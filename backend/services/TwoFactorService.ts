import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import crypto from 'crypto';
import User from '../models/User';

class TwoFactorService {
    issuer: string;
    window: number;
    backupCodesCount: number;
    constructor() {
        this.issuer = process.env.TOTP_ISSUER || 'Pastor-Portfolio';
        this.window = parseInt(process.env.TOTP_WINDOW || '1');
        this.backupCodesCount = parseInt(process.env.BACKUP_CODES_COUNT || '10');
    }
    async generateSetup(user: any) {
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
                backupCodes: backupCodes.map((code: any) => code.code)
            };
        } catch (error: any) {
            throw new Error(`Erro ao gerar setup 2FA: ${error.message}`);
        }
    }
    verifyToken(token: string, secret: string) {
        try {
            return speakeasy.totp.verify({
                secret: secret,
                encoding: 'base32',
                token: token,
                window: this.window
            });
        } catch {
            return false;
        }
    }
    // ...implementar outros métodos conforme necessário...
}

export default new TwoFactorService();
