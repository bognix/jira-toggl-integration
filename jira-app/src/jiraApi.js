import api, { route } from "@forge/api";

export const fetchIssueDetails = async (issueKey) => {
  const response = await api
    .asApp()
    .requestJira(route`/rest/api/3/issue/${issueKey}`);
  return await response.json();
};

export const fetchIssueScrumDetails = async (issueKey) => {
  const response = await api
    .asApp()
    .requestJira(route`/rest/agile/1.0/issue/${issueKey}`);

  return await response.json();
};

export const logTimeToJira = async (issueKey, timeSpentSeconds, started) => {
    return await api
    .asApp()
    .requestJira(
      route`/rest/api/3/issue/${issueKey}/worklog`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          timeSpentSeconds,
          started,
        }),
    }
  );
};
