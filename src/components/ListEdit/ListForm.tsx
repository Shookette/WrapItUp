import { FC } from "react";
import { FullList } from "#/interfaces/List.ts";
import { setList } from "#/repository/ListRepository.ts";
import { useAppForm } from "#/hooks/useAppForm.ts";
import { useToast } from "#/components/Toast/toastContext.ts";
import Button from "#/components/Button/Button.tsx";
import ListFormPresents from "./ListFormPresents.tsx";
import { listFormOptions } from "./listFormOptions.ts";

type ListFormProps = {
  list: FullList;
};

const ListForm: FC<ListFormProps> = ({ list }) => {
  const toast = useToast();
  const form = useAppForm({
    ...listFormOptions,
    defaultValues: list,
    onSubmit: async ({ value }) => {
      await setList(value);

      toast.show({
        type: "success",
        message: "Liste modifiée",
      });
    },
  });

  return (
    <form.AppForm>
      <form.Form>
        <form.AppField name="title">
          {(field) => (
            <field.TextField
              label="Nom de la liste de cadeau"
              placeholder="Nom de la liste de cadeau"
              required
            />
          )}
        </form.AppField>
        <ListFormPresents form={form} />
        <div>
          <Button
            size="small"
            type="success"
            onClick={() =>
              form.pushFieldValue("presents", {
                id: crypto.randomUUID(),
                title: "",
                status: "available",
                listUID: list.id,
                description: "",
                url: "",
              })
            }
          >
            Ajouter un cadeau
          </Button>
        </div>
        <form.SubmitButton>Enregistrer</form.SubmitButton>
      </form.Form>
    </form.AppForm>
  );
};

export default ListForm;
