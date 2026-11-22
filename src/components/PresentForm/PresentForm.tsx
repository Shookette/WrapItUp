import "./PresentForm.css";

import { FC, useId } from "react";
import Button from "#/components/Button/Button.tsx";
import { revalidateLogic } from "@tanstack/react-form";
import { z } from "zod";
import { useAppForm } from "#/hooks/useAppForm.ts";
import {
  optionalUrlSchema,
  presentDescriptionSchema,
  presentTitleSchema,
} from "#/utils/formSchemas.ts";
import type { PresentDraft } from "#/utils/presents.ts";

const presentDraftSchema = z.object({
  title: presentTitleSchema,
  description: presentDescriptionSchema,
  url: optionalUrlSchema,
}) satisfies z.ZodType<PresentDraft, PresentDraft>;

const emptyDraft: PresentDraft = { title: "", description: "", url: "" };

type PresentFormProps = {
  initialValues?: PresentDraft;
  resetAfterSubmit?: boolean;
  submitLabel: string;
  onCancel?: () => void;
  onSubmit: (draft: PresentDraft) => Promise<boolean>;
};

const PresentForm: FC<PresentFormProps> = ({
  initialValues = emptyDraft,
  resetAfterSubmit = false,
  submitLabel,
  onCancel,
  onSubmit,
}) => {
  const id = useId();
  const defaultValues: PresentDraft = {
    title: initialValues.title,
    description: initialValues.description ?? "",
    url: initialValues.url ?? "",
  };
  const form = useAppForm({
    defaultValues,
    validationLogic: revalidateLogic(),
    validators: { onDynamic: presentDraftSchema },
    onSubmit: async ({ value, formApi }) => {
      const saved = await onSubmit(value);
      if (saved && resetAfterSubmit) {
        formApi.reset(emptyDraft);
      }
    },
  });

  return (
    <form.AppForm>
      <form.Form>
        <form.AppField name="title">
          {(field) => (
            <field.TextField
              id={`${id}-title`}
              label="Titre"
              placeholder="Ex. : un bon livre"
              required
            />
          )}
        </form.AppField>
        <form.AppField name="description">
          {(field) => (
            <field.TextField
              id={`${id}-description`}
              label="Description"
              placeholder="Taille, couleur, modèle…"
              type="textarea"
            />
          )}
        </form.AppField>
        <form.AppField name="url">
          {(field) => (
            <field.TextField
              description="Facultatif : la page où trouver le cadeau"
              id={`${id}-url`}
              label="Lien"
              placeholder="https://…"
              type="url"
            />
          )}
        </form.AppField>
        <div className="present-form__actions">
          {onCancel ? (
            <Button type="secondary" onClick={onCancel}>
              Annuler
            </Button>
          ) : (
            <Button type="secondary" onClick={() => form.reset(emptyDraft)}>
              Vider
            </Button>
          )}
          <div className="present-form__submit">
            <form.SubmitButton>{submitLabel}</form.SubmitButton>
          </div>
        </div>
      </form.Form>
    </form.AppForm>
  );
};

export default PresentForm;
