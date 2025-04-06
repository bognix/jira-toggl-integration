import { invoke, showFlag } from "@forge/bridge";
import ForgeReconciler, {
  Box,
  Button,
  Form,
  FormFooter,
  FormSection,
  HelperMessage,
  Icon,
  Inline,
  Label,
  LoadingButton,
  RequiredAsterisk,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  Text,
  Textfield,
  useForm,
  Spinner,
  List,
  ListItem,
  Stack,
} from "@forge/react";
import React, { useEffect, useState, useReducer } from "react";

const TokenForm = ({ apiKey, onSubmit }) => {
  const [successIcon, setSuccessIcon] = useState(false);
  const { handleSubmit, getFieldId, register, formState } = useForm({
    defaultValues: {
      apiKey,
    },
  });
  const { isSubmitting, isSubmitSuccessful } = formState;

  useEffect(() => {
    if (isSubmitSuccessful) {
      setSuccessIcon(true);
      setTimeout(() => {
        setSuccessIcon(false);
      }, 5_000);
    }
  }, [isSubmitSuccessful]);

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <FormSection>
        <Label labelFor={getFieldId("apiKey")}>
          API Key
          <RequiredAsterisk />
        </Label>
        <Textfield
          {...register("apiKey", { required: true })}
          elemAfterInput={
            successIcon && (
              <Box xcss={{ marginTop: "space.050", marginRight: "space.050" }}>
                <Icon
                  glyph="editor-success"
                  label="saved"
                  primaryColor="color.icon.success"
                />
              </Box>
            )
          }
        />
        <HelperMessage>Copy Toggl API key</HelperMessage>
      </FormSection>
      <FormFooter>
        <LoadingButton
          isLoading={isSubmitting}
          appearance="primary"
          type="submit"
        >
          Submit
        </LoadingButton>
      </FormFooter>
    </Form>
  );
};

const SettingsTab = ({ children }) => (
  <TabPanel>
    <Box xcss={{ width: "100%" }}>{children}</Box>
  </TabPanel>
);

const TimeEntryTab = ({ children }) => (
  <TabPanel>
    <Box xcss={{ width: "100%", paddingTop: "space.200" }}>{children}</Box>
  </TabPanel>
);

const TabbedView = ({ children }) => {
  const settingsTab = React.Children.toArray(children).find((child) => {
    return child.type === SettingsTab;
  });

  const timeEntryTab = React.Children.toArray(children).find((child) => {
    return child.type === TimeEntryTab;
  });

  return (
    <Tabs id="default">
      <TabList>
        <Tab>Track Time</Tab>
        <Tab>Settings</Tab>
      </TabList>
      {timeEntryTab}
      {settingsTab}
    </Tabs>
  );
};

const LoadingState = {
  Initial: "INITIAL",
  Loading: "LOADING",
  Loaded: "LOADED",
  Faulted: "FAULTED",
};

const LoadingEvent = {
  Load: "LOAD",
  Success: "SUCCESS",
  Fail: "FAIL",
};

const appStateReducer = (state, event) => {
  switch (state) {
    case LoadingState.Initial:
    case LoadingState.Loaded:
    case LoadingState.Faulted:
      if (event === LoadingEvent.Load) return LoadingState.Loading;
      break;
    case LoadingState.Loading:
      if (event === LoadingEvent.Success) return LoadingState.Loaded;
      if (event === LoadingEvent.Fail) return LoadingState.Faulted;
      break;
  }
  return state;
};

const timerStateReducer = (state, event) => {
  switch (state) {
    case LoadingState.Initial:
    case LoadingState.Loaded:
    case LoadingState.Faulted:
      if (event === LoadingEvent.Load) return LoadingState.Loading;
      break;
    case LoadingState.Loading:
      if (event === LoadingEvent.Success) return LoadingState.Loaded;
      if (event === LoadingEvent.Fail) return LoadingState.Faulted;
      break;
  }
  return state;
};

const timeEntriesListStateReducer = (state, event) => {
  switch (state) {
    case LoadingState.Initial:
    case LoadingState.Loaded:
    case LoadingState.Faulted:
      if (event === LoadingEvent.Load) return LoadingState.Loading;
      break;
    case LoadingState.Loading:
      if (event === LoadingEvent.Success) return LoadingState.Loaded;
      if (event === LoadingEvent.Fail) return LoadingState.Faulted;
      break;
  }
  return state;
};

const TimeEntryState = {
  NOT_LOGGED: "NOT_LOGGED",
  TOO_SHORT: "TOO_SHORT",
  LOGGING: "LOGGING",
  LOGGED: "LOGGED",
  FAILED: "FAILED",
};

const secondsToTime = (seconds) => {
  let remainingSeconds = seconds;
  const days = Math.floor(remainingSeconds / (24 * 60 * 60));
  remainingSeconds %= 24 * 60 * 60;

  const hours = Math.floor(remainingSeconds / (60 * 60));
  remainingSeconds %= 60 * 60;

  const minutes = Math.floor(remainingSeconds / 60);
  remainingSeconds %= 60;

  return {
    days,
    hours,
    minutes,
    seconds: remainingSeconds,
  };
};

const formatTime = ({ days, hours, minutes, seconds }) => {
  if (days > 0) {
    return `${days}d ${hours}:${minutes}:${seconds}`;
  } else if (hours > 0) {
    return `${hours}:${minutes}:${seconds}`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
};

const timeSincePassed = (dateString) => {
  // Parse the input date string
  const pastDate = new Date(dateString);

  // Get current date and time
  const currentDate = new Date();

  // Calculate the difference in milliseconds
  const differenceMs = currentDate - pastDate;

  const differenceSeconds = Math.floor(differenceMs / 1000);
  return formatTime(secondsToTime(differenceSeconds));
};

const getTogglApiKey = async () => {
  try {
    return await invoke("getTogglApiKey");
  } catch (e) {
    console.error(e);
  }
};

const postApiKey = async (apiKey) => {
  try {
    await invoke("setTogglApiKey", apiKey);
  } catch (e) {
    console.error(e);
  }
};

const getTogglUser = async (apiKey) => {
  try {
    return await invoke("getTogglUser", { apiKey });
  } catch (e) {
    console.error(e);
  }
};

const getCurrentTimeEntry = async (apiKey) => {
  try {
    return await invoke("getCurrentTogglTimeEntry", {
      apiKey,
    });
  } catch (e) {
    console.error(e);
  }
};

const startTimeEntry = async (apiKey, workspaceId) => {
  try {
    await invoke("startTogglTimeEntry", {
      apiKey,
      workspaceId,
    });
  } catch (e) {
    console.error(e);
  }
};

const stopTimeEntry = async (apiKey, workspaceId, timeEntryId) => {
  try {
    await invoke("stopTogglTimeEntry", {
      apiKey,
      timeEntryId,
      workspaceId,
    });
  } catch (e) {
    console.error(e);
  }
};

const getIssueTimeEntries = async (apiKey) => {
  try {
    return await invoke("getIssueTimeEntries", {
      apiKey,
    });
  } catch (e) {
    console.error(e);
  }
};

const TimeEntry = ({ timeEntry, onLogTimeToJira }) => {
  const getTimeEntryActionComponent = () => {
    return (
      <LoadingButton
        appearance="subtle"
        onClick={onLogTimeToJira}
        isDisabled={[TimeEntryState.TOO_SHORT, TimeEntryState.LOGGED].includes(
          timeEntry.loggedToJiraState
        )}
        isLoading={timeEntry.loggedToJiraState === TimeEntryState.LOGGING}
      >
        {timeEntry.loggedToJiraState === TimeEntryState.LOGGED
          ? "Logged ✅"
          : "Log to Jira"}
      </LoadingButton>
    );
  };

  const timeEntryDuration = formatTime(secondsToTime(timeEntry.duration));
  const startedAt = new Date(timeEntry.start).toDateString();

  return (
    <ListItem>
      <Inline spread="space-between" alignBlock="center">
        <Text>
          {timeEntry.description} ⏲️ {timeEntryDuration} 📅 {startedAt}
        </Text>
        <Box>{getTimeEntryActionComponent()}</Box>
      </Inline>
    </ListItem>
  );
};

const App = () => {
  // Handle app setup: user and toggl api key
  const [appState, appStateDispatch] = useReducer(
    appStateReducer,
    LoadingState.Initial
  );
  const [apiKey, setApiKey] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    appStateDispatch(LoadingEvent.Load);
    getTogglApiKey()
      .then((apiKey) => {
        setApiKey(apiKey);
        return getTogglUser(apiKey);
      })
      .then((user) => {
        setUser(user);
        appStateDispatch(LoadingEvent.Success);
      })
      .catch((e) => {
        appStateDispatch(LoadingEvent.Fail);
        console.error(e);
      });
  }, []);

  const onSubmitApiKey = async (formData) => {
    try {
      await postApiKey(formData.apiKey);
    } catch (e) {
      console.error(e);
    }
  };

  // Handle timer interactions (start/stop)
  const [currentTimeEntry, setCurrentTimeEntry] = useState(null);
  const [timerState, timerStateDispatch] = useReducer(
    timerStateReducer,
    LoadingState.Initial
  );

  useEffect(() => {
    if (apiKey) {
      timerStateDispatch(LoadingEvent.Load);
      getCurrentTimeEntry(apiKey)
        .then(setCurrentTimeEntry)
        .then(() => timerStateDispatch(LoadingEvent.Success))
        .catch((e) => {
          timerStateDispatch(LoadingEvent.Fail);
          console.error(e);
        });
    }
  }, [apiKey]);

  const onTimeEntryStartClick = async () => {
    try {
      timerStateDispatch(LoadingEvent.Load);
      await startTimeEntry(apiKey, user.default_workspace_id);
      const timeEntry = await getCurrentTimeEntry(apiKey);
      setCurrentTimeEntry(timeEntry);
      timerStateDispatch(LoadingEvent.Success);
    } catch (e) {
      timerStateDispatch(LoadingEvent.Fail);
      console.error(e);
    }
  };

  const onTimeEntryStopClick = async () => {
    try {
      timerStateDispatch(LoadingEvent.Load);
      await stopTimeEntry(
        apiKey,
        user.default_workspace_id,
        currentTimeEntry.id
      );
      setCurrentTimeEntry(null);
      timerStateDispatch(LoadingEvent.Success);
    } catch (e) {
      timerStateDispatch(LoadingEvent.Fail);
      console.error(e);
    }
  };

  let timerButton = null;

  if (currentTimeEntry?.id) {
    timerButton = (
      <LoadingButton
        isLoading={timerState === LoadingState.Loading}
        appearance="primary"
        iconAfter="vid-pause"
        onClick={() => onTimeEntryStopClick()}
      >
        Stop
      </LoadingButton>
    );
  } else {
    timerButton = (
      <LoadingButton
        isLoading={timerState === LoadingState.Loading}
        appearance="primary"
        iconAfter="vid-play"
        onClick={() => onTimeEntryStartClick()}
      >
        Start
      </LoadingButton>
    );
  }

  // Handle timer counter
  const [currentTimeEntryTimer, setCurrentTimeEntryTimer] = useState(null);
  const [currentTimeEntryInterval, setCurrentTimeEntryInterval] =
    useState(null);

  useEffect(() => {
    if (currentTimeEntry?.start) {
      const interval = setInterval(() => {
        const timeSince = timeSincePassed(currentTimeEntry.start);
        setCurrentTimeEntryTimer(timeSince);
      }, 1000);
      setCurrentTimeEntryInterval(interval);
    }

    return () => {
      if (!currentTimeEntry) {
        clearInterval(currentTimeEntryInterval);
        setCurrentTimeEntryInterval(null);
        setCurrentTimeEntryTimer(null);
      }
    };
  }, [currentTimeEntry]);

  // Handle time entries list
  const [timeEntries, setTimeEntries] = useState([]);
  const [timeEntriesListState, timeEntriesListStateDispatch] = useReducer(
    timeEntriesListStateReducer,
    LoadingState.Initial
  );
  useEffect(() => {
    if (apiKey && !currentTimeEntry) {
      timeEntriesListStateDispatch(LoadingEvent.Load);
      getIssueTimeEntries(apiKey)
        .then((timeEntries) => {
          setTimeEntries(
            timeEntries
              .filter((entry) => entry.duration > 0)
              .map((entry) => {
                let loggedToJiraState = TimeEntryState.NOT_LOGGED;
                if (entry.duration < 60) {
                  loggedToJiraState = TimeEntryState.TOO_SHORT;
                }
                return {
                  ...entry,
                  loggedToJiraState,
                };
              })
          );
        })
        .then(() => timeEntriesListStateDispatch(LoadingEvent.Success))
        .catch((e) => {
          timeEntriesListStateDispatch(LoadingEvent.Fail);
          console.error(e);
        });
    }
  }, [apiKey, currentTimeEntry]);

  const updateTimeEntry = (timeEntry, updates) => {
    return timeEntries.map((entry) => {
      if (entry.start === timeEntry.start) {
        return { ...entry, ...updates };
      }
      return entry;
    });
  };

  const logTimeToJira = async (timeEntry) => {
    try {
      setTimeEntries(
        updateTimeEntry(timeEntry, {
          loggedToJiraState: TimeEntryState.LOGGING,
        })
      );

      await invoke("logTimeToJira", {
        duration: timeEntry.duration,
        start: timeEntry.start,
      });

      setTimeEntries(
        updateTimeEntry(timeEntry, {
          loggedToJiraState: TimeEntryState.LOGGED,
        })
      );
    } catch (e) {
      showFlag({
        id: "error-flag",
        title: `Failed logging time for issue ${timeEntry.description}`,
        type: "error",
        description: e.message,
        isAutoDismiss: true,
      });

      setTimeEntries(
        updateTimeEntry(timeEntry, {
          loggedToJiraState: TimeEntryState.FAILED,
        })
      );
      console.error(e);
    }
  };

  const logAllTimeEntries = async () => {
    const timeEntriesToLog = timeEntries.filter((entry) => !entry.loggedToJira);
    // TODO: log all time entries
  };

  let timeEntriesComponent = null;
  if (
    [LoadingState.Initial, LoadingState.Loading].includes(timeEntriesListState)
  ) {
    timeEntriesComponent = <Spinner />;
  } else {
    timeEntriesComponent = (
      <Stack space="space.200">
        <Button onClick={logAllTimeEntries}>Log all</Button>
        <List type="unordered">
          {timeEntries.map((timeEntry) => (
            <TimeEntry
              key={timeEntry.start}
              timeEntry={timeEntry}
              onLogTimeToJira={() => logTimeToJira(timeEntry)}
            />
          ))}
        </List>
      </Stack>
    );
  }

  if ([LoadingState.Initial, LoadingState.Loading].includes(appState)) {
    return <Spinner />;
  }

  return (
    <TabbedView>
      <TimeEntryTab>
        <Stack space="space.200">
          <Inline alignBlock="center" space="space.50" spread="space-between">
            {currentTimeEntry?.id && (
              <Text>{`${currentTimeEntry.description} ${
                currentTimeEntryTimer ?? "..."
              }`}</Text>
            )}
            {timerButton}
          </Inline>
          {timeEntriesComponent}
        </Stack>
      </TimeEntryTab>
      <SettingsTab>
        <TokenForm onSubmit={onSubmitApiKey} apiKey={apiKey} />
      </SettingsTab>
    </TabbedView>
  );
};

ForgeReconciler.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
