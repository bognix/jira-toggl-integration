import Resolver from '@forge/resolver';

const resolver = new Resolver();

resolver.define('setTogglApiToken', ({ payload, context }) => {
  // localStorage.setItem('togglApiToken', payload);
});

export const handler = resolver.getDefinitions();
