import "./Dialog.css";

import {
  FC,
  PropsWithChildren,
  ReactNode,
  useEffect,
  useId,
  useRef,
} from "react";
import { IconX } from "@tabler/icons-react";
import Button from "#/components/Button/Button.tsx";

type DialogProps = PropsWithChildren<{
  actions?: ReactNode;
  description?: ReactNode;
  open: boolean;
  title: string;
  onClose: () => void;
}>;

const Dialog: FC<DialogProps> = ({
  actions,
  children,
  description,
  open,
  title,
  onClose,
}) => {
  const id = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (open && !dialog?.open) {
      dialog?.showModal();
    }
    if (!open && dialog?.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      aria-describedby={description ? `${id}-description` : undefined}
      aria-labelledby={`${id}-title`}
      className="dialog"
      ref={dialogRef}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current) {
          onClose();
        }
      }}
    >
      {open && (
        <div className="dialog__content">
          <div className="dialog__header">
            <h2 className="dialog__title" id={`${id}-title`}>
              {title}
            </h2>
            <Button
              ariaLabel="Fermer"
              icon={<IconX size={20} />}
              type="secondary"
              onClick={onClose}
            />
          </div>
          {description && (
            <p className="dialog__description" id={`${id}-description`}>
              {description}
            </p>
          )}
          {children}
          {actions && <div className="dialog__actions">{actions}</div>}
        </div>
      )}
    </dialog>
  );
};

export default Dialog;
