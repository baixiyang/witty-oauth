import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { NaiveUiResolver } from 'unplugin-vue-components/dist/resolvers';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import Components from 'unplugin-vue-components/dist/vite';
export default defineConfig({
  base: './',
  plugins: [
    vue(),
    Components({
      resolvers: [NaiveUiResolver()],
    }),
  ],
  server: {
    port: 5555,
    host: '0.0.0.0',
    proxy: {
      '^/auth': {
        target: 'http://127.0.0.1:5554',
        changeOrigin: true,
      },
    },
  },
});
