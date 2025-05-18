import "server-only";
import { createDirectus, readItems, rest, staticToken } from "@directus/sdk";
import type { Class, Schema } from "./schema";

const cms = createDirectus<Schema>(process.env.NEXT_PUBLIC_CMS_URL!)
  .with(staticToken(process.env.DIRECTUS_API_KEY!))
  .with(rest());

export default cms;

export async function getClasses() {
  const classes = await cms.request<Class[]>(
    readItems("classes", {
      limit: -1,
      fields: [
        "*",
        { location: ["*"] },
        { image: ["*"] },
        { students: ["*", { person: ["*"] }, { image: ["*"] }] },
      ],
    }),
  );

  return classes;
}
