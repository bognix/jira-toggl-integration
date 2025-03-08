import { invoke } from "@forge/bridge";
import ForgeReconciler, {
  Box,
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
  useForm,
} from "@forge/react";
import React, { useEffect, useState } from "react";

const TokenForm = ({ apiKey, onSubmit }) => {
  const { handleSubmit, getFieldId, register, formState } = useForm({
    defaultValues: {
      apiKey,
    },
  });
  const { isSubmitting, isSubmitSuccessful } = formState;
  const [successIcon, setSuccessIcon] = useState(false);

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
              <Box xcss={{ marginTop: "space.050", marginRight: "space.50" }}>
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

const SettingsTab = ({ children }) => <TabPanel>{children}</TabPanel>;

const TabbedView = ({ children }) => {
  const settingsTab = React.Children.toArray(children).find((child) => {
    return child.type === SettingsTab;
  });

  return (
    <Tabs id="default">
      <TabList>
        <Tab>Track Time</Tab>
        <Tab>Settings</Tab>
      </TabList>
      <TabPanel>
        <Box>This is the content area of the first tab.</Box>
      </TabPanel>
      {settingsTab}
    </Tabs>
  );
};
const App = () => {
  const [apiKey, setApiKey] = useState(null);

  useEffect(async () => {
    const apiKey = await invoke("getTogglApiKey");
    setApiKey(apiKey);
  }, []);

  const submitToken = (formPayload) => {
    invoke("setTogglApiKey", formPayload.apiKey);
    setApiKey(formPayload.apiKey);
  };

  return (
    <TabbedView>
      <SettingsTab>
        <TokenForm onSubmit={submitToken} apiKey={apiKey} />
      </SettingsTab>
    </TabbedView>
  );
};

ForgeReconciler.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
