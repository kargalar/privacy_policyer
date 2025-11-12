import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { GET_ME_QUERY } from '../graphql/queries';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem('token');

    const { data, loading: queryLoading } = useQuery(GET_ME_QUERY, {
        skip: !token,
        errorPolicy: 'ignore',
    });

    useEffect(() => {
        if (data?.me) {
            setUser(data.me);
        }
        setLoading(queryLoading);
    }, [data, queryLoading]);

    useEffect(() => {
        if (!token) {
            setUser(null);
            setLoading(false);
        }
    }, [token]);

    const login = (newUser, newToken) => {
        localStorage.setItem('token', newToken);
        setUser(newUser);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
