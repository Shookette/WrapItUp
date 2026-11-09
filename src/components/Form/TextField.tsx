import { FC } from "react";
import Input from "../Input/Input.tsx";
import { useFieldContext } from "./formContext.ts";

type TextFieldProps = {
  id?: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  type?: "email" | "text" | "textarea" | "password" | "url";
};

/**
 * Champ texte branché sur TanStack Form : à utiliser dans
 * `<form.AppField name="…">{(field) => <field.TextField … />}</form.AppField>`.
 * Affiche la première erreur de validation (schéma zod) du champ.
 */
const TextField: FC<TextFieldProps> = ({ id, ...props }) => {
  const field = useFieldContext<string | undefined>();
  const [firstError] = field.state.meta.errors;
  const errorMessage =
    typeof firstError === "string" ? firstError : firstError?.message;

  return (
    <Input
      {...props}
      error={!!errorMessage}
      errorMessage={errorMessage}
      id={id ?? field.name}
      name={field.name}
      value={field.state.value ?? ""}
      onBlur={field.handleBlur}
      onChange={field.handleChange}
    />
  );
};

export default TextField;
