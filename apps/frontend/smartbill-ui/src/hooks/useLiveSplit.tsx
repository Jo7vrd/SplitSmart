import { useState, useEffect, useRef, useCallback } from 'react'
import type { Bill, BillItem, Member } from '../types'
import { fetchBillFromBackend } from '../services/billService'

export function useLiveSplit(bill: Bill | null) {
    const [items, setItems] = useState<BillItem[]>([])
    const [members, setMembers] = useState<Member[]>([])
    const ws = useRef<WebSocket | null>(null)
    const roomCode = bill?.roomCode

    useEffect(() => {
        if (!bill) return
        setItems(bill.items)
        setMembers(bill.members)

        fetchBillFromBackend(bill.roomCode).then((freshBill) => {
            if (freshBill) {
                setItems(freshBill.items)
                setMembers(freshBill.members)
            }
        })

        const socketUrl = `ws://localhost:8080/ws/room/${roomCode}`
        ws.current = new WebSocket(socketUrl)
        ws.current.onopen = () => console.log('✅ Connected to Live Split Room:', roomCode)

        ws.current.onmessage = async (event) => {
            const msg = JSON.parse(event.data)

            if (msg.action === 'claim' || msg.action === 'unclaim') {
                setItems((prev) => prev.map((item) => {
                    if (item.id !== msg.item_id) return item
                    const isClaimed = item.assignedTo.includes(msg.member_id)
                    if (msg.action === 'claim' && !isClaimed) return { ...item, assignedTo: [...item.assignedTo, msg.member_id] }
                    if (msg.action === 'unclaim' && isClaimed) return { ...item, assignedTo: item.assignedTo.filter(id => id !== msg.member_id) }
                    return item
                }))
            }

            if (msg.action === 'toggle_paid') {
                setMembers(prev => prev.map(m => m.id === msg.member_id ? { ...m, hasPaid: !m.hasPaid } : m))
            }
            if (msg.action === 'edit_member') {
                setMembers(prev => prev.map(m => m.id === msg.member_id ? { ...m, name: msg.name } : m))
            }
            if (msg.action === 'delete_member') {
                setMembers(prev => prev.filter(m => m.id !== msg.member_id))
                setItems(prev => prev.map(item => ({ ...item, assignedTo: item.assignedTo.filter(id => id !== msg.member_id) })))
            }
            if (msg.action === 'refresh') {
                const updatedBill = await fetchBillFromBackend(roomCode!)
                if (updatedBill) {
                    setMembers(updatedBill.members)
                    setItems(updatedBill.items)
                }
            }
        }

        return () => { if (ws.current) ws.current.close() }
    }, [bill, roomCode])

    const addMember = async (name: string) => {
        if (!roomCode) return
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1'
            const res = await fetch(`${API_URL}/rooms/${roomCode}/join`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name })
            })

            if (res.ok) {
                if (ws.current?.readyState === WebSocket.OPEN) ws.current.send(JSON.stringify({ action: 'refresh' }))

                const updatedBill = await fetchBillFromBackend(roomCode)
                if (updatedBill) setMembers(updatedBill.members)
            }
        } catch (error) { console.error(error) }
    }

    const togglePaidWS = useCallback((memberId: string) => {
        if (ws.current?.readyState === WebSocket.OPEN) ws.current.send(JSON.stringify({ action: 'toggle_paid', member_id: memberId }))
    }, [])

    const editMemberWS = useCallback((memberId: string, newName: string) => {
        if (ws.current?.readyState === WebSocket.OPEN) ws.current.send(JSON.stringify({ action: 'edit_member', member_id: memberId, name: newName }))
        setMembers(prev => prev.map(m => m.id === memberId ? { ...m, name: newName } : m))
    }, [])

    const deleteMemberWS = useCallback((memberId: string) => {
        if (ws.current?.readyState === WebSocket.OPEN) ws.current.send(JSON.stringify({ action: 'delete_member', member_id: memberId }))
        setMembers(prev => prev.filter(m => m.id !== memberId))
        setItems(prev => prev.map(item => ({ ...item, assignedTo: item.assignedTo.filter(id => id !== memberId) })))
    }, [])

    const toggleClaim = useCallback((itemId: string, memberId: string) => {
        const item = items.find(i => i.id === itemId)
        if (!item) return
        const isClaimed = item.assignedTo.includes(memberId)
        const action = isClaimed ? 'unclaim' : 'claim'

        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify({ action: action, item_id: itemId, member_id: memberId }))
        }
        setItems((prev) => prev.map((item) => {
            if (item.id !== itemId) return item
            return { ...item, assignedTo: isClaimed ? item.assignedTo.filter((id) => id !== memberId) : [...item.assignedTo, memberId] }
        }))
    }, [items])

    const deleteItem = useCallback((itemId: string) => setItems((prev) => prev.filter((item) => item.id !== itemId)), [])
    const updateItemName = useCallback((itemId: string, newName: string) => setItems((prev) => prev.map(i => i.id === itemId ? { ...i, name: newName } : i)), [])

    return { items, members, addMember, toggleClaim, deleteItem, updateItemName, roomCode, togglePaidWS, editMemberWS, deleteMemberWS }
}