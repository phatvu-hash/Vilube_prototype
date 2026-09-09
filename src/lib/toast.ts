import { create } from 'zustand'

interface NotificationState {
  current: string | null
  queue: string[]
  push: (message: string) => void
  dismiss: () => void
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  current: null,
  queue: [],
  push: (message) => {
    const { current, queue } = get()
    if (current === null) set({ current: message })
    else set({ queue: [...queue, message] })
  },
  dismiss: () => {
    const { queue } = get()
    const [next, ...rest] = queue
    set({ current: next ?? null, queue: rest })
  },
}))

/** Thông báo popup giữa màn hình — phải bấm ĐỒNG Ý mới tắt */
export function toast(message: string) {
  useNotificationStore.getState().push(message)
}
