// src/types/index.ts
export interface ReceiptItem {
  id: string;
  name: string;
  price: number;
  assignees: string[];
}

export interface ReceiptData {
  merchantName: string;
  date: string;
  items: ReceiptItem[];
  subTotal: number;
  tax: number;
  total: number;
}

export interface Member {
  id: string
  name: string
  initials: string
  color: string
  isHost: boolean
  hasPaid: boolean
}

export interface BillItem {
  id: string
  name: string
  qty: number
  price: number
  assignedTo: string[]
}

export interface Bill {
  id: string
  icon: string
  name: string
  date: string
  amount: number
  roomCode: string
  status: string
  members: Member[]
  items: BillItem[]
}