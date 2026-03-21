import { useState, useEffect } from 'react'
import Home from './pages/Home'
import ScanStruk from './pages/ScanStruk'
import RecapPage from './pages/RecapPage'
import BottomNav from './components/BottomNav'
import type { ScreenType } from './components/BottomNav'
import { authService } from './services/authService'
import AuthPage from './components/AuthPage'

export default function App() {
  const [screen, setScreen] = useState<ScreenType>('home')

  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  useEffect(() => {
    const checkLoginStatus = () => {
      const user = authService.getUser()
      setIsAuthenticated(!!user)
      setIsCheckingAuth(false)
    }

    checkLoginStatus()
  }, [])

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#f7f9f8] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#1a5336] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <AuthPage onLoginSuccess={() => setIsAuthenticated(true)} />
  }
  return (
    <div className="bg-[#f7f9f8] min-h-screen relative">

      {screen === 'home' && <Home />}
      {screen === 'recap' && <RecapPage onBack={() => setScreen('home')} />}
      {screen === 'scan' && (
        <ScanStruk
          onBack={() => setScreen('home')}
          onCapture={() => setScreen('home')}
        />
      )}

      <BottomNav activeScreen={screen} onNavigate={setScreen} />

    </div>
  )
}