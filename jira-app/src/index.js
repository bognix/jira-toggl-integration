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

const formatStartDate = (date) => {
  return new Date(date).toISOString().replace("Z", "+00:00");
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
  const issueAgileDetails = await fetchIssueScrumDetails(
    context?.extension.issue.key
  );
  const firstActiveSprint =
    issueAgileDetails.fields?.sprint?.state === "active"
      ? issueAgileDetails.fields.sprint
      : null;
  let startDate = fourteenDaysAgo().toISOString();
  if (firstActiveSprint) {
    startDate = firstActiveSprint;
  }
  const timeEntryIdentifier = `${issueAgileDetails.key} - ${issueAgileDetails.fields.summary}`;
  const timeEntriesForPeriod = await apiClient.getTimeEntries(startDate, null);
  return timeEntriesForPeriod.filter(
    (timeEntry) => timeEntry.description === timeEntryIdentifier
  );
});

resolver.define("logTimeToJira", async ({ payload, context }) => {
  if (payload.duration < 60) {
    throw new Error("Duration must be greater than 60 seconds");
  }
  const startFormatted = formatStartDate(payload.start);
  const response = await api
    .asApp()
    .requestJira(
      route`/rest/api/3/issue/${context?.extension?.issue.key}/worklog`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          timeSpentSeconds: payload.duration,
          started: startFormatted,
        }),
      }
    );

  return response.json();
});

export const handler = resolver.getDefinitions();
