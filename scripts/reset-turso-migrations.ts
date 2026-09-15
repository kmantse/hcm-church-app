import { createClient } from "@libsql/client";
import { config } from "dotenv";

config({ path: ".env.local" });
config();

const client = createClient({
  url: process.env.DATABASE_URL!,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

async function main() {
  await client.execute("DELETE FROM _prisma_migrations");
  console.log("Migration history cleared — re-run migrate-turso.ts");
}

main().catch(console.error).finally(() => client.close());
