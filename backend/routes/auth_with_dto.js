// routes/auth_with_dto.js
/**
 * EXEMPLO: Rotas de autenticação com DTOs implementados
 * Demonstra como melhorar a segurança e validação na autenticação
 */

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { generateSecureToken, verifySecureToken, authRateLimit } = require('../middleware/jwtSecurity');

// Importa DTOs de autenticação
const {
  UserDTO,
  LoginDTO,
  AuthResponseDTO,
  UpdateUserDTO,
  ApiResponseDTO,
} = require('../dto');

const {
  validateInput,
  validateId,
  successResponse,
  handleValidationErrors,
} = require('../middleware/dtoValidation');

// Aplica rate limiting
router.use(authRateLimit);

// ========== ROTA DE REGISTRO COM DTO ==========
router.post('/register',
  validateInput(UserDTO), // Valida dados de entrada
  async (req, res, next) => {
    try {
      const userData = req.validatedData;

      // Verifica se usuário já existe
      const userExists = await User.findOne({ username: userData.username });
      if (userExists) {
        return res.status(400).json(
          ApiResponseDTO.error('Nome de usuário já existe', [
            { field: 'username', message: 'Este username já está em uso' },
          ], 400),
        );
      }

      // Cria novo usuário
      const user = await User.create(userData);

      // Gera tokens seguros
      const accessToken = generateSecureToken(
        { id: user._id, role: user.role },
        'access',
      );
      const refreshToken = generateSecureToken(
        { id: user._id, role: user.role },
        'refresh',
      );

      // Prepara dados de resposta
      const authData = {
        user: {
          _id: user._id,
          username: user.username,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        accessToken,
        refreshToken,
        expiresIn: 24 * 60 * 60, // 24 horas em segundos
      };

      // Valida e transforma resposta com DTO
      const authResponseDTO = new AuthResponseDTO(authData);
      const validation = authResponseDTO.validate();

      if (!validation.isValid) {
        throw new Error('Erro ao processar resposta de autenticação');
      }

      // Remove token de refresh da resposta pública (por segurança)
      const publicResponse = authResponseDTO.toPublicObject();

      res.status(201).json(
        ApiResponseDTO.success(
          publicResponse,
          'Usuário registrado com sucesso',
        ),
      );

    } catch (error) {
      next(error);
    }
  },
);

// ========== ROTA DE LOGIN COM DTO ==========
router.post('/login',
  validateInput(LoginDTO), // Valida credenciais
  async (req, res, next) => {
    try {
      const { username, password } = req.validatedData;

      // Busca usuário
      const user = await User.findOne({ username }).select('+password');
      if (!user) {
        return res.status(401).json(
          ApiResponseDTO.error('Credenciais inválidas', [
            { field: 'auth', message: 'Username ou senha incorretos' },
          ], 401),
        );
      }

      // Verifica senha
      const isPasswordMatch = await user.matchPassword(password);
      if (!isPasswordMatch) {
        return res.status(401).json(
          ApiResponseDTO.error('Credenciais inválidas', [
            { field: 'auth', message: 'Username ou senha incorretos' },
          ], 401),
        );
      }

      // Gera tokens seguros
      const accessToken = generateSecureToken(
        { id: user._id, role: user.role },
        'access',
      );
      const refreshToken = generateSecureToken(
        { id: user._id, role: user.role },
        'refresh',
      );

      // Atualiza último login
      await User.findByIdAndUpdate(user._id, {
        lastLogin: new Date(),
      });

      // Prepara resposta segura
      const authData = {
        user: {
          _id: user._id,
          username: user.username,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        accessToken,
        refreshToken,
        expiresIn: 24 * 60 * 60,
      };

      const authResponseDTO = new AuthResponseDTO(authData);
      const validation = authResponseDTO.validate();

      if (!validation.isValid) {
        throw new Error('Erro ao processar resposta de login');
      }

      const publicResponse = authResponseDTO.toPublicObject();

      res.json(
        ApiResponseDTO.success(
          publicResponse,
          'Login realizado com sucesso',
        ),
      );

    } catch (error) {
      next(error);
    }
  },
);

// ========== ROTA DE REFRESH TOKEN COM VALIDAÇÃO ==========
router.post('/refresh',
  validateInput(
    class RefreshTokenDTO extends require('../dto/BaseDTO') {
      constructor(data) {
        super(data);
        this.schema = require('joi').object({
          refreshToken: require('joi').string().required()
            .messages({
              'string.empty': 'Refresh token é obrigatório',
              'any.required': 'Refresh token é obrigatório',
            }),
        });
      }
    },
  ),
  async (req, res, next) => {
    try {
      const { refreshToken } = req.validatedData;

      // Verifica token
      const decoded = verifySecureToken(refreshToken, 'refresh');
      if (!decoded) {
        return res.status(401).json(
          ApiResponseDTO.error('Token inválido ou expirado', null, 401),
        );
      }

      // Busca usuário
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(401).json(
          ApiResponseDTO.error('Usuário não encontrado', null, 401),
        );
      }

      // Gera novos tokens
      const newAccessToken = generateSecureToken(
        { id: user._id, role: user.role },
        'access',
      );
      const newRefreshToken = generateSecureToken(
        { id: user._id, role: user.role },
        'refresh',
      );

      const authData = {
        user: {
          _id: user._id,
          username: user.username,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresIn: 24 * 60 * 60,
      };

      const authResponseDTO = new AuthResponseDTO(authData);
      const publicResponse = authResponseDTO.toPublicObject();

      res.json(
        ApiResponseDTO.success(
          publicResponse,
          'Token renovado com sucesso',
        ),
      );

    } catch (error) {
      next(error);
    }
  },
);

// ========== ROTA DE ATUALIZAÇÃO DE USUÁRIO ==========
router.put('/profile',
  require('../middleware/authMiddleware').protect,
  validateInput(UpdateUserDTO),
  async (req, res, next) => {
    try {
      const updateData = req.validatedData;
      const userId = req.user._id;

      // Verifica se novo username já existe (se foi fornecido)
      if (updateData.username) {
        const existingUser = await User.findOne({
          username: updateData.username,
          _id: { $ne: userId },
        });

        if (existingUser) {
          return res.status(400).json(
            ApiResponseDTO.error('Username já existe', [
              { field: 'username', message: 'Este username já está em uso' },
            ], 400),
          );
        }
      }

      // Atualiza usuário
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        updateData,
        { new: true, runValidators: true },
      ).select('-password');

      // Transforma resposta removendo dados sensíveis
      const userDTO = new UserDTO(updatedUser.toObject());
      const safeUserData = userDTO.toSafeObject();

      res.json(
        ApiResponseDTO.success(
          safeUserData,
          'Perfil atualizado com sucesso',
        ),
      );

    } catch (error) {
      next(error);
    }
  },
);

// ========== ROTA DE LOGOUT ==========
router.post('/logout',
  require('../middleware/authMiddleware').protect,
  successResponse('Logout realizado com sucesso'),
  async (req, res, next) => {
    try {
      // Atualiza último logout (opcional)
      await User.findByIdAndUpdate(req.user._id, {
        lastLogout: new Date(),
      });

      // Em uma implementação real, você adicionaria o token a uma blacklist
      // Por enquanto, apenas confirma o logout
      res.json({ message: 'Logout realizado com sucesso' });

    } catch (error) {
      next(error);
    }
  },
);

// Middleware de tratamento de erros
router.use(handleValidationErrors);

module.exports = router;

/**
 * MELHORIAS DE SEGURANÇA COM DTOs:
 *
 * 1. VALIDAÇÃO ROBUSTA:
 *    - Senhas com critérios específicos
 *    - Usernames com formato padronizado
 *    - Tokens validados adequadamente
 *
 * 2. FILTRAGEM DE DADOS:
 *    - Senhas nunca expostas nas respostas
 *    - Dados sensíveis filtrados automaticamente
 *
 * 3. PADRONIZAÇÃO:
 *    - Respostas consistentes em toda a API
 *    - Erros padronizados e informativos
 *
 * 4. AUDITORIA:
 *    - Logs automáticos de validação
 *    - Rastreamento de tentativas inválidas
 */
