import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const generateDocuments = async (appData) => {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

        // Privacy Policy oluştur
        const privacyPolicyPrompt = `
      Aşağıdaki bilgilere göre profesyonel bir Privacy Policy oluştur. 
      Türkçe ve hukuki olarak geçerli olacak şekilde yaz.
      
      Uygulama Adı: ${appData.appName}
      Uygulama Türü: ${appData.appType}
      E-posta Adresi: ${appData.email}
      Telefon Numarası Toplamı: ${appData.collectsPhone === 'true' ? 'Evet' : 'Hayır'}
      Konuşma/Video Verisi Toplama: ${appData.collectsVoice === 'true' ? 'Evet' : 'Hayır'}
      Ödeme Bilgisi Toplama: ${appData.collectsPayment === 'true' ? 'Evet' : 'Hayır'}
      Sosyal Medya Entegrasyonu: ${appData.socialMedia || 'Yok'}
      Üçüncü Taraf Hizmetleri: ${appData.thirdParty || 'Yok'}
      
      Profesyonel, kapsamlı, yasal açıdan geçerli bir Privacy Policy döndür.
      HTML formatında değil, düz metin formatında döndür.
      En az 1000 kelime uzunluğunda olmalı.
    `;

        // Terms of Service oluştur
        const tosPrompt = `
      Aşağıdaki bilgilere göre profesyonel bir Terms of Service oluştur. 
      Türkçe ve hukuki olarak geçerli olacak şekilde yaz.
      
      Uygulama Adı: ${appData.appName}
      Uygulama Türü: ${appData.appType}
      E-posta Adresi: ${appData.email}
      
      Profesyonel, kapsamlı, yasal açıdan geçerli bir Terms of Service döndür.
      HTML formatında değil, düz metin formatında döndür.
      En az 1000 kelime uzunluğunda olmalı.
    `;

        console.log('Generating Privacy Policy with Gemini...');
        const privacyPolicyResponse = await model.generateContent(privacyPolicyPrompt);
        const privacyPolicy = privacyPolicyResponse.response.text();

        console.log('Generating Terms of Service with Gemini...');
        const tosResponse = await model.generateContent(tosPrompt);
        const termsOfService = tosResponse.response.text();

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
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
        const response = await model.generateContent(prompt);
        return response.response.text();
    } catch (error) {
        console.error('Gemini API Error:', error);
        throw new Error(`Failed to generate document: ${error.message}`);
    }
};
