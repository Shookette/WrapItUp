import "./Input.css";

import { FC } from "react";
import classNames from "classnames";

type InputProps = {
  error?: boolean;
  errorMessage?: string;
  id?: string;
  label?: string;
  name?: string;
  placeholder?: string;
  required?: boolean;
  type?: "email" | "text" | "textarea";
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

      <input
        className="input__field"
        id={id}
        name={name}
        placeholder={placeholder}
        required={required}
        value={value}
        type={type}
        onChange={(e) => onChange(e.target.value)}
      />
      {error ? <p>{errorMessage ?? "Champ obligatoire"}</p> : ""}
    </div>
  );
};

export default Input;
