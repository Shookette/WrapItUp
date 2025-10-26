import { Button, SimpleGrid, Space, TextInput } from "@mantine/core";
import {
  Controller,
  SubmitHandler,
  useFieldArray,
  useForm,
} from "react-hook-form";
import { List } from "../interfaces/List";
import { FC, useCallback, useMemo, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import ListFormPresents from "./ListFormPresents";
import { setList } from "../repository/ListRepository.ts";
import { notifications } from "@mantine/notifications";

type ListFormProps = {
  list: List;
};

const ListForm: FC<ListFormProps> = ({ list }) => {
  const [loading, setLoading] = useState(false);
  const defaultValues = useMemo(() => list, [list]);

  const { control, handleSubmit, watch } = useForm<List>({
    defaultValues,
  });

  const watchListId = watch("id");

  const { fields, append, remove } = useFieldArray({
    name: "presents",
    control,
  });

  const handleOnSubmit: SubmitHandler<List> = useCallback(async (list) => {
    setLoading(true);
    await setList(list);
    setLoading(false);

    notifications.show({
      color: "green",
      position: "top-right",
      message: "Liste modifiée",
    });
  }, []);

  return (
    <form onSubmit={handleSubmit(handleOnSubmit)}>
      <Controller
        name="title"
        control={control}
        render={({ field: { onChange, value, name } }) => (
          <TextInput
            id="title"
            name={name}
            value={value}
            onChange={onChange}
            label="Nom de la liste de cadeau"
            autoFocus
            withAsterisk
            required
          />
        )}
      />
      <ListFormPresents control={control} fields={fields} remove={remove} />
      <Space h="md" />
      <Button
        type="button"
        color="green"
        onClick={() =>
          append({
            id: uuidv4(),
            title: "",
            status: "available",
            listUID: watchListId,
            description: "",
            url: "",
          })
        }
      >
        Ajouter un cadeau
      </Button>
      <Space h="md" />
      <SimpleGrid>
        <Button loading={loading} type="submit">
          Enregistrer
        </Button>
      </SimpleGrid>
    </form>
  );
};

export default ListForm;
