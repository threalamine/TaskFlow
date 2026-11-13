import { useEffect, useState } from 'react';
import api, { TOKEN_KEY } from '../api/axios';
import { AuthContext } from './AuthContext';

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const restoreSession = async () => {
            if (!localStorage.getItem(TOKEN_KEY)) {
                setLoading(false);
                return;
            }

            try {
                const { data } = await api.get('/auth/me');
                setUser(data.data);
            } catch {
                localStorage.removeItem(TOKEN_KEY);
            } finally {
                setLoading(false);
            }
        };

        restoreSession();
    }, []);

    const saveSession = (payload) => {
        localStorage.setItem(TOKEN_KEY, payload.token);
        setUser(payload.data);
    };

    const login = async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password });
        saveSession(data);
    };

    const register = async (name, email, password) => {
        const { data } = await api.post('/auth/register', {
            name,
            email,
            password,
        });
        saveSession(data);
    };

    const logout = () => {
        localStorage.removeItem(TOKEN_KEY);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}