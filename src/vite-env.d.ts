// / <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WS_SCHEME: string;
  readonly VITE_WS_HOST: string;
  readonly VITE_WS_PORT: string;
  readonly VITE_WS_PATH: string;
  readonly VITE_API_SCHEME: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}