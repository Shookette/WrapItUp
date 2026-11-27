import { createFormHook } from "@tanstack/react-form";
import { fieldContext, formContext } from "#/components/Form/formContext.ts";
import TextField from "#/components/Form/TextField.tsx";
import CheckboxField from "#/components/Form/CheckboxField.tsx";
import SubmitButton from "#/components/Form/SubmitButton.tsx";
import Form from "#/components/Form/Form.tsx";

export const { useAppForm, withForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: { TextField, CheckboxField },
  formComponents: { Form, SubmitButton },
});
