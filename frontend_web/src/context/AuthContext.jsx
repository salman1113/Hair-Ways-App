import React, { createContext, useState, useEffect, useContext } from 'react';
import { getUserProfile, loginUser as apiLogin, logoutUser } from '../services/api';

const AuthContext = createContext();

// Custom Hook for easy usage
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [authTokens, setAuthTokens] = useState(() => {
        const access = localStorage.getItem('access_token');
        const refresh = localStorage.getItem('refresh_token');
        return access ? { access, refresh } : null;
    });
    const [loading, setLoading] = useState(true);

    // 🔄 1. Check if user is already logged in (On Page Load)
    useEffect(() => {
        const initAuth = async () => {
            if (authTokens) {
                try {
                    const userData = await getUserProfile();
                    setUser(userData);
                } catch (error) {
                    console.error("Session expired:", error);
                    logout();
                }
            }
            setLoading(false);
        };
        initAuth();
    }, []); // Run once on mount

    // 🔐 2. Unified Login Success Handler (Used by Google & Standard Login)
    const loginSuccess = (data) => {
        // data expected: { access, refresh, user }
        setAuthTokens({ access: data.access, refresh: data.refresh });
        setUser(data.user);

        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
    };

    // 🔐 3. Standard Login Function (Email/Pass)
    const login = async (email, password) => {
        const data = await apiLogin(email, password);

        // Check for OTP requirement (Admin or unverified)
        if (data.require_otp) {
            return data;
        }

        let userData = data.user;
        if (!userData) {
            // If apiLogin doesn't return user, fetch it.
            // Helper: temporarily set tokens so api call works
            localStorage.setItem('access_token', data.access);
            try {
                userData = await getUserProfile();
            } catch (error) {
                console.error("Failed to fetch profile after login:", error);
                throw error;
            }
        }

        // Construct full data object for loginSuccess
        loginSuccess({ ...data, user: userData });
        return userData;
    };

    // 🚪 4. Logout Function
    const logout = () => {
        logoutUser(); // Clears LocalStorage
        setAuthTokens(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, authTokens, login, loginSuccess, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;