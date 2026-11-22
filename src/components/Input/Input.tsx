import "./Input.css";

import { ChangeEvent, FC, useMemo } from "react";
import classNames from "classnames";

type InputProps = {
  /** Texte d'aide affiché sous le champ (règles de saisie…). */
  description?: string;
  error?: boolean;
  errorMessage?: string;
  id?: string;
  label?: string;
  name?: string;
  placeholder?: string;
  required?: boolean;
  type?: "email" | "text" | "textarea" | "password" | "url";
  value?: string;
  onBlur?: () => void;
  onChange: (value: string) => void;
};

const Input: FC<InputProps> = ({
  description,
  error = false,
  errorMessage,
  id,
  label,
  name,
  placeholder,
  required = false,
  type = "text",
  value = "",
  onBlur,
  onChange,
}) => {
  const className = classNames("input", { "input--error": error });
  const descriptionId = description && id ? `${id}-description` : undefined;

  const commonProps = useMemo(
    () => ({
      className: "input__field",
      id,
      name,
      placeholder,
      required,
      value,
      "aria-invalid": error || undefined,
      "aria-describedby": descriptionId,
      onBlur,
      onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        onChange(e.target.value),
    }),
    [
      id,
      name,
      placeholder,
      required,
      value,
      error,
      descriptionId,
      onBlur,
      onChange,
    ],
  );

  const labelElement = useMemo(() => {
    if (!label) {
      return null;
    }

    return (
      <label className="input__label" htmlFor={id}>
        {label}
        {required && <span className="input__label-asterix"> *</span>}
      </label>
    );
  }, [id, label, required]);

  const errorElement = useMemo(() => {
    if (!error) {
      return null;
    }

    return (
      <p className="input__error">{errorMessage ?? "Champ obligatoire"}</p>
    );
  }, [error, errorMessage]);

  return (
    <div className={className}>
      {labelElement}

      {type === "textarea" ? (
        <textarea {...commonProps} />
      ) : (
        <input {...commonProps} type={type} />
      )}

      {description && (
        <p className="input__description" id={descriptionId}>
          {description}
        </p>
      )}

      {errorElement}
    </div>
  );
};

export default Input;
