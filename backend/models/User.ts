import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
    username: string;
    password: string;
    role: 'admin' | 'editor' | 'viewer';
    twoFactorAuth?: {
        enabled: boolean;
        secret?: string;
        backupCodes?: Array<{
            code: string;
            used: boolean;
            usedAt?: Date | null;
        }>;
        setupAt?: Date | null;
        lastVerified?: Date | null;
    };
    createdAt?: Date;
    updatedAt?: Date;
    comparePassword(candidate: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>({
    username: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'editor', 'viewer'], default: 'admin' },
    twoFactorAuth: {
        enabled: { type: Boolean, default: false },
        secret: { type: String, default: null },
        backupCodes: [{
            code: { type: String, required: true },
            used: { type: Boolean, default: false },
            usedAt: { type: Date, default: null }
        }],
        setupAt: { type: Date, default: null },
        lastVerified: { type: Date, default: null }
    }
}, { timestamps: true });

UserSchema.pre<IUser>('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

UserSchema.methods.comparePassword = async function (candidate: string) {
    return bcrypt.compare(candidate, this.password);
};

export default mongoose.model<IUser>('User', UserSchema);
