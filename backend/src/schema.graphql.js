export const typeDefs = `#graphql
  enum UserStatus {
    PENDING
    APPROVED
    REJECTED
    ADMIN
  }

  enum DocumentStatus {
    DRAFT
    APPROVED
    PUBLISHED
  }

  enum QuestionType {
    TEXT
    TEXTAREA
    SELECT
    BOOLEAN
    EMAIL
  }

  enum ImageType {
    APP_ICON
    FEATURE_GRAPHIC
    STORE_SCREENSHOT
  }

  type User {
    id: ID!
    email: String!
    username: String!
    status: UserStatus!
    createdAt: String!
  }

  type Question {
    id: ID!
    question: String!
    description: String
    type: QuestionType!
    required: Boolean!
    options: [String]
    sortOrder: Int
  }

  type Document {
    id: ID!
    userId: ID!
    appName: String!
    appDescription: String
    shortDescription: String
    longDescription: String
    privacyPolicy: String
    termsOfService: String
    status: DocumentStatus!
    imageCount: Int
    totalCost: Float
    createdAt: String!
    updatedAt: String!
    deleteRequests: [DeleteRequest!]!
    appImages: [AppImage!]!
    usageCost: Float
  }

  type DeleteRequest {
    id: ID!
    documentId: ID!
    email: String!
    createdAt: String!
  }

  type AppImage {
    id: ID!
    documentId: ID!
    imageType: String!
    style: String
    prompt: String
    cloudinaryUrl: String!
    cloudinaryId: String!
    width: Int
    height: Int
    createdAt: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type UsageByType {
    type: String!
    requests: Int!
    cost: Float!
  }

  type UsageByDocument {
    documentId: ID!
    appName: String
    requests: Int!
    cost: Float!
  }

  type DailyUsage {
    date: String!
    requests: Int!
    cost: Float!
  }

  type UsageStats {
    totalRequests: Int!
    totalInputTokens: Int!
    totalOutputTokens: Int!
    totalCost: Float!
    byType: [UsageByType!]!
    byDocument: [UsageByDocument!]!
    dailyUsage: [DailyUsage!]!
  }

  type DocumentUsageHistory {
    usageType: String!
    modelName: String!
    inputTokens: Int
    outputTokens: Int
    cost: Float!
    createdAt: String!
  }

  type DocumentUsage {
    totalCost: Float!
    totalRequests: Int!
    history: [DocumentUsageHistory!]!
  }

  type AppDescriptionResult {
    shortDescription: String!
    longDescription: String!
  }

  type Query {
    # Auth
    me: User!
    
    # Questions
    questions: [Question!]!
    
    # Documents / Apps
    myDocuments: [Document!]!
    document(id: ID!): Document
    documentByApp(appName: String!): Document
    
    # App Images
    appImages(documentId: ID!): [AppImage!]!
    appImage(id: ID!): AppImage
    
    # Public Documents (no auth required)
    publicDocument(username: String!, appName: String!): Document
    
    # API Usage
    myUsageStats: UsageStats!
    documentUsage(documentId: ID!): DocumentUsage!
    
    # Admin
    pendingUsers: [User!]!
    allUsers: [User!]!
  }

  type Mutation {
    # Auth
    register(email: String!, password: String!, username: String!): User!
    login(email: String!, password: String!): AuthPayload!
    
    # Documents
    generateDocuments(appName: String!, answers: [AnswerInput!]!): Document!
    approveDocument(documentId: ID!): Document!
    updateDocument(documentId: ID!, appName: String!, appDescription: String, privacyPolicy: String!, termsOfService: String!): Document!
    publishDocument(documentId: ID!): Document!
    unpublishDocument(documentId: ID!): Document!
    deleteDocument(documentId: ID!): Boolean!
    
    # App Images - styles array for multi-style generation, count per style
    generateAppImage(documentId: ID!, imageType: String!, styles: [String!], colors: [String!], prompt: String, requiredText: String, onlyRequiredText: Boolean, referenceImages: [String], transparentBackground: Boolean, count: Int, includeText: Boolean, includeAppName: Boolean): [AppImage!]!
    deleteAppImage(imageId: ID!): Boolean!
    
    # Delete Requests
    createDeleteRequest(appName: String!, email: String!): DeleteRequest!
    
    # App Description Generation
    generateAppDescription(documentId: ID!, prompt: String!): AppDescriptionResult!
    
    # Admin
    approveUser(userId: ID!): User!
    rejectUser(userId: ID!): User!
  }

  input AnswerInput {
    questionId: ID!
    value: String!
  }
`;
