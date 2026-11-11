import { FC, PropsWithChildren } from "react";
import Button from "#/components/Button/Button.tsx";
import { useFormContext } from "./formContext.ts";

type SubmitButtonProps = PropsWithChildren<{
  type?: "primary" | "danger" | "success";
}>;

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
