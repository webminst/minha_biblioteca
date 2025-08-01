// Mock manual do model Book para testes Jest
const Book = {
  find: jest.fn(),
  findById: jest.fn(),
  findOne: jest.fn(),
  countDocuments: jest.fn(),
  // Adicione outros métodos mockáveis conforme necessário
};

module.exports = Book;
