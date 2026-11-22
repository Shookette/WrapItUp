import "./Form.css";

import { FC, PropsWithChildren } from "react";
import { useFormContext } from "./formContext.ts";

const Form: FC<PropsWithChildren> = ({ children }) => {
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
