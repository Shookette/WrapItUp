import { createLazyFileRoute, useRouter } from "@tanstack/react-router";
import ListForm from "../components/ListForm/ListForm.tsx";
import { SubmitHandler } from "react-hook-form";
import { List } from "../interfaces/List.ts";
import { v4 as uuidv4 } from "uuid";
import { setList } from "../repository/ListRepository.ts";

const ListNew = () => {
  const { navigate } = useRouter();
  const onSubmit: SubmitHandler<List> = async (list) => {
    list.id = uuidv4();
    list.userUID = "123";
    setList(list).then(() => {
      navigate({
        to: "/",
      });
    });
  };

  return (
    <article className="list-add">
      <h2 className="list-add_title">Ajouter une nouvelle Liste de cadeau</h2>
      <ListForm handleOnSubmit={onSubmit} />
    </article>
  );
};

export default ListNew;

export const Route = createLazyFileRoute("/list-new")({
  component: ListNew,
});
