"use client";

import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import type { CategoryDTO } from "@/types";

interface CategoryModalState {
  open: boolean;
  editingCategory: CategoryDTO | null;
}

interface CategoryModalContextValue extends CategoryModalState {
  openAddModal: () => void;
  openEditModal: (category: CategoryDTO) => void;
  closeModal: () => void;
  registerOnSaved: (cb: () => void) => () => void;
  notifySaved: () => void;
}

const CategoryModalContext = createContext<CategoryModalContextValue | undefined>(undefined);

export function CategoryModalProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CategoryModalState>({ open: false, editingCategory: null });
  const [callbacks] = useState<Set<() => void>>(new Set());

  const openAddModal = useCallback(() => setState({ open: true, editingCategory: null }), []);
  const openEditModal = useCallback(
    (category: CategoryDTO) => setState({ open: true, editingCategory: category }),
    []
  );
  const closeModal = useCallback(() => setState({ open: false, editingCategory: null }), []);

  const registerOnSaved = useCallback(
    (cb: () => void) => {
      callbacks.add(cb);
      return () => callbacks.delete(cb);
    },
    [callbacks]
  );
  const notifySaved = useCallback(() => callbacks.forEach((cb) => cb()), [callbacks]);

  return (
    <CategoryModalContext.Provider
      value={{ ...state, openAddModal, openEditModal, closeModal, registerOnSaved, notifySaved }}
    >
      {children}
    </CategoryModalContext.Provider>
  );
}

export function useCategoryModal() {
  const ctx = useContext(CategoryModalContext);
  if (!ctx) throw new Error("useCategoryModal must be used within CategoryModalProvider");
  return ctx;
}
