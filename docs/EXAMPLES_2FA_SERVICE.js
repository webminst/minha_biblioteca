// services/TwoFactorService.js
/**
 * Serviço de Autenticação de Dois Fatores (2FA)
 * Gerencia TOTP, códigos de backup e configurações de 2FA
 */

const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const crypto = require('crypto');
const User = require('../models/User');

class TwoFactorService {
    constructor() {
        this.issuer = process.env.TOTP_ISSUER || 'Pastor-Portfolio';
        this.window = parseInt(process.env.TOTP_WINDOW) || 1; // 30s window
        this.backupCodesCount = parseInt(process.env.BACKUP_CODES_COUNT) || 10;
    }

    /**
     * Gera secret e QR code para setup do 2FA
     * @param {Object} user - Usuário
     * @returns {Object} Secret, QR code e backup codes
     */
    async generateSetup(user) {
        try {
            // Gera secret TOTP
            const secret = speakeasy.generateSecret({
                name: user.username,
                issuer: this.issuer,
                length: 32
            });

            // Gera QR code
            const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

            // Gera códigos de backup
            const backupCodes = this.generateBackupCodes();

            return {
                secret: secret.base32,
                qrCode: qrCodeUrl,
                manualEntryKey: secret.base32,
                backupCodes: backupCodes.map(code => code.code)
            };

        } catch (error) {
            throw new Error(`Erro ao gerar setup 2FA: ${error.message}`);
        }
    }

    /**
     * Verifica código TOTP
     * @param {string} token - Código inserido pelo usuário
     * @param {string} secret - Secret do usuário
     * @returns {boolean} Token válido
     */
    verifyToken(token, secret) {
        try {
            return speakeasy.totp.verify({
                secret: secret,
                encoding: 'base32',
                token: token,
                window: this.window
            });
        } catch (error) {
            console.error('Erro na verificação TOTP:', error);
            return false;
        }
    }

    /**
     * Gera códigos de backup criptografados
     * @returns {Array} Lista de códigos
     */
    generateBackupCodes() {
        const codes = [];

        for (let i = 0; i < this.backupCodesCount; i++) {
            // Gera código de 8 dígitos
            const code = Math.random().toString(36).substring(2, 10).toUpperCase();

            codes.push({
                code: code,
                used: false,
                usedAt: null
            });
        }

        return codes;
    }

    /**
     * Verifica código de backup
     * @param {string} inputCode - Código inserido
     * @param {Array} backupCodes - Códigos do usuário
     * @returns {boolean} Código válido e não usado
     */
    verifyBackupCode(inputCode, backupCodes) {
        const code = backupCodes.find(bc =>
            bc.code === inputCode.toUpperCase() && !bc.used
        );

        if (code) {
            // Marca como usado
            code.used = true;
            code.usedAt = new Date();
            return true;
        }

        return false;
    }

    /**
     * Ativa 2FA para um usuário
     * @param {string} userId - ID do usuário
     * @param {string} secret - Secret TOTP
     * @param {string} verificationCode - Código de verificação
     * @returns {Object} Resultado da ativação
     */
    async enableTwoFactor(userId, secret, verificationCode) {
        try {
            // Verifica código antes de ativar
            const isValidCode = this.verifyToken(verificationCode, secret);

            if (!isValidCode) {
                throw new Error('Código de verificação inválido');
            }

            // Gera códigos de backup
            const backupCodes = this.generateBackupCodes();

            // Criptografa o secret antes de salvar
            const encryptedSecret = this.encryptSecret(secret);

            // Atualiza usuário
            const user = await User.findByIdAndUpdate(userId, {
                'twoFactorAuth.enabled': true,
                'twoFactorAuth.secret': encryptedSecret,
                'twoFactorAuth.backupCodes': backupCodes,
                'twoFactorAuth.setupAt': new Date(),
                'twoFactorAuth.lastVerified': new Date()
            }, { new: true });

            return {
                success: true,
                backupCodes: backupCodes.map(bc => bc.code),
                message: '2FA ativado com sucesso'
            };

        } catch (error) {
            throw new Error(`Erro ao ativar 2FA: ${error.message}`);
        }
    }

    /**
     * Desativa 2FA para um usuário
     * @param {string} userId - ID do usuário
     * @param {string} verificationCode - Código de verificação ou backup
     * @returns {Object} Resultado da desativação
     */
    async disableTwoFactor(userId, verificationCode) {
        try {
            const user = await User.findById(userId);

            if (!user || !user.twoFactorAuth.enabled) {
                throw new Error('2FA não está ativado para este usuário');
            }

            // Descriptografa secret
            const secret = this.decryptSecret(user.twoFactorAuth.secret);

            // Verifica código TOTP ou backup
            const isTotpValid = this.verifyToken(verificationCode, secret);
            const isBackupValid = this.verifyBackupCode(verificationCode, user.twoFactorAuth.backupCodes);

            if (!isTotpValid && !isBackupValid) {
                throw new Error('Código de verificação inválido');
            }

            // Desativa 2FA
            await User.findByIdAndUpdate(userId, {
                'twoFactorAuth.enabled': false,
                'twoFactorAuth.secret': null,
                'twoFactorAuth.backupCodes': [],
                'twoFactorAuth.lastVerified': null
            });

            return {
                success: true,
                message: '2FA desativado com sucesso'
            };

        } catch (error) {
            throw new Error(`Erro ao desativar 2FA: ${error.message}`);
        }
    }

    /**
     * Verifica 2FA durante login
     * @param {Object} user - Usuário
     * @param {string} code - Código 2FA
     * @returns {boolean} Verificação bem-sucedida
     */
    async verifyLogin(user, code) {
        try {
            if (!user.twoFactorAuth.enabled) {
                return true; // 2FA não habilitado
            }

            // Descriptografa secret
            const secret = this.decryptSecret(user.twoFactorAuth.secret);

            // Verifica TOTP ou backup code
            const isTotpValid = this.verifyToken(code, secret);
            const isBackupValid = this.verifyBackupCode(code, user.twoFactorAuth.backupCodes);

            if (isTotpValid || isBackupValid) {
                // Atualiza última verificação
                await User.findByIdAndUpdate(user._id, {
                    'twoFactorAuth.lastVerified': new Date()
                });

                // Se usou backup code, salva a alteração
                if (isBackupValid) {
                    await user.save();
                }

                return true;
            }

            return false;

        } catch (error) {
            console.error('Erro na verificação 2FA:', error);
            return false;
        }
    }

    /**
     * Criptografa secret TOTP
     * @param {string} secret - Secret em texto
     * @returns {string} Secret criptografado
     */
    encryptSecret(secret) {
        const algorithm = 'aes-256-gcm';
        const key = crypto.scryptSync(process.env.JWT_SECRET, 'salt', 32);
        const iv = crypto.randomBytes(16);

        const cipher = crypto.createCipher(algorithm, key);
        cipher.setAAD(Buffer.from('2fa-secret'));

        let encrypted = cipher.update(secret, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        const authTag = cipher.getAuthTag();

        return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
    }

    /**
     * Descriptografa secret TOTP
     * @param {string} encryptedSecret - Secret criptografado
     * @returns {string} Secret em texto
     */
    decryptSecret(encryptedSecret) {
        const algorithm = 'aes-256-gcm';
        const key = crypto.scryptSync(process.env.JWT_SECRET, 'salt', 32);

        const [ivHex, authTagHex, encrypted] = encryptedSecret.split(':');
        const iv = Buffer.from(ivHex, 'hex');
        const authTag = Buffer.from(authTagHex, 'hex');

        const decipher = crypto.createDecipher(algorithm, key);
        decipher.setAAD(Buffer.from('2fa-secret'));
        decipher.setAuthTag(authTag);

        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    }

    /**
     * Gera novos códigos de backup
     * @param {string} userId - ID do usuário
     * @param {string} verificationCode - Código de verificação
     * @returns {Array} Novos códigos de backup
     */
    async regenerateBackupCodes(userId, verificationCode) {
        try {
            const user = await User.findById(userId);

            if (!user || !user.twoFactorAuth.enabled) {
                throw new Error('2FA não está ativado');
            }

            // Verifica código atual
            const secret = this.decryptSecret(user.twoFactorAuth.secret);
            const isValid = this.verifyToken(verificationCode, secret);

            if (!isValid) {
                throw new Error('Código de verificação inválido');
            }

            // Gera novos códigos
            const newBackupCodes = this.generateBackupCodes();

            // Atualiza usuário
            await User.findByIdAndUpdate(userId, {
                'twoFactorAuth.backupCodes': newBackupCodes
            });

            return newBackupCodes.map(bc => bc.code);

        } catch (error) {
            throw new Error(`Erro ao gerar códigos: ${error.message}`);
        }
    }
}

module.exports = new TwoFactorService();
