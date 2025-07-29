import Book from '../models/Book';
import { AppError } from '../middleware/errorHandler';

/**
 * Serviço para gerenciamento de livros e resumos
 * Centraliza toda a lógica de negócio relacionada aos livros
 */
class BookService {
    async findAll(options: any = {}) {
        const {
            page = 1,
            limit = 10,
            sortBy = 'createdAt',
            sortOrder = 'desc',
            author,
            area,
            publisher,
            series,
            search
        } = options;
        const filters: any = {};
        if (author) filters.author = { $regex: author, $options: 'i' };
        if (area) filters.area = { $regex: area, $options: 'i' };
        if (publisher) filters.publisher = { $regex: publisher, $options: 'i' };
        if (series) filters.series = { $regex: series, $options: 'i' };
        if (search) {
            filters.$or = [
                { title: { $regex: search, $options: 'i' } },
                { author: { $regex: search, $options: 'i' } },
                { area: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { publisher: { $regex: search, $options: 'i' } }
            ];
        }
        const sort: any = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
        const skip = (page - 1) * limit;
        const [books, total] = await Promise.all([
            Book.find(filters)
                .sort(sort)
                .skip(skip)
                .limit(Number(limit))
                .select('title author publisher area description tags coverImageUrl createdAt updatedAt'),
            Book.countDocuments(filters)
        ]);
        return {
            books,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / limit),
                hasNext: page < Math.ceil(total / limit),
                hasPrev: page > 1
            },
            filters: { author, area, publisher, series, search }
        };
    }

    async findById(id: string) {
        const book = await Book.findById(id);
        if (!book) throw new AppError('Livro não encontrado', 404);
        return book;
    }

    async findLatest() {
        const book = await Book.findOne()
            .sort({ createdAt: -1 })
            .select('title author publisher area description');
        if (!book) throw new AppError('Nenhum livro encontrado', 404);
        return book;
    }

    async create(bookData: any, userId: string) {
        if (!bookData.title) throw new AppError('Título é obrigatório', 400);
        if (bookData.author) {
            const existingBook = await Book.findOne({ title: bookData.title, author: bookData.author });
            if (existingBook) throw new AppError('Já existe um livro com este título e autor', 409);
        } else {
            const existingBook = await Book.findOne({ title: bookData.title });
            if (existingBook) throw new AppError('Já existe um livro com este título', 409);
        }
        const bookDataMapped = { ...bookData };
        if ('summary' in bookDataMapped) {
            bookDataMapped.content = bookDataMapped.summary;
            delete bookDataMapped.summary;
        }
        const book = new Book({ ...bookDataMapped, createdBy: userId });
        const savedBook = await book.save();
        return savedBook;
    }

    async update(id: string, updateData: any, userId: string) {
        const book = await Book.findById(id);
        if (!book) throw new AppError('Livro não encontrado', 404);
        const updateDataMapped = { ...updateData };
        if ('summary' in updateDataMapped) {
            updateDataMapped.content = updateDataMapped.summary;
            delete updateDataMapped.summary;
        }
        if (updateDataMapped.title) {
            const query: any = { _id: { $ne: id }, title: updateDataMapped.title };
            if (updateDataMapped.author) query.author = updateDataMapped.author;
            const existingBook = await Book.findOne(query);
            if (existingBook) {
                const errorMsg = updateDataMapped.author
                    ? 'Já existe outro livro com este título e autor'
                    : 'Já existe outro livro com este título';
                throw new AppError(errorMsg, 409);
            }
        }
        try {
            const updatedBook = await Book.findByIdAndUpdate(
                id,
                { ...updateDataMapped, updatedBy: userId, updatedAt: new Date() },
                { new: true, runValidators: true, context: 'query' }
            );
            if (!updatedBook) throw new AppError('Falha ao atualizar o livro: livro não encontrado após a atualização', 500);
            return updatedBook;
        } catch (error: any) {
            console.error('Erro ao atualizar livro:', error);
            if (error.name === 'ValidationError') {
                const errors = Object.values(error.errors).map((err: any) => err.message);
                throw new AppError(`Erro de validação: ${errors.join(', ')}`, 400);
            } else if (error.name === 'CastError') {
                throw new AppError('ID do livro inválido', 400);
            } else if (error.name === 'MongoError' && error.code === 11000) {
                throw new AppError('Já existe um livro com este título e/ou autor', 409);
            }
            throw new AppError(`Erro ao atualizar o livro: ${error.message}`, 500);
        }
    }

    async findByAuthor(author: string) {
        return Book.find({ author: { $regex: author, $options: 'i' } }).sort({ createdAt: -1 });
    }
    async findByArea(area: string) {
        return Book.find({ area: { $regex: area, $options: 'i' } }).sort({ createdAt: -1 });
    }
    async findByPublisher(publisher: string) {
        return Book.find({ publisher: { $regex: publisher, $options: 'i' } }).sort({ createdAt: -1 });
    }
    async findBySeries(series: string) {
        return Book.find({ series: { $regex: series, $options: 'i' } }).sort({ createdAt: -1 });
    }
    async getStats() {
        const stats = await Book.aggregate([
            {
                $group: {
                    _id: null,
                    totalBooks: { $sum: 1 },
                    totalAuthors: { $addToSet: '$author' },
                    totalAreas: { $addToSet: '$area' },
                    totalPublishers: { $addToSet: '$publisher' },
                    totalSeries: { $addToSet: '$series' },
                    avgDescriptionLength: { $avg: { $strLenCP: '$description' } },
                    mostRecentDate: { $max: '$createdAt' },
                    oldestDate: { $min: '$createdAt' },
                    booksWithImages: {
                        $sum: {
                            $cond: [{ $ne: ['$coverImageUrl', null] }, 1, 0]
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    totalBooks: 1,
                    totalAuthors: {
                        $size: {
                            $filter: {
                                input: '$totalAuthors',
                                cond: { $ne: ['$$this', null] }
                            }
                        }
                    },
                    totalAreas: {
                        $size: {
                            $filter: {
                                input: '$totalAreas',
                                cond: { $ne: ['$$this', null] }
                            }
                        }
                    },
                    totalPublishers: {
                        $size: {
                            $filter: {
                                input: '$totalPublishers',
                                cond: { $ne: ['$$this', null] }
                            }
                        }
                    },
                    totalSeries: {
                        $size: {
                            $filter: {
                                input: '$totalSeries',
                                cond: { $ne: ['$$this', null] }
                            }
                        }
                    },
                    avgDescriptionLength: { $round: ['$avgDescriptionLength', 0] },
                    mostRecentDate: 1,
                    oldestDate: 1,
                    booksWithImages: 1,
                    imagePercentage: {
                        $round: [{ $multiply: [{ $divide: ['$booksWithImages', '$totalBooks'] }, 100] }, 1]
                    }
                }
            }
        ]);
        return stats[0] || {
            totalBooks: 0,
            totalAuthors: 0,
            totalAreas: 0,
            totalPublishers: 0,
            totalSeries: 0,
            avgDescriptionLength: 0,
            mostRecentDate: null,
            oldestDate: null,
            booksWithImages: 0,
            imagePercentage: 0
        };
    }
    async getAllAuthors() {
        const authors = await Book.distinct('author');
        return authors.filter((a: string) => a && a.trim() !== '');
    }
    async getAllAreas() {
        const areas = await Book.distinct('area');
        return areas.filter((a: string) => a && a.trim() !== '');
    }
    async getAllPublishers() {
        const publishers = await Book.distinct('publisher');
        return publishers.filter((p: string) => p && p.trim() !== '');
    }
    async getAllSeries() {
        const series = await Book.distinct('series');
        return series.filter((s: string) => s && s.trim() !== '');
    }
    async findSuggestions(term: string, limit = 5) {
        if (!term || term.trim().length < 2) {
            return { titles: [], authors: [], areas: [], publishers: [] };
        }
        const searchRegex = new RegExp(term, 'i');
        try {
            const [titles, authors, areas, publishers] = await Promise.all([
                Book.find({ title: searchRegex }).select('title').limit(limit).distinct('title'),
                Book.find({ author: searchRegex }).select('author').limit(limit).distinct('author'),
                Book.find({ area: searchRegex }).select('area').limit(limit).distinct('area'),
                Book.find({ publisher: searchRegex }).select('publisher').limit(limit).distinct('publisher')
            ]);
            const filteredTitles = titles.filter((item: string) => item && item.trim() !== '').slice(0, limit);
            const filteredAuthors = authors.filter((item: string) => item && item.trim() !== '').slice(0, limit);
            const filteredAreas = areas.filter((item: string) => item && item.trim() !== '').slice(0, limit);
            const filteredPublishers = publishers.filter((item: string) => item && item.trim() !== '').slice(0, limit);
            return {
                titles: filteredTitles,
                authors: filteredAuthors,
                areas: filteredAreas,
                publishers: filteredPublishers
            };
        } catch (error) {
            console.error('Erro ao buscar sugestões de livros:', error);
            return { titles: [], authors: [], areas: [], publishers: [] };
        }
    }
    async findRelated(bookId: string, limit = 5) {
        const currentBook = await this.findById(bookId);
        const relatedBooks = await Book.find({
            _id: { $ne: bookId },
            $or: [
                { area: currentBook.area },
                { author: currentBook.author },
                { tags: { $in: currentBook.tags || [] } },
                { series: currentBook.series }
            ]
        })
            .limit(limit)
            .select('title author area description coverImageUrl')
            .sort({ createdAt: -1 });
        return relatedBooks;
    }
    async findPopular(limit = 10) {
        return Book.find()
            .sort({ createdAt: -1 })
            .limit(limit)
            .select('title author area description coverImageUrl tags');
    }
    async delete(id: string) {
        try {
            const book = await Book.findByIdAndDelete(id);
            if (!book) throw new AppError('Livro não encontrado', 404);
            return {
                success: true,
                message: 'Livro excluído com sucesso',
                data: {
                    id: book._id,
                    title: book.title,
                    author: book.author
                }
            };
        } catch (error: any) {
            console.error('Erro ao excluir livro:', error);
            if (error.name === 'CastError') {
                throw new AppError('ID do livro inválido', 400);
            }
            throw new AppError(`Erro ao excluir o livro: ${error.message}`, 500);
        }
    }
    async findRecommendedByArea(area: string, limit = 5) {
        return Book.find({ area: { $regex: area, $options: 'i' } })
            .sort({ createdAt: -1 })
            .limit(limit)
            .select('title author area description coverImageUrl');
    }
}

export default BookService;
