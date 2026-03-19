import type { Member } from '../types'

interface Props {
  members: Member[]
}

export default function AvatarGroup({ members }: Props) {
  return (
    <div className="flex">
      {members.map((m) => (
        <div
          key={m.id}
          className="w-5 h-5 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-bold text-white -ml-1.5 first:ml-0"
          style={{ backgroundColor: m.color }}
          title={m.name}
        >
          {m.initials}
        </div>
      ))}
    </div>
  )
}