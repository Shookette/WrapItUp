import "./Confirm.css";

import {
  FC,
  PropsWithChildren,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import Button from "#/components/Button/Button.tsx";
import { Confirm, ConfirmContext, ConfirmOptions } from "./confirmContext.ts";

type PendingConfirm = ConfirmOptions & {
  resolve: (confirmed: boolean) => void;
};

const ConfirmProvider: FC<PropsWithChildren> = ({ children }) => {
  const id = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [pending, setPending] = useState<PendingConfirm>();

  const confirm: Confirm = useCallback(
    (options) =>
      new Promise<boolean>((resolve) => setPending({ ...options, resolve })),
    [],
  );

  useEffect(() => {
    if (pending && !dialogRef.current?.open) {
      dialogRef.current?.showModal();
    }
  }, [pending]);

  const close = (confirmed: boolean) => {
    pending?.resolve(confirmed);
    setPending(undefined);
    dialogRef.current?.close();
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <dialog
        aria-describedby={pending?.message ? `${id}-message` : undefined}
        aria-labelledby={`${id}-title`}
        className="confirm"
        ref={dialogRef}
        onCancel={(event) => {
          event.preventDefault();
          close(false);
        }}
        onClick={(event) => {
          if (event.target === dialogRef.current) {
            close(false);
          }
        }}
      >
        {pending && (
          <div className="confirm__content">
            <h2 className="confirm__title" id={`${id}-title`}>
              {pending.title}
            </h2>
            {pending.message && (
              <p className="confirm__message" id={`${id}-message`}>
                {pending.message}
              </p>
            )}
            <div className="confirm__actions">
              <Button type="secondary" onClick={() => close(false)}>
                {pending.cancelLabel ?? "Annuler"}
              </Button>
              <Button onClick={() => close(true)}>
                {pending.confirmLabel}
              </Button>
            </div>
          </div>
        )}
      </dialog>
    </ConfirmContext.Provider>
  );
};

export default ConfirmProvider;
