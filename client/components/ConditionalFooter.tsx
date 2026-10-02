import React from 'react';
import { useLocation } from 'react-router-dom';
import Footer from './Footer';

const ConditionalFooter = () => {
  const location = useLocation();
  
  // Ne pas afficher le footer sur les pages dashboard, login, register
  const hiddenPaths = ['/dashboard', '/login', '/register'];
  const shouldHideFooter = hiddenPaths.some(path => location.pathname.startsWith(path));
  
  if (shouldHideFooter) {
    return null;
  }
  
  return <Footer />;
};

export default ConditionalFooter;
