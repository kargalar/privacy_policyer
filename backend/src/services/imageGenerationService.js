import { GoogleGenerativeAI } from '@google/generative-ai';
import { uploadImage } from './cloudinaryService.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper function to wait
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Retry wrapper for rate limit handling
const withRetry = async (fn, maxRetries = 3, initialDelay = 20000) => {
    let lastError;
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            if (error.status === 429 && i < maxRetries - 1) {
                const delay = initialDelay * (i + 1); // 20s, 40s, 60s
                console.log(`Rate limit hit. Waiting ${delay / 1000}s before retry ${i + 2}/${maxRetries}...`);
                await sleep(delay);
            } else {
                throw error;
            }
        }
    }
    throw lastError;
};

// Image types with their specifications
export const IMAGE_TYPES = {
    APP_ICON: {
        name: 'App Icon',
        width: 1152,
        height: 1152,
        description: 'Square app icon for mobile stores',
        aspectRatio: '1:1',
        imageSize: '2K',
    },
    FEATURE_GRAPHIC: {
        name: 'Feature Graphic',
        width: 1024,
        height: 500,
        description: 'Feature graphic for Google Play Store',
        aspectRatio: '21:9',
        imageSize: '1K',
    },
    STORE_SCREENSHOT: {
        name: 'Store Screenshot',
        width: 1080,
        height: 1920,
        description: 'Phone screenshot for app stores',
        aspectRatio: '9:16',
        imageSize: '2K',
    },
};

/**
 * Build content parts with reference images
 * @param {string} prompt - The main prompt
 * @param {string[]} referenceImages - Base64 encoded reference images
 * @param {string} contextText - Context text for reference images
 * @returns {Array} Content parts array
 */
const buildContentParts = (prompt, referenceImages = [], contextText = 'Use these reference images as inspiration:') => {
    const contentParts = [];

    if (referenceImages && referenceImages.length > 0) {
        contentParts.push({ text: contextText + '\n' });
        
        for (const refImage of referenceImages) {
            const matches = refImage.match(/^data:(.+);base64,(.+)$/);
            if (matches) {
                contentParts.push({
                    inlineData: {
                        mimeType: matches[1],
                        data: matches[2]
                    }
                });
            }
        }
        
        contentParts.push({ text: '\n\nNow create the image based on the above references and this prompt:\n' + prompt });
    } else {
        contentParts.push({ text: prompt });
    }

    return contentParts;
};

/**
 * Generate an app icon using Gemini 3 Pro Image model
 * @param {string} appName - Name of the application
 * @param {string} appDescription - Description of the application
 * @param {string} style - Style preference for the icon
 * @param {string} prompt - Additional prompt details
 * @param {string[]} referenceImages - Base64 encoded reference images
 * @param {boolean} transparentBackground - Whether to use transparent background
 * @returns {Promise<{base64: string, mimeType: string}>}
 */
export const generateAppIcon = async (appName, appDescription, style = 'modern', prompt = '', referenceImages = [], transparentBackground = false) => {
    try {
        // Use gemini-3-pro-image-preview for high quality icon generation
        const model = genAI.getGenerativeModel({
            model: 'gemini-3-pro-image-preview',
            generationConfig: {
                responseModalities: ['TEXT', 'IMAGE'],
            },
        });

        const imageConfig = IMAGE_TYPES.APP_ICON;

        // Build background instruction based on transparentBackground flag
        const backgroundInstruction = transparentBackground
            ? `- TRANSPARENT BACKGROUND - The icon must have NO background, only the main subject/symbol
- The subject should be designed to work on any background color
- PNG format with alpha channel transparency
- No colored background, no gradients in background, completely clear background`
            : `- Solid or gradient background that complements the icon design
- Background should be visually appealing and professional`;

        const fullPrompt = `Create a professional mobile app icon for an app called "${appName}".
${appDescription ? `App description: ${appDescription}.` : ''}
Style: ${style}
${prompt ? `Additional requirements: ${prompt}` : ''}

CRITICAL REQUIREMENTS - FOLLOW EXACTLY:
- The icon subject/symbol must FILL THE ENTIRE CANVAS - no padding, no margins, no empty space around edges
- Maximum visual impact - the design should extend to 100% of the frame boundaries
- Edge-to-edge design with the main element touching or nearly touching all sides
${backgroundInstruction}
- Clean, modern design suitable for app stores
- Simple and recognizable at small sizes
- Professional color palette
- No text in the icon unless specifically requested
- Square format with rounded corners
- High quality, sharp details
- Suitable for ${imageConfig.width}x${imageConfig.height} resolution
- The entire ${imageConfig.width}x${imageConfig.height} canvas must be utilized - DO NOT leave empty margins`;

        console.log('Generating app icon with Gemini 3 Pro Image...', { transparentBackground });

        const contentParts = buildContentParts(
            fullPrompt, 
            referenceImages, 
            'Use these reference images as inspiration for the style, colors, or design elements:'
        );

        const result = await withRetry(async () => {
            return await model.generateContent({
                contents: [{ role: 'user', parts: contentParts }],
                generationConfig: {
                    responseModalities: ['TEXT', 'IMAGE'],
                },
            });
        });
        
        const response = result.response;

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return {
                    base64: part.inlineData.data,
                    mimeType: part.inlineData.mimeType || 'image/png',
                };
            }
        }

        throw new Error('No image generated in response');
    } catch (error) {
        console.error('Gemini Image Generation Error:', error);
        throw new Error(`Failed to generate app icon: ${error.message}`);
    }
};

/**
 * Generate a feature graphic using Gemini
 * @param {string} appName - Name of the application
 * @param {string} appDescription - Description of the application
 * @param {string} style - Style preference
 * @param {string} prompt - Additional prompt details
 * @param {string[]} referenceImages - Base64 encoded reference images
 * @returns {Promise<{base64: string, mimeType: string}>}
 */
export const generateFeatureGraphic = async (appName, appDescription, style = 'modern', prompt = '', referenceImages = []) => {
    try {
        const model = genAI.getGenerativeModel({
            model: 'gemini-3-pro-image-preview',
            generationConfig: {
                responseModalities: ['TEXT', 'IMAGE'],
            },
        });

        const imageConfig = IMAGE_TYPES.FEATURE_GRAPHIC;

        const fullPrompt = `Create a professional feature graphic banner for a mobile app called "${appName}".
${appDescription ? `App description: ${appDescription}.` : ''}
Style: ${style}
${prompt ? `Additional requirements: ${prompt}` : ''}

Requirements:
- Landscape orientation with ${imageConfig.aspectRatio} aspect ratio
- Eye-catching design that showcases the app
- Professional and modern look
- Can include the app name as stylized text
- Suitable for Google Play Store feature graphic
- High quality with good contrast
- Resolution: ${imageConfig.width}x${imageConfig.height} pixels`;

        console.log('Generating feature graphic with Gemini 3 Pro Image...');

        const contentParts = buildContentParts(
            fullPrompt, 
            referenceImages, 
            'Use these reference images as inspiration for the style, colors, or design elements:'
        );

        const result = await withRetry(async () => {
            return await model.generateContent({
                contents: [{ role: 'user', parts: contentParts }],
                generationConfig: {
                    responseModalities: ['TEXT', 'IMAGE'],
                },
            });
        });
        
        const response = result.response;

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return {
                    base64: part.inlineData.data,
                    mimeType: part.inlineData.mimeType || 'image/png',
                };
            }
        }

        throw new Error('No image generated in response');
    } catch (error) {
        console.error('Gemini Image Generation Error:', error);
        throw new Error(`Failed to generate feature graphic: ${error.message}`);
    }
};

/**
 * Generate a store screenshot mockup using Gemini
 * @param {string} appName - Name of the application
 * @param {string} appDescription - Description of the application
 * @param {string} style - Style preference
 * @param {string} prompt - Additional prompt details
 * @param {string[]} referenceImages - Base64 encoded reference images (REQUIRED - at least 1 app screenshot)
 * @returns {Promise<{base64: string, mimeType: string}>}
 */
export const generateStoreScreenshot = async (appName, appDescription, style = 'modern', prompt = '', referenceImages = []) => {
    // Validate that at least 1 reference image (app screenshot) is provided
    if (!referenceImages || referenceImages.length === 0) {
        throw new Error('Store Screenshot requires at least 1 app screenshot. Please upload your app screenshot.');
    }

    try {
        const model = genAI.getGenerativeModel({
            model: 'gemini-3-pro-image-preview',
            generationConfig: {
                responseModalities: ['TEXT', 'IMAGE'],
            },
        });

        const imageConfig = IMAGE_TYPES.STORE_SCREENSHOT;

        const fullPrompt = `Create a professional app store listing image for "${appName}" mobile app.

IMPORTANT: Use the provided app screenshot(s) as the MAIN CONTENT of this store image.
${appDescription ? `App description: ${appDescription}.` : ''}
Style: ${style}
${prompt ? `Additional requirements: ${prompt}` : ''}

CRITICAL REQUIREMENTS:
- This is a STORE LISTING IMAGE, not just a screenshot
- Feature the provided app screenshot(s) prominently in the design
- Add a beautiful, professional background (gradient, abstract, or themed)
- The app screenshot should be displayed on a phone mockup or floating elegantly
- Add promotional text, tagline, or feature highlights if appropriate
- Portrait format with ${imageConfig.aspectRatio} aspect ratio
- Resolution: ${imageConfig.width}x${imageConfig.height} pixels
- Modern, eye-catching design that would attract users in an app store
- Professional marketing quality - this should look like a real app store listing
- Make it visually stunning with proper shadows, reflections, and depth`;

        console.log('Generating store screenshot with Gemini 3 Pro Image (with app screenshot)...');

        const contentParts = buildContentParts(
            fullPrompt, 
            referenceImages, 
            'These are the actual app screenshots to feature in the store listing image. Use these EXACT screenshots as the main content:'
        );

        const result = await withRetry(async () => {
            return await model.generateContent({
                contents: [{ role: 'user', parts: contentParts }],
                generationConfig: {
                    responseModalities: ['TEXT', 'IMAGE'],
                },
            });
        });
        
        const response = result.response;

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return {
                    base64: part.inlineData.data,
                    mimeType: part.inlineData.mimeType || 'image/png',
                };
            }
        }

        throw new Error('No image generated in response');
    } catch (error) {
        console.error('Gemini Image Generation Error:', error);
        throw new Error(`Failed to generate store screenshot: ${error.message}`);
    }
};

/**
 * Generate image based on type and upload to Cloudinary
 * @param {string} imageType - Type of image (APP_ICON, FEATURE_GRAPHIC, STORE_SCREENSHOT)
 * @param {string} appName - Name of the application
 * @param {string} appDescription - Description of the application
 * @param {string} style - Style preference
 * @param {string} prompt - Additional prompt details
 * @param {string} documentId - Document ID for folder organization
 * @param {string[]} referenceImages - Base64 encoded reference images
 * @param {boolean} transparentBackground - Whether to use transparent background (for icons)
 * @returns {Promise<{url: string, publicId: string, width: number, height: number, base64: string}>}
 */
export const generateAndUploadImage = async (imageType, appName, appDescription, style, prompt, documentId, referenceImages = [], transparentBackground = false) => {
    let imageData;

    switch (imageType) {
        case 'APP_ICON':
            imageData = await generateAppIcon(appName, appDescription, style, prompt, referenceImages, transparentBackground);
            break;
        case 'FEATURE_GRAPHIC':
            imageData = await generateFeatureGraphic(appName, appDescription, style, prompt, referenceImages);
            break;
        case 'STORE_SCREENSHOT':
            imageData = await generateStoreScreenshot(appName, appDescription, style, prompt, referenceImages);
            break;
        default:
            throw new Error(`Unknown image type: ${imageType}`);
    }

    // Upload to Cloudinary with specific dimensions
    const folder = `privacy_policyer/${documentId}/${imageType.toLowerCase()}`;
    const publicId = `${imageType.toLowerCase()}_${Date.now()}`;

    // Get target dimensions
    const targetDimensions = IMAGE_TYPES[imageType];

    const cloudinaryResult = await uploadImage(
        imageData.base64,
        folder,
        publicId,
        targetDimensions ? { width: targetDimensions.width, height: targetDimensions.height } : null
    );

    return {
        ...cloudinaryResult,
        base64: imageData.base64,
    };
};
