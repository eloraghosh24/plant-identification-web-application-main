# **App Name**: LeafWise

## Core Features:

- Image Capture/Upload: Enable users to upload images of plants from their device or capture new images using their camera.
- Image Preview: Display a preview of the captured or uploaded image before sending it for analysis.
- Gemini-Powered Identification: Convert the image to a base64-encoded string and send it to the Gemini API with a detailed prompt, requesting plant identification and relevant information. The prompt will instruct the tool about common name, scientific name, growth habit, ideal climate, toxicity to pets, and care tips.
- Plant Information Display: Parse the Gemini API response and display the plant's name, description, scientific classification, care needs, and toxicity information.
- PDF Export: Allow users to export the plant information and image as a PDF document.
- Speech Synthesis: Implement a text-to-speech feature that reads aloud the displayed plant details using the browser's speech synthesis API.
- Error Handling and Optimization: Implement retry logic to handle 503 Gemini API overloads and cache duplicate image inputs to minimize API calls.

## Style Guidelines:

- Primary color: Forest green (#388E3C) to reflect plant life.
- Background color: Very light desaturated green (#F1F8E9) for a natural, calming feel.
- Accent color: Earthy brown (#795548) for buttons and interactive elements, complementing the natural theme.
- Body and headline font: 'Inter' sans-serif, for a clean and modern reading experience.
- Use simple, line-based icons to represent actions and categories, maintaining a minimalistic style.
- Implement a responsive layout using clear content sections, suitable for both mobile and desktop devices.
- Use subtle fade-in animations on content loading for a smooth user experience.