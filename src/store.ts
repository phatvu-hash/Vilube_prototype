import { create } from 'zustand'
import type {
  Asn,
  DirectReceipt,
  InventoryRow,
  PickOrder,
  PutawayTask,
  Role,
} from '@/types'
import {
  asns as seedAsns,
  demoUsers,
  inventory as seedInventory,
  mkLotInternal,
  pickOrders as seedPickOrders,
  putaways as seedPutaways,
  storageLocations,
} from '@/data/mock'

export interface SessionUser {
  id: string
  name: string
  code: string
  role: Role
  warehouseId: string
}

export type WorkFeature = 'nhan' | 'cat' | 'soan'

/** Dữ liệu 1 lần nhận hàng (dùng chung cho Thẻ nhãn / Thẻ khác nhãn) */
export interface ReceivePayload {
  cartonCode?: string
  palletId: string
  itemId: string
  qty: number // đơn vị cơ sở
  unit: string
  lot: string
  mfgDate: string
  expDate: string
  lotInternal: string
}

interface AppState {
  user: SessionUser
  asns: Asn[]
  putaways: PutawayTask[]
  pickOrders: PickOrder[]
  inventory: InventoryRow[]
  receipts: DirectReceipt[]
  workFeature: WorkFeature

  setWorkFeature: (f: WorkFeature) => void
  claim: (kind: 'asn' | 'putaway' | 'pick', id: string) => void

  /** Nhận hàng: ghi nhận 1 thùng carton / 1 pallet vào đơn nhập */
  receive: (asnId: string, lineId: string, data: ReceivePayload) => void
  /** Nhập hàng chủ động (Khác → Nhập hàng) */
  receiveDirect: (data: Omit<DirectReceipt, 'id'>) => void
  /** Cất hàng: xác nhận đưa pallet vào vị trí → cộng tồn */
  putaway: (taskId: string, palletId: string, locationId: string) => void
  /** Soạn hàng: xác nhận số lượng đã soạn cho 1 dòng → trừ tồn */
  pick: (orderId: string, lineId: string, qty: number) => void

  resetDemo: () => void
}

const clone = <T,>(x: T): T => JSON.parse(JSON.stringify(x))

const u = demoUsers[0]
const sessionUser: SessionUser = {
  id: u.id,
  name: u.name,
  code: u.code,
  role: u.role,
  warehouseId: u.warehouseId,
}

let seq = 100
const nextId = (p: string) => `${p}-${++seq}`

/** Vị trí đề xuất kế tiếp — xoay vòng qua các vị trí lưu trữ (nút mũi tên kép) */
export function nextSuggestion(currentLocationId: string): string {
  const idx = storageLocations.findIndex((l) => l.id === currentLocationId)
  return storageLocations[(idx + 1) % storageLocations.length].id
}

export const useApp = create<AppState>((set) => ({
  user: sessionUser,
  asns: clone(seedAsns),
  putaways: clone(seedPutaways),
  pickOrders: clone(seedPickOrders),
  inventory: clone(seedInventory),
  receipts: [],
  workFeature: 'nhan',

  setWorkFeature: (workFeature) => set({ workFeature }),

  claim: (kind, id) =>
    set((s) => {
      const uid = s.user.id
      if (kind === 'asn') return { asns: s.asns.map((a) => (a.id === id ? { ...a, assignedTo: uid } : a)) }
      if (kind === 'putaway')
        return {
          putaways: s.putaways.map((t) =>
            t.id === id ? { ...t, assignedTo: uid, status: t.status === 'NEW' ? 'IN_PROGRESS' : t.status } : t,
          ),
        }
      return { pickOrders: s.pickOrders.map((o) => (o.id === id ? { ...o, assignedTo: uid } : o)) }
    }),

  receive: (asnId, lineId, data) =>
    set((s) => {
      const asn = s.asns.find((a) => a.id === asnId)
      if (!asn) return {}

      const asns = s.asns.map((a) => {
        if (a.id !== asnId) return a
        const lines = a.lines.map((l) => {
          if (l.id !== lineId) return l
          const applied = Math.min(l.qtyExpected - l.qtyReceived, data.qty)
          return {
            ...l,
            qtyReceived: l.qtyReceived + applied,
            lot: data.lot || l.lot,
            lotInternal: data.lotInternal || l.lotInternal,
            mfgDate: data.mfgDate || l.mfgDate,
            expDate: data.expDate || l.expDate,
            cartons: l.cartons.map((c) => (c.code === data.cartonCode ? { ...c, received: true } : c)),
          }
        })
        const all = lines.every((l) => l.qtyReceived >= l.qtyExpected)
        const any = lines.some((l) => l.qtyReceived > 0)
        return { ...a, lines, status: all ? ('RECEIVED' as const) : any ? ('PARTIAL' as const) : a.status }
      })

      // Tạo / bổ sung công việc cất hàng cho đơn nhập này
      const putaways = [...s.putaways]
      let task = putaways.find((t) => t.asnCode === asn.code)
      if (!task) {
        task = {
          id: nextId('pa'),
          wmsCode: `WMS${asn.code.slice(-8)}`,
          asnCode: asn.code,
          receivedDate: new Date().toISOString().slice(0, 10),
          type: asn.type,
          status: 'NEW',
          pallets: [],
        }
        putaways.push(task)
      }
      const existing = task.pallets.find((p) => p.palletId === data.palletId && !p.toLocationId)
      if (existing) {
        existing.qty += data.qty
      } else {
        task.pallets.push({
          id: nextId('pl'),
          palletId: data.palletId,
          itemId: data.itemId,
          qty: data.qty,
          unit: data.unit,
          lot: data.lot,
          lotInternal: data.lotInternal,
          mfgDate: data.mfgDate,
          expDate: data.expDate,
          suggestedLocationId: storageLocations[task.pallets.length % storageLocations.length].id,
        })
      }

      return { asns, putaways }
    }),

  receiveDirect: (data) =>
    set((s) => {
      const receipt: DirectReceipt = { ...data, id: nextId('rc') }
      const putaways = [...s.putaways]
      const code = 'CHUDONG'
      let task = putaways.find((t) => t.asnCode === code && t.status !== 'DONE')
      if (!task) {
        task = {
          id: nextId('pa'),
          wmsCode: `WMS${String(Date.now()).slice(-8)}`,
          asnCode: code,
          receivedDate: data.postingDate,
          type: data.orderType,
          status: 'NEW',
          pallets: [],
        }
        putaways.push(task)
      }
      task.pallets.push({
        id: nextId('pl'),
        palletId: data.palletId,
        itemId: data.itemId,
        qty: data.qty,
        unit: data.unit,
        lot: data.lot,
        lotInternal: data.lotInternal,
        mfgDate: data.mfgDate,
        expDate: data.expDate,
        suggestedLocationId: storageLocations[task.pallets.length % storageLocations.length].id,
      })
      return { receipts: [receipt, ...s.receipts], putaways }
    }),

  putaway: (taskId, palletId, locationId) =>
    set((s) => {
      const task = s.putaways.find((t) => t.id === taskId)
      const pallet = task?.pallets.find((p) => p.id === palletId)
      if (!task || !pallet) return {}

      const putaways = s.putaways.map((t) => {
        if (t.id !== taskId) return t
        const pallets = t.pallets.map((p) => (p.id === palletId ? { ...p, toLocationId: locationId } : p))
        const done = pallets.every((p) => p.toLocationId)
        return { ...t, pallets, status: done ? ('DONE' as const) : ('IN_PROGRESS' as const) }
      })

      const inventory = [...s.inventory]
      const idx = inventory.findIndex(
        (r) => r.itemId === pallet.itemId && r.locationId === locationId && r.lot === pallet.lot,
      )
      if (idx >= 0) {
        inventory[idx] = { ...inventory[idx], qty: inventory[idx].qty + pallet.qty }
      } else {
        inventory.push({
          id: nextId('inv'),
          itemId: pallet.itemId,
          locationId,
          palletId: pallet.palletId,
          lot: pallet.lot,
          lotInternal: pallet.lotInternal || mkLotInternal(pallet.mfgDate, new Date().toISOString().slice(0, 10)),
          mfgDate: pallet.mfgDate,
          expDate: pallet.expDate,
          qty: pallet.qty,
        })
      }
      return { putaways, inventory }
    }),

  pick: (orderId, lineId, qty) =>
    set((s) => {
      const order = s.pickOrders.find((o) => o.id === orderId)
      const line = order?.lines.find((l) => l.id === lineId)
      if (!order || !line) return {}

      const pickOrders = s.pickOrders.map((o) => {
        if (o.id !== orderId) return o
        const lines = o.lines.map((l) =>
          l.id === lineId ? { ...l, qtyPicked: Math.min(l.qtyRequired, l.qtyPicked + qty) } : l,
        )
        const all = lines.every((l) => l.qtyPicked >= l.qtyRequired)
        const any = lines.some((l) => l.qtyPicked > 0)
        return { ...o, lines, status: all ? ('PICKED' as const) : any ? ('PICKING' as const) : o.status }
      })

      const inventory = s.inventory
        .map((r) =>
          r.itemId === line.itemId && r.locationId === line.locationId
            ? { ...r, qty: Math.max(0, r.qty - qty) }
            : r,
        )
        .filter((r) => r.qty > 0)

      return { pickOrders, inventory }
    }),

  resetDemo: () =>
    set({
      asns: clone(seedAsns),
      putaways: clone(seedPutaways),
      pickOrders: clone(seedPickOrders),
      inventory: clone(seedInventory),
      receipts: [],
    }),
}))
