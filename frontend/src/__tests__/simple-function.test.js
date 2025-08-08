// Teste de função simples para verificar o ambiente de teste
function sum(a, b) {
  return a + b;
}

describe('Função de Soma', () => {
  it('deve somar dois números corretamente', () => {
    expect(sum(2, 3)).toBe(5);
  });
});
