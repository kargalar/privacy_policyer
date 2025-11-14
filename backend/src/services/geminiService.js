import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const generateDocuments = async (appData) => {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        // Varsayılan değerler ata
        const appName = appData.appName || 'Uygulama';
        const appType = appData.apptype || 'Mobil Uygulama';
        const email = appData.email || 'info@example.com';
        const collectsPhone = appData.collectsphone || 'false';
        const collectsVoice = appData.collectsvoice || 'false';
        const collectsPayment = appData.collectspayment || 'false';
        const socialMedia = appData.socialmedia || 'Yok';
        const thirdParty = appData.thirdparty || 'Yok';

        console.log('Gemini API - Kullanılan veriler:', {
            appName,
            appType,
            email,
            collectsPhone,
            collectsVoice,
            collectsPayment,
        });

        // Privacy Policy oluştur
        const privacyPolicyPrompt = `
      Aşağıdaki bilgilere göre profesyonel bir Privacy Policy oluştur. 
      Türkçe ve hukuki olarak geçerli olacak şekilde yaz.
      
      Uygulama Adı: ${appName}
      Uygulama Türü: ${appType}
      E-posta Adresi: ${email}
      Telefon Numarası Toplamı: ${collectsPhone === 'true' ? 'Evet' : 'Hayır'}
      Konuşma/Video Verisi Toplama: ${collectsVoice === 'true' ? 'Evet' : 'Hayır'}
      Ödeme Bilgisi Toplama: ${collectsPayment === 'true' ? 'Evet' : 'Hayır'}
      Sosyal Medya Entegrasyonu: ${socialMedia}
      Üçüncü Taraf Hizmetleri: ${thirdParty}
      
      Profesyonel, kapsamlı, yasal açıdan geçerli bir Privacy Policy döndür.
      HTML formatında değil, düz metin formatında döndür.
      En az 1000 kelime uzunluğunda olmalı.
    `;

        // Terms of Service oluştur
        const tosPrompt = `
      Aşağıdaki bilgilere göre profesyonel bir Terms of Service oluştur. 
      Türkçe ve hukuki olarak geçerli olacak şekilde yaz.
      
      Uygulama Adı: ${appName}
      Uygulama Türü: ${appType}
      E-posta Adresi: ${email}
      
      Profesyonel, kapsamlı, yasal açıdan geçerli bir Terms of Service döndür.
      HTML formatında değil, düz metin formatında döndür.
      En az 1000 kelime uzunluğunda olmalı.
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
