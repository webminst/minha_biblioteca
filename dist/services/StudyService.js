"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Study_1 = __importDefault(require("../models/Study"));
const errorHandler_1 = require("../middleware/errorHandler");
class StudyService {
    async findAll(options = {}) {
        const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', theme, format, series, speaker, search } = options;
        const filters = {};
        if (theme)
            filters.theme = { $regex: theme, $options: 'i' };
        if (format)
            filters.format = { $regex: format, $options: 'i' };
        if (series)
            filters.series = { $regex: series, $options: 'i' };
        if (speaker)
            filters.speaker = { $regex: speaker, $options: 'i' };
        if (search) {
            filters.$or = [
                { title: { $regex: search, $options: 'i' } },
                { reference: { $regex: search, $options: 'i' } },
                { theme: { $regex: search, $options: 'i' } },
                { format: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
        const skip = (page - 1) * limit;
        const [studies, total] = await Promise.all([
            Study_1.default.find(filters)
                .sort(sort)
                .skip(skip)
                .limit(Number(limit))
                .select('title reference theme format description tags createdAt updatedAt'),
            Study_1.default.countDocuments(filters)
        ]);
        return {
            studies,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / limit),
                hasNext: page < Math.ceil(total / limit),
                hasPrev: page > 1
            },
            filters: { theme, format, series, speaker, search }
        };
    }
    async findById(id) {
        const study = await Study_1.default.findById(id);
        if (!study)
            throw new errorHandler_1.AppError('Estudo não encontrado', 404);
        return study;
    }
}
exports.default = new StudyService();
