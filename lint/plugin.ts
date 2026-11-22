import path from "node:path";

type Position = { line: number; column: number };
type Comment = {
  type: "Line" | "Block";
  value: string;
  loc: { start: Position; end: Position };
};
type Report = { loc: Comment["loc"] | Position; message: string };
type Context = {
  cwd: string;
  filename: string;
  options: [{ allowed?: Record<string, number> }?];
  sourceCode: { getAllComments: () => Comment[] };
  report: (report: Report) => void;
};

export const RATCHET_COMMAND = "npm run lint:ratchet";

const DIRECTIVE = /^\s*(oxlint|eslint)-(disable|enable)/;
const TYPESCRIPT_DIRECTIVE = /^\s*@ts-expect-error\b/;
const TRIPLE_SLASH = /^\/\s*<reference\s/;
const JUSTIFIED = /\s--\s+\S/;

const isDirective = (comment: Comment) =>
  DIRECTIVE.test(comment.value) || TYPESCRIPT_DIRECTIVE.test(comment.value);

const isTripleSlash = (comment: Comment) =>
  comment.type === "Line" && TRIPLE_SLASH.test(comment.value);

export const tooFewMessage = (count: number, allowed: number) =>
  `Ratchet : ${count} commentaire(s) < ${allowed} toléré(s) pour ce fichier, lancer \`${RATCHET_COMMAND}\` pour figer le progrès.`;

const forbiddenMessage = (count: number, allowed: number) =>
  `Commentaire interdit (${count} pour ${allowed} toléré(s) dans ce fichier). Tautologie ou obsolète : le supprimer. Contournement : le supprimer et ouvrir une issue. Décision : la déplacer dans docs/adr/. Voir /delete-comment.`;

const unjustifiedMessage =
  "Directive sans justification : ajouter `-- #<issue>` ou `-- docs/adr/<fichier>.md`.";

const noComments = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Interdit les commentaires : les décisions vont dans docs/adr/, les contournements dans des issues.",
    },
    schema: [
      {
        type: "object",
        properties: {
          allowed: {
            type: "object",
            additionalProperties: { type: "integer", minimum: 1 },
          },
        },
        additionalProperties: false,
      },
    ],
  },
  create(context: Context) {
    return {
      Program() {
        const file = path
          .relative(context.cwd, context.filename)
          .split(path.sep)
          .join("/");
        const allowed = context.options[0]?.allowed?.[file] ?? 0;
        const comments = context.sourceCode.getAllComments();

        for (const comment of comments.filter(isDirective)) {
          if (!JUSTIFIED.test(comment.value)) {
            context.report({ loc: comment.loc, message: unjustifiedMessage });
          }
        }

        const counted = comments.filter(
          (comment) => !isDirective(comment) && !isTripleSlash(comment),
        );

        if (counted.length > allowed) {
          for (const comment of counted) {
            context.report({
              loc: comment.loc,
              message: forbiddenMessage(counted.length, allowed),
            });
          }
        } else if (counted.length < allowed) {
          context.report({
            loc: { line: 1, column: 0 },
            message: tooFewMessage(counted.length, allowed),
          });
        }
      },
    };
  },
};

export default {
  meta: { name: "wrap-it-up" },
  rules: { "no-comments": noComments },
};
