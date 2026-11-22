import { FC, PropsWithChildren, useCallback, useState } from "react";
import Button from "#/components/Button/Button.tsx";
import Dialog from "#/components/Dialog/Dialog.tsx";
import { Confirm, ConfirmContext, ConfirmOptions } from "./confirmContext.ts";

type PendingConfirm = ConfirmOptions & {
  resolve: (confirmed: boolean) => void;
};

const ConfirmProvider: FC<PropsWithChildren> = ({ children }) => {
  const [pending, setPending] = useState<PendingConfirm>();

  const confirm: Confirm = useCallback(
    (options) =>
      new Promise<boolean>((resolve) => setPending({ ...options, resolve })),
    [],
  );

  const close = (confirmed: boolean) => {
    pending?.resolve(confirmed);
    setPending(undefined);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Dialog
        actions={
          <>
            <Button type="secondary" onClick={() => close(false)}>
              {pending?.cancelLabel ?? "Annuler"}
            </Button>
            <Button onClick={() => close(true)}>{pending?.confirmLabel}</Button>
          </>
        }
        description={pending?.message}
        open={!!pending}
        title={pending?.title ?? ""}
        onClose={() => close(false)}
      />
    </ConfirmContext.Provider>
  );
};

export default ConfirmProvider;
