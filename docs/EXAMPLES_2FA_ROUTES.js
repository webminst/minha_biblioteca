// routes/auth2fa.js - EXEMPLO de rotas para 2FA
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const twoFactorService = require('../services/TwoFactorService');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const { generateSecureToken } = require('../middleware/jwtSecurity');
const { authRateLimit } = require('../middleware/rateLimiter');
const { auditAuthActions, auditCriticalActions } = require('../middleware/auditLogger');
const { ApiResponseDTO } = require('../dto');

// Aplica rate limiting e auditoria
router.use(authRateLimit);
router.use(auditAuthActions());

/**
 * POST /api/auth/2fa/setup
 * Inicia configuração do 2FA para usuário
 */
router.post('/setup',
    protect, // Usuário deve estar autenticado
    auditCriticalActions(),
    async (req, res) => {
        try {
            const user = req.user;

            // Verifica se 2FA já está habilitado
            if (user.twoFactorAuth.enabled) {
                return res.status(400).json(
                    ApiResponseDTO.error('2FA já está ativado para este usuário', null, 400)
                );
            }

            // Gera configuração de setup
            const setupData = await twoFactorService.generateSetup(user);

            res.json(
                ApiResponseDTO.success({
                    qrCode: setupData.qrCode,
                    manualEntryKey: setupData.manualEntryKey,
                    issuer: process.env.TOTP_ISSUER || 'Pastor-Portfolio',
                    backupCodes: setupData.backupCodes
                }, 'Setup 2FA gerado com sucesso')
            );

        } catch (error) {
            console.error('Erro no setup 2FA:', error);
            res.status(500).json(
                ApiResponseDTO.error('Erro interno no setup 2FA', null, 500)
            );
        }
    }
);

/**
 * POST /api/auth/2fa/enable
 * Ativa 2FA após verificação do código
 */
router.post('/enable',
    protect,
    auditCriticalActions(),
    async (req, res) => {
        try {
            const { secret, verificationCode } = req.body;
            const user = req.user;

            // Validação básica
            if (!secret || !verificationCode) {
                return res.status(400).json(
                    ApiResponseDTO.error('Secret e código de verificação são obrigatórios', null, 400)
                );
            }

            // Verifica se 2FA já está habilitado
            if (user.twoFactorAuth.enabled) {
                return res.status(400).json(
                    ApiResponseDTO.error('2FA já está ativado', null, 400)
                );
            }

            // Ativa 2FA
            const result = await twoFactorService.enableTwoFactor(
                user._id,
                secret,
                verificationCode
            );

            res.json(
                ApiResponseDTO.success({
                    backupCodes: result.backupCodes,
                    enabled: true
                }, '2FA ativado com sucesso')
            );

        } catch (error) {
            console.error('Erro ao ativar 2FA:', error);

            if (error.message.includes('inválido')) {
                return res.status(400).json(
                    ApiResponseDTO.error(error.message, null, 400)
                );
            }

            res.status(500).json(
                ApiResponseDTO.error('Erro interno ao ativar 2FA', null, 500)
            );
        }
    }
);

/**
 * POST /api/auth/2fa/verify
 * Verifica código 2FA durante login
 */
router.post('/verify', async (req, res) => {
    try {
        const { tempToken, twoFactorCode } = req.body;

        // Validação básica
        if (!tempToken || !twoFactorCode) {
            return res.status(400).json(
                ApiResponseDTO.error('Token temporário e código 2FA são obrigatórios', null, 400)
            );
        }

        // Verifica token temporário (partial_auth)
        const decoded = verifySecureToken(tempToken, 'partial_auth');

        // Busca usuário
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json(
                ApiResponseDTO.error('Usuário não encontrado', null, 401)
            );
        }

        // Verifica código 2FA
        const isValid = await twoFactorService.verifyLogin(user, twoFactorCode);

        if (!isValid) {
            return res.status(401).json(
                ApiResponseDTO.error('Código 2FA inválido', null, 401)
            );
        }

        // Gera tokens finais
        const accessToken = generateSecureToken({ id: user._id, role: user.role }, 'access');
        const refreshToken = generateSecureToken({ id: user._id, role: user.role }, 'refresh');

        res.json(
            ApiResponseDTO.success({
                _id: user._id,
                username: user.username,
                role: user.role,
                token: accessToken,
                refreshToken: refreshToken,
                expiresIn: '15m'
            }, 'Autenticação 2FA bem-sucedida')
        );

    } catch (error) {
        console.error('Erro na verificação 2FA:', error);
        res.status(500).json(
            ApiResponseDTO.error('Erro interno na verificação', null, 500)
        );
    }
});

/**
 * POST /api/auth/2fa/disable
 * Desativa 2FA para usuário
 */
router.post('/disable',
    protect,
    auditCriticalActions(),
    async (req, res) => {
        try {
            const { verificationCode } = req.body;
            const user = req.user;

            // Validação
            if (!verificationCode) {
                return res.status(400).json(
                    ApiResponseDTO.error('Código de verificação é obrigatório', null, 400)
                );
            }

            // Verifica se 2FA está habilitado
            if (!user.twoFactorAuth.enabled) {
                return res.status(400).json(
                    ApiResponseDTO.error('2FA não está ativado', null, 400)
                );
            }

            // Desativa 2FA
            const result = await twoFactorService.disableTwoFactor(user._id, verificationCode);

            res.json(
                ApiResponseDTO.success({ enabled: false }, '2FA desativado com sucesso')
            );

        } catch (error) {
            console.error('Erro ao desativar 2FA:', error);

            if (error.message.includes('inválido')) {
                return res.status(400).json(
                    ApiResponseDTO.error(error.message, null, 400)
                );
            }

            res.status(500).json(
                ApiResponseDTO.error('Erro interno ao desativar 2FA', null, 500)
            );
        }
    }
);

/**
 * POST /api/auth/2fa/backup-codes/regenerate
 * Regenera códigos de backup
 */
router.post('/backup-codes/regenerate',
    protect,
    auditCriticalActions(),
    async (req, res) => {
        try {
            const { verificationCode } = req.body;
            const user = req.user;

            if (!verificationCode) {
                return res.status(400).json(
                    ApiResponseDTO.error('Código de verificação é obrigatório', null, 400)
                );
            }

            if (!user.twoFactorAuth.enabled) {
                return res.status(400).json(
                    ApiResponseDTO.error('2FA não está ativado', null, 400)
                );
            }

            // Regenera códigos
            const newCodes = await twoFactorService.regenerateBackupCodes(user._id, verificationCode);

            res.json(
                ApiResponseDTO.success({
                    backupCodes: newCodes,
                    count: newCodes.length
                }, 'Códigos de backup regenerados')
            );

        } catch (error) {
            console.error('Erro ao regenerar códigos:', error);

            if (error.message.includes('inválido')) {
                return res.status(400).json(
                    ApiResponseDTO.error(error.message, null, 400)
                );
            }

            res.status(500).json(
                ApiResponseDTO.error('Erro interno ao regenerar códigos', null, 500)
            );
        }
    }
);

/**
 * GET /api/auth/2fa/status
 * Verifica status do 2FA para usuário atual
 */
router.get('/status', protect, async (req, res) => {
    try {
        const user = req.user;

        res.json(
            ApiResponseDTO.success({
                enabled: user.twoFactorAuth.enabled,
                setupAt: user.twoFactorAuth.setupAt,
                lastVerified: user.twoFactorAuth.lastVerified,
                backupCodesCount: user.getBackupCodesCount(),
                trustedDevicesCount: user.twoFactorAuth.trustedDevices.length
            }, 'Status 2FA obtido')
        );

    } catch (error) {
        console.error('Erro ao obter status 2FA:', error);
        res.status(500).json(
            ApiResponseDTO.error('Erro interno ao obter status', null, 500)
        );
    }
});

module.exports = router;
