import { config } from "dotenv";
config({ path: ".env.local" });
config();

import { defineConfig } from "prisma/config";

const dbUrl = process.env.DATABASE_URL ?? "";
const authToken = process.env.DATABASE_AUTH_TOKEN ?? "";
const datasourceUrl = dbUrl.startsWith("libsql://") && authToken
  ? `${dbUrl}?authToken=${authToken}`
  : dbUrl;

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: datasourceUrl,
  },
});
