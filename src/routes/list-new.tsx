import { createFileRoute, useRouter } from "@tanstack/react-router";
import { SubmitHandler, useFieldArray, useForm } from "react-hook-form";
import { List } from "../interfaces/List.ts";
import { v4 as uuidv4 } from "uuid";
import { setList } from "../repository/ListRepository.ts";
import { useUserContext } from "../hooks/UserContext.tsx";
import dayjs from "dayjs";
import { useCallback } from "react";
import { setPresent } from "../repository/PresentRepository.ts";
import { isAuthenticated } from "../utils/routeUtils.ts";

const ListNew = () => {
  const { navigate } = useRouter();
  const { user } = useUserContext();

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<List>({
    defaultValues: {
      id: uuidv4(),
      userUID: user!.uid,
      createdAt: dayjs().format("YYYY-MM-DD"),
    },
  });

  const watchListId = watch("id");

  const { fields, append, remove } = useFieldArray({
    name: "presents",
    control,
  });

  const handleOnSubmit: SubmitHandler<List> = useCallback(async (list) => {
    await setList(list);
    await Promise.all(
      list.presents.map(async (present) => {
        await setPresent(present);
      }),
    );
    navigate({
      to: "/",
    });
  }, []);

  return (
    <article className="list-add">
      <h2 className="list-add_title">Ajouter une nouvelle Liste de cadeau</h2>
      <form className="form" onSubmit={handleSubmit(handleOnSubmit)}>
        <label className="form_label" htmlFor="title">
          Nom de la liste de cadeau
        </label>
        <input
          autoFocus
          className="form_input"
          id="title"
          {...register("title", { required: true })}
        />
        <span role="alert" className="form_input--error">
          {errors.title && "Le nom de la liste est obligatoire"}
        </span>
        {fields.map((field, index) => {
          return (
            <div key={field.id}>
              <section className={"section"} key={field.id}>
                <input
                  placeholder="title"
                  {...register(`presents.${index}.title` as const, {
                    required: true,
                  })}
                  className={errors?.presents?.[index]?.title ? "error" : ""}
                  defaultValue={field.title}
                />
                <textarea
                  placeholder="description"
                  {...register(`presents.${index}.description` as const)}
                  className={
                    errors?.presents?.[index]?.description ? "error" : ""
                  }
                  defaultValue={field.description}
                />
                <input
                  placeholder="lien"
                  type="text"
                  {...register(`presents.${index}.url` as const)}
                  className={errors?.presents?.[index]?.url ? "error" : ""}
                  defaultValue={field.url}
                />
                <button type="button" onClick={() => remove(index)}>
                  Supprimer
                </button>
              </section>
            </div>
          );
        })}

        <button
          type="button"
          onClick={() =>
            append({
              id: uuidv4(),
              title: "",
              status: "available",
              listUID: watchListId,
            })
          }
        >
          Ajouter un cadeau
        </button>

        <input className="form_submit" type="submit" value="Envoyer" />
      </form>
    </article>
  );
};

export const Route = createFileRoute("/list-new")({
  component: ListNew,
  beforeLoad: ({ context }) => {
    isAuthenticated(context);
  },
});
