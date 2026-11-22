import { createContext, ReactNode, useContext } from "react";

export type ConfirmOptions = {
  cancelLabel?: string;
  confirmLabel: string;
  message?: ReactNode;
  title: string;
};

export type Confirm = (options: ConfirmOptions) => Promise<boolean>;

export const ConfirmContext = createContext<Confirm | null>(null);

export const useConfirm = (): Confirm => {
  const context = useContext(ConfirmContext);

  if (!context) {
    throw new Error("useConfirm doit être utilisé dans un <ConfirmProvider>");
  }

  return context;
};
