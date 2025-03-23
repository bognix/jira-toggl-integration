import api, { storage, route } from "@forge/api";
import Resolver from "@forge/resolver";
import { createClient } from "./togglApi";

const resolver = new Resolver();

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

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
  const response = await api
    .asApp()
    .requestJira(route`/rest/api/3/issue/${issueKey}`);
  return await response.json();
};

const fetchIssueScrumDetails = async (issueKey) => {
  const response = await api
    .asApp()
    .requestJira(route`/rest/agile/1.0/issue/${issueKey}`);

  return await response.json();
};

resolver.define("startTogglTimeEntry", async ({ payload, context }) => {
  const issueDetails = await fetchIssueDetails(context?.extension?.issue.key);
  const apiClient = createClient(payload.apiKey);
  return await apiClient.startTimeEntry(
    payload.workspaceId,
    `${issueDetails.key} - ${issueDetails.fields.summary}`
  );
});

resolver.define("stopTogglTimeEntry", async ({ payload }) => {
  const apiClient = createClient(payload.apiKey);
  return await apiClient.stopTimeEntry(
    payload.workspaceId,
    payload.timeEntryId
  );
});

resolver.define("getCurrentTogglTimeEntry", async ({ payload }) => {
  const apiClient = createClient(payload.apiKey);
  return await apiClient.getCurrentTimeEntry();
});

resolver.define("getIssueTimeEntries", async ({ payload, context }) => {
  const apiClient = createClient(payload.apiKey);
  const issueDetails = await fetchIssueDetails(context?.extension?.issue.key);
  const timeEntryIdentifier = `${issueDetails.key} - ${issueDetails.fields.summary}`
  const timeEntriesForPeriod = await apiClient.getTimeEntries(payload.startDate, null);
  return timeEntriesForPeriod.filter(timeEntry => timeEntry.description === timeEntryIdentifier);
});

export const handler = resolver.getDefinitions();
