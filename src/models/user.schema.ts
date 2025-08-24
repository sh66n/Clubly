import { z } from "zod";

export const zUser = z.object({
  points: z.number(),
  name: z.string(),
  email: z.string(),
  role: z.string(),
  image: z.string(),
});

export interface IUser {
  _id?: string;
  points: number;
  name: string;
  email: string;
  role: string;
  image: string;
}
