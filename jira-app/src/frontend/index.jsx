import { invoke } from "@forge/bridge";
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

const timeSincePassed = (dateString) => {
  // Parse the input date string
  const pastDate = new Date(dateString);

  // Get current date and time
  const currentDate = new Date();

  // Calculate the difference in milliseconds
  const differenceMs = currentDate - pastDate;

  // Convert milliseconds to seconds (round down to nearest integer)
  let totalSeconds = Math.floor(differenceMs / 1000);

  // Calculate days, hours, minutes, and remaining seconds
  const days = Math.floor(totalSeconds / (24 * 60 * 60));
  totalSeconds %= 24 * 60 * 60;

  const hours = Math.floor(totalSeconds / (60 * 60));
  totalSeconds %= 60 * 60;

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  // Pad minutes and seconds with leading zeros if needed
  const paddedMinutes = minutes < 10 ? `0${minutes}` : minutes;
  const paddedSeconds = seconds < 10 ? `0${seconds}` : seconds;

  // Format the output according to the rules
  if (days > 0) {
    return `${days} ${hours}:${paddedMinutes}:${paddedSeconds}`;
  } else if (hours > 0) {
    return `${hours}:${paddedMinutes}:${paddedSeconds}`;
  } else if (minutes > 0) {
    return `${paddedMinutes}m:${paddedSeconds}s`;
  } else {
    return `${paddedSeconds}s`;
  }
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
  await invoke("stopTogglTimeEntry", {
    apiKey,
    timeEntryId,
    workspaceId,
  });
};

const App = () => {
  const [apiKey, setApiKey] = useState(null);
  const [user, setUser] = useState(null);
  const [currentTimeEntry, setCurrentTimeEntry] = useState(null);
  const [currentTimeEntryTimer, setCurrentTimeEntryTimer] = useState(null);
  const [currentTimeEntryInterval, setCurrentTimeEntryInterval] =
    useState(null);
  const [appState, appStateDispatch] = useReducer(
    appStateReducer,
    LoadingState.Initial
  );
  const [timerState, timerStateDispatch] = useReducer(
    timerStateReducer,
    LoadingState.Initial
  );

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

  const onSubmitApiKey = async (formData) => {
    try {
      await postApiKey(formData.apiKey);
    } catch (e) {
      console.error(e);
    }
  };

  if ([LoadingState.Initial, LoadingState.Loading].includes(appState)) {
    return <Spinner />;
  }

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

  return (
    <TabbedView>
      <TimeEntryTab>
        <Inline alignBlock="center" space="space.200" spread="space-between">
          {currentTimeEntry?.id && (
            <Text>{`${currentTimeEntry.description} ${
              currentTimeEntryTimer ?? "-"
            }`}</Text>
          )}
          {timerButton}
        </Inline>
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
