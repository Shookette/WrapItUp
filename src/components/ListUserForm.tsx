import { Control, UseFormWatch } from "react-hook-form";
import { List } from "../interfaces/List";
import { FC } from "react";

type ListUserFormProps = {
  control: Control<List>;
  watch: UseFormWatch<List>;
};

const ListUserForm: FC<ListUserFormProps> = ({}) => {
  return <>WIP</>;
};

export default ListUserForm;
