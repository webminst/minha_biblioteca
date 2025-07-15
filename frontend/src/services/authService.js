// src/services/authService.js
import axios from 'axios';
import API_ENDPOINTS from '../config/api';

/**
 * Serviço de Autenticação com Refresh Token Automático
 */
class AuthService {
    constructor() {
        this.isRefreshing = false;
        this.refreshSubscribers = [];
        this.setupInterceptors();
    }

    /**
     * Configura interceptors do Axios para refresh automático
     */
    setupInterceptors() {
        // Request interceptor - adiciona token automaticamente
        axios.interceptors.request.use(
            (config) => {
                const token = this.getAccessToken();
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Response interceptor - trata expiração de tokens
        axios.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;

                // Se recebeu 401 e não é uma tentativa de refresh
                if (error.response?.status === 401 && !originalRequest._retry) {

                    // Se for o endpoint de refresh que falhou, desloga
                    if (originalRequest.url?.includes('/auth/refresh')) {
                        this.logout();
                        return Promise.reject(error);
                    }

                    // Marca como tentativa de retry
                    originalRequest._retry = true;

                    // Se já está fazendo refresh, adiciona à fila
                    if (this.isRefreshing) {
                        return new Promise((resolve) => {
                            this.refreshSubscribers.push((token) => {
                                originalRequest.headers.Authorization = `Bearer ${token}`;
                                resolve(axios(originalRequest));
                            });
                        });
                    }

                    // Tenta fazer refresh
                    this.isRefreshing = true;

                    try {
                        const newToken = await this.refreshToken();

                        if (newToken) {
                            // Atualiza token na requisição original
                            originalRequest.headers.Authorization = `Bearer ${newToken}`;

                            // Notifica todas as requisições em espera
                            this.refreshSubscribers.forEach(callback => callback(newToken));
                            this.refreshSubscribers = [];

                            // Reexecuta a requisição original
                            return axios(originalRequest);
                        }
                    } catch (refreshError) {
                        console.error('Erro ao renovar token:', refreshError);
                        this.logout();
                        return Promise.reject(refreshError);
                    } finally {
                        this.isRefreshing = false;
                    }
                }

                return Promise.reject(error);
            }
        );
    }

    /**
     * Obtém access token do localStorage
     */
    getAccessToken() {
        return localStorage.getItem('userToken');
    }

    /**
     * Obtém refresh token do localStorage
     */
    getRefreshToken() {
        return localStorage.getItem('refreshToken');
    }

    /**
     * Verifica se o usuário está autenticado
     */
    isAuthenticated() {
        const token = this.getAccessToken();
        const refreshToken = this.getRefreshToken();
        return !!(token && refreshToken);
    }

    /**
     * Renova o access token usando refresh token
     */
    async refreshToken() {
        try {
            const refreshToken = this.getRefreshToken();

            if (!refreshToken) {
                throw new Error('Refresh token não encontrado');
            }

            console.log('🔄 Renovando token...');

            const response = await axios.post(API_ENDPOINTS.AUTH.REFRESH, {
                refreshToken
            }, {
                // Remove o interceptor para esta requisição
                transformRequest: [(data, headers) => {
                    delete headers.Authorization;
                    return JSON.stringify(data);
                }],
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const { token: newAccessToken, expiresIn } = response.data;

            // Atualiza o access token
            localStorage.setItem('userToken', newAccessToken);

            console.log(`✅ Token renovado com sucesso! Expira em: ${expiresIn}`);

            // Dispara evento customizado para notificar componentes
            window.dispatchEvent(new CustomEvent('tokenRefreshed', {
                detail: { token: newAccessToken, expiresIn }
            }));

            return newAccessToken;

        } catch (error) {
            console.error('❌ Falha ao renovar token:', error);

            // Se refresh falhou, remove tokens inválidos
            this.logout();

            throw error;
        }
    }

    /**
     * Realiza login
     */
    async login(username, password) {
        try {
            const response = await axios.post(API_ENDPOINTS.AUTH.LOGIN, {
                username,
                password
            });

            const { token, refreshToken, username: loggedInUsername, role } = response.data;

            // Armazena tokens
            localStorage.setItem('userToken', token);
            localStorage.setItem('refreshToken', refreshToken);
            localStorage.setItem('username', loggedInUsername);
            localStorage.setItem('userRole', role);

            console.log('✅ Login realizado com sucesso');

            // Dispara evento de login
            window.dispatchEvent(new CustomEvent('userLoggedIn', {
                detail: { username: loggedInUsername, role, token, refreshToken }
            }));

            return { username: loggedInUsername, role, token, refreshToken };

        } catch (error) {
            console.error('❌ Erro no login:', error);
            throw error;
        }
    }

    /**
     * Realiza logout
     */
    logout() {
        console.log('🚪 Realizando logout...');

        // Remove todos os tokens
        localStorage.removeItem('userToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('username');
        localStorage.removeItem('userRole');

        // Dispara evento de logout
        window.dispatchEvent(new CustomEvent('userLoggedOut'));

        // Redireciona para login se não estiver lá
        if (window.location.pathname !== '/login') {
            window.location.href = '/login';
        }
    }

    /**
     * Obtém informações do usuário atual
     */
    getCurrentUser() {
        if (!this.isAuthenticated()) {
            return null;
        }

        return {
            username: localStorage.getItem('username'),
            role: localStorage.getItem('userRole'),
            token: this.getAccessToken()
        };
    }

    /**
     * Verifica se o token está próximo do vencimento
     * @param {number} minutesBefore - Minutos antes do vencimento para considerar "próximo"
     */
    isTokenExpiringSoon(minutesBefore = 2) {
        try {
            const token = this.getAccessToken();
            if (!token) return true;

            // Decodifica o JWT para obter a data de expiração
            const payload = JSON.parse(atob(token.split('.')[1]));
            const expirationTime = payload.exp * 1000; // Converte para milliseconds
            const currentTime = Date.now();
            const timeUntilExpiry = expirationTime - currentTime;
            const minutesUntilExpiry = timeUntilExpiry / (1000 * 60);

            return minutesUntilExpiry <= minutesBefore;
        } catch (error) {
            console.error('Erro ao verificar expiração do token:', error);
            return true; // Se não conseguiu verificar, considera como expirando
        }
    }

    /**
     * Inicia renovação proativa de tokens
     */
    startProactiveRefresh() {
        setInterval(() => {
            if (this.isAuthenticated() && this.isTokenExpiringSoon(2)) {
                console.log('⚡ Token expirando em breve, renovando proativamente...');
                this.refreshToken().catch(() => {
                    // Se falhar, será tratado pelo interceptor na próxima requisição
                });
            }
        }, 60000); // Verifica a cada minuto
    }

    /**
     * Verifica a validade do token no backend
     */
    async verifyToken() {
        try {
            const response = await axios.post(API_ENDPOINTS.AUTH.VERIFY, {
                token: this.getAccessToken()
            });
            return response.data.valid;
        } catch (error) {
            console.error('Token inválido:', error);
            return false;
        }
    }
}

// Instância singleton
const authService = new AuthService();

// Inicia refresh proativo quando o serviço é carregado
authService.startProactiveRefresh();

export default authService;
