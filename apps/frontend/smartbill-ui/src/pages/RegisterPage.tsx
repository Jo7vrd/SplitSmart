import { useState } from 'react'
import { authService } from '../services/authService'

interface Props {
    onBack: () => void
    onRegisterSuccess: () => void
    onMasuk: () => void
}

export default function RegisterPage({ onBack, onRegisterSuccess, onMasuk }: Props) {
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [password, setPassword] = useState('')
    const [agree, setAgree] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

const handleSubmit = async () => {
        if (!agree) return setError('Setujui syarat & ketentuan dulu ya')
        setError('')
        setLoading(true)
        try {
            const fullName = `${firstName} ${lastName}`.trim()
            await authService.register(fullName, username, email, phone, password)
            onRegisterSuccess()
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const inputClass = "w-full bg-[#f7f9f8] border border-black/8 text-dark text-sm rounded-2xl px-4 py-3.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-dark/25"

    return (
        <div className="min-h-screen font-sans relative" style={{ background: 'linear-gradient(to bottom, #22523E 25%, #f7f9f8 25%)' }}>

            {/* Blobs */}
            <div className="absolute w-64 h-64 rounded-full bg-white/5 -top-20 -right-16 pointer-events-none" />
            <div className="absolute w-48 h-48 rounded-full bg-white/5 top-32 -left-20 pointer-events-none" />

            {/* Hero */}
            <div className="px-6 pt-10 pb-6 relative">
                <button onClick={onBack} className="relative z-10 text-white/60  block">
                    <span className="text-5xl">‹</span>
                </button>
                <div className="relative z-10 text-center">
                    <h1 className="font-sans text-3xl font-bold text-white">Buat Akun</h1>
                    <p className="text-white/50 text-sm mt-1">Daftar gratis, tidak perlu kartu kredit</p>
                </div>
            </div>

            {/* Card */}
            <div className="px-5 relative z-10 pb-10">
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-black/5">

                    {error && (
                        <div className="bg-red-50 text-red-500 text-xs font-medium p-3 rounded-xl mb-4 text-center border border-red-100">
                            {error}
                        </div>
                    )}

                    <div className="space-y-3">
                        {/* Nama depan & belakang */}
                        <div className="flex gap-3">
                            <div className="flex-1">
                                <label className="block text-sm font-semibold text-dark mb-1.5">Nama Depan</label>
                                <input
                                    type="text"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    className={inputClass}
                                    placeholder="Jonathan"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-semibold text-dark mb-1.5">Nama Belakang</label>
                                <input
                                    type="text"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    className={inputClass}
                                    placeholder="Panjaitan"
                                />
                            </div>
                        </div>

                        {/* Username */}
                        <div>
                            <label className="block text-sm font-semibold text-dark mb-1.5">Username</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className={`${inputClass} pr-10`}
                                    placeholder="@jonathan_ap"
                                />
                                {username.length > 3 && (
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-primary text-sm font-bold">✓</span>
                                )}
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-semibold text-dark mb-1.5">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={inputClass}
                                placeholder="email@example.com"
                            />
                        </div>

                        {/* No HP */}
                        <div>
                            <label className="block text-sm font-semibold text-dark mb-1.5">
                                No. HP <span className="text-primary font-normal text-xs">(opsional)</span>
                            </label>
                            <div className="flex gap-2">
                                <div className="bg-[#f7f9f8] border border-black/8 rounded-2xl px-4 py-3.5 text-sm font-semibold text-dark/50 shrink-0">
                                    +62
                                </div>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className={`${inputClass} flex-1`}
                                    placeholder="812 3456 7890"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-semibold text-dark mb-1.5">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={inputClass}
                                placeholder="••••••••"
                            />
                        </div>

                        {/* Agree checkbox */}
                        <button
                            onClick={() => setAgree(!agree)}
                            className="flex items-center gap-2.5 pt-1 active:scale-95 transition-transform w-full text-left"
                        >
                            <div
                                className="w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all"
                                style={{
                                    borderColor: agree ? '#22523E' : '#ccc',
                                    background: agree ? '#22523E' : 'white'
                                }}
                            >
                                {agree && <span className="text-white text-[10px] font-bold">✓</span>}
                            </div>
                            <span className="text-xs text-dark/50">
                                Saya setuju dengan{' '}
                                <span className="text-primary font-bold">Syarat & Ketentuan</span>
                            </span>
                        </button>

                        {/* Submit */}
                        <button
                            onClick={handleSubmit}
                            disabled={loading || !agree}
                            className="w-full bg-primary text-white font-bold py-4 rounded-2xl active:scale-[0.98] transition-all disabled:opacity-60"
                        >
                            {loading ? 'Tunggu bentar...' : 'Buat Akun →'}
                        </button>
                    </div>

                    {/* Switch to login */}
                    <p className="text-sm text-dark/40 text-center mt-5">
                        Sudah punya akun?{' '}
                        <button onClick={onMasuk} className="text-primary font-bold">Masuk</button>
                    </p>
                </div>
            </div>

        </div>
    )
}