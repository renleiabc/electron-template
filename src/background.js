/*
 * @Author: abc
 * @Date: 2020-10-27 16:10:40
 * @LastEditors: abc
 * @LastEditTime: 2020-10-27 17:06:48
 * @Description:electron主线程配置文件
 */
"use strict";

import {
  Menu,
  app,
  protocol,
  BrowserWindow,
  globalShortcut,
  dialog
} from "electron";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
import { autoUpdater } from "electron-updater";
// const { ipcMain } = require("electron");
import installExtension, { VUEJS_DEVTOOLS } from "electron-devtools-installer";
const isDevelopment = process.env.NODE_ENV !== "production";

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { secure: true, standard: true } }
]);

function createWindow() {
  // 设置导航栏函数调用
  createMenu();
  // Create the browser window.
  win = new BrowserWindow({
    width: 900,
    height: 620,
    useContentSize: true,
    titleBarStyle: "hidden",
    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      // eslint-disable-next-line no-undef
      preload: `${__static}/preload.js`,
      // eslint-disable-next-line no-undef
      icon: `${__static}/img/icons/favicon.ico`
    }
  });
  if (process.platform === "darwin") {
    // eslint-disable-next-line no-undef
    app.dock.setIcon(`${__static}/img/icons/512.png`);
  }

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    win.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
    // if (!process.env.IS_TEST) win.webContents.openDevTools();
  } else {
    createProtocol("app");
    // Load the index.html when not in development
    win.loadURL("app://./index.html");
    // 启动更新检查
    autoUpdater.checkForUpdates();
  }

  win.on("closed", () => {
    win = null;
  });

  globalShortcut.register("CommandOrControl+Shift+i", function () {
    win.webContents.openDevTools();
  });
}
// 设置菜单栏
function createMenu() {
  // darwin表示macOS，针对macOS的设置
  if (process.platform === "darwin") {
    const template = [
      {
        label: "electorn-my-app",
        submenu: [
          {
            role: "about"
          },
          {
            role: "quit"
          }
        ]
      }
    ];
    let menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  } else {
    // windows及linux系统
    Menu.setApplicationMenu(null);
  }
}

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow();
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS);
    } catch (e) {
      console.error("Vue Devtools failed to install:", e.toString());
    }
  }
  createWindow();
});
autoUpdater.on("checking-for-update", () => {});
autoUpdater.on("update-available", (info) => {
  console.log(info);
  dialog.showMessageBox({
    title: "新版本发布",
    message: "有新内容更新，稍后将重新为您安装",
    buttons: ["确定"],
    type: "info",
    noLink: true
  });
});
// autoUpdater.on("update-not-available", (info) => {});
// autoUpdater.on("error", (err) => {});
// autoUpdater.on("download-progress", (progressObj) => {});
autoUpdater.on("update-downloaded", (info) => {
  console.log(info);
  autoUpdater.quitAndInstall();
});
// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === "win32") {
    process.on("message", (data) => {
      if (data === "graceful-exit") {
        app.quit();
      }
    });
  } else {
    process.on("SIGTERM", () => {
      app.quit();
    });
  }
}
