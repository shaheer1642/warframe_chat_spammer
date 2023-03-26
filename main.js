console.log('script started')
const {keyboard, Key, getActiveWindow, sleep, mouse, screen, Button } = require("@nut-tree/nut-js")
keyboard.config.autoDelayMs = 10
const fs = require('fs')
const os = require('os')
require('dotenv').config()
require('./modules/logreader')

const appFolder = os.homedir() + '/Documents/warframe_chat_spammer'
const configPath = os.homedir() + '/Documents/warframe_chat_spammer/config.json'
var config = {}
try {
  fs.mkdirSync(appFolder);
} catch (e) {}

const screenSize = {
  width: 1280,
  height: 720
}
getScreenSize()
async function getScreenSize() {
  screenSize.width = await screen.width()
  screenSize.height = await screen.height()
  console.log(screenSize)
}


if (!fs.existsSync(configPath)) {
  fs.writeFileSync(configPath,JSON.stringify({
    sendMsgHotkeyNoSpam: "ctrl+num0",
    startSpammerHotkey: "ctrl+num1",
    endSpammerHotkey: "ctrl+num2",
    spamTimeoutMinInSeconds: 121,
    spamTimeoutMaxInSeconds: 240,
    pastas: [
        "Aya farm, vaulted relics, eidolons, archon hunt, liches, murmur, sisters, steel path, incursions, index, arbitration, sorties - find squads on: allsquads.com",
        "Aya farm, vaulted relics, eidolons, archon hunt, liches, murmur, sisters, steel path, incursions, index, arbitration, sorties - find squads on: allsquads.com",
        "Do you have vaulted relics? Loki volt saryn nekros mag relics etc. etc.? Join our community to open them together: allsquads.com",
    ],
    multiClientSpam: false
  }))
}

config = JSON.parse(fs.readFileSync(configPath))

fs.watchFile(configPath,() => {
  console.log('config changed')
  config = JSON.parse(fs.readFileSync(configPath))
})
// main.js

// Modules to control application life and create native browser window
const { globalShortcut, app, BrowserWindow, clipboard } = require('electron')
const path = require('path')

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
  
  globalShortcut.register(config.sendMsgHotkeyNoSpam, sendCustomPasta)
  globalShortcut.register(config.startSpammerHotkey, () => {
      console.log('starting auto spammer')
      startSpammerHotkey()
  })
  globalShortcut.register(config.endSpammerHotkey, () => {
      console.log('stopping auto spammer...')
      endSpammerHotkey()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.


var startSpammerHotkeyTimer = null
const screenSwitch = {
  x: screenSize.width * .25,
  y: screenSize.height * .5,
}

var screenToggle = true
function toggleScreenSwitch() {
  screenToggle = !screenToggle
  screenSwitch.x = screenToggle ? screenSize.width * .25 : screenSize.width * .75
  screenSwitch.y = screenSize.height * .5
}

function startSpammerHotkey() {
    sendCustomPasta(async () => {
      if (config.multiClientSpam) {
        toggleScreenSwitch()
        await mouse.setPosition(screenSwitch).catch(console.error)
        await mouse.click(Button.LEFT).catch(console.error)
        await sleep(500)
        sendCustomPasta()
      }
      const seconds = randomIntFromInterval(config.spamTimeoutMinInSeconds, config.spamTimeoutMaxInSeconds)
      startSpammerHotkeyTimer = setTimeout(startSpammerHotkey, seconds * 1000);
      console.log('[autoSpammer] sending next msg after',seconds,'seconds')
    })
}
function endSpammerHotkey() {
    clearTimeout(startSpammerHotkeyTimer)
    console.log('stopped auto spammer')
}

async function sendCustomPasta(callback) {
    const windowRef = await getActiveWindow()
    const title = await windowRef.title
    if (title == 'Warframe') {
        const msg = get_random(config.pastas)
        clipboard.writeText(msg)
        await sleep(500)
        await keyboard.pressKey(Key.LeftControl)
        await keyboard.pressKey(Key.V)
        await keyboard.releaseKey(Key.V)
        await keyboard.releaseKey(Key.LeftControl)
        await keyboard.pressKey(Key.Enter)
        await keyboard.releaseKey(Key.Enter)
        await sleep(100)
        await keyboard.pressKey(Key.T)
        await keyboard.releaseKey(Key.T)
        await keyboard.pressKey(Key.Backspace)
        await keyboard.releaseKey(Key.Backspace)
        console.log('Sent msg:',msg)
        if (callback) callback()
    } else {
        console.log('failed to send msg, warframe is not active')
    }
}

function get_random (list) {
  return list[Math.floor((Math.random()*list.length))];
}

function randomIntFromInterval(min, max) { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min)
}
