/**
 * Função auxiliar para criar o cabeçalho de autorização com o token JWT
 * Retorna um objeto com o cabeçalho de autorização se o usuário estiver logado
 * Caso contrário, retorna um objeto vazio
 */

export default function authHeader() {
  const user = JSON.parse(localStorage.getItem('user'));

  if (user && user.accessToken) {
    return {
      'x-access-token': user.accessToken,
      'Content-Type': 'application/json',
    };
  } else {
    return { 'Content-Type': 'application/json' };
  }
}
