"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const speakeasy_1 = __importDefault(require("speakeasy"));
const qrcode_1 = __importDefault(require("qrcode"));
class TwoFactorService {
    constructor() {
        this.issuer = process.env.TOTP_ISSUER || 'Pastor-Portfolio';
        this.window = parseInt(process.env.TOTP_WINDOW || '1');
        this.backupCodesCount = parseInt(process.env.BACKUP_CODES_COUNT || '10');
    }
    async generateSetup(user) {
        try {
            const secret = speakeasy_1.default.generateSecret({
                name: user.username,
                issuer: this.issuer,
                length: 32
            });
            const qrCodeUrl = await qrcode_1.default.toDataURL(secret.otpauth_url);
            const backupCodes = this.generateBackupCodes();
            return {
                secret: secret.base32,
                qrCode: qrCodeUrl,
                manualEntryKey: secret.base32,
                backupCodes: backupCodes.map((code) => code.code)
            };
        }
        catch (error) {
            throw new Error(`Erro ao gerar setup 2FA: ${error.message}`);
        }
    }
    verifyToken(token, secret) {
        try {
            return speakeasy_1.default.totp.verify({
                secret: secret,
                encoding: 'base32',
                token: token,
                window: this.window
            });
        }
        catch {
            return false;
        }
    }
}
exports.default = new TwoFactorService();
