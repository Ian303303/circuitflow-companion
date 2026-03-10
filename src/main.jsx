import React from 'react'
import ReactDOM from 'react-dom/client'
import CompanionApp from './CompanionApp.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CompanionApp isLoggedIn={false} onLogin={() => {
      window.open('https://circuitflow.dev', '_blank')
    }} />
  </React.StrictMode>
)
