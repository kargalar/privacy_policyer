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
    privacyPolicy: String
    termsOfService: String
    status: DocumentStatus!
    createdAt: String!
    updatedAt: String!
    deleteRequests: [DeleteRequest!]!
    appImages: [AppImage!]!
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
    
    # App Images
    generateAppImage(documentId: ID!, imageType: String!, style: String, prompt: String, referenceImages: [String], transparentBackground: Boolean): AppImage!
    deleteAppImage(imageId: ID!): Boolean!
    
    # Delete Requests
    createDeleteRequest(appName: String!, email: String!): DeleteRequest!
    
    # Admin
    approveUser(userId: ID!): User!
    rejectUser(userId: ID!): User!
  }

  input AnswerInput {
    questionId: ID!
    value: String!
  }
`;
