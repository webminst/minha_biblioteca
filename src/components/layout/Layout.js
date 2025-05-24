import React from 'react';
import { Outlet } from 'react-router-dom'; // Importa o Outlet
import Header from '../header/Header';
import Footer from '../footer/Footer';
import './Layout.css';

const Layout = () => {
  return (
    <div className="layout-container">
      <Header />
      <main className="main-content">
        <Outlet /> {/* O conteúdo da rota específica será renderizado aqui */}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;