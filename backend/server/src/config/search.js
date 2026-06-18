import "dotenv/config";

const requestedProvider = String(process.env.SEARCH_PROVIDER || "auto").toLowerCase();
const isHosted =
  process.env.NODE_ENV === "production" ||
  process.env.RENDER === "true" ||
  Boolean(process.env.RENDER_SERVICE_ID);

const validProviders = new Set(["auto", "meilisearch", "sql"]);

if (!validProviders.has(requestedProvider)) {
  throw new Error("SEARCH_PROVIDER must be auto, meilisearch, or sql");
}

export const searchProvider = requestedProvider === "auto"
  ? (isHosted ? "sql" : "meilisearch")
  : requestedProvider;

export const usesMeilisearch = searchProvider === "meilisearch";
