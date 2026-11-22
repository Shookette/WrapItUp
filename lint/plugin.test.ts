import { describe, it } from "node:test";
import { RuleTester } from "oxlint/plugins-dev";
import plugin, { tooFewMessage } from "./plugin.ts";

RuleTester.describe = describe;
RuleTester.it = it;

const rule = plugin.rules["no-comments"];
const tester = new RuleTester({ cwd: "/repo" });
const allowed = (count: number) => [{ allowed: { "src/a.ts": count } }];

tester.run("no-comments", rule as never, {
  valid: [
    { code: 'const url = "https://example.com/a//b";' },
    { code: '/// <reference types="vite/client" />\nconst a = 1;' },
    {
      code: "// oxlint-disable-next-line no-console -- #12\nconsole.log(1);",
    },
    {
      code: "// @ts-expect-error -- #12\nconst a: number = '';",
      filename: "/repo/src/a.ts",
    },
    {
      code: "// un\nconst a = 1;",
      filename: "/repo/src/a.ts",
      options: allowed(1),
    },
  ],
  invalid: [
    { code: "// tautologie\nconst a = 1;", errors: 1 },
    { code: "/** doc */\nconst a = 1;", errors: 1 },
    {
      code: "const a = <div>{/* jsx */}</div>;",
      filename: "/repo/a.tsx",
      errors: 1,
    },
    {
      code: "// oxlint-disable-next-line no-console\nconsole.log(1);",
      errors: 1,
    },
    {
      code: "// un\n// deux\nconst a = 1;",
      filename: "/repo/src/a.ts",
      options: allowed(1),
      errors: 2,
    },
    {
      code: "const a = 1;",
      filename: "/repo/src/a.ts",
      options: allowed(2),
      errors: [{ message: tooFewMessage(0, 2) }],
    },
  ],
});
