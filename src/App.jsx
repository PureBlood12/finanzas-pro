import React from 'react'
import { AuthProvider } from './contexts/AuthContext'
import MainContent from './components/MainContent'

function App() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  )
}

export default App
