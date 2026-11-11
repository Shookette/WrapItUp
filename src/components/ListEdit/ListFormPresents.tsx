import { IconTrash } from "@tabler/icons-react";
import { withForm } from "../../hooks/useAppForm.ts";
import Button from "../Button/Button.tsx";
import Table from "../Table/Table.tsx";
import { listFormOptions } from "./listFormOptions.ts";

const ListFormPresents = withForm({
  ...listFormOptions,
  render: function ListFormPresents({ form }) {
    return (
      <form.Field name="presents" mode="array">
        {(presentsField) => (
          <Table
            emptyMessage="Aucun cadeau"
            headers={[
              "Nom du cadeau",
              "Description du cadeau",
              "Lien du cadeau",
              "Actions",
            ]}
          >
            {presentsField.state.value.map((present, index) => (
              <tr className="table__row" key={present.id}>
                <td className="table__cell">
                  <form.AppField name={`presents[${index}].title`}>
                    {(field) => (
                      <field.TextField
                        id={`title-${index}`}
                        placeholder="Titre"
                        required
                      />
                    )}
                  </form.AppField>
                </td>
                <td className="table__cell">
                  <form.AppField name={`presents[${index}].description`}>
                    {(field) => (
                      <field.TextField
                        id={`description-${index}`}
                        placeholder="Description"
                        type="textarea"
                      />
                    )}
                  </form.AppField>
                </td>
                <td className="table__cell">
                  <form.AppField name={`presents[${index}].url`}>
                    {(field) => (
                      <field.TextField
                        id={`url-${index}`}
                        placeholder="https://…"
                        type="url"
                      />
                    )}
                  </form.AppField>
                </td>
                <td className="table__cell">
                  <Button
                    icon={<IconTrash size={16} />}
                    size="small"
                    type="danger"
                    onClick={() => presentsField.removeValue(index)}
                  />
                </td>
              </tr>
            ))}
          </Table>
        )}
      </form.Field>
    );
  },
});

export default ListFormPresents;
