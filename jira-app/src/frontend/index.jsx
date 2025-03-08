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
  Button,
} from "@forge/react";
import React from "react";

const TokenForm = ({ onSubmit }) => {
  const { handleSubmit, getFieldId, register } = useForm();

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
        <Button appearance="primary" type="submit">
          Submit
        </Button>
      </FormFooter>
    </Form>
  );
};

const TabbedView = () => {
  return (
    <Tabs id="default">
      <TabList>
        <Tab>Track Time</Tab>
        <Tab>Settings</Tab>
      </TabList>
      <TabPanel>
        <Box>
          This is the content area of the first tab.
        </Box>
      </TabPanel>
      <TabPanel>
        <TokenForm />
      </TabPanel>
    </Tabs>
  );
};
const App = () => {
  const login = (token) => {
    invoke("setTogglApiToken", { token });
  };
  return <TabbedView />;
};

ForgeReconciler.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
