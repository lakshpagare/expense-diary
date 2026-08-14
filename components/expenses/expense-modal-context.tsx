"use client";

import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import type { ExpenseDTO } from "@/types";

interface ExpenseModalState {
  open: boolean;
  editingExpense: ExpenseDTO | null;
}

interface ExpenseModalContextValue extends ExpenseModalState {
  openAddModal: () => void;
  openEditModal: (expense: ExpenseDTO) => void;
  closeModal: () => void;
  onSavedCallbacks: Set<() => void>;
  registerOnSaved: (cb: () => void) => () => void;
  notifySaved: () => void;
}

const ExpenseModalContext = createContext<ExpenseModalContextValue | undefined>(
  undefined
);

export function ExpenseModalProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ExpenseModalState>({
    open: false,
    editingExpense: null,
  });
  const [callbacks] = useState<Set<() => void>>(new Set());

  const openAddModal = useCallback(() => {
    setState({ open: true, editingExpense: null });
  }, []);

  const openEditModal = useCallback((expense: ExpenseDTO) => {
    setState({ open: true, editingExpense: expense });
  }, []);

  const closeModal = useCallback(() => {
    setState({ open: false, editingExpense: null });
  }, []);

  const registerOnSaved = useCallback(
    (cb: () => void) => {
      callbacks.add(cb);
      return () => callbacks.delete(cb);
    },
    [callbacks]
  );

  const notifySaved = useCallback(() => {
    callbacks.forEach((cb) => cb());
  }, [callbacks]);

  return (
    <ExpenseModalContext.Provider
      value={{
        ...state,
        openAddModal,
        openEditModal,
        closeModal,
        onSavedCallbacks: callbacks,
        registerOnSaved,
        notifySaved,
      }}
    >
      {children}
    </ExpenseModalContext.Provider>
  );
}

export function useExpenseModal() {
  const ctx = useContext(ExpenseModalContext);
  if (!ctx) throw new Error("useExpenseModal must be used within ExpenseModalProvider");
  return ctx;
}
