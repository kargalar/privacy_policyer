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
