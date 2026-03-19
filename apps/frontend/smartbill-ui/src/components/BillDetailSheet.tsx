import { useEffect, useState } from 'react'
import type { Bill, BillItem } from '../types'
import { AVATAR_UNSELECTED } from '../utils/member'
import { useLiveSplit } from '../hooks/useLiveSplit'

interface Props {
    bill: Bill | null
    onClose: () => void
}

export default function BillDetailSheet({ bill, onClose }: Props) {
    const { items, members, addMember, toggleClaim, deleteItem, updateItemName, roomCode, togglePaidWS, editMemberWS, deleteMemberWS } = useLiveSplit(bill)

    // State UI
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editingName, setEditingName] = useState('')
    const [copied, setCopied] = useState(false)

    // State buat nambahin/edit member
    const [isAddingMember, setIsAddingMember] = useState(false)
    const [newMemberName, setNewMemberName] = useState('')
    const [editingMemberId, setEditingMemberId] = useState<string | null>(null)
    const [editingMemberName, setEditingMemberName] = useState('')

    useEffect(() => {
        if (bill) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => { document.body.style.overflow = '' }
    }, [bill])

    if (!bill) return null

    // Handle Edit Item UI
    const startEdit = (item: BillItem) => {
        setEditingId(item.id)
        setEditingName(item.name)
    }

    const saveEdit = () => {
        if (editingId) updateItemName(editingId, editingName)
        setEditingId(null)
    }

    // Share UI
    const handleShare = () => {
        navigator.clipboard.writeText(`${roomCode}`)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    // Kalkulasi matematika UI
    const memberTotals = members.map((m) => {
        const total = items.reduce((acc, item) => {
            if (item.assignedTo.includes(m.id)) {
                return acc + Math.round(item.price / item.assignedTo.length)
            }
            return acc
        }, 0)
        return { member: m, total }
    })

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/40 z-40 animate-fade-in" onClick={onClose} />

            {/* Sheet */}
            <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl animate-slide-up max-h-[90dvh] flex flex-col">
                <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
                    <div className="w-10 h-1 rounded-full bg-black/10" />
                </div>

                <div className="overflow-y-auto flex-1 px-5 pb-8">
                    {/* Header */}
                    <div className="flex items-center gap-3 py-4 border-b border-black/5">
                        <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-2xl flex-shrink-0">
                            {bill.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h2 className="font-sans font-bold text-dark text-base">{bill.name}</h2>
                            <p className="text-xs text-dark/40 mt-0.5">
                                {bill.date} · {items.length} item
                            </p>
                        </div>
                        <button
                            onClick={handleShare}
                            className="flex items-center gap-1.5 bg-primary/10 px-3 py-1.5 rounded-full active:scale-95 transition-transform"
                        >
                            <span className="font-mono text-xs font-medium text-primary">{roomCode}</span>
                            <span className="text-xs text-primary">{copied ? '✓' : '⎘'}</span>
                        </button>
                    </div>

                    {/* Member tabs */}
                    <div className="flex gap-2 py-4 overflow-x-auto no-scrollbar border-b border-black/5 items-center">
                        {memberTotals.map(({ member, total }) => {
                            const paid = member.hasPaid

                            return (
                                <div
                                    key={member.id}
                                    className="relative flex items-center pr-3 pl-1 py-1 rounded-full border-2 flex-shrink-0 transition-all"
                                    style={{
                                        borderColor: paid ? member.color : member.color,
                                        background: paid ? member.color : 'transparent',
                                    }}
                                >
                                    {/* 🌟 FIX: BUNGKUS AVATAR DAN NAMA DALAM 1 BUTTON BESAR */}
                                    <button
                                        onClick={() => togglePaidWS(member.id)}
                                        className="flex items-center gap-2 text-left active:scale-95 transition-transform"
                                    >
                                        {/* Avatar-nya */}
                                        <div
                                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 shadow-sm"
                                            style={{ background: paid ? 'rgba(255,255,255,0.3)' : member.color, color: 'white' }}
                                        >
                                            {paid ? '✓' : member.initials}
                                        </div>

                                        {/* Info Nama */}
                                        <div className="min-w-[60px]">
                                            {editingMemberId === member.id ? (
                                                <input
                                                    autoFocus
                                                    value={editingMemberName}
                                                    onChange={(e) => setEditingMemberName(e.target.value)}
                                                    onBlur={() => setEditingMemberId(null)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' && editingMemberName.trim() !== '') {
                                                            editMemberWS(member.id, editingMemberName.trim())
                                                            setEditingMemberId(null)
                                                        }
                                                    }}
                                                    onClick={(e) => e.stopPropagation()} // Biar pas ngetik ga ke-toggle lunas
                                                    className="w-full bg-transparent text-xs font-semibold outline-none border-b border-black/20"
                                                    style={{ color: paid ? 'white' : '#0E1311' }}
                                                />
                                            ) : (
                                                <p className="text-xs font-semibold leading-none truncate max-w-[80px]" style={{ color: paid ? 'white' : '#0E1311' }}>
                                                    {member.name}
                                                </p>
                                            )}
                                            <p className="font-mono text-xs font-medium mt-0.5" style={{ color: paid ? 'rgba(255,255,255,0.8)' : member.color }}>
                                                {paid ? 'Lunas' : `Rp ${Math.round(total / 1000)}k`}
                                            </p>
                                        </div>
                                    </button>

                                    {/* Action Buttons tetap diluar button utama */}
                                    {!member.isHost && (
                                        <div className="flex flex-col gap-1 border-l border-black/10 pl-2 ml-1">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setEditingMemberId(member.id); setEditingMemberName(member.name) }}
                                                className="text-[10px] opacity-40 hover:opacity-100 transition-opacity"
                                                style={{ color: paid ? 'white' : 'black' }}
                                            >✎</button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); deleteMemberWS(member.id) }}
                                                className="text-[10px] opacity-40 hover:text-red-500 transition-colors"
                                                style={{ color: paid ? 'white' : 'black' }}
                                            >✕</button>
                                        </div>
                                    )}
                                </div>
                            )
                        })}

                        {/* Tombol Tambah Teman */}
                        {isAddingMember ? (
                            <div className="flex items-center gap-2 px-3 py-2 rounded-full border-2 border-dashed border-gray-300 flex-shrink-0 bg-gray-50 h-[52px]">
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="Nama..."
                                    value={newMemberName}
                                    onChange={(e) => setNewMemberName(e.target.value)}
                                    onKeyDown={async (e) => {
                                        if (e.key === 'Enter' && newMemberName.trim() !== '') {
                                            await addMember(newMemberName.trim())
                                            setNewMemberName('')
                                            setIsAddingMember(false)
                                        }
                                    }}
                                    className="w-20 text-xs font-semibold outline-none bg-transparent text-gray-700 placeholder-gray-400"
                                />
                                <button onClick={() => setIsAddingMember(false)} className="text-gray-400 hover:text-red-500 text-xs font-bold px-1">✕</button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setIsAddingMember(true)}
                                className="flex items-center justify-center px-4 rounded-full border-2 border-dashed border-gray-300 text-gray-500 text-xs font-bold flex-shrink-0 hover:bg-gray-50 transition-colors h-[52px]"
                            >
                                + Teman
                            </button>
                        )}
                    </div>

                    {/* Item list */}
                    <div className="mt-2">
                        {items.map((item) => (
                            <div key={item.id} className="py-3 border-b border-black/5 last:border-0">
                                <div className="flex justify-between items-start mb-2 gap-2">
                                    {editingId === item.id ? (
                                        <input
                                            autoFocus
                                            value={editingName}
                                            onChange={(e) => setEditingName(e.target.value)}
                                            onBlur={saveEdit}
                                            onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                                            className="flex-1 text-sm font-sans font-medium text-dark bg-white border border-primary/30 rounded-lg px-2 py-1 outline-none"
                                        />
                                    ) : (
                                        <span className="flex-1 text-sm font-sans font-medium text-dark" onDoubleClick={() => startEdit(item)}>
                                            {item.name}
                                        </span>
                                    )}
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <span className="font-mono font-medium text-sm text-dark/60">{item.price.toLocaleString('id-ID')}</span>
                                        <button onClick={() => startEdit(item)} className="text-dark/30 hover:text-primary transition-colors text-xs px-1">✎</button>
                                        <button onClick={() => deleteItem(item.id)} className="text-dark/30 hover:text-red-500 transition-colors text-xs px-1">✕</button>
                                    </div>
                                </div>

                                {/* Avatar toggle klaim */}
                                <div className="flex gap-2">
                                    {members.map((m) => {
                                        const selected = item.assignedTo.includes(m.id)
                                        return (
                                            <button
                                                key={m.id}
                                                onClick={() => toggleClaim(item.id, m.id)}
                                                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all active:scale-90"
                                                style={{
                                                    background: selected ? m.color : AVATAR_UNSELECTED,
                                                    color: selected ? 'white' : '#aaa',
                                                    borderColor: selected ? m.color : 'transparent',
                                                }}
                                            >
                                                {m.initials}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Summary */}
                    <div className="mt-4 pt-4 border-t border-black/10">
                        {memberTotals.map(({ member, total }) => (
                            <div key={member.id} className="flex items-center justify-between py-1.5">
                                <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: member.color }} />
                                    <span className="text-sm font-sans text-dark">{member.name}</span>
                                    {/* 🌟 DIAMBIL DARI MEMBER JUGA */}
                                    {member.hasPaid && (
                                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full text-white" style={{ background: member.color }}>
                                            Lunas
                                        </span>
                                    )}
                                </div>
                                <span className="font-mono font-medium text-sm text-dark">
                                    {total.toLocaleString('id-ID')}
                                </span>
                            </div>
                        ))}
                        <div className="flex justify-between items-center mt-3 pt-3 border-t border-black/10">
                            <span className="font-sans font-bold text-dark">Total</span>
                            <span className="font-mono font-bold text-dark">
                                {items.reduce((acc, item) => acc + item.price, 0).toLocaleString('id-ID')}
                            </span>
                        </div>
                    </div>

                    {/* CTA */}
                    <button className="w-full mt-5 bg-[#1a5336] text-white font-sans font-semibold py-4 rounded-2xl active:scale-[0.98] transition-transform">
                        ✓ Selesai & Bagikan
                    </button>

                </div>
            </div>
        </>
    )
}