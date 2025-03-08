import Resolver from '@forge/resolver';

const resolver = new Resolver();

resolver.define('setTogglApiToken', ({ payload, context }) => {
  console.log(payload);
  console.log(context);
});

export const handler = resolver.getDefinitions();
