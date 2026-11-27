import { FC } from "react";
import { useFieldContext } from "./formContext.ts";

type CheckboxFieldProps = {
  description?: string;
  id?: string;
  label: string;
};

const CheckboxField: FC<CheckboxFieldProps> = ({ description, id, label }) => {
  const field = useFieldContext<boolean | undefined>();
  const inputId = id ?? field.name;
  const descriptionId = description ? `${inputId}-description` : undefined;

  return (
    <div className="form__checkbox">
      <input
        aria-describedby={descriptionId}
        checked={!!field.state.value}
        className="form__checkbox-input"
        id={inputId}
        name={field.name}
        type="checkbox"
        onBlur={field.handleBlur}
        onChange={(event) => field.handleChange(event.target.checked)}
      />
      <div>
        <label className="form__checkbox-label" htmlFor={inputId}>
          {label}
        </label>
        {description && (
          <p className="form__checkbox-description" id={descriptionId}>
            {description}
          </p>
        )}
      </div>
    </div>
  );
};

export default CheckboxField;
