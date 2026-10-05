/// <reference types="vite/client" />

interface Window {
  webkitAudioContext?: typeof AudioContext;
}

interface ImportMetaEnv {
  readonly MIAODA_CLIENT_BASE_PATH: string;
}
