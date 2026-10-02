import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Route, Switch } from 'wouter';
import { AuthProvider } from './auth/AuthContext';

import 'normalize.css';

import Index from './pages/Index';
import Horoscopo from './pages/Horoscopo';
import Eventos from './pages/Eventos';
import Login from './pages/Login';
import Panel from './pages/Panel';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <Switch>
        <Route path="/" component={Index} />
        <Route path="/horoscopo" component={Horoscopo} />
        <Route path="/eventos" component={Eventos} />
        <Route path="/ingresar" component={Login} />
        <Route path="/panel" component={Panel} />
      </Switch>
    </AuthProvider>
  </StrictMode>,
);
