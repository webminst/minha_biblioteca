// src/App.js
import React from 'react';
import ScrollToTop from './components/ScrollToTop';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Sermons from './pages/Sermons';
import Studies from './pages/Studies';
import Books from './pages/Books';
import Agenda from './pages/Agenda';
import About from './pages/About';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';
import SupportPage from './pages/SupportPage';
import ContentDetail from './pages/ContentDetail';
import SearchResults from './pages/SearchResults';
import './App.css';

// Todas as importações acima são utilizadas no componente App.

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="sermoes" element={<Sermons />} />
          <Route path="sermoes/:contentId" element={<ContentDetail />} />
          <Route path="estudos" element={<Studies />} />
          <Route path="estudos/:contentId" element={<ContentDetail />} />
          <Route path="livros" element={<Books />} />
          <Route path="livros/:contentId" element={<ContentDetail />} />
          <Route path="agenda" element={<Agenda />} />
          <Route path="sobre" element={<About />} />
          <Route path="contato" element={<Contact />} />
          <Route path="busca" element={<SearchResults />} />
          <Route path="apoie" element={<SupportPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;