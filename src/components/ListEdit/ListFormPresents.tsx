import { Table, Text, Textarea, TextInput } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import {
  Control,
  Controller,
  FieldArrayWithId,
  UseFieldArrayRemove,
} from "react-hook-form";
import { FullList } from "../../interfaces/List.ts";
import { FC } from "react";
import Button from "../Button/Button.tsx";

type ListFormPresentsProps = {
  control: Control<FullList>;
  fields: FieldArrayWithId<FullList, "presents", "id">[];
  remove: UseFieldArrayRemove;
};

const ListFormPresents: FC<ListFormPresentsProps> = ({
  control,
  fields,
  remove,
}) => {
  return (
    <Table>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Nom du cadeau</Table.Th>
          <Table.Th>Description du cadeau</Table.Th>
          <Table.Th>Lien du cadeau</Table.Th>
          <Table.Th>Actions</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {fields.length > 1 ? (
          fields.map((_, index) => {
            return (
              <Table.Tr key={index}>
                <Table.Td>
                  <Controller
                    name={`presents.${index}.title`}
                    control={control}
                    render={({ field: { onChange, value, name } }) => (
                      <TextInput
                        id="title"
                        name={name}
                        placeholder="Titre"
                        value={value}
                        onChange={onChange}
                        autoFocus
                        withAsterisk
                        required
                      />
                    )}
                  />
                </Table.Td>
                <Table.Td>
                  <Controller
                    name={`presents.${index}.description`}
                    control={control}
                    render={({ field: { onChange, value, name } }) => (
                      <Textarea
                        id="description"
                        placeholder="Description"
                        name={name}
                        value={value}
                        onChange={onChange}
                      />
                    )}
                  />
                </Table.Td>
                <Table.Td>
                  <Controller
                    name={`presents.${index}.url`}
                    control={control}
                    render={({ field: { onChange, value, name } }) => (
                      <TextInput
                        id="url"
                        placeholder="Lien"
                        name={name}
                        value={value}
                        onChange={onChange}
                      />
                    )}
                  />
                </Table.Td>
                <Table.Td>
                  <Button
                    icon={<IconTrash size={16} />}
                    size="small"
                    type="danger"
                    onClick={() => remove(index)}
                  />
                </Table.Td>
              </Table.Tr>
            );
          })
        ) : (
          <Table.Tr>
            <Table.Td colSpan={4}>
              <Text ta="center">Aucun cadeau</Text>
            </Table.Td>
          </Table.Tr>
        )}
      </Table.Tbody>
    </Table>
  );
};

export default ListFormPresents;
