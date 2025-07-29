import mongoose, { Document, Schema } from 'mongoose';

function arrayLimit(val: any[]) {
    return val.length <= 10;
}

export interface ISermon extends Document {
    title: string;
    bibleReference: string;
    series?: string;
    tags?: string[];
    speaker: string;
    date?: Date;
    local?: string;
    description?: string;
    content?: string;
    createdBy?: string;
    updatedBy?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const SermonSchema = new Schema<ISermon>({
    title: { type: String, required: true, trim: true, maxlength: 200 },
    bibleReference: { type: String, required: true, trim: true, maxlength: 100 },
    series: { type: String, trim: true, maxlength: 100 },
    tags: { type: [String], validate: [arrayLimit, 'Máximo 10 tags permitidas'] },
    speaker: { type: String, required: true, trim: true, maxlength: 100, default: 'Giovanni Guimarães' },
    date: { type: Date, default: Date.now, required: true },
    local: { type: String, trim: true, maxlength: 150 },
    description: { type: String, maxlength: 2000 },
    content: { type: String },
    createdBy: { type: String },
    updatedBy: { type: String }
}, { timestamps: true });

export default mongoose.model<ISermon>('Sermon', SermonSchema);
