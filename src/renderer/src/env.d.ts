/// <reference types="vite/client" />

interface Window {
  api: {
    extractVideoInfo: (filePath: string) => Promise<any>
    getFilePath: (file: File) => string
    selectDirectory: () => Promise<string | null>
  }
}
