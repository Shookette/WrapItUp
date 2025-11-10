import { SimpleGrid, Space } from "@mantine/core";
import {
  Controller,
  SubmitHandler,
  useFieldArray,
  useForm,
} from "react-hook-form";
import { FullList } from "../../interfaces/List.ts";
import { FC, useCallback, useMemo, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import ListFormPresents from "./ListFormPresents.tsx";
import { setList } from "../../repository/ListRepository.ts";
import { notifications } from "@mantine/notifications";
import Button from "../Button/Button.tsx";
import Input from "../Input/Input.tsx";

type ListFormProps = {
  list: FullList;
};

const ListForm: FC<ListFormProps> = ({ list }) => {
  const [loading, setLoading] = useState(false);
  const defaultValues = useMemo(() => list, [list]);

  const { control, handleSubmit, watch } = useForm<FullList>({
    defaultValues,
  });

  const watchListId = watch("id");

  const { fields, append, remove } = useFieldArray({
    name: "presents",
    control,
  });

  const handleOnSubmit: SubmitHandler<FullList> = useCallback(async (list) => {
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
          <Input
            id="title"
            label="Nom de la liste de cadeau"
            name={name}
            placeholder="Nom de la liste de cadeau"
            required
            value={value}
            onChange={onChange}
          />
        )}
      />
      <ListFormPresents control={control} fields={fields} remove={remove} />
      <Space h="md" />
      <Button
        size="small"
        type="success"
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
        <Button isSubmit loading={loading}>
          Enregistrer
        </Button>
      </SimpleGrid>
    </form>
  );
};

export default ListForm;
