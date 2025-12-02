import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const generateDocuments = async (appData) => {
    try {
        // Use gemini-2.5-flash for fast, efficient text generation
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        // Set default values
        const appName = appData.appName || 'Application';
        const appType = appData.whattypeofapplicationisit || 'Mobile Application';
        const email = appData.contactemailaddress || 'info@example.com';
        const collectsPhone = appData.doyoucollectphonenumbers || 'false';
        const collectsVoice = appData.doyoucollectvoiceorvideodata || 'false';
        const collectsPayment = appData.doyoucollectpaymentinformation || 'false';
        const socialMedia = appData.doyouhavesocialmediaintegration || 'None';
        const thirdParty = appData.doyouusethirdpartyservices || 'None';

        console.log('Gemini API - Used data:', {
            appName,
            appType,
            email,
            collectsPhone,
            collectsVoice,
            collectsPayment,
            socialMedia,
            thirdParty,
        });

        // Create Privacy Policy
        const privacyPolicyPrompt = `
      Create a professional Privacy Policy based on the following information.
      Write it in English and ensure it is legally valid.
      
      Application Name: ${appName}
      Application Type: ${appType}
      Contact Email: ${email}
      Collects Phone Number: ${collectsPhone === 'true' ? 'Yes' : 'No'}
      Collects Voice/Video Data: ${collectsVoice === 'true' ? 'Yes' : 'No'}
      Collects Payment Information: ${collectsPayment === 'true' ? 'Yes' : 'No'}
      Social Media Integration: ${socialMedia}
      Third-party Services: ${thirdParty}
      
      Return a professional, comprehensive, and legally valid Privacy Policy.
      Do not use HTML format, return plain text format.
      Should be at least 1000 words long.
    `;

        // Create Terms of Service
        const tosPrompt = `
      Create a professional Terms of Service based on the following information.
      Write it in English and ensure it is legally valid.
      
      Application Name: ${appName}
      Application Type: ${appType}
      Contact Email: ${email}
      
      Return a professional, comprehensive, and legally valid Terms of Service.
      Do not use HTML format, return plain text format.
      Should be at least 1000 words long.
    `;

        console.log('Generating Privacy Policy with Gemini...');
        const privacyPolicyResponse = await model.generateContent(privacyPolicyPrompt);
        const privacyPolicy = privacyPolicyResponse.response.text();
        console.log('✓ Privacy Policy generated');

        console.log('Generating Terms of Service with Gemini...');
        const tosResponse = await model.generateContent(tosPrompt);
        const termsOfService = tosResponse.response.text();
        console.log('✓ Terms of Service generated');

        return {
            privacyPolicy,
            termsOfService,
        };
    } catch (error) {
        console.error('Gemini API Error:', error);
        throw new Error(`Failed to generate documents: ${error.message}`);
    }
};

export const generateDocumentWithCustomPrompt = async (prompt) => {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const response = await model.generateContent(prompt);
        return response.response.text();
    } catch (error) {
        console.error('Gemini API Error:', error);
        throw new Error(`Failed to generate document: ${error.message}`);
    }
};

export const generateAppDescription = async (appName, prompt) => {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const descriptionPrompt = `
You are an expert app store copywriter. Generate compelling app descriptions for the app store based on the following details.

App Name: ${appName}
Additional Details: ${prompt}

IMPORTANT REQUIREMENTS:
1. SHORT DESCRIPTION: Exactly 80 characters or less. This is the tagline that appears under the app name. Make it catchy, clear, and action-oriented.
2. LONG DESCRIPTION: Around 2000 characters (can be up to 4000 max). This is the full app store description. Include:
   - A compelling opening hook
   - Key features with bullet points (use emoji bullets ✓ or •)
   - Benefits of using the app
   - Call to action

Return ONLY a JSON object in this exact format (no markdown, no code blocks):
{"shortDescription": "Your 80 char description here", "longDescription": "Your ~2000 char description here"}
`;

        console.log('Generating App Description with Gemini...');
        const response = await model.generateContent(descriptionPrompt);
        let text = response.response.text();
        
        // Clean up response - remove markdown code blocks if present
        text = text.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();
        
        const result = JSON.parse(text);
        console.log('✓ App Description generated');
        
        // Validate and trim short description if needed
        if (result.shortDescription && result.shortDescription.length > 80) {
            result.shortDescription = result.shortDescription.substring(0, 80);
        }
        
        return {
            shortDescription: result.shortDescription || '',
            longDescription: result.longDescription || '',
            usageInfo: {
                inputTokens: response.response.usageMetadata?.promptTokenCount || 0,
                outputTokens: response.response.usageMetadata?.candidatesTokenCount || 0
            }
        };
    } catch (error) {
        console.error('Gemini API Error:', error);
        throw new Error(`Failed to generate app description: ${error.message}`);
    }
};
