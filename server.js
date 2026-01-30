import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// Enable CORS for frontend
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
}));

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Backend server is running' });
});

// Proxy endpoint for Clarifai Food Model API
app.post('/api/analyze', upload.single('image'), async (req, res) => {
    try {
        console.log('Received image analysis request...');

        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided' });
        }

        const apiKey = process.env.VITE_CLARIFAI_PAT;

        if (!apiKey || apiKey === 'PLACEHOLDER_API_KEY') {
            return res.status(500).json({
                error: 'Clarifai API key not configured',
                demo: true
            });
        }

        console.log('Converting image to base64...');
        const base64Data = req.file.buffer.toString('base64');

        console.log('Calling Clarifai Food Model API...');

        // Call Clarifai Food Recognition API
        const response = await fetch(
            'https://api.clarifai.com/v2/models/food-item-recognition/outputs',
            {
                method: 'POST',
                headers: {
                    'Authorization': `Key ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    inputs: [
                        {
                            data: {
                                image: {
                                    base64: base64Data,
                                },
                            },
                        },
                    ],
                }),
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Clarifai API error:', response.status, errorText);
            return res.status(response.status).json({
                error: `Clarifai API error: ${response.status}`,
                details: errorText
            });
        }

        const data = await response.json();
        console.log('Clarifai predictions received');

        // Extract predictions
        const concepts = data.outputs?.[0]?.data?.concepts;

        if (!concepts || concepts.length === 0) {
            return res.status(400).json({ error: 'No food detected in image' });
        }

        // Return predictions to frontend
        res.json({
            success: true,
            predictions: concepts
        });

    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`\n🚀 Backend server running on http://localhost:${PORT}`);
    console.log(`📡 Ready to proxy Clarifai Food Model API requests\n`);
});
