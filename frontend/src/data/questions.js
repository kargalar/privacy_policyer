// Static questions for document generation
// These questions are used to gather information for privacy policy and terms of service generation
// Covers GDPR, CCPA, COPPA, and other major privacy regulations
// Uses conditional logic: showIf determines when a question is displayed

export const questions = [
    // ============ SECTION 1: BASIC INFORMATION ============
    {
        id: 'app_type',
        question: 'What type of application is it?',
        description: 'Select the type that best describes your application',
        type: 'SELECT',
        required: true,
        options: ['Mobile App', 'Web Application', 'Desktop Application', 'Browser Extension', 'Game', 'E-commerce', 'SaaS Platform', 'Other'],
        sortOrder: 1,
        section: 'Basic Information',
    },
    {
        id: 'company_name',
        question: 'Company/Developer Name',
        description: 'Legal name of the company or individual developer',
        type: 'TEXT',
        required: true,
        sortOrder: 2,
        section: 'Basic Information',
    },
    {
        id: 'company_address',
        question: 'Company Address',
        description: 'Physical address of the company (required for GDPR)',
        type: 'TEXTAREA',
        required: true,
        sortOrder: 3,
        section: 'Basic Information',
    },
    {
        id: 'contact_email',
        question: 'Contact Email Address',
        description: 'Email for privacy concerns',
        type: 'EMAIL',
        required: true,
        sortOrder: 4,
        section: 'Basic Information',
    },
    {
        id: 'website_url',
        question: 'Website URL',
        description: 'Your company or application website URL',
        type: 'TEXT',
        required: false,
        sortOrder: 5,
        section: 'Basic Information',
    },

    // ============ SECTION 2: TARGET AUDIENCE ============
    {
        id: 'target_regions',
        question: 'Which regions do you serve?',
        description: 'Select all regions where your app is available',
        type: 'SELECT',
        required: true,
        options: ['Worldwide', 'USA only', 'Europe only', 'USA and Europe', 'Other specific regions'],
        sortOrder: 10,
        section: 'Target Audience',
    },
    {
        id: 'target_children',
        question: 'Is your app directed at children under 13?',
        description: 'COPPA requires special protections for children',
        type: 'BOOLEAN',
        required: true,
        sortOrder: 11,
        section: 'Target Audience',
    },
    {
        id: 'children_data_handling',
        question: 'How do you handle children\'s data?',
        description: 'Describe parental consent mechanisms and protections',
        type: 'TEXTAREA',
        required: true,
        sortOrder: 12,
        section: 'Target Audience',
        showIf: { field: 'target_children', value: 'true' },
    },
    {
        id: 'age_verification',
        question: 'What age verification do you use?',
        description: 'How do you verify user age?',
        type: 'SELECT',
        required: true,
        options: ['No verification', 'Self-declaration (checkbox)', 'Date of birth entry', 'ID verification', 'Parental consent required'],
        sortOrder: 13,
        section: 'Target Audience',
        showIf: { field: 'target_children', value: 'true' },
    },

    // ============ SECTION 3: DATA COLLECTION (MASTER QUESTION) ============
    {
        id: 'collect_personal_data',
        question: 'Do you collect any personal data from users?',
        description: 'Personal data includes names, emails, phone numbers, addresses, etc.',
        type: 'BOOLEAN',
        required: true,
        sortOrder: 20,
        section: 'Data Collection',
    },

    // ============ SECTION 3.1: PERSONAL DATA TYPES (shown if collect_personal_data = true) ============
    {
        id: 'collect_name',
        question: 'Do you collect user names?',
        description: 'Full name, display name, or username',
        type: 'BOOLEAN',
        required: true,
        sortOrder: 21,
        section: 'Data Collection',
        showIf: { field: 'collect_personal_data', value: 'true' },
    },
    {
        id: 'collect_email',
        question: 'Do you collect email addresses?',
        description: 'For account creation, newsletters, or communication',
        type: 'BOOLEAN',
        required: true,
        sortOrder: 22,
        section: 'Data Collection',
        showIf: { field: 'collect_personal_data', value: 'true' },
    },
    {
        id: 'collect_phone',
        question: 'Do you collect phone numbers?',
        description: 'For verification, SMS, or contact',
        type: 'BOOLEAN',
        required: true,
        sortOrder: 23,
        section: 'Data Collection',
        showIf: { field: 'collect_personal_data', value: 'true' },
    },
    {
        id: 'collect_address',
        question: 'Do you collect physical addresses?',
        description: 'Mailing, billing, or shipping addresses',
        type: 'BOOLEAN',
        required: true,
        sortOrder: 24,
        section: 'Data Collection',
        showIf: { field: 'collect_personal_data', value: 'true' },
    },
    {
        id: 'collect_birthdate',
        question: 'Do you collect date of birth?',
        description: 'For age verification or personalization',
        type: 'BOOLEAN',
        required: true,
        sortOrder: 25,
        section: 'Data Collection',
        showIf: { field: 'collect_personal_data', value: 'true' },
    },
    {
        id: 'collect_photo',
        question: 'Do you collect profile photos?',
        description: 'User-uploaded profile pictures',
        type: 'BOOLEAN',
        required: true,
        sortOrder: 26,
        section: 'Data Collection',
        showIf: { field: 'collect_personal_data', value: 'true' },
    },

    // ============ SECTION 3.2: SENSITIVE DATA ============
    {
        id: 'collect_sensitive_data',
        question: 'Do you collect any sensitive personal data?',
        description: 'Health, biometric, financial, or other sensitive data (special category under GDPR)',
        type: 'BOOLEAN',
        required: true,
        sortOrder: 30,
        section: 'Data Collection',
        showIf: { field: 'collect_personal_data', value: 'true' },
    },
    {
        id: 'collect_health_data',
        question: 'Do you collect health or medical data?',
        description: 'Health records, fitness data, medical conditions',
        type: 'BOOLEAN',
        required: true,
        sortOrder: 31,
        section: 'Data Collection',
        showIf: { field: 'collect_sensitive_data', value: 'true' },
    },
    {
        id: 'collect_biometric',
        question: 'Do you collect biometric data?',
        description: 'Fingerprints, facial recognition, voice prints',
        type: 'BOOLEAN',
        required: true,
        sortOrder: 32,
        section: 'Data Collection',
        showIf: { field: 'collect_sensitive_data', value: 'true' },
    },
    {
        id: 'collect_financial',
        question: 'Do you collect financial information?',
        description: 'Bank accounts, credit scores, financial statements',
        type: 'BOOLEAN',
        required: true,
        sortOrder: 33,
        section: 'Data Collection',
        showIf: { field: 'collect_sensitive_data', value: 'true' },
    },
    {
        id: 'sensitive_data_purpose',
        question: 'Why do you collect sensitive data?',
        description: 'Explain the purpose and necessity',
        type: 'TEXTAREA',
        required: true,
        sortOrder: 34,
        section: 'Data Collection',
        showIf: { field: 'collect_sensitive_data', value: 'true' },
    },

    // ============ SECTION 3.3: LOCATION DATA ============
    {
        id: 'collect_location',
        question: 'Do you collect location data?',
        description: 'GPS, IP-based location, or other location tracking',
        type: 'BOOLEAN',
        required: true,
        sortOrder: 40,
        section: 'Data Collection',
    },
    {
        id: 'location_type',
        question: 'What type of location data do you collect?',
        description: 'Select the most applicable option',
        type: 'SELECT',
        required: true,
        options: ['Approximate location (city/region from IP)', 'Precise GPS location', 'Background location tracking', 'Both approximate and precise'],
        sortOrder: 41,
        section: 'Data Collection',
        showIf: { field: 'collect_location', value: 'true' },
    },
    {
        id: 'location_purpose',
        question: 'Why do you collect location data?',
        description: 'Purpose of location collection',
        type: 'TEXTAREA',
        required: true,
        sortOrder: 42,
        section: 'Data Collection',
        showIf: { field: 'collect_location', value: 'true' },
    },

    // ============ SECTION 3.4: DEVICE & TECHNICAL DATA ============
    {
        id: 'collect_device_data',
        question: 'Do you collect device or technical data?',
        description: 'Device info, IP addresses, browser data, etc.',
        type: 'BOOLEAN',
        required: true,
        sortOrder: 50,
        section: 'Data Collection',
    },
    {
        id: 'collect_device_info',
        question: 'Do you collect device information?',
        description: 'Device type, model, OS, browser',
        type: 'BOOLEAN',
        required: true,
        sortOrder: 51,
        section: 'Data Collection',
        showIf: { field: 'collect_device_data', value: 'true' },
    },
    {
        id: 'collect_device_ids',
        question: 'Do you collect unique device identifiers?',
        description: 'IDFA, GAID, MAC address, IMEI',
        type: 'BOOLEAN',
        required: true,
        sortOrder: 52,
        section: 'Data Collection',
        showIf: { field: 'collect_device_data', value: 'true' },
    },
    {
        id: 'collect_ip_address',
        question: 'Do you collect IP addresses?',
        description: 'For security, analytics, or geolocation',
        type: 'BOOLEAN',
        required: true,
        sortOrder: 53,
        section: 'Data Collection',
        showIf: { field: 'collect_device_data', value: 'true' },
    },
    {
        id: 'collect_usage_data',
        question: 'Do you track app/website usage patterns?',
        description: 'Pages visited, features used, time spent',
        type: 'BOOLEAN',
        required: true,
        sortOrder: 54,
        section: 'Data Collection',
        showIf: { field: 'collect_device_data', value: 'true' },
    },

    // ============ SECTION 4: COOKIES & TRACKING (Web/Browser only) ============
    {
        id: 'use_cookies',
        question: 'Do you use cookies or similar technologies?',
        description: 'Cookies, local storage, tracking pixels',
        type: 'BOOLEAN',
        required: true,
        sortOrder: 60,
        section: 'Cookies & Tracking',
        showIf: { field: 'app_type', value: ['Web Application', 'Browser Extension', 'E-commerce', 'SaaS Platform'] },
    },
    {
        id: 'cookie_types',
        question: 'What types of cookies do you use?',
        description: 'Select the cookie categories you use',
        type: 'SELECT',
        required: true,
        options: ['Essential only', 'Essential + Functional', 'Essential + Analytics', 'Essential + Advertising', 'All types (Essential, Functional, Analytics, Advertising)'],
        sortOrder: 61,
        section: 'Cookies & Tracking',
        showIf: { field: 'use_cookies', value: 'true' },
    },
    {
        id: 'cookie_consent',
        question: 'How do you obtain cookie consent?',
        description: 'Cookie consent mechanism for GDPR compliance',
        type: 'SELECT',
        required: true,
        options: ['Cookie banner with accept/reject', 'Cookie banner with granular controls', 'Implied consent (continue browsing)', 'No consent mechanism yet'],
        sortOrder: 62,
        section: 'Cookies & Tracking',
        showIf: { field: 'use_cookies', value: 'true' },
    },

    // ============ SECTION 5: THIRD PARTY SERVICES ============
    {
        id: 'use_third_party',
        question: 'Do you use any third-party services?',
        description: 'Analytics, advertising, payment processors, cloud services, etc.',
        type: 'BOOLEAN',
        required: true,
        sortOrder: 70,
        section: 'Third Party Services',
    },
    {
        id: 'use_analytics',
        question: 'Do you use analytics services?',
        description: 'Google Analytics, Firebase, Mixpanel, etc.',
        type: 'BOOLEAN',
        required: true,
        sortOrder: 71,
        section: 'Third Party Services',
        showIf: { field: 'use_third_party', value: 'true' },
    },
    {
        id: 'analytics_services',
        question: 'Which analytics services do you use?',
        description: 'List all analytics providers',
        type: 'TEXT',
        required: true,
        sortOrder: 72,
        section: 'Third Party Services',
        showIf: { field: 'use_analytics', value: 'true' },
    },
    {
        id: 'use_advertising',
        question: 'Do you use advertising or ad networks?',
        description: 'Google Ads, Facebook Ads, AdMob, etc.',
        type: 'BOOLEAN',
        required: true,
        sortOrder: 73,
        section: 'Third Party Services',
        showIf: { field: 'use_third_party', value: 'true' },
    },
    {
        id: 'advertising_services',
        question: 'Which advertising services do you use?',
        description: 'List all ad networks',
        type: 'TEXT',
        required: true,
        sortOrder: 74,
        section: 'Third Party Services',
        showIf: { field: 'use_advertising', value: 'true' },
    },
    {
        id: 'use_social_login',
        question: 'Do you offer social media login?',
        description: 'Login with Google, Facebook, Apple, etc.',
        type: 'BOOLEAN',
        required: true,
        sortOrder: 75,
        section: 'Third Party Services',
        showIf: { field: 'use_third_party', value: 'true' },
    },
    {
        id: 'social_providers',
        question: 'Which social login providers?',
        description: 'List all social login options',
        type: 'TEXT',
        required: true,
        sortOrder: 76,
        section: 'Third Party Services',
        showIf: { field: 'use_social_login', value: 'true' },
    },
    {
        id: 'other_third_party',
        question: 'List any other third-party services',
        description: 'Cloud services, crash reporting, push notifications, etc.',
        type: 'TEXTAREA',
        required: false,
        sortOrder: 77,
        section: 'Third Party Services',
        showIf: { field: 'use_third_party', value: 'true' },
    },

    // ============ SECTION 6: PAYMENTS (E-commerce/SaaS/Games with IAP) ============
    {
        id: 'collect_payment',
        question: 'Do you process payments or collect payment info?',
        description: 'Credit cards, bank accounts, or in-app purchases',
        type: 'BOOLEAN',
        required: true,
        sortOrder: 80,
        section: 'Payments',
        showIf: { field: 'app_type', value: ['E-commerce', 'SaaS Platform', 'Game', 'Mobile App', 'Web Application'] },
    },
    {
        id: 'payment_processor',
        question: 'Which payment processor(s) do you use?',
        description: 'Stripe, PayPal, Apple Pay, Google Pay, etc.',
        type: 'TEXT',
        required: true,
        sortOrder: 81,
        section: 'Payments',
        showIf: { field: 'collect_payment', value: 'true' },
    },
    {
        id: 'store_payment_data',
        question: 'Do you store payment data on your servers?',
        description: 'Or does the payment processor handle everything?',
        type: 'SELECT',
        required: true,
        options: ['No - Payment processor handles all data', 'Yes - We store encrypted tokens', 'Yes - Full payment data (PCI-DSS compliant)'],
        sortOrder: 82,
        section: 'Payments',
        showIf: { field: 'collect_payment', value: 'true' },
    },

    // ============ SECTION 7: DATA SHARING ============
    {
        id: 'share_data',
        question: 'Do you share user data with third parties?',
        description: 'Beyond the service providers mentioned above',
        type: 'BOOLEAN',
        required: true,
        sortOrder: 90,
        section: 'Data Sharing',
        showIf: { field: 'collect_personal_data', value: 'true' },
    },
    {
        id: 'share_data_affiliates',
        question: 'Do you share with affiliates or subsidiaries?',
        description: 'Parent companies, sister companies',
        type: 'BOOLEAN',
        required: true,
        sortOrder: 91,
        section: 'Data Sharing',
        showIf: { field: 'share_data', value: 'true' },
    },
    {
        id: 'share_data_partners',
        question: 'Do you share with business partners?',
        description: 'Marketing partners, joint ventures',
        type: 'BOOLEAN',
        required: true,
        sortOrder: 92,
        section: 'Data Sharing',
        showIf: { field: 'share_data', value: 'true' },
    },
    {
        id: 'sell_data',
        question: 'Do you sell personal information?',
        description: 'CCPA requires disclosure of data sales',
        type: 'BOOLEAN',
        required: true,
        sortOrder: 93,
        section: 'Data Sharing',
        showIf: { field: 'share_data', value: 'true' },
    },
    {
        id: 'share_purposes',
        question: 'What are the purposes of data sharing?',
        description: 'Explain why you share data',
        type: 'TEXTAREA',
        required: true,
        sortOrder: 94,
        section: 'Data Sharing',
        showIf: { field: 'share_data', value: 'true' },
    },

    // ============ SECTION 8: DATA RETENTION (only if collecting data) ============
    {
        id: 'data_retention_period',
        question: 'How long do you retain user data?',
        description: 'Default retention period',
        type: 'SELECT',
        required: true,
        options: ['Until account deletion', 'Up to 1 year', 'Up to 2 years', 'Up to 5 years', 'Indefinitely', 'Varies by data type'],
        sortOrder: 100,
        section: 'Data Retention & Security',
        showIf: { field: 'collect_personal_data', value: 'true' },
    },
    {
        id: 'data_deletion_process',
        question: 'How can users delete their data?',
        description: 'Data deletion options available to users',
        type: 'SELECT',
        required: true,
        options: ['In-app deletion option', 'Email request', 'Account settings', 'Contact form', 'Multiple options'],
        sortOrder: 101,
        section: 'Data Retention & Security',
        showIf: { field: 'collect_personal_data', value: 'true' },
    },

    // ============ SECTION 9: SECURITY ============
    {
        id: 'encryption_transit',
        question: 'Is data encrypted in transit (HTTPS)?',
        description: 'TLS/SSL for data transmission',
        type: 'BOOLEAN',
        required: true,
        sortOrder: 110,
        section: 'Data Retention & Security',
    },
    {
        id: 'encryption_rest',
        question: 'Is data encrypted at rest?',
        description: 'Database and storage encryption',
        type: 'BOOLEAN',
        required: true,
        sortOrder: 111,
        section: 'Data Retention & Security',
        showIf: { field: 'collect_personal_data', value: 'true' },
    },
    {
        id: 'security_measures',
        question: 'What other security measures do you use?',
        description: 'Access controls, audits, 2FA, etc.',
        type: 'TEXTAREA',
        required: false,
        sortOrder: 112,
        section: 'Data Retention & Security',
    },

    // ============ SECTION 10: INTERNATIONAL TRANSFERS ============
    {
        id: 'data_stored_location',
        question: 'Where is user data stored?',
        description: 'Server locations',
        type: 'SELECT',
        required: true,
        options: ['United States', 'European Union', 'US and EU', 'Multiple global locations', 'User\'s region'],
        sortOrder: 120,
        section: 'International Transfers',
        showIf: { field: 'collect_personal_data', value: 'true' },
    },
    {
        id: 'transfer_outside_eea',
        question: 'Do you transfer data outside the EU/EEA?',
        description: 'Transfers to non-EU countries',
        type: 'BOOLEAN',
        required: true,
        sortOrder: 121,
        section: 'International Transfers',
        showIf: { field: 'target_regions', value: ['Worldwide', 'USA and Europe', 'Europe only'] },
    },
    {
        id: 'transfer_safeguards',
        question: 'What safeguards do you use for transfers?',
        description: 'Legal mechanisms for international transfers',
        type: 'SELECT',
        required: true,
        options: ['Standard Contractual Clauses (SCCs)', 'Binding Corporate Rules', 'Adequacy decisions', 'User consent', 'Not applicable'],
        sortOrder: 122,
        section: 'International Transfers',
        showIf: { field: 'transfer_outside_eea', value: 'true' },
    },

    // ============ SECTION 11: USER RIGHTS ============
    {
        id: 'provide_data_access',
        question: 'Can users access their data?',
        description: 'View collected data',
        type: 'BOOLEAN',
        required: true,
        sortOrder: 130,
        section: 'User Rights',
        showIf: { field: 'collect_personal_data', value: 'true' },
    },
    {
        id: 'provide_data_export',
        question: 'Can users export/download their data?',
        description: 'Data portability feature',
        type: 'BOOLEAN',
        required: true,
        sortOrder: 131,
        section: 'User Rights',
        showIf: { field: 'collect_personal_data', value: 'true' },
    },
    {
        id: 'provide_opt_out',
        question: 'Can users opt out of data collection?',
        description: 'Options to limit data collection',
        type: 'BOOLEAN',
        required: true,
        sortOrder: 132,
        section: 'User Rights',
        showIf: { field: 'collect_personal_data', value: 'true' },
    },
    {
        id: 'provide_marketing_opt_out',
        question: 'Can users opt out of marketing?',
        description: 'Unsubscribe from emails/notifications',
        type: 'BOOLEAN',
        required: true,
        sortOrder: 133,
        section: 'User Rights',
    },

    // ============ SECTION 12: GAME-SPECIFIC (only for Games) ============
    {
        id: 'game_has_iap',
        question: 'Does your game have in-app purchases?',
        description: 'Virtual goods, currency, premium features',
        type: 'BOOLEAN',
        required: true,
        sortOrder: 140,
        section: 'Game Features',
        showIf: { field: 'app_type', value: 'Game' },
    },
    {
        id: 'game_has_multiplayer',
        question: 'Does your game have multiplayer features?',
        description: 'Online play, chat, social features',
        type: 'BOOLEAN',
        required: true,
        sortOrder: 141,
        section: 'Game Features',
        showIf: { field: 'app_type', value: 'Game' },
    },
    {
        id: 'game_has_chat',
        question: 'Does your game have chat or messaging?',
        description: 'In-game chat, voice chat, messaging',
        type: 'BOOLEAN',
        required: true,
        sortOrder: 142,
        section: 'Game Features',
        showIf: { field: 'game_has_multiplayer', value: 'true' },
    },
    {
        id: 'game_has_leaderboards',
        question: 'Does your game have leaderboards or profiles?',
        description: 'Public scores, achievements, player profiles',
        type: 'BOOLEAN',
        required: true,
        sortOrder: 143,
        section: 'Game Features',
        showIf: { field: 'app_type', value: 'Game' },
    },
    {
        id: 'game_has_ads',
        question: 'Does your game show advertisements?',
        description: 'Banner ads, interstitial, rewarded video',
        type: 'BOOLEAN',
        required: true,
        sortOrder: 144,
        section: 'Game Features',
        showIf: { field: 'app_type', value: 'Game' },
    },

    // ============ SECTION 13: MOBILE-SPECIFIC (only for Mobile Apps) ============
    {
        id: 'mobile_permissions',
        question: 'What device permissions does your app require?',
        description: 'Camera, microphone, contacts, etc.',
        type: 'SELECT',
        required: true,
        options: ['No special permissions', 'Camera only', 'Location only', 'Camera and Location', 'Multiple permissions (describe below)'],
        sortOrder: 150,
        section: 'Mobile Features',
        showIf: { field: 'app_type', value: 'Mobile App' },
    },
    {
        id: 'mobile_permissions_detail',
        question: 'List all permissions and their purposes',
        description: 'Explain why each permission is needed',
        type: 'TEXTAREA',
        required: true,
        sortOrder: 151,
        section: 'Mobile Features',
        showIf: { field: 'mobile_permissions', value: 'Multiple permissions (describe below)' },
    },
    {
        id: 'mobile_push_notifications',
        question: 'Do you send push notifications?',
        description: 'Mobile push or in-app notifications',
        type: 'BOOLEAN',
        required: true,
        sortOrder: 152,
        section: 'Mobile Features',
        showIf: { field: 'app_type', value: 'Mobile App' },
    },
    {
        id: 'mobile_background_data',
        question: 'Does your app collect data in the background?',
        description: 'Location tracking, syncing while app is closed',
        type: 'BOOLEAN',
        required: true,
        sortOrder: 153,
        section: 'Mobile Features',
        showIf: { field: 'app_type', value: 'Mobile App' },
    },

    // ============ SECTION 14: E-COMMERCE SPECIFIC ============
    {
        id: 'ecommerce_shipping',
        question: 'Do you collect shipping addresses?',
        description: 'Physical delivery addresses',
        type: 'BOOLEAN',
        required: true,
        sortOrder: 160,
        section: 'E-commerce Features',
        showIf: { field: 'app_type', value: 'E-commerce' },
    },
    {
        id: 'ecommerce_order_history',
        question: 'Do you store order/purchase history?',
        description: 'Past orders, invoices, receipts',
        type: 'BOOLEAN',
        required: true,
        sortOrder: 161,
        section: 'E-commerce Features',
        showIf: { field: 'app_type', value: 'E-commerce' },
    },
    {
        id: 'ecommerce_recommendations',
        question: 'Do you provide personalized recommendations?',
        description: 'Product suggestions based on browsing/purchase history',
        type: 'BOOLEAN',
        required: true,
        sortOrder: 162,
        section: 'E-commerce Features',
        showIf: { field: 'app_type', value: 'E-commerce' },
    },

    // ============ SECTION 15: BREACH & NOTIFICATIONS ============
    {
        id: 'breach_notification',
        question: 'Do you have a data breach notification process?',
        description: 'GDPR requires notification within 72 hours',
        type: 'BOOLEAN',
        required: true,
        sortOrder: 170,
        section: 'Breach Notification',
        showIf: { field: 'collect_personal_data', value: 'true' },
    },
    {
        id: 'breach_timeline',
        question: 'Within what timeframe do you notify users?',
        description: 'After discovering a breach',
        type: 'SELECT',
        required: true,
        options: ['Within 24 hours', 'Within 72 hours (GDPR)', 'Within 7 days', 'As soon as practicable'],
        sortOrder: 171,
        section: 'Breach Notification',
        showIf: { field: 'breach_notification', value: 'true' },
    },

    // ============ SECTION 16: ADDITIONAL ============
    {
        id: 'additional_info',
        question: 'Any additional information?',
        description: 'Other relevant details about your data practices',
        type: 'TEXTAREA',
        required: false,
        sortOrder: 200,
        section: 'Additional Information',
    },
];

// Helper function to check if a question should be shown based on current answers
export const shouldShowQuestion = (question, answers) => {
    if (!question.showIf) return true;

    const { field, value } = question.showIf;
    const currentAnswer = answers[field];

    if (currentAnswer === undefined || currentAnswer === null || currentAnswer === '') {
        return false;
    }

    // Handle array of values (OR condition)
    if (Array.isArray(value)) {
        return value.includes(currentAnswer);
    }

    // Handle single value
    return currentAnswer === value;
};

// Get visible questions based on current answers
export const getVisibleQuestions = (answers = {}) => {
    return questions.filter(q => shouldShowQuestion(q, answers));
};

// Get questions grouped by section
export const getQuestionsBySection = (answers = {}) => {
    const visibleQuestions = getVisibleQuestions(answers);
    const sections = {};
    
    visibleQuestions.forEach(q => {
        const section = q.section || 'Other';
        if (!sections[section]) {
            sections[section] = [];
        }
        sections[section].push(q);
    });

    return sections;
};

// Get all questions (for backward compatibility)
export const getQuestions = () => {
    return questions.map(q => ({
        ...q,
        options: q.options || null,
    }));
};
