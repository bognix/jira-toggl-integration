import { storage } from "@forge/api";
import Resolver from "@forge/resolver";
import { createClient } from "./togglApi";
import {
  fetchIssueDetails,
  fetchIssueScrumDetails,
  logTimeToJira,
  getLoggedTimeEntries,
} from "./jiraApi";

const resolver = new Resolver();

const formatStartDate = (date) => {
  return new Date(date).toISOString().replace("Z", "+0000");
};

const fourteenDaysAgo = () => {
  const today = new Date();
  const fourteenDaysAgo = new Date(today);
  fourteenDaysAgo.setDate(today.getDate() - 14);
  return fourteenDaysAgo;
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
  const issueAgileDetails = await fetchIssueScrumDetails(
    context?.extension.issue.key
  );
  const firstActiveSprint =
    issueAgileDetails.fields?.sprint?.state === "active"
      ? issueAgileDetails.fields.sprint
      : null;
  let startDate = fourteenDaysAgo().toISOString();
  if (firstActiveSprint) {
    startDate = firstActiveSprint.startDate;
  }
  const timeEntryIdentifier = `${issueAgileDetails.key} - ${issueAgileDetails.fields.summary}`;
  const timeEntriesForPeriod = await apiClient.getTimeEntries(startDate, null);
  return timeEntriesForPeriod.filter(
    (timeEntry) => timeEntry.description === timeEntryIdentifier
  );
});

resolver.define("getLoggedTimeEntries", async ({ _, context }) => {
  return await getLoggedTimeEntries(context?.extension?.issue.key);
});

resolver.define("logTimeToJira", async ({ payload, context }) => {
  if (payload.duration < 60) {
    throw new Error("Duration must be greater than 60 seconds");
  }
  const startFormatted = formatStartDate(payload.start);
  const response = await logTimeToJira(
    context?.extension?.issue.key,
    payload.duration,
    startFormatted
  );
  const json = await response.json();
  if (json.errors) {
    const firstError = Object.keys(json.errors)[0];
    throw new Error(json.errors[firstError]);
  }
  return json;
});

export const handler = resolver.getDefinitions();
