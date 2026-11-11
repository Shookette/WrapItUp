import { createFormHook } from "@tanstack/react-form";
import { fieldContext, formContext } from "#components/Form/formContext.ts";
import TextField from "#components/Form/TextField.tsx";
import SubmitButton from "#components/Form/SubmitButton.tsx";
import Form from "#components/Form/Form.tsx";

/**
 * Hook de formulaire de l'application (TanStack Form) :
 * - champs : `field.TextField`
 * - formulaire : `form.Form`, `form.SubmitButton` (dans `<form.AppForm>`)
 */
export const { useAppForm, withForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: { TextField },
  formComponents: { Form, SubmitButton },
});
