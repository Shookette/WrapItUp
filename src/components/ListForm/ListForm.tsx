import { FC, useEffect } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import "./MediaForm.scss";
import { List } from "../../interfaces/List.ts";

type ListFormProps = {
  list?: List;
  handleOnSubmit: SubmitHandler<List>;
};

const ListForm: FC<ListFormProps> = ({ list, handleOnSubmit }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<List>({ defaultValues: list });
  useEffect(() => {
    reset(list);
  }, [list]);

  return (
    <div className="list-form">
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
        <input className="form_submit" type="submit" value="Envoyer" />
      </form>
    </div>
  );
};

export default ListForm;
