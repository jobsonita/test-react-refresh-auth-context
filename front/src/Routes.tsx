import React from 'react'
import { Route, Switch } from 'react-router-dom'

import Dashboard from './pages/Dashboard'
import Home from './pages/Home'
import MessagesDashboard from './pages/MessagesDashboard'
import Register from './pages/Register'
import UsersDashboard from './pages/UsersDashboard'

const Routes: React.FC = () => {
  return (
    <Switch>
      <Route exact path="/" component={Home} />
      <Route exact path="/register" component={Register} />
      <Route exact path="/dashboard" component={Dashboard} />
      <Route exact path="/messages" component={MessagesDashboard} />
      <Route exact path="/admin" component={UsersDashboard} />
    </Switch>
  )
}

export default Routes
