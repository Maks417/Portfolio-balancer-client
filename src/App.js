import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './components/Home';
import { NotFound } from './components/NotFound';

import './sass/app.scss'

function App() {
  return (
    <Layout>
      <Router>
        <Routes>
          <Route exact path='/' element={<Home />} />
          <Route component={<NotFound />} />
        </Routes>
      </Router>
    </Layout>
  );
}

export default App;
