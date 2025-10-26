import { Button, SimpleGrid, Space, TextInput } from "@mantine/core";
import {
  Control,
  Controller,
  useFieldArray,
  UseFormHandleSubmit,
  UseFormWatch,
} from "react-hook-form";
import { List } from "../interfaces/List";
import { FC } from "react";
import { v4 as uuidv4 } from "uuid";
import ListFormPresents from "./ListFormPresents";

type ListFormProps = {
  control: Control<List>;
  watch: UseFormWatch<List>;
  handleSubmit: UseFormHandleSubmit<List>;
  handleOnSubmit: (list: List) => void;
};

const ListForm: FC<ListFormProps> = ({
  control,
  watch,
  handleSubmit,
  handleOnSubmit,
}) => {
  const watchListId = watch("id");

  const { fields, append, remove } = useFieldArray({
    name: "presents",
    control,
  });

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
        <Button type="submit">Envoyer</Button>
      </SimpleGrid>
    </form>
  );
};

export default ListForm;
