import { Link } from 'react-router-dom';
import './NotFound.css';

/**
 * Componente NotFound - Página 404 (Erro)
 * Exibida quando o usuário acessa uma rota inexistente
 * Oferece navegação de volta para a página inicial
 */
const NotFound = () => {
  return (
    <div className='not-found-container'>
      {/* Ícone ou ilustração de erro */}
      <div className='error-icon'>
        <span className='error-number'>404</span>
      </div>

      {/* Mensagem principal de erro */}
      <h1 className='error-title'>Página Não Encontrada</h1>

      {/* Mensagem explicativa */}
      <p className='error-message'>
        Desculpe, a página que você está procurando não existe ou foi removida.
      </p>

      {/* Sugestões para o usuário */}
      <div className='error-suggestions'>
        <p>Você pode:</p>
        <ul>
          <li>Verificar se o endereço foi digitado corretamente</li>
          <li>Voltar para a página inicial</li>
          <li>Navegar pelas seções do site</li>
        </ul>
      </div>

      {/* Botões de navegação */}
      <div className='error-actions'>
        <Link to='/' className='primary-button'>
          Página Inicial
        </Link>
        <Link to='/sermons' className='secondary-button'>
          Ver Sermões
        </Link>
        <Link to='/estudos' className='secondary-button'>
          Ver Estudos
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
