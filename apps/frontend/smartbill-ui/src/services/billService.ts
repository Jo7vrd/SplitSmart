import type { Bill } from '../types'

// Pake Env Variable Vite. Kalau kosong, fallback ke localhost.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1'

export const fetchBillFromBackend = async (roomCode: string): Promise<Bill | null> => {
    try {
        // Panggil endpoint GET Room
        const response = await fetch(`${API_URL}/rooms/${roomCode}`)

        if (!response.ok) {
            throw new Error(`Gagal narik data: ${response.statusText}`)
        }

        const data = await response.json()

        // Transformasi JSON Backend ke Tipe TypeScript Frontend
        const formattedBill: Bill = {
            id: data.id,
            roomCode: data.room_code,
            name: data.merchant_name,
            amount: data.grand_total,
            status: data.status,
            date: new Date(data.created_at).toLocaleDateString('id-ID', {
                day: 'numeric', month: 'short', year: 'numeric'
            }),
            icon: '🍽️',

            members: data.members.map((m: any) => ({
                id: m.id,
                name: m.name,
                initials: m.name.substring(0, 1).toUpperCase(),
                color: m.color_code,
                isHost: m.is_host,
                hasPaid: m.has_paid
            })),

            items: data.items.map((item: any) => ({
                id: item.id,
                name: item.item_name,
                qty: item.qty,
                price: item.price,
                assignedTo: item.splits ? item.splits.map((split: any) => split.member_id) : []
            }))
        }

        return formattedBill

    } catch (error) {
        console.error("❌ Error fetchBillFromBackend:", error)
        return null
    }
}