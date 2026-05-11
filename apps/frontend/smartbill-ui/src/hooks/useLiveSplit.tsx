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

        const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8080'
        const socketUrl = `${WS_URL}/ws/room/${roomCode}`
        ws.current = new WebSocket(socketUrl)
        ws.current.onopen = () => console.log('Connected to Live Split Room:', roomCode)

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

            if (msg.action === 'update_category') {
                setItems(prev => prev.map(item =>
                    item.id === msg.item_id ? { ...item, category: { id: "temp-id", name: msg.name } } : item
                ))
            }
            if (msg.action === 'edit_item_name') {
                setItems(prev => prev.map(item =>
                    item.id === msg.item_id ? { ...item, name: msg.name } : item
                ))
            }
            if (msg.action === 'edit_item_price') {
                setItems(prev => prev.map(item =>
                    item.id === msg.item_id ? { ...item, price: msg.price } : item
                ))
            }

            if (msg.action === 'add_item') {
                setItems(prev => {
                    if (prev.find(i => i.id === msg.item_id)) return prev;
                    return [...prev, { id: msg.item_id, name: msg.name, price: msg.price, qty: 1, assignedTo: [] }]
                })
            }
            if (msg.action === 'delete_item') {
                setItems(prev => prev.filter(i => i.id !== msg.item_id))
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

    // ==========================================
    // ACTIONS: MEMBER
    // ==========================================
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


    // ==========================================
    // ACTIONS: ITEMS
    // ==========================================
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

    const deleteItemWS = useCallback((itemId: string) => {
        if (ws.current?.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify({ action: 'delete_item', item_id: itemId }))
        }
        setItems((prev) => prev.filter((item) => item.id !== itemId))
    }, [])

    const addItemWS = useCallback(() => {
        const newId = crypto.randomUUID()
        const newItem: BillItem = {
            id: newId,
            name: '',
            price: 0,
            qty: 1,
            assignedTo: []
        }

        if (ws.current?.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify({
                action: 'add_item',
                room_code: roomCode,
                item_id: newId,
                name: newItem.name,
                price: newItem.price
            }))
        }
        setItems(prev => [...prev, newItem])
        return newId
    }, [roomCode])

    const updateItemCategory = useCallback((itemId: string, categoryName: string) => {
        if (ws.current?.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify({ action: 'update_category', item_id: itemId, name: categoryName }))
        }
        setItems(prev => prev.map(item => item.id === itemId ? { ...item, category: { id: "temp-id", name: categoryName } } : item))
    }, [])

    const updateItemNameWS = useCallback((itemId: string, newName: string) => {
        if (ws.current?.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify({ action: 'edit_item_name', item_id: itemId, name: newName }))
        }
        setItems(prev => prev.map(item => item.id === itemId ? { ...item, name: newName } : item))
    }, [])

    const updateItemPriceWS = useCallback((itemId: string, newPrice: number) => {
        if (ws.current?.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify({ action: 'edit_item_price', item_id: itemId, price: newPrice }))
        }
        setItems(prev => prev.map(item => item.id === itemId ? { ...item, price: newPrice } : item))
    }, [])


    // ==========================================
    // ACTIONS: ROOM
    // ==========================================
    const lockRoom = async () => {
        if (!roomCode) return false
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1'
            const res = await fetch(`${API_URL}/rooms/${roomCode}/lock`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
            })

            if (res.ok) {
                if (ws.current?.readyState === WebSocket.OPEN) {
                    ws.current.send(JSON.stringify({ action: 'refresh' }))
                }
                return true
            } else {
                const data = await res.json()
                alert(`Gagal ngunci room: ${data.error}`)
                return false
            }
        } catch (error) {
            console.error(error)
            return false
        }
    }

    return {
        items, members, roomCode,
        addMember, togglePaidWS, editMemberWS, deleteMemberWS,
        toggleClaim, deleteItemWS, addItemWS, updateItemCategory, updateItemNameWS, updateItemPriceWS,
        lockRoom
    }
}