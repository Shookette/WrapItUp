import { FC, PropsWithChildren } from "react";
import Button from "#/components/Button/Button.tsx";
import { ButtonType } from "#/components/Button/buttonClassNames.ts";
import { useFormContext } from "./formContext.ts";

type SubmitButtonProps = PropsWithChildren<{
  type?: ButtonType;
}>;

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
