import { FC, ReactNode } from "react";
import Button from "../Button/Button.tsx";
import { useFormContext } from "./formContext.ts";

type SubmitButtonProps = {
  children: ReactNode;
  type?: "primary" | "danger" | "success";
};

/** Bouton d'envoi pleine largeur, en chargement pendant la soumission. */
const SubmitButton: FC<SubmitButtonProps> = ({ children, type }) => {
  const form = useFormContext();

  return (
    <form.Subscribe selector={(state) => state.isSubmitting}>
      {(isSubmitting) => (
        <div className="form__actions">
          <Button isSubmit loading={isSubmitting} type={type}>
            {children}
          </Button>
        </div>
      )}
    </form.Subscribe>
  );
};

export default SubmitButton;
