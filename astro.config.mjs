import { defineConfig } from "astro/config";

const repository = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "paper-cards";
const owner = process.env.GITHUB_REPOSITORY_OWNER ?? "example";
const isUserSite = repository.endsWith(".github.io");
const base = process.env.BASE_PATH ?? (isUserSite ? "/" : `/${repository}`);

export default defineConfig({
  output: "static",
  site: process.env.SITE_URL ?? `https://${owner}.github.io`,
  base,
  trailingSlash: "always",
  vite: {
    build: {
      cssMinify: true,
    },
  },
});
