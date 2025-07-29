"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Sermon_1 = __importDefault(require("../models/Sermon"));
const errorHandler_1 = require("../middleware/errorHandler");
class SermonService {
    async findAll(options = {}) {
        const { page = 1, limit = 10, sortBy = 'date', sortOrder = 'desc', book, series, speaker, search } = options;
        const filters = {};
        if (book)
            filters.book = { $regex: book, $options: 'i' };
        if (series)
            filters.series = { $regex: series, $options: 'i' };
        if (speaker)
            filters.speaker = { $regex: speaker, $options: 'i' };
        if (search) {
            filters.$or = [
                { title: { $regex: search, $options: 'i' } },
                { bibleReference: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { series: { $regex: search, $options: 'i' } }
            ];
        }
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
        const skip = (page - 1) * limit;
        const [sermons, total] = await Promise.all([
            Sermon_1.default.find(filters)
                .sort(sort)
                .skip(skip)
                .limit(Number(limit))
                .select('title bibleReference series description tags date createdAt updatedAt'),
            Sermon_1.default.countDocuments(filters)
        ]);
        return {
            sermons,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / limit),
                hasNext: page < Math.ceil(total / limit),
                hasPrev: page > 1
            },
            filters: { book, series, speaker, search }
        };
    }
    async findById(id) {
        const sermon = await Sermon_1.default.findById(id);
        if (!sermon)
            throw new errorHandler_1.AppError('Sermão não encontrado', 404);
        return sermon;
    }
}
exports.default = new SermonService();
