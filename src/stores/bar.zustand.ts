import { create } from "zustand";

// 디바이스의 상단 및 하단 바 높이를 저장하는 상태
export const useBar = create<{
    top: number;
    bottom: number;
    set: (top: number, bottom: number) => void;
}>((set) => ({
    top: 0,
    bottom: 0,
    set: (top, bottom) => set((state) => ({ ...state, top, bottom })),
}));
