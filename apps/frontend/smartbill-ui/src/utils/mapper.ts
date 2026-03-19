import { getInitials } from './member'
import type { Bill, Member, BillItem } from '../types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapMember(raw: any): Member {
    return {
        id: raw.id,
        name: raw.name,
        initials: getInitials(raw.name),
        color: raw.color_code,
        isHost: raw.is_host,
        hasPaid: raw.has_paid,
    }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapBillItem(raw: any): BillItem {
    return {
        id: raw.id,
        name: raw.item_name,
        qty: raw.qty,
        price: raw.price,
        assignedTo: raw.splits?.map((s: any) => s.member_id) ?? [],
    }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapBill(raw: any): Bill {
    return {
        id: raw.id,
        icon: '🍽️',
        name: raw.merchant_name,
        date: new Date(raw.created_at).toLocaleDateString('id-ID', {
            day: 'numeric', month: 'short', year: 'numeric'
        }),
        amount: raw.grand_total,
        roomCode: raw.room_code,
        status: raw.status,
        members: raw.members?.map(mapMember) ?? [],
        items: raw.items?.map(mapBillItem) ?? [],
    }
}