import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

import ffmpeg from 'fluent-ffmpeg'
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg'
import ffprobeInstaller from '@ffprobe-installer/ffprobe'
import fs from 'fs'
import path from 'path'
import os from 'os'
import { spawn } from 'child_process'

const ffmpegPath = ffmpegInstaller.path.replace('app.asar', 'app.asar.unpacked')
const ffprobePath = ffprobeInstaller.path.replace('app.asar', 'app.asar.unpacked')

ffmpeg.setFfmpegPath(ffmpegPath)
ffmpeg.setFfprobePath(ffprobePath)

function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  if (h > 0) {
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 900,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  ipcMain.handle('dialog:openDirectory', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      properties: ['openDirectory', 'createDirectory']
    })
    if (canceled) {
      return null
    } else {
      return filePaths[0]
    }
  })

  ipcMain.handle('process-video', async (event, videoPath, outputDir, keywords, padBefore, padAfter) => {
    return new Promise((resolve, reject) => {
      const exePath = app.isPackaged
        ? path.join(process.resourcesPath, 'ElimCutEngine')
        : path.join(__dirname, '../../resources/ElimCutEngine')
      
      const child = spawn(exePath, [
        '--video', videoPath,
        '--out', outputDir,
        '--keywords', keywords.join(','),
        '--pad_before', padBefore.toString(),
        '--pad_after', padAfter.toString()
      ])
      
      child.stdout.on('data', (data) => {
        console.log(`ElimCutEngine: ${data}`)
      })
      
      child.stderr.on('data', (data) => {
        console.error(`ElimCutEngine Error: ${data}`)
      })
      
      child.on('close', (code) => {
        if (code === 0) {
          resolve(true)
        } else {
          reject(new Error(`ElimCutEngine exited with code ${code}`))
        }
      })
    })
  })

  ipcMain.handle('extract-video-info', async (_, filePath) => {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) {
          return reject(err)
        }
        
        const videoStream = metadata.streams.find(s => s.codec_type === 'video')
        const durationSeconds = metadata.format.duration || 0
        const sizeBytes = metadata.format.size || 0
        
        const duration = formatDuration(durationSeconds)
        const resolution = videoStream ? `${videoStream.width}x${videoStream.height}` : 'Unknown'
        const size = formatBytes(sizeBytes)
        
        // Extract a frame at 1 second or halfway if shorter
        const screenshotTime = durationSeconds > 1 ? 1 : durationSeconds / 2
        const tempDir = os.tmpdir()
        const filename = `thumb-${Date.now()}.jpg`
        
        ffmpeg(filePath)
          .on('end', () => {
            const thumbPath = path.join(tempDir, filename)
            try {
              const base64 = fs.readFileSync(thumbPath, { encoding: 'base64' })
              fs.unlinkSync(thumbPath) // clean up
              resolve({
                duration,
                resolution,
                size,
                thumbnail: `data:image/jpeg;base64,${base64}`
              })
            } catch(e) {
              reject(e)
            }
          })
          .on('error', (err) => {
            reject(err)
          })
          .screenshots({
            timestamps: [screenshotTime],
            filename: filename,
            folder: tempDir,
            size: '320x180'
          })
      })
    })
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
