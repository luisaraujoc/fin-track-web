import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001', // Porta corrigida
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor: Adiciona o token
api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

// Interceptor: Trata Token Expirado (401)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Verifica se é erro 401
        if (error.response?.status === 401) {
            // AQUI ESTÁ O TRUQUE:
            // Se a URL original da requisição for '/auth/login', NÃO redireciona.
            // Deixa o erro voltar para a página de Login exibir "Senha incorreta".
            const isLoginRequest = error.config.url.includes('/auth/login');

            if (!isLoginRequest && typeof window !== 'undefined') {
                localStorage.removeItem('token');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;