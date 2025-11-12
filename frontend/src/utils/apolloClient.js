import { ApolloClient, InMemoryCache, HttpLink, ApolloLink } from '@apollo/client';

const httpLink = new HttpLink({
    uri: process.env.REACT_APP_GRAPHQL_ENDPOINT || 'http://localhost:4000/graphql',
    credentials: 'include',
});

const authLink = new ApolloLink((operation, forward) => {
    const token = localStorage.getItem('token');

    if (token) {
        operation.setContext({
            headers: {
                authorization: `Bearer ${token}`,
            },
        });
    }

    return forward(operation);
});

const client = new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
});

export default client;
