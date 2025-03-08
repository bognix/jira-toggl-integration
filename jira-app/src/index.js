import Resolver from "@forge/resolver";
import { storage } from "@forge/api";

const resolver = new Resolver();

resolver.define("setTogglApiKey", async ({ payload, context }) => {
  await storage.setSecret(`${context.accountId}:togglApiKey`, payload);
});

resolver.define("getTogglApiKey", async ({ _, context }) => {
  return await storage.getSecret(`${context.accountId}:togglApiKey`);
});

export const handler = resolver.getDefinitions();
