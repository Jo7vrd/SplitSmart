import { useState, useEffect } from 'react'
import { Utensils, ShoppingCart, Droplets, Receipt, Pill, Film, BookOpen, Car, Box, CheckCircle, AlertCircle, Copy, Check, Edit2, Trash2, Store } from 'lucide-react'
import type { Bill, BillItem } from '../types'
import { AVATAR_UNSELECTED } from '../utils/member'
import { useLiveSplit } from '../hooks/useLiveSplit'
import { authService } from '../services/authService'

const getCategoryIcon = (category: string) => {
    const iconMap: Record<string, React.ReactNode> = {
        "Makan": <Utensils className="w-4 h-4" />,
        "Belanja": <ShoppingCart className="w-4 h-4" />,
        "Kebersihan": <Droplets className="w-4 h-4" />,
        "Tagihan": <Receipt className="w-4 h-4" />,
        "Kesehatan": <Pill className="w-4 h-4" />,
        "Hiburan": <Film className="w-4 h-4" />,
        "Pendidikan": <BookOpen className="w-4 h-4" />,
        "Transportasi": <Car className="w-4 h-4" />,
        "Lain-lain": <Box className="w-4 h-4" />
    }
    return iconMap[category] || <Box className="w-4 h-4" />
}

const getMerchantIcon = (iconType: string) => {
    switch (iconType) {
        case 'shop':
            return <Store className="w-6 h-6" />
        default:
            return <Store className="w-6 h-6" />
    }
}

interface Props {
    bill: Bill | null
    onClose: () => void
}

export default function BillDetailSheet({ bill, onClose }: Props) {
    const { items, members, roomCode,
        addMember, togglePaidWS, editMemberWS, deleteMemberWS,
        toggleClaim, deleteItemWS, addItemWS, updateItemCategory, updateItemNameWS, updateItemPriceWS,
        lockRoom } = useLiveSplit(bill)


    const currentUser = authService.getUser()
    const hostMember = members.find(m => m.isHost)
    const isMeHost = currentUser && hostMember && hostMember.userId === currentUser.id

    const [editingId, setEditingId] = useState<string | null>(null)
    const [editingName, setEditingName] = useState('')
    const [editingPrice, setEditingPrice] = useState<number | string>('')

    const [copied, setCopied] = useState(false)
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

    const startEdit = (item: BillItem) => {
        setEditingId(item.id)
        setEditingName(item.name)
        setEditingPrice(item.price)
    }

    const saveEdit = () => {
        if (editingId) {
            const originalItem = items.find(i => i.id === editingId)

            if (originalItem?.name !== editingName) {
                updateItemNameWS(editingId, editingName)
            }
            const numPrice = Number(editingPrice)
            if (!isNaN(numPrice) && originalItem?.price !== numPrice) {
                updateItemPriceWS(editingId, numPrice)
            }
        }
        setEditingId(null)
    }

    const handleShare = () => {
        navigator.clipboard.writeText(`${roomCode}`)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const memberTotals = members.map((m) => {
        const total = items.reduce((acc, item) => {
            if (item.assignedTo.includes(m.id)) {
                return acc + Math.round(item.price / item.assignedTo.length)
            }
            return acc
        }, 0)
        return { member: m, total }
    })

    const handleCompleteAndShare = async () => {
        const success = await lockRoom()
        if (!success) return

        let text = `*Rekap Tagihan: ${bill.name}*\n`
        text += `${bill.date}\n\n`

        memberTotals.forEach(({ member, total }) => {
            const status = member.hasPaid ? 'Lunas' : 'Belum bayar'
            text += `${member.name}: Rp ${total.toLocaleString('id-ID')} (${status})\n`
        })

        const grandTotal = items.reduce((acc, item) => acc + item.price, 0)
        text += `\n*Total Semua: Rp ${grandTotal.toLocaleString('id-ID')}*\n`
        text += `Cek detail: https://smartbill.shahwul.men\n`

        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Tagihan ${bill.name}`,
                    text: text,
                })
            } catch (err) {
                console.log('Share dibatalkan', err)
            }
        } else {
            navigator.clipboard.writeText(text)
            alert('Room Dikunci & Rekap berhasil disalin ke clipboard! Tinggal Paste di WA.')
        }
        onClose()
    }

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/40 z-40 animate-fade-in" onClick={onClose} />

            {/* Sheet */}
            <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl animate-slide-up max-h-[90dvh] flex flex-col">
                <div className="flex justify-center pt-3 pb-1 shrink-0">
                    <div className="w-10 h-1 rounded-full bg-black/10" />
                </div>

                <div className="overflow-y-auto flex-1 px-5 pb-8">
                    {/* Header */}
                    <div className="flex items-center gap-3 py-4 border-b border-black/5">
                        <div className="w-12 h-12 rounded-2xl bg-[#1a5336] flex items-center justify-center text-amber-50 shrink-0">
                            {getMerchantIcon(bill.icon)}
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
                            {copied ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5 text-primary" />}
                        </button>
                    </div>

                    {/* Member tabs */}
                    <div className="flex gap-2 py-4 overflow-x-auto no-scrollbar border-b border-black/5 items-center">
                        {memberTotals.map(({ member, total }) => {
                            const paid = member.hasPaid

                            return (
                                <div
                                    key={member.id}
                                    className="relative flex items-center pr-3 pl-1 py-1 rounded-full border-2 shrink-0 transition-all"
                                    style={{
                                        borderColor: paid ? member.color : member.color,
                                        background: paid ? member.color : 'transparent',
                                    }}
                                >
                                    <button
                                        onClick={() => togglePaidWS(member.id)}
                                        className="flex items-center gap-2 text-left active:scale-95 transition-transform"
                                    >
                                        {/* Avatar-nya */}
                                        <div
                                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 shadow-sm"
                                            style={{ background: paid ? 'rgba(255,255,255,0.3)' : member.color, color: 'white' }}
                                        >
                                            {paid ? <Check className="w-4 h-4" /> : member.initials}
                                        </div>

                                        {/* Info Nama */}
                                        <div className="min-w-15">
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
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="w-full bg-transparent text-xs font-semibold outline-none border-b border-black/20"
                                                    style={{ color: paid ? 'white' : '#0E1311' }}
                                                />
                                            ) : (
                                                <p className="text-xs font-semibold leading-none truncate max-w-20" style={{ color: paid ? 'white' : '#0E1311' }}>
                                                    {member.name}
                                                </p>
                                            )}
                                            <p className="font-mono text-xs font-medium mt-0.5" style={{ color: paid ? 'rgba(255,255,255,0.8)' : member.color }}>
                                                {paid ? 'Lunas' : `Rp ${Math.round(total / 1000)}k`}
                                            </p>
                                        </div>
                                    </button>

                                    {/* Action Buttons */}
                                    {isMeHost && !member.isHost && (
                                        <div className="flex flex-col gap-1 border-l border-black/10 pl-2 ml-1">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setEditingMemberId(member.id); setEditingMemberName(member.name) }}
                                                className="opacity-40 hover:opacity-100 transition-opacity"
                                                style={{ color: paid ? 'white' : 'black' }}
                                            ><Edit2 className="w-3.5 h-3.5" /></button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); deleteMemberWS(member.id) }}
                                                className="opacity-40 hover:text-red-500 transition-colors"
                                                style={{ color: paid ? 'white' : 'black' }}
                                            ><Trash2 className="w-3.5 h-3.5" /></button>
                                        </div>
                                    )}
                                </div>
                            )
                        })}

                        {/* Tombol Tambah Teman */}
                        {isAddingMember ? (
                            <div className="flex items-center gap-2 px-3 py-2 rounded-full border-2 border-dashed border-gray-300 shrink-0 bg-gray-50 h-13">
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
                                <button onClick={() => setIsAddingMember(false)} className="text-gray-400 hover:text-red-500 text-xs font-bold px-1"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setIsAddingMember(true)}
                                className="flex items-center justify-center px-4 rounded-full border-2 border-dashed border-gray-300 text-gray-500 text-xs font-bold shrink-0 hover:bg-gray-50 transition-colors h-13"
                            >
                                + Teman
                            </button>
                        )}
                    </div>

                    {/* Item list */}
                    <div className="mt-2.5">
                        {items.map((item) => (
                            <div key={item.id} className="py-2 border-b border-black/5 last:border-0">

                                {/* Baris atas: emoji + nama + harga + aksi */}
                                <div className="flex items-center gap-3 mb-1.5">

                                    {/* Icon kategori */}
                                    <div className="relative shrink-0">
                                        <div className="w-8 h-8 rounded-xl bg-black/5 flex items-center justify-center text-dark/60">
                                            {getCategoryIcon(item.category?.name || 'Lain-lain')}
                                        </div>
                                        {isMeHost && (
                                            <select
                                                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                                                value={item.category?.name || 'Lain-lain'}
                                                onChange={(e) => updateItemCategory(item.id, e.target.value)}
                                            >
                                                <option value="Makan">Makan</option>
                                                <option value="Belanja">Belanja</option>
                                                <option value="Kebersihan">Kebersihan</option>
                                                <option value="Tagihan">Tagihan</option>
                                                <option value="Kesehatan">Kesehatan</option>
                                                <option value="Hiburan">Hiburan</option>
                                                <option value="Pendidikan">Pendidikan</option>
                                                <option value="Transportasi">Transportasi</option>
                                                <option value="Lain-lain">Lain-lain</option>
                                            </select>
                                        )}
                                    </div>

                                    {/* Nama — mode edit vs view */}
                                    {editingId === item.id ? (
                                        <div className="flex-1 flex gap-2 min-w-0">
                                            <input
                                                autoFocus
                                                value={editingName}
                                                onChange={(e) => setEditingName(e.target.value)}
                                                className="flex-1 min-w-0 text-sm font-medium text-dark bg-white border border-primary/30 rounded-xl px-3 py-1.5 outline-none"
                                                placeholder="Nama item"
                                            />
                                            <input
                                                type="number"
                                                value={editingPrice}
                                                onChange={(e) => setEditingPrice(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                                                className="w-28 font-mono text-sm text-dark bg-white border border-primary/30 rounded-xl px-3 py-1.5 outline-none"
                                                placeholder="Harga"
                                            />
                                            <button
                                                onClick={saveEdit}
                                                className="bg-primary text-white text-xs font-bold px-3 rounded-xl active:scale-95 transition-transform flex items-center gap-1"
                                            >
                                                <Check className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <span
                                                className="flex-1 text-sm font-medium text-dark truncate"
                                                onDoubleClick={() => startEdit(item)}
                                            >
                                                {item.name}
                                            </span>
                                            <div className="flex items-center gap-3 shrink-0">
                                                <span className="font-mono text-sm font-medium text-dark/50">
                                                    {item.price.toLocaleString('id-ID')}
                                                </span>
                                                {isMeHost && (
                                                    <div className="flex gap-1">
                                                        <button
                                                            onClick={() => startEdit(item)}
                                                            className="w-6 h-6 rounded-lg bg-black/5 flex items-center justify-center text-dark/40 hover:text-primary hover:bg-primary/10 transition-all"
                                                        >
                                                            <Edit2 className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            onClick={() => deleteItemWS(item.id)}
                                                            className="w-6 h-6 rounded-lg bg-black/5 flex items-center justify-center text-dark/40 hover:text-red-500 hover:bg-red-50 transition-all"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* Baris bawah: avatar klaim */}
                                <div className="flex gap-1.5 pl-11">
                                    {members.map((m) => {
                                        const selected = item.assignedTo.includes(m.id)
                                        return (
                                            <button
                                                key={m.id}
                                                onClick={() => toggleClaim(item.id, m.id)}
                                                title={m.name}
                                                className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold transition-all active:scale-90"
                                                style={{
                                                    background: selected ? m.color : AVATAR_UNSELECTED,
                                                    color: selected ? 'white' : '#bbb',
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

                    <div className="mb-4">
                        {isMeHost && (
                            <button
                                onClick={() => {
                                    const newId = addItemWS()
                                    setEditingId(newId)
                                    setEditingName('')
                                    setEditingPrice('')
                                }}
                                className="w-full mt-3 py-3 border-2 border-dashed border-[#1a5336]/30 text-[#1a5336] rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#1a5336]/5 transition-colors active:scale-[0.98]"
                            >
                                <span className="text-lg leading-none">+</span> Tambah Menu Manual
                            </button>
                        )}
                    </div>

                    {/* Summary */}
                    <div className="mt-2 pt-4 border-t border-black/10">
                        {memberTotals.map(({ member, total }) => (
                            <div key={member.id} className="flex items-center justify-between py-1.5">
                                <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: member.color }} />
                                    <span className="text-sm font-sans text-dark">{member.name}</span>
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
                    <button onClick={handleCompleteAndShare} className="w-full mt-5 bg-[#1a5336] text-white font-sans font-semibold py-4 rounded-2xl active:scale-[0.98] transition-transform flex items-center justify-center gap-2">
                        <Check className="w-5 h-5" /> Selesai & Bagikan
                    </button>

                </div>
            </div>
        </>
    )
}