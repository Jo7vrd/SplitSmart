import { useState, useEffect } from 'react'
import BillCard from '../components/BillCard'
import BillDetailSheet from '../components/BillDetailSheet'
import type { Bill } from '../types'
import { fetchBillFromBackend } from '../services/billService' // 🌟 Import API service kita

interface Props {
  onScan: () => void
}

export default function Home({ onScan }: Props) {
  // State UI
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null)

  // State Data dari Backend
  const [bills, setBills] = useState<Bill[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadBills = async () => {
    setIsLoading(true)
    const [room1, room2] = await Promise.all([
      fetchBillFromBackend('WSR01'),
      fetchBillFromBackend('KPK02')
    ])

    const loadedBills: Bill[] = []
    if (room1) loadedBills.push(room1)
    if (room2) loadedBills.push(room2)

    setBills(loadedBills)
    setIsLoading(false)
  }

  // Panggil saat halaman pertama dibuka
  useEffect(() => {
    loadBills()
  }, [])

  // Kalkulasi dinamis buat Hero Card (Biar angkanya nggak hardcode)
  const activeBills = bills.filter(b => b.status === 'splitting')
  const totalUnpaid = activeBills.reduce((sum, bill) => sum + bill.amount, 0)

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* Navbar */}
      <div className="relative flex justify-center items-center px-6 pt-14 pb-3">
        <span className="text-[30px] font-serif font-bold tracking-tight">SmartBill</span>
        <div className="absolute right-6 w-10 h-10 rounded-full bg-emerald-700 flex items-center justify-center text-white text-sm font-bold shadow-md">
          JA
        </div>
      </div>

      {/* Hero Card */}
      <div className="mx-4 bg-[#1a5336] rounded-2xl p-5 text-white relative overflow-hidden shadow-lg shadow-emerald-900/20">
        <p className="text-[11px] font-medium opacity-70 uppercase tracking-wide mb-1">
          Total yang belum dibayar
        </p>
        <p className="font-serif text-4xl font-bold tracking-tight mb-4">
          Rp <span className="font-mono">{totalUnpaid.toLocaleString('id-ID')}</span>
        </p>
        <div className="flex gap-3">
          <div className="flex-1 bg-white/10 rounded-xl p-3">
            <p className="text-[10px] opacity-65 uppercase tracking-wide mb-1">Kamu bayar</p>
            {/* Angka ini nanti bisa dihitung dari total split user yang login */}
            <p className="font-mono font-medium text-base">Rp 31k</p>
          </div>
          <div className="flex-1 bg-white/10 rounded-xl p-3">
            <p className="text-[10px] opacity-65 uppercase tracking-wide mb-1">Tagihan aktif</p>
            <p className="font-mono font-medium text-base">{activeBills.length} tagihan</p>
          </div>
        </div>
      </div>

      {/* Tagihan Terbaru */}
      <div className="px-4 mt-5 pb-28">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-[15px] font-semibold text-gray-800">Tagihan Terbaru</h2>
          <span className="text-sm text-emerald-700 font-medium cursor-pointer">Lihat semua →</span>
        </div>

        <div className="flex flex-col gap-2">
          {isLoading ? (
            // Skeleton Loading UI biar keliatan pro
            <div className="animate-pulse space-y-3">
              <div className="h-20 bg-gray-100 rounded-2xl w-full"></div>
              <div className="h-20 bg-gray-100 rounded-2xl w-full"></div>
            </div>
          ) : bills.length > 0 ? (
            bills.map((b) => (
              <BillCard
                key={b.id}
                bill={b}
                onClick={() => setSelectedBill(b)}
              />
            ))
          ) : (
            <p className="text-center text-sm text-gray-400 mt-4">Belum ada tagihan nih cuy.</p>
          )}
        </div>
      </div>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-black/5 flex items-center justify-around px-8 pt-3 pb-6">
        <button className="flex flex-col items-center gap-1 text-xs font-medium text-emerald-700">
          <span className="text-xl">🏠</span>
          Home
        </button>
        <button
          onClick={onScan}
          className="w-14 h-14 bg-[#1a5336] rounded-2xl flex items-center justify-center text-white text-3xl -mt-4 shadow-lg shadow-emerald-900/40 active:scale-95 transition-transform"
        >
          +
        </button>
        <button className="flex flex-col items-center gap-1 text-xs font-medium text-gray-400">
          <span className="text-xl">🕐</span>
          Riwayat
        </button>
      </div>

      {/* Sheet Modal */}
      <BillDetailSheet
        bill={selectedBill}
        onClose={() => { setSelectedBill(null); loadBills() }}
      />
    </div>
  )
}