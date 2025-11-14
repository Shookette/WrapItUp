import "./Input.css";

import { ChangeEvent, FC, useMemo } from "react";
import classNames from "classnames";

type InputProps = {
  error?: boolean;
  errorMessage?: string;
  id?: string;
  label?: string;
  name?: string;
  placeholder?: string;
  required?: boolean;
  type?: "email" | "text" | "textarea" | "password";
  value?: string;
  onChange: (value: string) => void;
};

const Input: FC<InputProps> = ({
  error = false,
  errorMessage,
  id,
  label,
  name,
  placeholder,
  required = false,
  type = "text",
  value = "",
  onChange,
}) => {
  const className = classNames("input", {});

  const commonProps = useMemo(() => ({
    className: "input__field",
    id,
    name,
    placeholder,
    required,
    value,
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(e.target.value)
  }), [id, name, placeholder, required, value, onChange])

  return (
    <div className={className}>
      {label ? (
        <label className="input__label">
          {label}
          {required ? <span className="input__label-asterix"> *</span> : ""}
        </label>
      ) : (
        ""
      )}

      {type === "textarea" ? (
        <textarea
          {...commonProps}
        />
      ) : (
        <input
          {...commonProps}
          type={type}
        />
      )}

      {error ? <p>{errorMessage ?? "Champ obligatoire"}</p> : ""}
    </div>
  );
};

export default Input;
