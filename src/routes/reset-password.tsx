import { createFileRoute } from "@tanstack/react-router";
import Button from "../components/Button/Button.tsx";
import { SubmitHandler, useForm } from "react-hook-form";
import { useUserContext } from "../hooks/UserContext.tsx";

export const Route = createFileRoute("/reset-password")({
  component: ResetPasswordComponent,
});

export type FormResetPassword = {
  email: string;
};

function ResetPasswordComponent() {
  const { resetPassword } = useUserContext();
  const navigate = Route.useNavigate();

  const handleOnSubmit: SubmitHandler<FormResetPassword> = async (data) => {
    await resetPassword(data.email);
    navigate({ to: "/login" });
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormResetPassword>();

  return (
    <article className="reset-password">
      <div className="reset-password_content">
        <h1 className="reset_password_title">Réinitialiser le mot de passe</h1>
        <form className="form" onSubmit={handleSubmit(handleOnSubmit)}>
          <label className="form_label" htmlFor="email">
            Adresse e-mail
          </label>
          <input
            className="form_input"
            id="email"
            {...register("email", { required: true })}
          />
          <span role="alert" className="form_input--error">
            {errors.email && `L'adresse mail est obligatoire`}
          </span>
          <input className="form_submit" type="submit" value="Réinitialiser" />
        </form>
        <div className="reset-password_actions">
          <Button
            type="button"
            displayType="secondary"
            handleOnClick={() => navigate({ to: "/login" })}
          >
            <span>Connexion</span>
          </Button>
          <Button
            type="button"
            displayType="tertiary"
            handleOnClick={() => navigate({ to: "/register" })}
          >
            <span>Inscription</span>
          </Button>
        </div>
      </div>
    </article>
  );
}
