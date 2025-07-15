// src/hooks/useApi.js
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { extractSermons, extractStudies, extractBooks } from '../utils/apiResponseHelpers';

/**
 * Hook customizado para requisições API
 * Gerencia estado de loading, dados, erro e revalidação
 * Inclui compatibilidade automática com estrutura DTO
 * 
 * @param {string} url - URL da API
 * @param {Object} options - Opções da requisição (incluindo dataType para auto-extração)
 * @param {Array} dependencies - Dependências para refazer a requisição
 * @returns {Object} - { data, loading, error, refetch, mutate }
 */
export const useApi = (url, options = {}, dependencies = []) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Helper para extrair dados baseado no tipo de endpoint
    const extractDataByType = (responseData, url) => {
        if (options.dataType) {
            // Usa tipo explícito se fornecido
            switch (options.dataType) {
                case 'sermons': return extractSermons(responseData);
                case 'studies': return extractStudies(responseData);
                case 'books': return extractBooks(responseData);
                default: return responseData;
            }
        }

        // Auto-detecção baseada na URL
        if (url?.includes('/sermons')) return extractSermons(responseData);
        if (url?.includes('/studies')) return extractStudies(responseData);
        if (url?.includes('/books')) return extractBooks(responseData);

        // Para outros endpoints, retorna os dados como estão (com fallback para DTO)
        return responseData.success ? responseData.data : responseData;
    };

    const fetchData = useCallback(async () => {
        if (!url) return;

        try {
            setLoading(true);
            setError(null);

            // Configurações padrão
            const config = {
                method: 'GET',
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                }
            };

            // O token é adicionado automaticamente pelo interceptor do authService
            // Não é mais necessário adicionar manualmente aqui

            const response = await axios(url, config);
            // Extrai dados com compatibilidade DTO
            const extractedData = extractDataByType(response.data, url);
            setData(extractedData);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Erro na requisição');
            console.error('Erro na API:', err);
        } finally {
            setLoading(false);
        }
    }, [url, ...dependencies]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Função para revalidar dados
    const refetch = useCallback(() => {
        fetchData();
    }, [fetchData]);

    // Função para mutar dados localmente (otimistic updates)
    const mutate = useCallback((newData) => {
        setData(newData);
    }, []);

    return { data, loading, error, refetch, mutate };
};

/**
 * Hook para mutações (POST, PUT, DELETE)
 * 
 * @param {Function} mutationFn - Função que executa a mutação
 * @returns {Object} - { mutate, loading, error, data }
 */
export const useMutation = (mutationFn) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);

    const mutate = useCallback(async (...args) => {
        try {
            setLoading(true);
            setError(null);

            const result = await mutationFn(...args);
            setData(result);
            return result;
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Erro na operação';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [mutationFn]);

    return { mutate, loading, error, data };
};

/**
 * Hook para paginação
 * 
 * @param {Array} items - Array de itens para paginar
 * @param {number} itemsPerPage - Itens por página
 * @returns {Object} - Estado e funções de paginação
 */
export const usePagination = (items = [], itemsPerPage = 10) => {
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.ceil(items.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = items.slice(startIndex, endIndex);

    const goToPage = useCallback((page) => {
        const pageNumber = Math.max(1, Math.min(page, totalPages));
        setCurrentPage(pageNumber);
    }, [totalPages]);

    const nextPage = useCallback(() => {
        goToPage(currentPage + 1);
    }, [currentPage, goToPage]);

    const prevPage = useCallback(() => {
        goToPage(currentPage - 1);
    }, [currentPage, goToPage]);

    const reset = useCallback(() => {
        setCurrentPage(1);
    }, []);

    return {
        currentPage,
        totalPages,
        currentItems,
        goToPage,
        nextPage,
        prevPage,
        reset,
        hasNext: currentPage < totalPages,
        hasPrev: currentPage > 1
    };
};

/**
 * Hook para localStorage com estado reativo
 * 
 * @param {string} key - Chave do localStorage
 * @param {*} defaultValue - Valor padrão
 * @returns {Array} - [value, setValue]
 */
export const useLocalStorage = (key, defaultValue) => {
    const [value, setValue] = useState(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error(`Erro ao ler localStorage para chave "${key}":`, error);
            return defaultValue;
        }
    });

    const setStoredValue = useCallback((newValue) => {
        try {
            setValue(newValue);
            window.localStorage.setItem(key, JSON.stringify(newValue));
        } catch (error) {
            console.error(`Erro ao salvar localStorage para chave "${key}":`, error);
        }
    }, [key]);

    return [value, setStoredValue];
};
