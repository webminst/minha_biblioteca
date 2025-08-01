module.exports = {
  // Ambiente de teste
  testEnvironment: 'node',
  
  // Diretórios de teste
  testMatch: [
    '**/__tests__/**/*.(test|spec).(js|ts)',
    '**/*.(test|spec).(js|ts)'
  ],
  
  // Extensões de arquivo
  moduleFileExtensions: ['js', 'ts', 'json'],
  
  // Transformadores
  transform: {
    '^.+\\.(js|ts)$': ['babel-jest', {
      presets: [
        ['@babel/preset-env', { targets: { node: 'current' } }],
        '@babel/preset-typescript'
      ]
    }]
  },
  
  // Configuração de módulos
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@config/(.*)$': '<rootDir>/config/$1',
    '^@services/(.*)$': '<rootDir>/services/$1',
    '^@models/(.*)$': '<rootDir>/models/$1',
    '^@middleware/(.*)$': '<rootDir>/middleware/$1',
    '^@utils/(.*)$': '<rootDir>/utils/$1',
    '^@dto/(.*)$': '<rootDir>/dto/$1'
  },
  
  // Setup de teste
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  
  // Cobertura de código
  collectCoverage: true,
  collectCoverageFrom: [
    '**/*.{js,ts}',
    '!**/node_modules/**',
    '!**/__tests__/**',
    '!**/coverage/**',
    '!**/jest.config.js',
    '!**/jest.setup.js',
    '!**/server.js',
    '!**/scripts/**'
  ],
  
  // Relatórios de cobertura
  coverageReporters: ['text', 'lcov', 'html'],
  coverageDirectory: 'coverage',
  
  // Timeout de teste
  testTimeout: 10000,
  
  // Verbose
  verbose: true,
  
  // Forçar saída
  forceExit: true,
  
  // Detectar handles abertos
  detectOpenHandles: true,
  
  // Configurações específicas para diferentes tipos de arquivo
  overrides: [
    {
      files: ['**/*.ts'],
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint'],
      extends: [
        'eslint:recommended',
        '@typescript-eslint/recommended'
      ]
    }
  ],
  
  // Mocks globais
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json'
    }
  }
};
