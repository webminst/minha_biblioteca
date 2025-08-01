// dto/auth/UserDTO.js
const Joi = require('joi');
const BaseDTO = require('../BaseDTO');

/**
 * DTO para operações de usuário
 */
class UserDTO extends BaseDTO {
  constructor(data) {
    super(data);
    this.schema = Joi.object({
      username: BaseDTO.commonValidations.username.required(),
      password: BaseDTO.commonValidations.password.required(),
      role: Joi.string()
        .valid('admin', 'editor', 'viewer')
        .default('admin'),
    });
  }

  /**
     * Remove dados sensíveis para resposta
     */
  toSafeObject() {
    const { password, ...safeData } = this.validatedData || this.data;
    return safeData;
  }
}

/**
 * DTO para login de usuário
 */
class LoginDTO extends BaseDTO {
  constructor(data) {
    super(data);
    this.schema = Joi.object({
      username: BaseDTO.commonValidations.username.required(),
      password: Joi.string().required().min(1).message('Senha é obrigatória'),
    });
  }
}

/**
 * DTO para resposta de autenticação
 */
class AuthResponseDTO extends BaseDTO {
  constructor(data) {
    super(data);
    this.schema = Joi.object({
      user: Joi.object({
        _id: BaseDTO.commonValidations.id,
        username: Joi.string(),
        role: Joi.string(),
        createdAt: Joi.date(),
        updatedAt: Joi.date(),
      }),
      accessToken: Joi.string(),
      refreshToken: Joi.string(),
      expiresIn: Joi.number(),
    });
  }

  /**
     * Remove tokens sensíveis se necessário
     */
  toPublicObject() {
    const { refreshToken, ...publicData } = this.validatedData || this.data;
    return publicData;
  }
}

/**
 * DTO para atualização de usuário
 */
class UpdateUserDTO extends BaseDTO {
  constructor(data) {
    super(data);
    this.schema = Joi.object({
      username: BaseDTO.commonValidations.username.optional(),
      password: BaseDTO.commonValidations.password.optional(),
      role: Joi.string()
        .valid('admin', 'editor', 'viewer')
        .optional(),
    }).min(1); // Pelo menos um campo deve ser fornecido
  }

  toSafeObject() {
    const { password, ...safeData } = this.validatedData || this.data;
    return safeData;
  }
}

module.exports = {
  UserDTO,
  LoginDTO,
  AuthResponseDTO,
  UpdateUserDTO,
};
