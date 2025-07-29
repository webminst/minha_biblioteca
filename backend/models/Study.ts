import mongoose, { Document, Schema } from 'mongoose';

function arrayLimit(val: any[]) {
    return val.length <= 10;
}

export interface IStudy extends Document {
    title: string;
    reference: string;
    theme?: string;
    format?: string;
    tags?: string[];
    description?: string;
    content: string;
    outline?: string[];
    createdBy?: string;
    updatedBy?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const StudySchema = new Schema<IStudy>({
    title: { type: String, required: true, trim: true, maxlength: 200 },
    reference: { type: String, required: true, trim: true, maxlength: 100 },
    theme: { type: String, trim: true },
    format: { type: String, trim: true },
    tags: { type: [String], validate: [arrayLimit, 'Máximo 10 tags permitidas'] },
    description: { type: String, maxlength: 2000 },
    content: { type: String, required: true, minlength: 100 },
    outline: { type: [String] },
    createdBy: { type: String },
    updatedBy: { type: String }
}, { timestamps: true });

export default mongoose.model<IStudy>('Study', StudySchema);
