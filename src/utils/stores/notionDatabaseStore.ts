import { create } from "zustand";

export type NotionDatabaseState = {
  shownDatabaseId: string | null;
  setShownDatabaseId: (id: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

export const useNotionDatabaseStore = create<NotionDatabaseState>((set) => ({
  shownDatabaseId: null,
  setShownDatabaseId: (id: string) => set({ shownDatabaseId: id }),
  isOpen: false,
  setIsOpen: (isOpen: boolean) => set({ isOpen }),
}));
