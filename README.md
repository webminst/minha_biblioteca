# Pastor Portfolio

Este é um site de portfólio desenvolvido em React para apresentar o ministério, agenda, estudos, sermões e informações sobre o pastor Giovanni Moreira Guimarães. O projeto foi pensado para ser responsivo, acessível e fácil de manter.

## Funcionalidades

- **Página Inicial:** Apresentação do pastor, destaques de sermões, estudos e livros.
- **Sermões, Estudos e Livros:** Listagem e detalhes de conteúdos organizados.
- **Agenda:** Integração com Google Calendar para exibir eventos e compromissos.
- **Sobre:** Testemunho, formação e trajetória ministerial.
- **Contato:** Formulário para mensagens.
- **Newsletter:** Cadastro para receber novidades.
- **Busca:** Pesquisa de conteúdos no site.
- **Responsividade:** Layout adaptado para dispositivos móveis e desktop.

## Tecnologias Utilizadas

- [React](https://react.dev/)
- [React Router DOM](https://reactrouter.com/)
- [Font Awesome](https://fontawesome.com/)
- [Google Calendar Embed](https://calendar.google.com/)
- [Vercel](https://vercel.com/) (deploy)
- [GitHub Pages](https://pages.github.com/) (opcional)
- CSS customizado

## Como rodar localmente

1. **Clone o repositório:**
   ```sh
   git clone https://github.com/SEU_USUARIO/NOME_DO_REPOSITORIO.git
   cd NOME_DO_REPOSITORIO
   ```

2. **Instale as dependências:**
   ```sh
   npm install
   ```

3. **Inicie o servidor de desenvolvimento:**
   ```sh
   npm start
   ```

4. Acesse [http://localhost:3000](http://localhost:3000) no navegador.

## Como publicar

### Vercel

1. Faça login em [vercel.com](https://vercel.com/) e importe o repositório.
2. O Vercel detecta automaticamente projetos React.
3. Clique em **Deploy** e aguarde.
4. O site estará disponível em uma URL do tipo `https://seusite.vercel.app`.

### GitHub Pages

1. Instale o pacote `gh-pages`:
   ```sh
   npm install --save gh-pages
   ```
2. Adicione ao `package.json`:
   ```json
   "homepage": "https://SEU_USUARIO.github.io/NOME_DO_REPOSITORIO",
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d build"
   }
   ```
3. Rode:
   ```sh
   npm run deploy
   ```

## Estrutura de Pastas

```
src/
  components/
  pages/
  assets/
  App.js
  index.js
public/
README.md
package.json
```

## Créditos

- Pastor Giovanni Moreira Guimarães
- Desenvolvido com apoio da comunidade React

## Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.
