import {Present} from "./Present.ts";

export type List = {
    id: string;
    title: string;
    userUID: string;
    presents: Present[]
}