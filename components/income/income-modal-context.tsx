"use client";

import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import type { IncomeDTO } from "@/types";

interface IncomeModalState {
  open: boolean;
  editingIncome: IncomeDTO | null;
}

interface IncomeModalContextValue extends IncomeModalState {
  openAddModal: () => void;
  openEditModal: (income: IncomeDTO) => void;
  closeModal: () => void;
  registerOnSaved: (cb: () => void) => () => void;
  notifySaved: () => void;
}

const IncomeModalContext = createContext<IncomeModalContextValue | undefined>(undefined);

export function IncomeModalProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<IncomeModalState>({
    open: false,
    editingIncome: null,
  });
  const [callbacks] = useState<Set<() => void>>(new Set());

  const openAddModal = useCallback(() => {
    setState({ open: true, editingIncome: null });
  }, []);

  const openEditModal = useCallback((income: IncomeDTO) => {
    setState({ open: true, editingIncome: income });
  }, []);

  const closeModal = useCallback(() => {
    setState({ open: false, editingIncome: null });
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
    <IncomeModalContext.Provider
      value={{ ...state, openAddModal, openEditModal, closeModal, registerOnSaved, notifySaved }}
    >
      {children}
    </IncomeModalContext.Provider>
  );
}

export function useIncomeModal() {
  const ctx = useContext(IncomeModalContext);
  if (!ctx) throw new Error("useIncomeModal must be used within IncomeModalProvider");
  return ctx;
}
