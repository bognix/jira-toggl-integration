import { invoke } from "@forge/bridge";
import ForgeReconciler, {
  Box,
  Button,
  Form,
  FormFooter,
  FormSection,
  HelperMessage,
  Icon,
  Label,
  LoadingButton,
  RequiredAsterisk,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  Textfield,
  Text,
  useForm,
  Inline,
  Strong,
} from "@forge/react";
import React, { useEffect, useState } from "react";

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

const App = () => {
  const [apiKey, setApiKey] = useState(null);
  const [user, setUser] = useState(null);
  const [currentTimeEntry, setCurrentTimeEntry] = useState(null);

  const getCurrentTimeEntry = async () => {
    console.log('inside getCurrentTimeEntry...')
    const currentTimeEntry = await invoke("getCurrentTogglTimeEntry", { apiKey });
    console.log(currentTimeEntry)
    setCurrentTimeEntry(currentTimeEntry);
  };
  
  useEffect(() => {
    const getTogglApiKey = async () => {
      const apiKey = await invoke("getTogglApiKey");
      setApiKey(apiKey);
    };
    getTogglApiKey().catch(console.error);
  }, []);

  useEffect(() => {
    const getTogglUser = async () => {
      const togglUser = await invoke("getTogglUser", { apiKey });
      setUser(togglUser);
    };

    if (apiKey) {
      getTogglUser().catch(console.error);
    }
  }, [apiKey]);

  useEffect(() => {
    if (apiKey && user?.id) {
      getCurrentTimeEntry().catch(console.error);
    }
  }, [apiKey, user]);

  const onTimeEntryStartClick = () => {
    const startTimeEntry = async () => {
      await invoke("startTogglTimeEntry", {
        apiKey,
        workspaceId: user.default_workspace_id,
      });
    };

    if (user?.id) {
      startTimeEntry()
      .then(() => {
        return getCurrentTimeEntry()
      })
      .catch(console.error);
    }
  };

  const onTimeEntryStopClick = () => {
    const stopTimeEntry = async () => {
      await invoke("stopTogglTimeEntry", {
        apiKey,
        timeEntryId: currentTimeEntry.id,
        workspaceId: user.default_workspace_id,
      });
    };

    if (currentTimeEntry?.id) {
      stopTimeEntry().then(() => {
        return getCurrentTimeEntry()
      }).catch(console.error);
    }
  };

  const submitApiKey = (formPayload) => {
    invoke("setTogglApiKey", formPayload.apiKey);
    setApiKey(formPayload.apiKey);
  };

  return (
    <TabbedView>
      <TimeEntryTab>
        {currentTimeEntry ? (
          <Inline alignBlock="center" space="space.200">
            <Text>
              <Strong>Current Time Entry:</Strong>{" "}
              {currentTimeEntry.description}
            </Text>
            <Button
              appearance="primary"
              iconAfter="vid-pause"
              onClick={() => onTimeEntryStopClick()}
            >
              Stop
            </Button>
          </Inline>
        ) : (
          <Button
            appearance="primary"
            iconAfter="vid-play"
            isDisabled={!user?.id}
            onClick={() => onTimeEntryStartClick()}
          >
            Start
          </Button>
        )}
      </TimeEntryTab>
      <SettingsTab>
        <TokenForm onSubmit={submitApiKey} apiKey={apiKey} />
      </SettingsTab>
    </TabbedView>
  );
};

ForgeReconciler.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
