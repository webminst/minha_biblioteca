import Sermon from '../models/Sermon';
import { AppError } from '../middleware/errorHandler';

class SermonService {
    async findAll(options: any = {}) {
        const {
            page = 1,
            limit = 10,
            sortBy = 'date',
            sortOrder = 'desc',
            book,
            series,
            speaker,
            search
        } = options;
        const filters: any = {};
        if (book) filters.book = { $regex: book, $options: 'i' };
        if (series) filters.series = { $regex: series, $options: 'i' };
        if (speaker) filters.speaker = { $regex: speaker, $options: 'i' };
        if (search) {
            filters.$or = [
                { title: { $regex: search, $options: 'i' } },
                { bibleReference: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { series: { $regex: search, $options: 'i' } }
            ];
        }
        const sort: any = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
        const skip = (page - 1) * limit;
        const [sermons, total] = await Promise.all([
            Sermon.find(filters)
                .sort(sort)
                .skip(skip)
                .limit(Number(limit))
                .select('title bibleReference series description tags date createdAt updatedAt'),
            Sermon.countDocuments(filters)
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

    async findById(id: string) {
        const sermon = await Sermon.findById(id);
        if (!sermon) throw new AppError('Sermão não encontrado', 404);
        return sermon;
    }

    // ...métodos adicionais podem ser migrados conforme necessário...
}

export default new SermonService();
