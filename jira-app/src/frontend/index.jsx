import { invoke } from "@forge/bridge";
import ForgeReconciler, {
  Button,
  Form,
  FormFooter,
  FormHeader,
  FormSection,
  HelperMessage,
  Label,
  RequiredAsterisk,
  Textfield,
  useForm,
} from "@forge/react";
import React from "react";

const App = () => {
  const { handleSubmit, getFieldId, register } = useForm();
  const login = (token) => {
    invoke("setTogglApiToken", { token });
  };

  return (
    <Form onSubmit={handleSubmit(login)}>
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

ForgeReconciler.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
