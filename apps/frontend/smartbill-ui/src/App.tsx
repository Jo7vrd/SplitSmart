import { useState } from 'react'
import Home from './pages/Home'
import ScanStruk from './pages/ScanStruk'

type Screen = 'home' | 'scan'

export default function App() {
  const [screen, setScreen] = useState<Screen>('home')

  const handleCapture = (img: string) => {
    console.log('captured:', img)
    // nanti connect ke halaman split bill detail
  }

  if (screen === 'scan') {
    return <ScanStruk onBack={() => setScreen('home')} onCapture={handleCapture} />
  }

  return <Home onScan={() => setScreen('scan')} />
}