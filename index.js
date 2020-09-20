const { app, BrowserWindow } = require("electron");
//import {app, BrowserWindow} from "electron";
let win = null;
app.on("ready", _ => {
    win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true
        },
        icon: "app/images/icon.png",
        resizable: false
    });
    win.setMenuBarVisibility(false);
    win.loadFile('app/index.html');
});
