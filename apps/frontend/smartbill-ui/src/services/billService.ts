import type { Bill } from '../types'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1'

export const fetchBillFromBackend = async (roomCode: string): Promise<Bill | null> => {
    try {
        const token = localStorage.getItem('token')

        const response = await fetch(`${API_URL}/rooms/${roomCode}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })

        if (!response.ok) {
            if (response.status === 401) {
                console.warn("Sesi habis, harus login ulang!")
            }
            throw new Error(`Gagal narik data: ${response.statusText}`)
        }

        const data = await response.json()

        const formattedBill: Bill = {
            id: data.id,
            roomCode: data.room_code,
            name: data.merchant_name,
            amount: data.grand_total,
            status: data.status,
            date: new Date(data.created_at).toLocaleDateString('id-ID', {
                day: 'numeric', month: 'short', year: 'numeric'
            }),
            icon: 'shop',

            members: data.members.map((m: any) => ({
                id: m.id,
                name: m.name,
                initials: m.name.substring(0, 1).toUpperCase(),
                color: m.color_code,
                isHost: m.is_host,
                hasPaid: m.has_paid,
                userId: m.user_id
            })),

            items: data.items.map((item: any) => ({
                id: item.id,
                name: item.item_name,
                qty: item.qty,
                price: item.price,
                assignedTo: item.splits ? item.splits.map((split: any) => split.member_id) : [],
                category: item.category && item.category.id ? {
                    id: item.category.id,
                    name: item.category.name
                } : undefined
            }))
        }

        return formattedBill

    } catch (error) {
        console.error("Error fetchBillFromBackend:", error)
        return null
    }
}

export const fetchUserBills = async (): Promise<Bill[]> => {
    try {
        const token = localStorage.getItem('token')

        const response = await fetch(`${API_URL}/rooms`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })

        if (!response.ok) {
            throw new Error(`Gagal narik history: ${response.statusText}`)
        }

        const data = await response.json()

        const userBills: Bill[] = data.map((room: any) => ({
            id: room.id,
            roomCode: room.room_code,
            name: room.merchant_name,
            amount: room.grand_total,
            status: room.status,
            date: new Date(room.created_at).toLocaleDateString('id-ID', {
                day: 'numeric', month: 'short', year: 'numeric'
            }),
            icon: 'shop',
            members: [],
            items: []
        }))

        return userBills

    } catch (error) {
        console.error("Error fetchUserBills:", error)
        return []
    }
}

export const joinRoomSelf = async (roomCode: string): Promise<boolean> => {
    try {
        const token = localStorage.getItem('token')
        const response = await fetch(`${API_URL}/rooms/${roomCode}/join-self`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })

        if (!response.ok) {
            const data = await response.json()
            throw new Error(data.error || 'Gagal gabung ke room')
        }

        return true
    } catch (error: any) {
        alert(`Error: ${error.message}`)
        return false
    }
}

export const joinRoomGuest = async (roomCode: string, name: string): Promise<boolean> => {
    try {
        const response = await fetch(`${API_URL}/rooms/${roomCode}/join`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name })
        })

        if (!response.ok) {
            const data = await response.json()
            throw new Error(data.error || 'Gagal masuk room')
        }
        return true
    } catch (error: any) {
        alert(`Error: ${error.message}`)
        return false
    }
}