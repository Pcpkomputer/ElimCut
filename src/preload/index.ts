import { contextBridge, ipcRenderer, webUtils } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  extractVideoInfo: (filePath: string) => ipcRenderer.invoke('extract-video-info', filePath),
  getFilePath: (file: File) => webUtils.getPathForFile(file),
  selectDirectory: () => ipcRenderer.invoke('dialog:openDirectory'),
  processVideo: (videoPath: string, outputDir: string, keywords: string[], padBefore: number, padAfter: number) => ipcRenderer.invoke('process-video', videoPath, outputDir, keywords, padBefore, padAfter)
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
