/// <reference types="vite/client" />

declare module '*.json' {
  const value: unknown;
  export default value;
}

// Global constants defined in vite.config.ts
declare const __APP_VERSION__: string;
