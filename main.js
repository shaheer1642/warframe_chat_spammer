console.log('script started')
const {keyboard, Key, getActiveWindow, sleep } = require("@nut-tree/nut-js")
keyboard.config.autoDelayMs = 10
const fs = require('fs')
require('dotenv').config()
require('./modules/logreader')

if (!fs.existsSync('./config.json')) fs.writeFileSync('./config.json',JSON.stringify({
    sendMsgHotkeyNoSpam: "ctrl+num0",
    startSpammerHotkey: "ctrl+num1",
    endSpammerHotkey: "ctrl+num2",
    spamTimeoutMinInSeconds: 121,
    spamTimeoutMaxInSeconds: 300,
    pastas: [
        "discord.gg/346ZthxCe8 | Find squads for any warframe content, like eidolons archon sortie murmur hydron nightwave steel path etc.. :squad:AllSquads Warframe:squad: Discord",
        "discord.gg/346ZthxCe8 | Find squads for any warframe content, like relics archon sortie murmur hydron index arbitration voruna etc.. :squad:AllSquads Warframe:squad: Discord",
        ":squad:AllSquads Warframe:squad: Discord (not a clan) | Find squads for any warframe content | Fun community | Giveaways | discord link: discord.gg/346ZthxCe8",
        "discord.gg/346ZthxCe8 | Find squads for any warframe content, like eidolons archon sortie murmur hydron nightwave steel path etc.. :squad:AllSquads Warframe:squad: Discord",
        "discord.gg/346ZthxCe8 | Find squads for any warframe content, like relics archon sortie murmur hydron index arbitration voruna etc.. :squad:AllSquads Warframe:squad: Discord",
        ":squad:AllSquads Warframe:squad: Discord (not a clan) | Find squads for any warframe content | Fun community | Giveaways | discord link: discord.gg/346ZthxCe8",
        "discord.gg/346ZthxCe8 | Find squads for any warframe content, like relics archon sortie murmur hydron index arbitration voruna etc.. :squad:AllSquads Warframe:squad: Discord"
    ]
}))

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
  
  globalShortcut.register(require('./config.json').sendMsgHotkeyNoSpam, sendCustomPasta)
  globalShortcut.register(require('./config.json').startSpammerHotkey, () => {
      console.log('starting auto spammer')
      startSpammerHotkey()
  })
  globalShortcut.register(require('./config.json').endSpammerHotkey, () => {
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
function startSpammerHotkey() {
    sendCustomPasta()
    const seconds = randomIntFromInterval(require('./config.json').spamTimeoutMinInSeconds, require('./config.json').spamTimeoutMaxInSeconds)
    startSpammerHotkeyTimer = setTimeout(startSpammerHotkey, seconds * 1000);
    console.log('[autoSpammer] sending next msg after',seconds,'seconds')
}
function endSpammerHotkey() {
    clearTimeout(startSpammerHotkeyTimer)
    console.log('stopped auto spammer')
}

async function sendCustomPasta() {
    const windowRef = await getActiveWindow()
    const title = await windowRef.title
    if (title.toLowerCase().match('warframe')) {
        const msg = get_random(require('./config.json').pastas)
        clipboard.writeText(msg)
        sleep(500)
        await keyboard.pressKey(Key.LeftControl)
        await keyboard.pressKey(Key.V)
        await keyboard.releaseKey(Key.V)
        await keyboard.releaseKey(Key.LeftControl)
        await keyboard.pressKey(Key.Enter)
        await keyboard.releaseKey(Key.Enter)
        setTimeout(async () => {
            await keyboard.pressKey(Key.T)
            await keyboard.releaseKey(Key.T)
            await keyboard.pressKey(Key.Backspace)
            await keyboard.releaseKey(Key.Backspace)
        }, 100);
        console.log('Sent msg:',msg)
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
