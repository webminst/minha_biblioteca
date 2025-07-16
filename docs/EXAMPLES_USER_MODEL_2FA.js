// models/User.js - EXEMPLO de extensão para 2FA
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['admin', 'editor', 'viewer'],
        default: 'admin'
    },

    // ========== NOVOS CAMPOS PARA 2FA ==========
    twoFactorAuth: {
        enabled: {
            type: Boolean,
            default: false
        },
        secret: {
            type: String, // Secret TOTP criptografado
            default: null
        },
        backupCodes: [{
            code: {
                type: String,
                required: true
            },
            used: {
                type: Boolean,
                default: false
            },
            usedAt: {
                type: Date,
                default: null
            }
        }],
        setupAt: {
            type: Date,
            default: null
        },
        lastVerified: {
            type: Date,
            default: null
        },
        // Configurações opcionais
        trustedDevices: [{
            deviceId: String,
            deviceName: String,
            addedAt: Date,
            lastUsed: Date,
            userAgent: String
        }]
    },

    // Campos de auditoria existentes
    lastLogin: {
        type: Date,
        default: null
    },
    lastLogout: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Middleware existente para hash da senha
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Método existente para comparar senha
UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// ========== NOVOS MÉTODOS PARA 2FA ==========

/**
 * Verifica se 2FA está habilitado
 */
UserSchema.methods.isTwoFactorEnabled = function () {
    return this.twoFactorAuth.enabled;
};

/**
 * Obtém códigos de backup não utilizados
 */
UserSchema.methods.getAvailableBackupCodes = function () {
    return this.twoFactorAuth.backupCodes.filter(code => !code.used);
};

/**
 * Conta códigos de backup disponíveis
 */
UserSchema.methods.getBackupCodesCount = function () {
    return this.getAvailableBackupCodes().length;
};

/**
 * Verifica se dispositivo está na lista de confiança
 */
UserSchema.methods.isTrustedDevice = function (deviceId) {
    return this.twoFactorAuth.trustedDevices.some(device =>
        device.deviceId === deviceId
    );
};

/**
 * Adiciona dispositivo à lista de confiança
 */
UserSchema.methods.addTrustedDevice = function (deviceInfo) {
    this.twoFactorAuth.trustedDevices.push({
        deviceId: deviceInfo.deviceId,
        deviceName: deviceInfo.deviceName || 'Dispositivo Desconhecido',
        addedAt: new Date(),
        lastUsed: new Date(),
        userAgent: deviceInfo.userAgent || ''
    });
};

/**
 * Remove dispositivo da lista de confiança
 */
UserSchema.methods.removeTrustedDevice = function (deviceId) {
    this.twoFactorAuth.trustedDevices = this.twoFactorAuth.trustedDevices.filter(
        device => device.deviceId !== deviceId
    );
};

/**
 * Atualiza último uso de dispositivo confiável
 */
UserSchema.methods.updateTrustedDeviceUsage = function (deviceId) {
    const device = this.twoFactorAuth.trustedDevices.find(d => d.deviceId === deviceId);
    if (device) {
        device.lastUsed = new Date();
    }
};

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);
