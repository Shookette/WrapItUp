import { z } from "zod";

export const isInternalPath = (path: string): boolean =>
  /^\/(?![/\\])/.test(path);

export const redirectSearchSchema = z.object({
  redirect: z.string().refine(isInternalPath).optional().catch(undefined),
});

export type RedirectSearch = z.infer<typeof redirectSearchSchema>;
