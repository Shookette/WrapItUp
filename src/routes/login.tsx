import { createFileRoute } from "@tanstack/react-router";
import { useUserContext } from "../hooks/UserContext.tsx";
import { useEffect } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import Button from "../components/Button/Button.tsx";

export const Route = createFileRoute("/login")({
  component: LoginComponent,
});

export type FormLogin = {
  email: string;
  password: string;
};

function LoginComponent() {
  const { login, user } = useUserContext();

  const navigate = Route.useNavigate();

  const handleOnSubmit: SubmitHandler<FormLogin> = async (data) => {
    await login(data.email, data.password);
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
  } = useForm<FormLogin>();

  return (
    <article className="login">
      <div className="login_content">
        <h1 className="login_title">Connexion</h1>
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
          <input className="form_submit" type="submit" value="Connexion" />
        </form>
        <div className="login_actions">
          <Button
            type="button"
            displayType="secondary"
            handleOnClick={() => navigate({ to: "/register" })}
          >
            <span>Inscription</span>
          </Button>
          <Button
            type="button"
            displayType="tertiary"
            handleOnClick={() => navigate({ to: "/reset-password" })}
          >
            <span>Mot de passe oublié</span>
          </Button>
        </div>
      </div>
    </article>
  );
}
