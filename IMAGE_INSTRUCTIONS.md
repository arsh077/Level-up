# Image Setup Instructions

## Required Image

Please save the provided portrait image as:
- **File name**: `arshad-portrait.jpg`
- **Location**: `public/assets/story/arshad-portrait.jpg`

## Steps:
1. Save the red background portrait image you provided
2. Name it `arshad-portrait.jpg`
3. Place it in the `public/assets/story/` folder
4. The StoryPage component is already configured to use this image

## Current Image Path in Code:
```jsx
<img 
  src="/assets/story/arshad-portrait.jpg" 
  alt="Arshad - The Discipline Built Man" 
  className="w-full h-[600px] object-cover object-center transition-all duration-700 hover:scale-105"
/>
```

The image will appear in the "About Arshad" section of the Story page with proper styling and hover effects.