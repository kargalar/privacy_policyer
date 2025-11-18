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
    privacyPolicy: String
    termsOfService: String
    status: DocumentStatus!
    createdAt: String!
    updatedAt: String!
    deleteRequests: [DeleteRequest!]!
  }

  type DeleteRequest {
    id: ID!
    documentId: ID!
    email: String!
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
    
    # Documents
    myDocuments: [Document!]!
    document(id: ID!): Document
    documentByApp(appName: String!): Document
    
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
    updateDocument(documentId: ID!, appName: String!, privacyPolicy: String!, termsOfService: String!): Document!
    publishDocument(documentId: ID!): Document!
    unpublishDocument(documentId: ID!): Document!
    deleteDocument(documentId: ID!): Boolean!
    
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
