import { useState, useEffect } from 'react'
import { Zap } from 'lucide-react'
import { fetchBillFromBackend, joinRoomGuest } from '../services/billService'
import BillDetailSheet from './BillDetailSheet'
import type { Bill } from '../types'

export default function GuestPage({ onBackToLogin }: { onBackToLogin: () => void }) {
    const [roomCode, setRoomCode] = useState('')
    const [name, setName] = useState('')
    const [loading, setLoading] = useState(false)
    const [activeBill, setActiveBill] = useState<Bill | null>(null)

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search)
        const codeFromUrl = urlParams.get('room')
        if (codeFromUrl) setRoomCode(codeFromUrl.toUpperCase())
    }, [])

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        const success = await joinRoomGuest(roomCode, name)
        if (success) {
            const billData = await fetchBillFromBackend(roomCode)
            if (billData) setActiveBill(billData)
        }
        setLoading(false)
    }

    const inputClass = "w-full bg-[#f7f9f8] border border-black/8 text-dark text-sm rounded-2xl px-4 py-3.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-dark/25"

    return (
        <div className="min-h-screen font-sans relative" style={{ background: 'linear-gradient(to bottom, #22523E 25%, #f7f9f8 25%)' }}>

            {/* Blobs */}
            <div className="absolute w-64 h-64 rounded-full bg-white/5 -top-20 -right-16 pointer-events-none" />
            <div className="absolute w-48 h-48 rounded-full bg-white/5 top-32 -left-20 pointer-events-none" />

            {/* Hero */}
            <div className="px-6 pt-10 pb-6 relative">
                <button onClick={onBackToLogin} className="relative z-10 text-white/60 block">
                    <span className="text-5xl">‹</span>
                </button>
                <div className="relative z-10 text-center">
                    <h1 className="font-sans text-3xl font-bold text-white">Gabung Tagihan</h1>
                    <p className="text-white/50 text-sm mt-1">Masukin kode dari temenmu</p>
                </div>
            </div>

            {/* Card */}
            <div className="px-5 relative z-10 pb-10">
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-black/5">

                    <div className="space-y-3">
                        {/* Kode Room */}
                        <div>
                            <label className="block text-sm font-semibold text-dark mb-1.5">Kode Room</label>
                            <input
                                type="text"
                                required
                                maxLength={6}
                                value={roomCode}
                                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                                className="w-full bg-[#f7f9f8] border border-black/8 text-dark font-mono font-bold tracking-[0.3em] text-center text-lg rounded-2xl px-4 py-3.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-dark/20 placeholder:tracking-normal placeholder:font-sans placeholder:font-medium placeholder:text-sm"
                                placeholder="KPK02"
                            />
                        </div>

                        {/* Nama */}
                        <div>
                            <label className="block text-sm font-semibold text-dark mb-1.5">Nama Kamu</label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className={`${inputClass} text-center font-semibold`}
                                placeholder="Siapa namamu?"
                            />
                        </div>

                        {/* Submit */}
                        <button
                            onClick={handleJoin}
                            disabled={loading || roomCode.length < 5 || !name}
                            className="w-full bg-primary text-white font-bold py-4 rounded-2xl mt-1 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? 'Masuk...' : <>Gas Bayar! <Zap className="w-4 h-4" /></>}
                        </button>

                        {/* Divider */}
                        <div className="flex items-center gap-3 py-1">
                            <div className="flex-1 h-px bg-black/8" />
                            <span className="text-xs text-dark/30 font-medium">atau</span>
                            <div className="flex-1 h-px bg-black/8" />
                        </div>

                        {/* Back to login */}
                        <button
                            onClick={onBackToLogin}
                            className="w-full border border-black/10 bg-white text-dark/50 text-sm font-medium py-3.5 rounded-2xl active:scale-[0.98] transition-all"
                        >
                            ← Kembali ke Login
                        </button>
                    </div>
                </div>
            </div>

            <BillDetailSheet
                bill={activeBill}
                onClose={() => {
                    setActiveBill(null)
                    window.history.pushState({}, '', window.location.pathname)
                }}
            />
        </div>
    )
}