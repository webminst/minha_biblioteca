

const QRCode = require('qrcode');
const crypto = require('crypto');
const User = require('../models/User');

class TwoFactorService {
    constructor() {
        this.issuer = process.env.TOTP_ISSUER || 'Pastor-Portfolio';
        this.backupCodesCount = parseInt(process.env.BACKUP_CODES_COUNT) || 10;
    }

    async generateSetup(user) {
        try {
            const secret = speakeasy.generateSecret({
                name: user.username,
                issuer: this.issuer,
                length: 32
            });
            const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);
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

    verifyToken(token, secret) {
        try {
            return speakeasy.totp.verify({
                secret: secret,
                encoding: 'base32',
                token: token,
                window: this.window
            });
        } catch (error) {
            return false;
        }
    }

    generateBackupCodes() {
        const codes = [];
        for (let i = 0; i < this.backupCodesCount; i++) {
            const code = Math.random().toString(36).substring(2, 10).toUpperCase();
            codes.push({
                code: code,
                used: false,
                usedAt: null
            });
        }
        return codes;
    }

    verifyBackupCode(inputCode, backupCodes) {
        const code = backupCodes.find(bc =>
            bc.code === inputCode.toUpperCase() && !bc.used
        );
        if (code) {
            code.used = true;
            code.usedAt = new Date();
            return true;
        }
        return false;
    }

    async enableTwoFactor(userId, secret, verificationCode) {
        try {
            const isValidCode = this.verifyToken(verificationCode, secret);
            if (!isValidCode) {
                throw new Error('Código de verificação inválido');
            }
            const backupCodes = this.generateBackupCodes();
            const encryptedSecret = this.encryptSecret(secret);
            await User.findByIdAndUpdate(userId, {
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

    async disableTwoFactor(userId, verificationCode) {
        try {
            const user = await User.findById(userId);
            if (!user || !user.twoFactorAuth.enabled) {
                throw new Error('2FA não está ativado para este usuário');
            }
            const secret = this.decryptSecret(user.twoFactorAuth.secret);
            const isTotpValid = this.verifyToken(verificationCode, secret);
            const isBackupValid = this.verifyBackupCode(verificationCode, user.twoFactorAuth.backupCodes);
            if (!isTotpValid && !isBackupValid) {
                throw new Error('Código de verificação inválido');
            }
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

    async verifyLogin(user, code) {
        try {
            if (!user.twoFactorAuth.enabled) {
                return true;
            }
            const secret = this.decryptSecret(user.twoFactorAuth.secret);
            const isTotpValid = this.verifyToken(code, secret);
            const isBackupValid = this.verifyBackupCode(code, user.twoFactorAuth.backupCodes);
            if (isTotpValid || isBackupValid) {
                await User.findByIdAndUpdate(user._id, {
                    'twoFactorAuth.lastVerified': new Date()
                });
                if (isBackupValid) {
                    await user.save();
                }
                return true;
            }
            return false;
        } catch (error) {
            return false;
        }
    }

    encryptSecret(secret) {
        const algorithm = 'aes-256-cbc';
        const key = crypto.scryptSync(process.env.JWT_SECRET || 'fallback-key', 'salt', 32);
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(algorithm, key, iv);
        let encrypted = cipher.update(secret, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return `${iv.toString('hex')}:${encrypted}`;
    }

    decryptSecret(encryptedSecret) {
        const algorithm = 'aes-256-cbc';
        const key = crypto.scryptSync(process.env.JWT_SECRET || 'fallback-key', 'salt', 32);
        const [ivHex, encrypted] = encryptedSecret.split(':');
        const iv = Buffer.from(ivHex, 'hex');
        const decipher = crypto.createDecipheriv(algorithm, key, iv);
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }

    async regenerateBackupCodes(userId, verificationCode) {
        try {
            const user = await User.findById(userId);
            if (!user || !user.twoFactorAuth.enabled) {
                throw new Error('2FA não está ativado');
            }
            const secret = this.decryptSecret(user.twoFactorAuth.secret);
            const isValid = this.verifyToken(verificationCode, secret);
            if (!isValid) {
                throw new Error('Código de verificação inválido');
            }
            const newBackupCodes = this.generateBackupCodes();
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
