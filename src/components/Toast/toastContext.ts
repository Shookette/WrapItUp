import { createContext, useContext } from "react";

export type ToastType = "info" | "success" | "danger";

export type ToastOptions = {
  message: string;
  title?: string;
  type?: ToastType;
};

export type ToastContextValue = {
  show: (options: ToastOptions) => void;
};

export const ToastContext = createContext<ToastContextValue | null>(null);

/** `const toast = useToast(); toast.show({ type: "success", message: "…" });` */
export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast doit être utilisé dans un <ToastProvider>");
  }

  return context;
};
