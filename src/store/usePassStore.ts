import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { BoardingPass } from '../types/BoardingPass'

interface PassStore {
  passes: BoardingPass[]
  addPass: (pass: BoardingPass) => void
  removePass: (id: string) => void
}

export const usePassStore = create<PassStore>()(
  persist(
    (set) => ({
      passes: [],
      addPass: (pass) => set((state) => ({ passes: [...state.passes, pass] })),
      removePass: (id) => set((state) => ({ passes: state.passes.filter((p) => p.id !== id) })),
    }),
    {
      name: 'boarding-passes-storage',
    },
  ),
)
