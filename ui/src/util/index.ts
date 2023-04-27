import { createDiscreteApi, darkTheme } from 'naive-ui';

const api = createDiscreteApi(['message'], {
  configProviderProps: {
    theme: darkTheme,
  },
});
export const message = api.message;
