const { app, BrowserWindow } = require("electron");
let win = null;
app.on("ready", _ => {
    win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true
        },
    });
    win.setMenuBarVisibility(false);
    win.loadFile('app/index.html');
});
