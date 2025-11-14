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

export const SUBMIT_ANSWERS_MUTATION = gql`
  mutation SubmitAnswers($answers: [AnswerInput!]!) {
    submitAnswers(answers: $answers)
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
      privacyPolicy
      termsOfService
      status
      createdAt
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
  mutation UpdateDocument($documentId: ID!, $appName: String!, $privacyPolicy: String!, $termsOfService: String!) {
    updateDocument(documentId: $documentId, appName: $appName, privacyPolicy: $privacyPolicy, termsOfService: $termsOfService) {
      id
      appName
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
