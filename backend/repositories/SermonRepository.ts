import BaseRepository from './BaseRepository';
import Sermon, { ISermon } from '../models/Sermon';

/**
 * SermonRepository - Repository específico para operações com Sermões
 * Estende BaseRepository e adiciona métodos específicos para sermões
 */
class SermonRepository extends BaseRepository<ISermon> {
  constructor() {
    super(Sermon);
  }

  async findSermons(filters: Record<string, any> = {}, options: Record<string, any> = {}): Promise<any> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      book,
      series,
      speaker,
      search
    } = options;
    const queryFilters = { ...filters };
    if (book) queryFilters.book = { $regex: book, $options: 'i' };
    if (series) queryFilters.series = { $regex: series, $options: 'i' };
    if (speaker) queryFilters.speaker = { $regex: speaker, $options: 'i' };
    if (search) {
      queryFilters.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { book: { $regex: search, $options: 'i' } },
        { series: { $regex: search, $options: 'i' } },
        { speaker: { $regex: search, $options: 'i' } }
      ];
    }
    const sort: Record<string, 1 | -1> = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    return await this.findAll(queryFilters, {
      page,
      limit,
      sort,
      select: '-__v'
    });
  }

  async findLatest(): Promise<ISermon | null> {
    return this.model.findOne().sort({ createdAt: -1 }).select('-__v').exec();
  }

  async findBySeries(series: string, options: Record<string, any> = {}): Promise<any> {
    const filters = { series: { $regex: series, $options: 'i' } };
    return await this.findSermons(filters, options);
  }

  async findBySpeaker(speaker: string, options: Record<string, any> = {}): Promise<any> {
    const filters = { speaker: { $regex: speaker, $options: 'i' } };
    return await this.findSermons(filters, options);
  }

  async findByBook(book: string, options: Record<string, any> = {}): Promise<any> {
    const filters = { book: { $regex: book, $options: 'i' } };
    return await this.findSermons(filters, options);
  }

  async findSuggestions(term: string, limit = 5): Promise<any[]> {
    if (!term || term.length < 2) return [];
    const suggestions = await this.model.aggregate([
      {
        $match: {
          $or: [
            { title: { $regex: term, $options: 'i' } },
            { book: { $regex: term, $options: 'i' } },
            { series: { $regex: term, $options: 'i' } },
            { speaker: { $regex: term, $options: 'i' } }
          ]
        }
      },
      {
        $project: {
          title: 1,
          book: 1,
          series: 1,
          speaker: 1,
          score: {
            $add: [
              { $cond: [{ $regexMatch: { input: '$title', regex: term, options: 'i' } }, 3, 0] },
              { $cond: [{ $regexMatch: { input: '$book', regex: term, options: 'i' } }, 2, 0] },
              { $cond: [{ $regexMatch: { input: '$series', regex: term, options: 'i' } }, 2, 0] },
              { $cond: [{ $regexMatch: { input: '$speaker', regex: term, options: 'i' } }, 1, 0] }
            ]
          }
        }
      },
      { $sort: { score: -1 } },
      { $limit: limit }
    ]);
    return suggestions;
  }

  async getStats(): Promise<any> {
    const stats = await this.model.aggregate([
      {
        $group: {
          _id: null,
          totalSermons: { $sum: 1 },
          totalBooks: { $addToSet: '$book' },
          totalSeries: { $addToSet: '$series' },
          totalSpeakers: { $addToSet: '$speaker' },
          averageDuration: { $avg: '$duration' },
          totalViews: { $sum: '$views' }
        }
      },
      {
        $project: {
          _id: 0,
          totalSermons: 1,
          totalBooks: { $size: '$totalBooks' },
          totalSeries: { $size: '$totalSeries' },
          totalSpeakers: { $size: '$totalSpeakers' },
          averageDuration: { $round: ['$averageDuration', 2] },
          totalViews: 1
        }
      }
    ]);
    return stats[0] || {
      totalSermons: 0,
      totalBooks: 0,
      totalSeries: 0,
      totalSpeakers: 0,
      averageDuration: 0,
      totalViews: 0
    };
  }

  async getAllSeries(): Promise<string[]> {
    const series = await this.model.distinct('series');
    return series.filter(Boolean).sort();
  }

  async getAllSpeakers(): Promise<string[]> {
    const speakers = await this.model.distinct('speaker');
    return speakers.filter(Boolean).sort();
  }

  async getAllBooks(): Promise<string[]> {
    const books = await this.model.distinct('book');
    return books.filter(Boolean).sort((a: string, b: string) => a.localeCompare(b));
  }

  async findUniqueBooks(): Promise<any[]> {
    const books = await this.model.aggregate([
      { $match: { book: { $exists: true, $ne: null, $ne: '' } } },
      { $group: { _id: '$book', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
      { $project: { book: '$_id', count: 1, _id: 0 } }
    ]);
    return books;
  }

  async incrementViews(id: string): Promise<ISermon | null> {
    return this.model.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true }
    );
  }

  async findPopular(limit = 10): Promise<ISermon[]> {
    return this.model.find().sort({ views: -1, createdAt: -1 }).limit(limit).select('-__v').exec();
  }

  async findRecent(limit = 10): Promise<ISermon[]> {
    return this.model.find().sort({ createdAt: -1 }).limit(limit).select('-__v').exec();
  }

  async createSermonIndexes(): Promise<void> {
    const indexes = [
      { fields: { title: 'text', content: 'text' }, options: { name: 'sermon_text_search' } },
      { fields: { book: 1 }, options: { name: 'sermon_book_index' } },
      { fields: { series: 1 }, options: { name: 'sermon_series_index' } },
      { fields: { speaker: 1 }, options: { name: 'sermon_speaker_index' } },
      { fields: { createdAt: -1 }, options: { name: 'sermon_created_at_index' } },
      { fields: { views: -1 }, options: { name: 'sermon_views_index' } },
      { fields: { book: 1, series: 1 }, options: { name: 'sermon_book_series_index' } }
    ];
    await this.createIndexes(indexes);
  }
}

const sermonRepository = new SermonRepository();
export default sermonRepository;
