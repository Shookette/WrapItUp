import "./Form.css";

import { FC, ReactNode } from "react";
import { useFormContext } from "./formContext.ts";

type FormProps = {
  children: ReactNode;
};

/**
 * Balise `<form>` branchée sur TanStack Form. La validation native du
 * navigateur est désactivée (`noValidate`) : les messages viennent des
 * schémas zod.
 */
const Form: FC<FormProps> = ({ children }) => {
  const form = useFormContext();

  return (
    <form
      className="form"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void form.handleSubmit();
      }}
    >
      {children}
    </form>
  );
};

export default Form;
