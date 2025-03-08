import { invoke } from "@forge/bridge";
import ForgeReconciler, {
  useForm,
  Form,
  FormFooter,
  FormHeader,
  Label,
  Textfield,
  FormSection,
  HelperMessage,
  RequiredAsterisk,
  Tabs,
  Tab,
  Box,
  TabList,
  TabPanel,
  LoadingButton,
} from "@forge/react";
import React, { useState, useEffect } from "react";

const TokenForm = ({ onSubmit }) => {
  const { handleSubmit, getFieldId, register, formState } = useForm();
  const { isSubmitting } = formState;

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <FormHeader title="Set Toggl Api Key">
        Required fields are marked with an asterisk <RequiredAsterisk />
      </FormHeader>
      <FormSection>
        <Label labelFor={getFieldId("apiKey")}>
          API Key
          <RequiredAsterisk />
        </Label>
        <Textfield {...register("apiKey", { required: true })} />
        <HelperMessage>Copy Toggl API key</HelperMessage>
      </FormSection>
      <FormFooter>
        <LoadingButton isLoading={isSubmitting} appearance="primary" type="submit">
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
  const submitToken = (formPayload) => {
    invoke("setTogglApiKey", formPayload.apiKey);
  };

  const [ apiKey, setApiKey ] = useState(async () => {
    const apiKey = await invoke("getTogglApiKey");
    setApiKey(apiKey);
  });

  useEffect(() => {
    console.log(apiKey, "....apiTokenChanged");
  }, [apiKey]);

  return (
    <TabbedView>
      <SettingsTab>
        <TokenForm onSubmit={submitToken} />
      </SettingsTab>
    </TabbedView>
  );
};

ForgeReconciler.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
