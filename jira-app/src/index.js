import api, { storage, route } from '@forge/api';
import Resolver from "@forge/resolver";
import { createClient } from "./togglApi";

const resolver = new Resolver();

resolver.define("setTogglApiKey", async ({ payload, context }) => {
  await storage.setSecret(`${context.accountId}:togglApiKey`, payload);
});

resolver.define("getTogglApiKey", async ({ _, context }) => {
  return await storage.getSecret(`${context.accountId}:togglApiKey`);
});

resolver.define("getTogglUser", async ({ payload, context }) => {
  const apiClient = createClient(payload.apiKey);
  return await apiClient.getUser();
});

const fetchIssueDetails = async (issueKey) => {
  const response = await api.asApp().requestJira(route`/rest/api/3/issue/${issueKey}`);
  return await response.json();
};

resolver.define("startTogglTimeEntry", async ({ payload, context }) => {
  const issueDetails = await fetchIssueDetails(context?.extension?.issue.key)
  const apiClient = createClient(payload.apiKey);
  return await apiClient.startTimeEntry(payload.workspaceId, `${issueDetails.key} - ${issueDetails.fields.summary}`);
});

resolver.define("stopTogglTimeEntry", async ({ payload, context }) => {
  const apiClient = createClient(payload.apiKey);
  return await apiClient.stopTimeEntry(payload.workspaceId, payload.timeEntryId);
});

resolver.define("getCurrentTogglTimeEntry", async ({ payload }) => {
  const apiClient = createClient(payload.apiKey)
  return await apiClient.getCurrentTimeEntry()
})

export const handler = resolver.getDefinitions();
