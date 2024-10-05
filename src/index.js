const { app, autoUpdater, BrowserWindow, shell } = require("electron");
const path = require("node:path");

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient("manifest", process.execPath, [
      path.resolve(process.argv[1]),
    ]);
  }
} else {
  app.setAsDefaultProtocolClient("manifest");
}

const createWindow = () => {
  win = new BrowserWindow({
    width: 1600,
    height: 1000,
    minWidth: 1000, // Set minimum width
    minHeight: 800, // Set minimum height
    frame: false, // Disable default frame
    transparent: false, // Enable transparency
    titleBarStyle: "hidden",
    trafficLightPosition: { x: 20, y: 20 }, // Adjust as needed
    icon: "./assets/logo.png", // Add this line
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  win.loadURL("https://platform.manifest-hq.com/");

  // Inject a custom class to the body element
  win.webContents.on("did-finish-load", () => {
    win.webContents.executeJavaScript(`
      document.body.classList.add('electron-app')
    `);
  });

  // Optional: Set the background color with alpha for transparency
  win.setBackgroundColor("#FAF9F7");

  win.webContents.on("will-navigate", (event, url) => {
    if (url !== win.webContents.getURL()) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  // Handle external links
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  // Handle custom protocol for auth redirect
  handleAuthRedirect(win);
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  checkUpdates();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

function checkUpdates() {
  const server = "https://update.electronjs.org";
  const feed = `${server}/Manifest-HQ/desktop-app/${
    process.platform
  }/${app.getVersion()}`;

  autoUpdater.setFeedURL(feed);
  console.log(feed);

  // Check for updates immediately
  autoUpdater.checkForUpdates();

  // Check for updates every 10 minutes
  setInterval(() => {
    autoUpdater.checkForUpdates();
  }, 10 * 60 * 1000);
}

function handleAuthRedirect(win) {
  const protocol = "manifest";
  app.setAsDefaultProtocolClient(protocol);

  app.on("open-url", (event, url) => {
    event.preventDefault();
    const urlObj = new URL(url);
    if (urlObj.protocol === `${protocol}:`) {
      win.webContents.send("auth-callback", url);
    }
  });

  // Handle the protocol on Windows
  app.on("second-instance", (event, commandLine) => {
    const url = commandLine.pop();
    if (url.startsWith(`${protocol}:`)) {
      win.webContents.send("auth-callback", url);
    }
  });
}

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
