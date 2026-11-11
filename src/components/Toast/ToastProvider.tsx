import "./Toast.css";

import { FC, PropsWithChildren, useCallback, useMemo, useState } from "react";
import classNames from "classnames";
import { IconX } from "@tabler/icons-react";
import { ToastContext, ToastOptions } from "./toastContext.ts";

const TOAST_DURATION = 4000;

type ToastItem = Required<Pick<ToastOptions, "type">> &
  ToastOptions & { id: number };

let nextId = 0;

/** Affiche les notifications en haut à droite, fermées après 4 secondes. */
const ToastProvider: FC<PropsWithChildren> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const close = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const show = useCallback(
    ({ type = "info", ...options }: ToastOptions) => {
      const id = nextId++;
      setToasts((current) => [...current, { ...options, type, id }]);
      setTimeout(() => close(id), TOAST_DURATION);
    },
    [close],
  );

  const value = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toasts" aria-live="polite">
        {toasts.map((toast) => (
          <div
            className={classNames("toast", `toast__type--${toast.type}`)}
            key={toast.id}
            role={toast.type === "danger" ? "alert" : "status"}
          >
            <div className="toast__content">
              {toast.title && <p className="toast__title">{toast.title}</p>}
              <p className="toast__message">{toast.message}</p>
            </div>
            <button
              aria-label="Fermer"
              className="toast__close"
              type="button"
              onClick={() => close(toast.id)}
            >
              <IconX size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export default ToastProvider;
