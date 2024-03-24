/// <reference types="vite-plugin-electron/electron-env" />

import { WindowElectron } from "./preload"

declare namespace NodeJS {
  interface ProcessEnv {
    /**
     * The built directory structure
     *
     * ```tree
     * ├─┬─┬ dist
     * │ │ └── index.html
     * │ │
     * │ ├─┬ dist-electron
     * │ │ ├── main.js
     * │ │ └── preload.js
     * │
     * ```
     */
    DIST: string
    /** /dist/ or /public/ */
    VITE_PUBLIC: string
  }
}

// Used in Renderer process, expose in `preload.ts`
declare global {
  interface Window {
    ipcRenderer: import("electron").IpcRenderer
    [WindowElectron.name]: typeof WindowElectron
  }
}
