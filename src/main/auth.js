import { Menu, BrowserWindow } from 'electron'
import request from 'request'
import fs from 'fs'
import path from 'path'

const options = {
  client_id: '',
  client_secret: '',
  scopes: ['read_qiita_team', 'write_qiita_team']
}

export default class Auth {
  constructor () {
    const config = JSON.parse(fs.readFileSync(path.join(__static, './config.json')))
    options.client_id = config.client_id
    options.client_secret = config.client_secret
  }
  getAccessToken (callback) {
    let authWindow = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        nodeIntegration: false,
        webSecurity: false
      }
    })
    setupMenu()
    const state = this.generateState()
    const authUrl = 'https://qiita.com/api/v2/oauth/authorize?client_id=' + options.client_id + '&scope=' + options.scopes.join('+') + '&state=' + state

    authWindow.loadURL(authUrl)

    authWindow.webContents.on('will-navigate', (event, url) => {
      const queryStrings = /\?(.*)/.exec(url)
      const params = queryStrings[1].split('&')
      var args = {}
      for (let i = 0; i < params.length; i++) {
        const kv = params[i].split('=')
        args[kv[0]] = kv[1]
      }
      if (args['state'] !== state) {
        console.log("[warning] State doesn't match.")
      }
      if (args['code'] || args['error']) {
        authWindow.close()
      }
      this.generateToken(args['code'], (token) => {
        callback(token)
      })
    })
  }

  generateToken (code, callback) {
    const tokenUrl = 'https://qiita.com/api/v2/access_tokens'

    request.post({
      url: tokenUrl,
      json: {
        client_id: options.client_id,
        client_secret: options.client_secret,
        code: code
      }
    }, (error, response, body) => {
      if (error) throw error
      if (body.token) {
        callback(body.token)
      }
    })
  }

  generateState () {
    const c = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    const len = c.length
    let state = ''
    for (let i = 0; i < 16; i++) {
      state += c[Math.floor(Math.random() * len)]
    }
    return state
  }
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
      label: 'Edit',
      submenu: [
        { label: 'Undo', accelerator: 'CmdOrCtrl+Z', selector: 'undo:' },
        { label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', selector: 'redo:' },
        { type: 'separator' },
        { label: 'Cut', accelerator: 'CmdOrCtrl+X', selector: 'cut:' },
        { label: 'Copy', accelerator: 'CmdOrCtrl+C', selector: 'copy:' },
        { label: 'Paste', accelerator: 'CmdOrCtrl+V', selector: 'paste:' },
        { label: 'Select All', accelerator: 'CmdOrCtrl+A', selector: 'selectAll:' }
      ]
    }
  ]
  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}
