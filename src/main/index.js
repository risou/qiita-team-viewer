'use strict'

import { app, Menu, BrowserWindow, shell } from 'electron'
import Auth from './auth'
import storage from 'electron-json-storage-sync'
import fs from 'fs'
import path from 'path'

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    // height: 563,
    // useContentSize: true,
    // width: 1000
    height: 800,
    width: 1280,
    webPreferences: {
      webSecurity: false
    }
  })
  mainWindow.webContents.on('new-window', (event, url) => {
    event.preventDefault()
    shell.openExternal(url)
  })
  mainWindow.webContents.on('will-navigate', (event, url) => {

  })

  setupMenu()

  mainWindow.loadURL(winURL)

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

function setupMenu () {
  const template = [
    {
      label: 'Electron',
      submenu: [
        { role: 'close' },
        { role: 'quit' }
      ]
    },
    {
      label: 'Select',
      submenu: [
        {
          label: 'Next',
          accelerator: 'J',
          click: (item, focusedWindow) => {
            mainWindow.webContents.send('J', 'Next')
          }
        },
        {
          label: 'Previous',
          accelerator: 'K',
          click: (item, focusedWindow) => {
            mainWindow.webContents.send('K', 'Previous')
          }
        },
        {
          label: 'Newest',
          accelerator: 'g',
          click: (item, focusedWindow) => {
            mainWindow.webContents.send('g', 'Newest')
          }
        },
        {
          label: 'Oldest',
          accelerator: 'Shift+g',
          click: (item, focusedWindow) => {
            mainWindow.webContents.send('Shift+g', 'Oldest')
          }
        },
        {
          label: 'Open Browser',
          accelerator: 'L',
          click: (item, focusedWindow) => {
            mainWindow.webContents.send('L', 'Open Browser')
          }
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Reload',
          accelerator: 'R',
          click: (item, focusedWindow) => {
            mainWindow.webContents.send('R', 'Reload')
          }
        }
      ]
    }
  ]
  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

async function verifyAuth () {
  await fs.access(path.join(app.getPath('userData'), 'storage'), fs.constants.R_OK | fs.constants.W_OK, (error) => {
    if (error) {
      if (error.code === 'ENOENT') {
        fs.mkdirSync(path.join(app.getPath('userData'), 'storage'))
      } else {
        console.log(error)
        throw error
      }
    }
    const checkStorage = storage.has('auth')
    if (checkStorage.status) {
      if (!checkStorage.data) {
        fs.writeFileSync(path.join(app.getPath('userData'), 'storage', 'auth.json'), '{}')
      }
    } else {
      throw checkStorage.error
    }
    const authStorage = storage.get('auth')
    if (authStorage.status) {
      if (authStorage.data.token) {
        createWindow()
      } else {
        let auth = new Auth()
        auth.getAccessToken((token) => {
          let result = storage.set('auth', {token: token})
          if (result.status) {
            createWindow()
          } else {
            throw result.error
          }
        })
      }
    } else {
      throw authStorage.error
    }
  })
}

app.on('ready', verifyAuth)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
