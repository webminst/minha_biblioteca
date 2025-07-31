/**
 * @swagger
 * /api/books/{id}/ratings:
 *   get:
 *     summary: Obter média e total de avaliações de um livro
 *     description: Retorna a média e o total de avaliações de um livro específico
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do livro
 *     responses:
 *       200:
 *         description: Dados de avaliação obtidos com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 average:
 *                   type: number
 *                   format: float
 *                   nullable: true
 *                   description: Média das avaliações (1-5) ou null se não houver avaliações
 *                   example: 4.5
 *                 total:
 *                   type: integer
 *                   description: Número total de avaliações
 *                   example: 3
 *       404:
 *         description: Livro não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
