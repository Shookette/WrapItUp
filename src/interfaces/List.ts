import { Present } from "./Present.ts";

export type AllowedUser = {
  userUID: string;
  username?: string;
};

export type List = {
  id: string;
  title: string;
  userUID: string;
  presents: Present[];
  username?: string;
  createdAt: string;
  allowedUsers: string[];
};

export type FullList = Omit<List, "allowedUsers"> & {
  allowedUsers: AllowedUser[];
};
