import { useState, useEffect } from 'react'
import { authService } from '../services/authService'
import { fetchUserBills, fetchBillFromBackend } from '../services/billService'

interface RecapPageProps {
    onBack: () => void
}

const CATEGORY_EMOJIS: Record<string, string> = {
    "Makan": "🍱", "Belanja": "🛒", "Kebersihan": "🧼", "Tagihan": "🧾",
    "Kesehatan": "💊", "Hiburan": "🎬", "Pendidikan": "📚", "Transportasi": "🚕", "Lain-lain": "📦"
}

const CATEGORY_COLORS: Record<string, string> = {
    "Makan": "bg-amber-600", "Belanja": "bg-blue-500", "Kebersihan": "bg-teal-400",
    "Tagihan": "bg-red-500", "Kesehatan": "bg-emerald-500", "Hiburan": "bg-purple-500",
    "Pendidikan": "bg-indigo-600", "Transportasi": "bg-yellow-500", "Lain-lain": "bg-gray-400"
}

export default function RecapPage({ onBack }: RecapPageProps) {
    const [recapData, setRecapData] = useState<any[]>([])
    const [totalPengeluaran, setTotalPengeluaran] = useState(0)
    const [isLoading, setIsLoading] = useState(true)

    const namaBulan = new Date().toLocaleString('id-ID', { month: 'long', year: 'numeric' })

    useEffect(() => {
        const loadRecap = async () => {
            setIsLoading(true)
            const currentUser = authService.getUser()
            if (!currentUser) return

            const userHistory = await fetchUserBills()

            let totalHutang = 0
            let kategoriMap: Record<string, number> = {}

            if (userHistory.length > 0) {
                const fullBills = await Promise.all(
                    userHistory.map(b => fetchBillFromBackend(b.roomCode))
                )
                fullBills.forEach(fullBill => {
                    if (!fullBill) return

                    const me = fullBill.members.find(m => m.userId === currentUser.id)
                    if (me) {
                        fullBill.items.forEach(item => {
                            if (item.assignedTo.includes(me.id)) {
                                const hargaPatungan = item.price / item.assignedTo.length
                                totalHutang += hargaPatungan
                                const namaKategori = item.category?.name || "Lain-lain"

                                if (kategoriMap[namaKategori]) {
                                    kategoriMap[namaKategori] += hargaPatungan
                                } else {
                                    kategoriMap[namaKategori] = hargaPatungan
                                }
                            }
                        })
                    }
                })
            }

            const finalRecap = Object.keys(kategoriMap)
                .map(key => ({
                    nama_asli: key,
                    nama: `${CATEGORY_EMOJIS[key] || "📦"} ${key}`,
                    jumlah: kategoriMap[key],
                    warna: CATEGORY_COLORS[key] || "bg-gray-400"
                }))
                .sort((a, b) => b.jumlah - a.jumlah)

            setRecapData(finalRecap)
            setTotalPengeluaran(totalHutang)
            setIsLoading(false)
        }

        loadRecap()
    }, [])

    return (
        <div className="min-h-screen bg-[#f7f9f8] font-sans pb-24">

            {/* Header */}
            <div className="bg-[#1a5336] pt-14 pb-8 px-6 rounded-b-[2rem] shadow-md text-white relative">
                <button onClick={onBack} className="relative z-10 text-white block">
                    <span className="text-5xl">‹</span>
                </button>
                <div className="text-center mt-6">
                    <p className="text-xs font-medium opacity-70 uppercase tracking-widest mb-1">Pengeluaranmu</p>
                    <h1 className="font-sans text-4xl font-bold">{namaBulan}</h1>
                    <p className="text-4xl font-mono font-bold mt-3">
                        Rp {isLoading ? "..." : (totalPengeluaran / 1000).toLocaleString('id-ID')}k
                    </p>
                </div>
            </div>

            {/* List Kategori */}
            <div className="px-5 mt-8">
                <h2 className="text-[15px] font-bold text-gray-800 mb-4">Rincian per Kategori</h2>

                <div className="bg-white rounded-3xl p-5 shadow-sm border border-black/5 flex flex-col gap-5 min-h-[200px]">
                    {isLoading ? (
                        <div className="animate-pulse flex flex-col gap-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-10 bg-gray-100 rounded-xl w-full"></div>
                            ))}
                        </div>
                    ) : recapData.length > 0 ? (
                        recapData.map((kat, index) => {
                            const persentase = totalPengeluaran > 0 ? Math.round((kat.jumlah / totalPengeluaran) * 100) : 0

                            return (
                                <div key={index} className="flex flex-col gap-2">
                                    <div className="flex justify-between items-center text-sm font-semibold">
                                        <span className="text-dark">{kat.nama}</span>
                                        <span className="font-mono text-dark/70">
                                            Rp {(kat.jumlah / 1000).toLocaleString('id-ID')}k
                                        </span>
                                    </div>

                                    <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${kat.warna} rounded-full transition-all duration-1000 ease-out`}
                                            style={{ width: `${persentase}%` }}
                                        />
                                    </div>
                                    <p className="text-[10px] text-right text-gray-400 font-bold -mt-1">{persentase}%</p>
                                </div>
                            )
                        })
                    ) : (
                        <div className="text-center text-gray-400 text-sm mt-10">
                            Belum ada pengeluaran bulan ini cuy. Mantap, hemat! 🤑
                        </div>
                    )}
                </div>
            </div>

            {/* Info Tambahan */}
            {!isLoading && recapData.length > 0 && (
                <div className="px-5 mt-6 animate-fade-in">
                    <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex gap-3 items-start">
                        <span className="text-2xl">💡</span>
                        <p className="text-xs text-emerald-800 leading-relaxed font-medium mt-1">
                            Bulan ini kamu paling boros di kategori <b>{recapData[0].nama_asli}</b>.
                            {recapData[0].nama_asli === 'Makan' ? ' Kurang-kurangin jajan di luar cuy, masak telor aja di rumah!' : ' Coba ditahan dulu nafsunya, mending duitnya ditabung!'}
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}