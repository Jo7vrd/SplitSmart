import AvatarGroup from './AvatarGroup'
import type { Bill } from '../types'

interface Props {
  bill: Bill
  onClick: () => void
}

export default function BillCard({ bill, onClick }: Props) {
  return (
    <div onClick={onClick} className="bg-white rounded-2xl p-4 flex items-center gap-3 border border-black/5 active:scale-[0.98] transition-transform cursor-pointer">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 bg-orange-50">
        {bill.icon}
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