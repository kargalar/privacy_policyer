import { gql } from '@apollo/client';

export const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        email
        username
        status
      }
    }
  }
`;

export const REGISTER_MUTATION = gql`
  mutation Register($email: String!, $password: String!, $username: String!) {
    register(email: $email, password: $password, username: $username) {
      id
      email
      username
      status
    }
  }
`;

export const GET_ME_QUERY = gql`
  query GetMe {
    me {
      id
      email
      username
      status
    }
  }
`;

export const GET_QUESTIONS_QUERY = gql`
  query GetQuestions {
    questions {
      id
      question
      description
      type
      required
      options
      sortOrder
    }
  }
`;

export const GENERATE_DOCUMENTS_MUTATION = gql`
  mutation GenerateDocuments($appName: String!, $answers: [AnswerInput!]!) {
    generateDocuments(appName: $appName, answers: $answers) {
      id
      appName
      privacyPolicy
      termsOfService
      status
      createdAt
    }
  }
`;

export const GET_MY_DOCUMENTS_QUERY = gql`
  query GetMyDocuments {
    myDocuments {
      id
      appName
      status
      imageCount
      totalCost
      createdAt
      updatedAt
    }
  }
`;

export const GET_DOCUMENT_QUERY = gql`
  query GetDocument($id: ID!) {
    document(id: $id) {
      id
      appName
      appDescription
      shortDescription
      longDescription
      privacyPolicy
      termsOfService
      status
      createdAt
      deleteRequests {
        id
        documentId
        email
        createdAt
      }
    }
  }
`;

export const APPROVE_DOCUMENT_MUTATION = gql`
  mutation ApproveDocument($documentId: ID!) {
    approveDocument(documentId: $documentId) {
      id
      status
    }
  }
`;

export const UPDATE_DOCUMENT_MUTATION = gql`
  mutation UpdateDocument($documentId: ID!, $appName: String!, $appDescription: String, $privacyPolicy: String!, $termsOfService: String!) {
    updateDocument(documentId: $documentId, appName: $appName, appDescription: $appDescription, privacyPolicy: $privacyPolicy, termsOfService: $termsOfService) {
      id
      appName
      appDescription
      privacyPolicy
      termsOfService
      status
    }
  }
`;

export const PUBLISH_DOCUMENT_MUTATION = gql`
  mutation PublishDocument($documentId: ID!) {
    publishDocument(documentId: $documentId) {
      id
      status
    }
  }
`;

export const UNPUBLISH_DOCUMENT_MUTATION = gql`
  mutation UnpublishDocument($documentId: ID!) {
    unpublishDocument(documentId: $documentId) {
      id
      status
    }
  }
`;

export const DELETE_DOCUMENT_MUTATION = gql`
  mutation DeleteDocument($documentId: ID!) {
    deleteDocument(documentId: $documentId)
  }
`;

export const PENDING_USERS_QUERY = gql`
  query GetPendingUsers {
    pendingUsers {
      id
      email
      username
      createdAt
    }
  }
`;

export const APPROVE_USER_MUTATION = gql`
  mutation ApproveUser($userId: ID!) {
    approveUser(userId: $userId) {
      id
      status
    }
  }
`;

export const REJECT_USER_MUTATION = gql`
  mutation RejectUser($userId: ID!) {
    rejectUser(userId: $userId) {
      id
      status
    }
  }
`;

export const GET_PUBLIC_DOCUMENT_QUERY = gql`
  query GetPublicDocument($username: String!, $appName: String!) {
    publicDocument(username: $username, appName: $appName) {
      id
      appName
      privacyPolicy
      termsOfService
      status
      createdAt
    }
  }
`;

export const CREATE_DELETE_REQUEST_MUTATION = gql`
  mutation CreateDeleteRequest($appName: String!, $email: String!) {
    createDeleteRequest(appName: $appName, email: $email) {
      id
      documentId
      email
      createdAt
    }
  }
`;

// App Images Queries and Mutations
export const GET_APP_IMAGES_QUERY = gql`
  query GetAppImages($documentId: ID!) {
    appImages(documentId: $documentId) {
      id
      documentId
      imageType
      style
      prompt
      cloudinaryUrl
      cloudinaryId
      width
      height
      createdAt
    }
  }
`;

export const GENERATE_APP_IMAGE_MUTATION = gql`
  mutation GenerateAppImage($documentId: ID!, $imageType: String!, $styles: [String!], $prompt: String, $referenceImages: [String], $transparentBackground: Boolean, $count: Int, $includeText: Boolean, $includeAppName: Boolean) {
    generateAppImage(documentId: $documentId, imageType: $imageType, styles: $styles, prompt: $prompt, referenceImages: $referenceImages, transparentBackground: $transparentBackground, count: $count, includeText: $includeText, includeAppName: $includeAppName) {
      id
      documentId
      imageType
      style
      prompt
      cloudinaryUrl
      cloudinaryId
      width
      height
      createdAt
    }
  }
`;

export const DELETE_APP_IMAGE_MUTATION = gql`
  mutation DeleteAppImage($imageId: ID!) {
    deleteAppImage(imageId: $imageId)
  }
`;

// API Usage Queries
export const GET_MY_USAGE_STATS = gql`
  query GetMyUsageStats {
    myUsageStats {
      totalRequests
      totalInputTokens
      totalOutputTokens
      totalCost
      byType {
        type
        requests
        cost
      }
      byDocument {
        documentId
        appName
        requests
        cost
      }
      dailyUsage {
        date
        requests
        cost
      }
    }
  }
`;

export const GET_DOCUMENT_USAGE = gql`
  query GetDocumentUsage($documentId: ID!) {
    documentUsage(documentId: $documentId) {
      totalCost
      totalRequests
      history {
        usageType
        modelName
        inputTokens
        outputTokens
        cost
        createdAt
      }
    }
  }
`;

export const GENERATE_APP_DESCRIPTION_MUTATION = gql`
  mutation GenerateAppDescription($documentId: ID!, $prompt: String!) {
    generateAppDescription(documentId: $documentId, prompt: $prompt) {
      shortDescription
      longDescription
    }
  }
`;
