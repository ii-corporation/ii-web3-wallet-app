/**
 * UI Store
 * Manages global UI state like modals, toasts, and loading states
 */

import { create } from "zustand";

export type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface Modal {
  id: string;
  component: string;
  props?: Record<string, unknown>;
}

interface UIState {
  // Toasts
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;

  // Modals
  activeModal: Modal | null;
  openModal: (component: string, props?: Record<string, unknown>) => void;
  closeModal: () => void;

  // Global loading
  isGlobalLoading: boolean;
  globalLoadingMessage: string | null;
  setGlobalLoading: (loading: boolean, message?: string) => void;

  // Bottom sheet
  bottomSheetContent: string | null;
  bottomSheetProps: Record<string, unknown> | null;
  openBottomSheet: (content: string, props?: Record<string, unknown>) => void;
  closeBottomSheet: () => void;

  // Keyboard
  isKeyboardVisible: boolean;
  setKeyboardVisible: (visible: boolean) => void;
}

let toastId = 0;

export const useUIStore = create<UIState>((set, get) => ({
  // Toasts
  toasts: [],
  addToast: (toast) => {
    const id = `toast-${++toastId}`;
    const newToast = { ...toast, id };

    set((state) => ({
      toasts: [...state.toasts, newToast],
    }));

    // Auto-remove after duration
    const duration = toast.duration ?? 3000;
    if (duration > 0) {
      setTimeout(() => {
        get().removeToast(id);
      }, duration);
    }

    return id;
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
  clearToasts: () => set({ toasts: [] }),

  // Modals
  activeModal: null,
  openModal: (component, props) =>
    set({
      activeModal: {
        id: `modal-${Date.now()}`,
        component,
        props,
      },
    }),
  closeModal: () => set({ activeModal: null }),

  // Global loading
  isGlobalLoading: false,
  globalLoadingMessage: null,
  setGlobalLoading: (loading, message) =>
    set({
      isGlobalLoading: loading,
      globalLoadingMessage: loading ? (message ?? null) : null,
    }),

  // Bottom sheet
  bottomSheetContent: null,
  bottomSheetProps: null,
  openBottomSheet: (content, props) =>
    set({
      bottomSheetContent: content,
      bottomSheetProps: props ?? null,
    }),
  closeBottomSheet: () =>
    set({
      bottomSheetContent: null,
      bottomSheetProps: null,
    }),

  // Keyboard
  isKeyboardVisible: false,
  setKeyboardVisible: (visible) => set({ isKeyboardVisible: visible }),
}));

/**
 * Convenience functions for common toast types
 */
export const showSuccessToast = (message: string, duration?: number) =>
  useUIStore.getState().addToast({ type: "success", message, duration });

export const showErrorToast = (message: string, duration?: number) =>
  useUIStore.getState().addToast({ type: "error", message, duration: duration ?? 5000 });

export const showWarningToast = (message: string, duration?: number) =>
  useUIStore.getState().addToast({ type: "warning", message, duration });

export const showInfoToast = (message: string, duration?: number) =>
  useUIStore.getState().addToast({ type: "info", message, duration });
