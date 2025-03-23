import { fetch } from "@forge/api";

export const createClient = (apiToken) => {
  const auth = Buffer.from(`${apiToken}:api_token`).toString("base64");
  const settings = {
    body: {
      created_with: "jira-integration",
    },
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${auth}`,
    },
  };

  const callApi = async (path, method, body = {}) => {
    try {
      const response = await fetch(
        `https://api.track.toggl.com/api/v9/${path}`,
        {
          method,
          body:
            method === "GET"
              ? null
              : JSON.stringify({
                  ...settings.body,
                  ...body,
                }),
          headers: { ...settings.headers },
        }
      );
      const jsonResponse = await response.json();
      return jsonResponse ?? {};
    } catch (e) {
      console.error(e);
      return {};
    }
  };

  const getUser = async () => {
    return await callApi("me?with_related_data", "GET");
  };

  const startTimeEntry = async (workspaceId, description) => {
    return await callApi(`workspaces/${workspaceId}/time_entries`, "POST", {
      duration: -1,
      start: new Date().toISOString(),
      workspace_id: workspaceId,
      description,
    });
  };

  const stopTimeEntry = async (workspaceId, timeEntryId) => {
    return await callApi(
      `workspaces/${workspaceId}/time_entries/${timeEntryId}/stop`,
      "PATCH"
    );
  };

  const getCurrentTimeEntry = async () => {
    return await callApi("me/time_entries/current", "GET");
  };

  const getTimeEntries = async (startDate, endDate) => {
    const params = new URLSearchParams();
    // params.append("start_date", startDate);

    return await callApi(`me/time_entries?${params}`, "GET");
  };

  return {
    getCurrentTimeEntry,
    getTimeEntries,
    getUser,
    startTimeEntry,
    stopTimeEntry,
  };
};
