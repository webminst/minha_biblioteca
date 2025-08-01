// dto/index.js
/**
 * Arquivo de índice para exportar todos os DTOs
 * Centraliza as importações para facilitar o uso
 */

// DTOs de Autenticação
const {
  UserDTO,
  LoginDTO,
  AuthResponseDTO,
  UpdateUserDTO,
} = require('./auth/UserDTO');

// DTOs de Livros
const {
  CreateBookDTO,
  UpdateBookDTO,
  BookResponseDTO,
  BookSearchDTO,
} = require('./books/BookDTO');

// DTOs de Sermões
const {
  CreateSermonDTO,
  UpdateSermonDTO,
  SermonResponseDTO,
  SermonSearchDTO,
} = require('./sermons/SermonDTO');

// DTOs de Estudos
const {
  CreateStudyDTO,
  UpdateStudyDTO,
  StudyResponseDTO,
  StudySearchDTO,
} = require('./studies/StudyDTO');

// DTOs Comuns
const {
  ApiResponseDTO,
  PaginationDTO,
  MongoIdDTO,
  SearchFiltersDTO,
  StatsDTO,
} = require('./common/ResponseDTO');

// DTO Base
const BaseDTO = require('./BaseDTO');

module.exports = {
  // Base
  BaseDTO,

  // Autenticação
  UserDTO,
  LoginDTO,
  AuthResponseDTO,
  UpdateUserDTO,

  // Livros
  CreateBookDTO,
  UpdateBookDTO,
  BookResponseDTO,
  BookSearchDTO,

  // Sermões
  CreateSermonDTO,
  UpdateSermonDTO,
  SermonResponseDTO,
  SermonSearchDTO,

  // Estudos
  CreateStudyDTO,
  UpdateStudyDTO,
  StudyResponseDTO,
  StudySearchDTO,

  // Comuns
  ApiResponseDTO,
  PaginationDTO,
  MongoIdDTO,
  SearchFiltersDTO,
  StatsDTO,
};
