import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // Refresh hote hi turant localStorage se data uthana zaroori hai
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            localStorage.setItem('token', token);
        } else {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
        setLoading(false); // Ye batata hai ki auth check poora ho gaya
    }, [token]);

    const login = (userData, userToken) => {
        setToken(userToken);
        setUser(userData);
        localStorage.setItem('token', userToken);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.clear();
    };

    return (
        <AuthContext.Provider value={{ user, setUser, token, setToken, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};