import { createFileRoute } from "@tanstack/react-router";
import Button from "../components/Button/Button.tsx";
import { SubmitHandler, useForm } from "react-hook-form";
import { useUserContext } from "../hooks/UserContext.tsx";
import { useEffect } from "react";

export const Route = createFileRoute("/register")({
  component: RegisterComponent,
});

export type FormRegister = {
  email: string;
  username: string;
  password: string;
};

function RegisterComponent() {
  const { register: userRegister, user } = useUserContext();

  const navigate = Route.useNavigate();

  const handleOnSubmit: SubmitHandler<FormRegister> = async (data) => {
    await userRegister(data.email, data.password, data.username);
    navigate({ to: "/login" });
  };

  useEffect(() => {
    if (user) {
      navigate({ to: "/" });
    }
  }, [user]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormRegister>();

  return (
    <article className="register">
      <div className="register_content">
        <h1 className="register_title">Inscription</h1>
        <form className="form" onSubmit={handleSubmit(handleOnSubmit)}>
          <label className="form_label" htmlFor="email">
            Email
          </label>
          <input
            className="form_input"
            id="email"
            {...register("email", { required: true })}
          />
          <span role="alert" className="form_input--error">
            {errors.email && `L'adresse mail est obligatoire`}
          </span>
          <label className="form_label" htmlFor="username">
            Nom/Prenom
          </label>
          <input
            className="form_input"
            id="username"
            {...register("username", { required: true })}
          />
          <span role="alert" className="form_input--error">
            {errors.username && `Le nom et le prénom est obligatoire`}
          </span>
          <label className="form_label" htmlFor="password">
            Mot de passe
          </label>
          <input
            className="form_input"
            id="password"
            type="password"
            {...register("password", { required: true })}
          />
          <span role="alert" className="form_input--error">
            {errors.password && `Le mot de passe est obligatoire`}
          </span>
          <input className="form_submit" type="submit" value="Inscription" />
        </form>
        <div className="register_actions">
          <Button
            type="button"
            displayType="secondary"
            handleOnClick={() => navigate({ to: "/login" })}
          >
            Connexion
          </Button>
          <Button
            type="button"
            displayType="tertiary"
            handleOnClick={() => navigate({ to: "/reset-password" })}
          >
            Réinitialiser le mot de passe
          </Button>
        </div>
      </div>
    </article>
  );
}
