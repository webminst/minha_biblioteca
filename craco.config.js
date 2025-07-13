const path = require('path');

module.exports = {
    webpack: {
        configure: (webpackConfig) => {
            // Modificar as configurações do devServer para resolver os warnings
            if (webpackConfig.devServer) {
                // Remover as opções deprecated e usar setupMiddlewares
                delete webpackConfig.devServer.onBeforeSetupMiddleware;
                delete webpackConfig.devServer.onAfterSetupMiddleware;

                // Usar a nova abordagem setupMiddlewares se necessário
                if (!webpackConfig.devServer.setupMiddlewares) {
                    webpackConfig.devServer.setupMiddlewares = (middlewares, devServer) => {
                        // Aqui você pode adicionar middlewares customizados se necessário
                        return middlewares;
                    };
                }
            }

            return webpackConfig;
        }
    },
    devServer: {
        // Configurações do dev server
        port: 3000,
        open: false,
        // Usar setupMiddlewares em vez das opções deprecated
        setupMiddlewares: (middlewares, devServer) => {
            // Middleware customizado pode ser adicionado aqui
            return middlewares;
        }
    }
};
