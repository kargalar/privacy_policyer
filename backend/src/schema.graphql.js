export const typeDefs = `#graphql
  enum UserStatus {
    PENDING
    APPROVED
    REJECTED
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
    fullName: String
    status: UserStatus!
    isAdmin: Boolean!
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

  type Answer {
    questionId: ID!
    value: String!
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
    
    # Admin
    pendingUsers: [User!]!
    allUsers: [User!]!
  }

  type Mutation {
    # Auth
    register(email: String!, password: String!, fullName: String!): User!
    login(email: String!, password: String!): AuthPayload!
    
    # Questions
    submitAnswers(answers: [AnswerInput!]!): Boolean!
    
    # Documents
    generateDocuments(appName: String!, answers: [AnswerInput!]!): Document!
    approveDocument(documentId: ID!): Document!
    publishDocument(documentId: ID!): Document!
    deleteDocument(documentId: ID!): Boolean!
    
    # Admin
    approveUser(userId: ID!): User!
    rejectUser(userId: ID!): User!
  }

  input AnswerInput {
    questionId: ID!
    value: String!
  }
`;
