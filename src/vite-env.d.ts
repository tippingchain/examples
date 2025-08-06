/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_THIRDWEB_CLIENT_ID: string
  readonly VITE_APP_NETWORK?: string
  readonly VITE_APP_DEFAULT_CHAIN_ID?: string
  readonly VITE_BASE_PATH?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}