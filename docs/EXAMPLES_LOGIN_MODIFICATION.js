// EXEMPLO: Modificação na rota de login para suporte 2FA
// routes/auth.js - Seção modificada

/**
 * POST /api/auth/login - Login com suporte a 2FA
 */
router.post('/login',
    loginRateLimit,
    async (req, res) => {
        try {
            const { username, password, twoFactorCode } = req.body;

            // Registra tentativa de login
            const recordAttempt = recordAttemptMiddleware('LOGIN');
            await new Promise((resolve) => recordAttempt(req, res, resolve));

            // Validação básica
            if (!username || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Username e senha são obrigatórios'
                });
            }

            // Busca usuário no banco
            const user = await User.findOne({ username });
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Credenciais inválidas',
                    attemptsRemaining: req.rateLimitInfo?.attemptsRemaining || 0
                });
            }

            // Verifica senha
            const isPasswordValid = await user.matchPassword(password);
            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    message: 'Credenciais inválidas',
                    attemptsRemaining: req.rateLimitInfo?.attemptsRemaining || 0
                });
            }

            // ========== LÓGICA 2FA ==========

            // Verifica se 2FA está habilitado
            if (user.twoFactorAuth.enabled) {
                // Se não forneceu código 2FA, retorna token temporário
                if (!twoFactorCode) {
                    const tempToken = generateSecureToken(
                        { id: user._id, role: user.role },
                        'partial_auth' // Novo tipo de token
                    );

                    return res.json({
                        success: false,
                        requiresTwoFactor: true,
                        tempToken: tempToken,
                        message: 'Código 2FA necessário',
                        expiresIn: '5m' // Token temporário expira em 5 minutos
                    });
                }

                // Verifica código 2FA fornecido
                const is2FAValid = await twoFactorService.verifyLogin(user, twoFactorCode);

                if (!is2FAValid) {
                    return res.status(401).json({
                        success: false,
                        message: 'Código 2FA inválido',
                        attemptsRemaining: req.rateLimitInfo?.attemptsRemaining || 0
                    });
                }
            }

            // ========== LOGIN COMPLETO ==========

            // Login bem-sucedido - limpa tentativas
            const clearAttempts = clearAttemptsMiddleware('LOGIN');
            await new Promise((resolve) => clearAttempts(req, res, resolve));

            // Gera tokens finais
            const accessToken = generateSecureToken({ id: user._id, role: user.role }, 'access');
            const refreshToken = generateSecureToken({ id: user._id, role: user.role }, 'refresh');

            // Atualiza último login
            await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

            res.json({
                success: true,
                _id: user._id,
                username: user.username,
                role: user.role,
                token: accessToken,
                refreshToken: refreshToken,
                message: 'Login realizado com sucesso',
                expiresIn: '15m',
                twoFactorEnabled: user.twoFactorAuth.enabled
            });

        } catch (error) {
            console.error('Erro no login:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }
);

// ========== NOVO TIPO DE TOKEN ==========
// middleware/jwtSecurity.js - Adicionar configuração

const JWT_CONFIG = {
    ACCESS_TOKEN_EXPIRY: process.env.JWT_ACCESS_EXPIRY || '15m',
    REFRESH_TOKEN_EXPIRY: process.env.JWT_REFRESH_EXPIRY || '7d',
    PARTIAL_AUTH_EXPIRY: process.env.JWT_PARTIAL_EXPIRY || '5m', // NOVO

    ISSUER: process.env.JWT_ISSUER || 'pastor-portfolio-api',
    AUDIENCE: process.env.JWT_AUDIENCE || 'pastor-portfolio-client',
    ALGORITHM: 'HS256',

    SECURITY_HEADERS: {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin'
    }
};

function generateSecureToken(payload, type = 'access') {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
        throw new Error('JWT_SECRET não configurado');
    }

    // Define expiração baseada no tipo
    let expiry;
    switch (type) {
        case 'access':
            expiry = JWT_CONFIG.ACCESS_TOKEN_EXPIRY;
            break;
        case 'refresh':
            expiry = JWT_CONFIG.REFRESH_TOKEN_EXPIRY;
            break;
        case 'partial_auth': // NOVO
            expiry = JWT_CONFIG.PARTIAL_AUTH_EXPIRY;
            break;
        default:
            throw new Error(`Tipo de token inválido: ${type}`);
    }

    const securePayload = {
        ...payload,
        iss: JWT_CONFIG.ISSUER,
        aud: JWT_CONFIG.AUDIENCE,
        iat: Math.floor(Date.now() / 1000),
        jti: crypto.randomUUID(),
        type: type
    };

    return jwt.sign(securePayload, secret, {
        expiresIn: expiry,
        algorithm: JWT_CONFIG.ALGORITHM
    });
}
