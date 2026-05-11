import { Store } from 'lucide-react'
import AvatarGroup from './AvatarGroup'
import type { Bill } from '../types'

interface Props {
  bill: Bill
  onClick: () => void
}

const getMerchantIcon = (iconType: string) => {
  switch (iconType) {
    case 'shop':
      return <Store className="w-6 h-6" />
    default:
      return <Store className="w-6 h-6" />
  }
}

export default function BillCard({ bill, onClick }: Props) {
  return (
    <div onClick={onClick} className="bg-white rounded-2xl p-4 flex items-center gap-3 border border-black/8 shadow-sm shadow-black/5 active:scale-[0.98] transition-transform cursor-pointer hover:shadow-md hover:shadow-black/8">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-[#1a5336] text-amber-50">
        {getMerchantIcon(bill.icon)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-gray-900">{bill.name}</p>
        <p className="text-xs f text-gray-400 mt-0.5">{bill.date}</p>
      </div>
      <div className="text-right">
        <p className="font-mono text-sm font-semibold text-gray-900">
          Rp {bill.amount.toLocaleString('id-ID')}
        </p>
        <div className="flex justify-end mt-1">
          <AvatarGroup members={bill.members} />
        </div>
      </div>
    </div>
  )
}