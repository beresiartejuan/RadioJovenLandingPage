import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Route, Switch } from 'wouter'
import Index from './pages/Index'
import Horoscopo from './pages/Horoscopo'
import Eventos from './pages/Eventos'
import 'normalize.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Switch>
      <Route path="/" component={Index} />
      <Route path="/horoscopo" component={Horoscopo} />
      <Route path="/eventos" component={Eventos}></Route>
    </Switch>
  </StrictMode>,
)
