// src/components/AuthPage.tsx
import { useState } from 'react'
import { DollarSign } from 'lucide-react'
import { authService } from '../services/authService'

export default function AuthPage({ onLoginSuccess, onGuestClick }: { onLoginSuccess: () => void, onGuestClick?: () => void }) {
    const [isLogin, setIsLogin] = useState(true)
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            if (isLogin) {
                await authService.login(email, password)
            } else {
                await authService.register(name, email, password)
            }
            onLoginSuccess()
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#f7f9f8] flex items-center justify-center p-5 font-sans">
            <div className="w-full max-w-sm bg-white rounded-3xl p-7 border border-black/5 shadow-sm">

                {/* Logo & Title */}
                <div className="text-center mb-8">
                    <div className="w-14 h-14 bg-primary rounded-2xl mx-auto flex items-center justify-center text-white mb-4"
                        style={{ boxShadow: '0 0 0 4px white, 0 4px 16px rgba(34,82,62,0.25)' }}>
                        <DollarSign className="w-7 h-7" />
                    </div>
                    <h1 className="font-serif text-2xl font-bold text-dark">SmartBill</h1>
                    <p className="text-sm text-dark/40 mt-1">
                        {isLogin ? 'Masuk buat ngatur utang temen' : 'Daftar dulu biar gampang nagih'}
                    </p>
                </div>

                {/* Toggle */}
                <div className="flex bg-black/5 rounded-2xl p-1 mb-6">
                    <button
                        onClick={() => { setIsLogin(true); setError('') }}
                        className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-all ${isLogin ? 'bg-white text-dark shadow-sm' : 'text-dark/35'}`}
                    >
                        Masuk
                    </button>
                    <button
                        onClick={() => { setIsLogin(false); setError('') }}
                        className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-all ${!isLogin ? 'bg-white text-dark shadow-sm' : 'text-dark/35'}`}
                    >
                        Daftar
                    </button>
                </div>

                {/* Error */}
                {error && (
                    <div className="bg-red-50 text-red-500 text-xs font-medium p-3 rounded-xl mb-4 text-center border border-red-100">
                        {error}
                    </div>
                )}

                {/* Form */}
                <div className="space-y-3">
                    {!isLogin && (
                        <div>
                            <label className="block text-xs font-semibold text-dark/50 mb-1.5 ml-0.5">Nama Panggilan</label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-white border border-black/10 text-dark text-sm rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-dark/25"
                                placeholder="Budi"
                            />
                        </div>
                    )}
                    <div>
                        <label className="block text-xs font-semibold text-dark/50 mb-1.5 ml-0.5">Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-white border border-black/10 text-dark text-sm rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-dark/25"
                            placeholder="budi@email.com"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-dark/50 mb-1.5 ml-0.5">Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-white border border-black/10 text-dark text-sm rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-dark/25"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full bg-primary text-white text-sm font-bold py-3.5 rounded-xl mt-1 active:scale-[0.98] transition-all disabled:opacity-60"
                    >
                        {loading ? 'Tunggu bentar...' : (isLogin ? 'Masuk' : 'Daftar Sekarang')}
                    </button>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-3 my-5">
                    <div className="flex-1 h-px bg-black/8" />
                    <span className="text-xs text-dark/30 font-medium">atau</span>
                    <div className="flex-1 h-px bg-black/8" />
                </div>

                {/* Guest */}
                <button
                    onClick={(e) => { e.preventDefault(); onGuestClick?.() }}
                    className="w-full border border-black/10 bg-white text-dark/50 text-sm font-medium py-3 rounded-xl hover:bg-black/5 active:scale-[0.98] transition-all"
                >
                    Lanjut sebagai Guest 👀
                </button>

            </div>
        </div>
    )
}