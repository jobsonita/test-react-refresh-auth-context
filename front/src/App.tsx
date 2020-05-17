import React from 'react'
import { BrowserRouter as Router } from 'react-router-dom'

import { AppProvider } from './context'

import Routes from './Routes'

function App() {
  return (
    <div className="App">
      <Router>
        <AppProvider>
          <Routes />
        </AppProvider>
      </Router>
    </div>
  )
}

export default App
