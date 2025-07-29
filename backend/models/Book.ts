import mongoose, { Document, Schema } from 'mongoose';

function arrayLimit(val: any[]) {
    return val.length <= 10;
}

export interface IBook extends Document {
    title: string;
    author: string;
    publisher?: string;
    area?: string;
    tags?: string[];
    description?: string;
    summary?: string;
    keyPoints?: string[];
    quotes?: Array<{ text: string; page?: number; chapter?: string }>;
    publicationYear?: number;
    series?: string;
    isbn?: string;
    pageCount?: number;
    personalRating?: number;
    difficulty?: string;
    purchaseLinks?: Array<{ store: string; url: string; price?: number }>;
    isPublished?: boolean;
    featured?: boolean;
    views?: number;
    likes?: number;
    createdBy?: string;
    updatedBy?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const BookSchema = new Schema<IBook>({
    title: { type: String, required: true, trim: true, maxlength: 200 },
    author: { type: String, required: true, trim: true, maxlength: 100 },
    publisher: { type: String, trim: true, maxlength: 100 },
    area: { type: String, trim: true },
    tags: { type: [String], validate: [arrayLimit, 'Máximo 10 tags permitidas'] },
    description: { type: String, maxlength: 2000 },
    summary: { type: String, minlength: 50, maxlength: 10000 },
    keyPoints: { type: [String], maxlength: 20 },
    quotes: [{ text: String, page: Number, chapter: String }],
    publicationYear: { type: Number, min: 1900, max: new Date().getFullYear() },
    series: { type: String, trim: true, maxlength: 100 },
    isbn: { type: String, match: /^\d{10}|\d{13}$/ },
    pageCount: { type: Number, max: 10000 },
    personalRating: { type: Number, min: 1, max: 5 },
    difficulty: { type: String, enum: ['Iniciante', 'Intermediário', 'Avançado'] },
    purchaseLinks: [{ store: String, url: String, price: Number }],
    isPublished: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    createdBy: { type: String },
    updatedBy: { type: String }
}, { timestamps: true });

export default mongoose.model<IBook>('Book', BookSchema);
