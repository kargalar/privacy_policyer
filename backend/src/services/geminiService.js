import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const generateDocuments = async (appData) => {
    try {
        // Use gemini-2.5-flash for fast, efficient text generation
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        // Extract all data from new comprehensive questions
        const data = {
            // Basic Information
            appName: appData.appName || 'Application',
            appType: appData.app_type || 'Mobile Application',
            companyName: appData.company_name || '',
            companyAddress: appData.company_address || '',
            contactEmail: appData.contact_email || 'privacy@example.com',
            websiteUrl: appData.website_url || '',
            
            // Target Audience
            targetRegions: appData.target_regions || 'Worldwide',
            targetChildren: appData.target_children === 'true',
            childrenDataHandling: appData.children_data_handling || '',
            ageVerification: appData.age_verification || '',
            
            // Personal Data Collection
            collectsPersonalData: appData.collect_personal_data === 'true',
            collectsName: appData.collect_name === 'true',
            collectsEmail: appData.collect_email === 'true',
            collectsPhone: appData.collect_phone === 'true',
            collectsAddress: appData.collect_address === 'true',
            collectsBirthdate: appData.collect_birthdate === 'true',
            collectsPhoto: appData.collect_photo === 'true',
            
            // Sensitive Data
            collectsSensitiveData: appData.collect_sensitive_data === 'true',
            collectsHealthData: appData.collect_health_data === 'true',
            collectsBiometric: appData.collect_biometric === 'true',
            collectsFinancial: appData.collect_financial === 'true',
            sensitiveDataPurpose: appData.sensitive_data_purpose || '',
            
            // Location Data
            collectsLocation: appData.collect_location === 'true',
            locationType: appData.location_type || '',
            locationPurpose: appData.location_purpose || '',
            
            // Device Data
            collectsDeviceData: appData.collect_device_data === 'true',
            collectsDeviceInfo: appData.collect_device_info === 'true',
            collectsDeviceIds: appData.collect_device_ids === 'true',
            collectsIpAddress: appData.collect_ip_address === 'true',
            collectsUsageData: appData.collect_usage_data === 'true',
            
            // Cookies
            usesCookies: appData.use_cookies === 'true',
            cookieTypes: appData.cookie_types || '',
            cookieConsent: appData.cookie_consent || '',
            
            // Third Party Services
            usesThirdParty: appData.use_third_party === 'true',
            usesAnalytics: appData.use_analytics === 'true',
            analyticsServices: appData.analytics_services || '',
            usesAdvertising: appData.use_advertising === 'true',
            advertisingServices: appData.advertising_services || '',
            usesSocialLogin: appData.use_social_login === 'true',
            socialProviders: appData.social_providers || '',
            otherThirdParty: appData.other_third_party || '',
            
            // Payments
            collectsPayment: appData.collect_payment === 'true',
            paymentProcessor: appData.payment_processor || '',
            storePaymentData: appData.store_payment_data || '',
            
            // Data Sharing
            sharesData: appData.share_data === 'true',
            sharesWithAffiliates: appData.share_data_affiliates === 'true',
            sharesWithPartners: appData.share_data_partners === 'true',
            sellsData: appData.sell_data === 'true',
            sharePurposes: appData.share_purposes || '',
            
            // Data Retention & Security
            dataRetentionPeriod: appData.data_retention_period || '',
            dataDeletionProcess: appData.data_deletion_process || '',
            encryptionTransit: appData.encryption_transit === 'true',
            encryptionRest: appData.encryption_rest === 'true',
            securityMeasures: appData.security_measures || '',
            
            // International Transfers
            dataStoredLocation: appData.data_stored_location || '',
            transferOutsideEea: appData.transfer_outside_eea === 'true',
            transferSafeguards: appData.transfer_safeguards || '',
            
            // User Rights
            providesDataAccess: appData.provide_data_access === 'true',
            providesDataExport: appData.provide_data_export === 'true',
            providesOptOut: appData.provide_opt_out === 'true',
            providesMarketingOptOut: appData.provide_marketing_opt_out === 'true',
            
            // Breach Notification
            hasBreachNotification: appData.breach_notification === 'true',
            breachTimeline: appData.breach_timeline || '',
            
            // Game Specific
            gameHasIap: appData.game_has_iap === 'true',
            gameHasMultiplayer: appData.game_has_multiplayer === 'true',
            gameHasChat: appData.game_has_chat === 'true',
            gameHasLeaderboards: appData.game_has_leaderboards === 'true',
            gameHasAds: appData.game_has_ads === 'true',
            
            // Mobile Specific
            mobilePermissions: appData.mobile_permissions || '',
            mobilePermissionsDetail: appData.mobile_permissions_detail || '',
            mobilePushNotifications: appData.mobile_push_notifications === 'true',
            mobileBackgroundData: appData.mobile_background_data === 'true',
            
            // E-commerce Specific
            ecommerceShipping: appData.ecommerce_shipping === 'true',
            ecommerceOrderHistory: appData.ecommerce_order_history === 'true',
            ecommerceRecommendations: appData.ecommerce_recommendations === 'true',
            
            // Additional
            additionalInfo: appData.additional_info || '',
        };

        console.log('Gemini API - Processing comprehensive privacy data for:', data.appName);

        // Build personal data collection list
        let personalDataList = [];
        if (data.collectsName) personalDataList.push('Names');
        if (data.collectsEmail) personalDataList.push('Email addresses');
        if (data.collectsPhone) personalDataList.push('Phone numbers');
        if (data.collectsAddress) personalDataList.push('Physical addresses');
        if (data.collectsBirthdate) personalDataList.push('Date of birth');
        if (data.collectsPhoto) personalDataList.push('Profile photos');
        
        // Build sensitive data list
        let sensitiveDataList = [];
        if (data.collectsHealthData) sensitiveDataList.push('Health/medical data');
        if (data.collectsBiometric) sensitiveDataList.push('Biometric data');
        if (data.collectsFinancial) sensitiveDataList.push('Financial information');
        
        // Build device data list
        let deviceDataList = [];
        if (data.collectsDeviceInfo) deviceDataList.push('Device type, model, OS');
        if (data.collectsDeviceIds) deviceDataList.push('Unique device identifiers (IDFA, GAID)');
        if (data.collectsIpAddress) deviceDataList.push('IP addresses');
        if (data.collectsUsageData) deviceDataList.push('Usage patterns and behavior');
        
        // Build third party services section
        let thirdPartyServices = '';
        if (data.usesAnalytics && data.analyticsServices) {
            thirdPartyServices += `Analytics: ${data.analyticsServices}\n`;
        }
        if (data.usesAdvertising && data.advertisingServices) {
            thirdPartyServices += `Advertising: ${data.advertisingServices}\n`;
        }
        if (data.usesSocialLogin && data.socialProviders) {
            thirdPartyServices += `Social Login: ${data.socialProviders}\n`;
        }
        if (data.collectsPayment && data.paymentProcessor) {
            thirdPartyServices += `Payment Processing: ${data.paymentProcessor}\n`;
        }
        if (data.otherThirdParty) {
            thirdPartyServices += `Other Services: ${data.otherThirdParty}\n`;
        }

        // Build user rights list
        let userRightsList = [];
        if (data.providesDataAccess) userRightsList.push('Access their personal data');
        if (data.providesDataExport) userRightsList.push('Export/download their data');
        if (data.providesOptOut) userRightsList.push('Opt out of data collection');
        if (data.providesMarketingOptOut) userRightsList.push('Opt out of marketing communications');
        
        // Build security measures list
        let securityList = [];
        if (data.encryptionTransit) securityList.push('Data encrypted in transit (HTTPS/TLS)');
        if (data.encryptionRest) securityList.push('Data encrypted at rest');
        if (data.securityMeasures) securityList.push(data.securityMeasures);

        // Create comprehensive Privacy Policy prompt
        const privacyPolicyPrompt = `
You are an expert privacy lawyer. Create a comprehensive, legally compliant Privacy Policy that adheres to GDPR, CCPA, COPPA, and other major privacy regulations.

=== COMPANY/APP INFORMATION ===
Application Name: ${data.appName}
Application Type: ${data.appType}
Company/Developer Name: ${data.companyName || 'Not specified'}
Company Address: ${data.companyAddress || 'Not specified'}
Contact Email: ${data.contactEmail}
Website: ${data.websiteUrl || 'Not specified'}

=== TARGET AUDIENCE ===
Target Regions: ${data.targetRegions}
Directed at Children Under 13: ${data.targetChildren ? 'Yes' : 'No'}
${data.targetChildren ? `Children Data Handling: ${data.childrenDataHandling}` : ''}
${data.targetChildren ? `Age Verification: ${data.ageVerification}` : ''}

=== PERSONAL DATA COLLECTION ===
Collects Personal Data: ${data.collectsPersonalData ? 'Yes' : 'No'}
${personalDataList.length > 0 ? `Types of Personal Data: ${personalDataList.join(', ')}` : ''}

=== SENSITIVE DATA ===
Collects Sensitive Data: ${data.collectsSensitiveData ? 'Yes' : 'No'}
${sensitiveDataList.length > 0 ? `Types of Sensitive Data: ${sensitiveDataList.join(', ')}` : ''}
${data.sensitiveDataPurpose ? `Purpose: ${data.sensitiveDataPurpose}` : ''}

=== LOCATION DATA ===
Collects Location Data: ${data.collectsLocation ? 'Yes' : 'No'}
${data.locationType ? `Location Type: ${data.locationType}` : ''}
${data.locationPurpose ? `Purpose: ${data.locationPurpose}` : ''}

=== DEVICE & TECHNICAL DATA ===
Collects Device Data: ${data.collectsDeviceData ? 'Yes' : 'No'}
${deviceDataList.length > 0 ? `Types: ${deviceDataList.join(', ')}` : ''}

=== COOKIES & TRACKING ===
Uses Cookies: ${data.usesCookies ? 'Yes' : 'No'}
${data.cookieTypes ? `Cookie Types: ${data.cookieTypes}` : ''}
${data.cookieConsent ? `Consent Mechanism: ${data.cookieConsent}` : ''}

=== THIRD PARTY SERVICES ===
${thirdPartyServices || 'No third-party services specified'}

=== DATA SHARING ===
Shares Data with Third Parties: ${data.sharesData ? 'Yes' : 'No'}
${data.sharesWithAffiliates ? 'Shares with Affiliates: Yes' : ''}
${data.sharesWithPartners ? 'Shares with Business Partners: Yes' : ''}
${data.sellsData ? 'Sells Personal Information: Yes (CCPA disclosure required)' : 'Does NOT sell personal information'}
${data.sharePurposes ? `Sharing Purposes: ${data.sharePurposes}` : ''}

=== DATA RETENTION ===
Retention Period: ${data.dataRetentionPeriod || 'As long as necessary'}
Deletion Process: ${data.dataDeletionProcess || 'Upon request'}

=== SECURITY MEASURES ===
${securityList.length > 0 ? securityList.join('\n') : 'Standard security practices'}

=== INTERNATIONAL TRANSFERS ===
Data Storage Location: ${data.dataStoredLocation || 'Not specified'}
Transfers Outside EU/EEA: ${data.transferOutsideEea ? 'Yes' : 'No'}
${data.transferSafeguards ? `Safeguards: ${data.transferSafeguards}` : ''}

=== USER RIGHTS ===
${userRightsList.length > 0 ? `Users can: ${userRightsList.join(', ')}` : 'Standard GDPR/CCPA rights apply'}

=== BREACH NOTIFICATION ===
Has Breach Notification Process: ${data.hasBreachNotification ? 'Yes' : 'No'}
${data.breachTimeline ? `Notification Timeline: ${data.breachTimeline}` : ''}

${data.appType === 'Game' ? `
=== GAME-SPECIFIC FEATURES ===
In-App Purchases: ${data.gameHasIap ? 'Yes' : 'No'}
Multiplayer Features: ${data.gameHasMultiplayer ? 'Yes' : 'No'}
Chat/Messaging: ${data.gameHasChat ? 'Yes' : 'No'}
Leaderboards/Profiles: ${data.gameHasLeaderboards ? 'Yes' : 'No'}
Advertisements: ${data.gameHasAds ? 'Yes' : 'No'}
` : ''}

${data.appType === 'Mobile App' ? `
=== MOBILE-SPECIFIC FEATURES ===
Device Permissions: ${data.mobilePermissions || 'None specified'}
${data.mobilePermissionsDetail ? `Permission Details: ${data.mobilePermissionsDetail}` : ''}
Push Notifications: ${data.mobilePushNotifications ? 'Yes' : 'No'}
Background Data Collection: ${data.mobileBackgroundData ? 'Yes' : 'No'}
` : ''}

${data.appType === 'E-commerce' ? `
=== E-COMMERCE SPECIFIC ===
Collects Shipping Addresses: ${data.ecommerceShipping ? 'Yes' : 'No'}
Stores Order History: ${data.ecommerceOrderHistory ? 'Yes' : 'No'}
Personalized Recommendations: ${data.ecommerceRecommendations ? 'Yes' : 'No'}
` : ''}

${data.additionalInfo ? `=== ADDITIONAL INFORMATION ===\n${data.additionalInfo}` : ''}

REQUIREMENTS:
1. Create a COMPLETE, LEGALLY VALID Privacy Policy
2. Include ALL standard sections: Introduction, Data Controller, Data Collected, How We Use Data, Legal Basis, Data Sharing, Third Party Services, Security, User Rights, Data Retention, International Transfers, Children's Privacy, Changes to Policy, Contact Information
3. Be SPECIFIC about the data types and purposes mentioned above
4. Include GDPR-specific language for EU users
5. Include CCPA-specific language for California users
6. Include COPPA compliance if children are involved
7. Write in clear, professional English
8. DO NOT use HTML - return plain text with clear section headers
9. Should be at least 2000 words for comprehensive coverage
10. Include the effective date as: [EFFECTIVE DATE]
`;

        // Create comprehensive Terms of Service prompt
        const tosPrompt = `
You are an expert legal professional. Create a comprehensive Terms of Service agreement that is legally binding and protects both the service provider and users.

=== COMPANY/APP INFORMATION ===
Application Name: ${data.appName}
Application Type: ${data.appType}
Company/Developer Name: ${data.companyName || 'The Developer'}
Contact Email: ${data.contactEmail}
Website: ${data.websiteUrl || 'Not specified'}

=== SERVICE DETAILS ===
${data.appType === 'Game' ? `
- This is a game application
- In-App Purchases: ${data.gameHasIap ? 'Yes' : 'No'}
- Multiplayer Features: ${data.gameHasMultiplayer ? 'Yes' : 'No'}
- Chat/Messaging: ${data.gameHasChat ? 'Yes' : 'No'}
- Leaderboards: ${data.gameHasLeaderboards ? 'Yes' : 'No'}
- Advertisements: ${data.gameHasAds ? 'Yes' : 'No'}
` : ''}

${data.appType === 'E-commerce' ? `
- This is an e-commerce platform
- Collects Shipping Addresses: ${data.ecommerceShipping ? 'Yes' : 'No'}
- Stores Order History: ${data.ecommerceOrderHistory ? 'Yes' : 'No'}
- Personalized Recommendations: ${data.ecommerceRecommendations ? 'Yes' : 'No'}
` : ''}

${data.collectsPayment ? `
- Accepts payments
- Payment Processor: ${data.paymentProcessor || 'Third-party payment processor'}
` : ''}

${thirdPartyServices ? `Third Party Integrations:\n${thirdPartyServices}` : ''}

REQUIREMENTS:
1. Create a COMPLETE, LEGALLY VALID Terms of Service
2. Include all standard sections:
   - Acceptance of Terms
   - Description of Service
   - User Accounts and Registration
   - User Responsibilities and Conduct
   - Intellectual Property Rights
   - User-Generated Content (if applicable)
   - Payment Terms (if applicable)
   - Virtual Currency/In-App Purchases (if applicable)
   - Disclaimers and Limitations of Liability
   - Indemnification
   - Termination
   - Governing Law and Dispute Resolution
   - Changes to Terms
   - Contact Information
3. Write in clear, professional English
4. Be fair but protective of the service provider
5. DO NOT use HTML - return plain text with clear section headers
6. Should be at least 1500 words for comprehensive coverage
7. Include the effective date as: [EFFECTIVE DATE]
`;

        console.log('Generating comprehensive Privacy Policy with Gemini...');
        const privacyPolicyResponse = await model.generateContent(privacyPolicyPrompt);
        const privacyPolicy = privacyPolicyResponse.response.text();
        console.log('✓ Privacy Policy generated');

        console.log('Generating comprehensive Terms of Service with Gemini...');
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
