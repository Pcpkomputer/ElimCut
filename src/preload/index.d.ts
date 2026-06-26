import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      extractVideoInfo: (filePath: string) => Promise<{
        duration: string;
        resolution: string;
        size: string;
        thumbnail: string;
      }>;
      getFilePath: (file: File) => string;
    }
  }
}
