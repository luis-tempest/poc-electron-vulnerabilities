// const electron = require('electron');
const url = require('url');
const path = require('path');

const {app, BrowserWindow, Menu, ipcMain} = require('electron');

let mainWindow;
let addWindow;

// Listen for app to be ready
app.on('ready', function(){
    //Create new window
    mainWindow = new BrowserWindow({
        webPreferences:{
            nodeIntegration: true,
        }
    });

    //Load html into window
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'mainWindow.html'),
        protocol: 'file:',
        slashes: true,
    }));
    //Quit app when closed
    mainWindow.on('close', function(){
        app.quit();
    });

    //Build menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);

    //Insert menu
    Menu.setApplicationMenu(mainMenu);

});

//Handle create add window
function createAddWindow(){

    //Create new window
    addWindow = new BrowserWindow({
        width:300,
        height:200,
        title:'Add Shopping List Item',
        webPreferences:{
            nodeIntegration: true
        }
    });

    //Load html into window
    addWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'addWindow.html'),
    protocol: 'file:',
    slashes: true,
    }));
    //Garbage collenction handle
    addWindow.on('close', function(){
        addWindow=null;
    });
}

function nodeRceWindow(){

    // payload
    // <script> require('child_process').execFile('gnome-calculator',function(){})</script>
    // <script> require('child_process').exec('gnome-calculator')</script>
    addWindow = new BrowserWindow({
        title:'Node Integration RCE',
        webPreferences:{
            nodeIntegration: true
        }
    });
    addWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'nodeIntegrationRce.html'),
        protocol: 'file:',
        slashes: true,
    }));
    //Garbage collenction handle
    addWindow.on('close', function(){
        addWindow=null;
    });

}
function sandboxRceWindow(){

    //payload => preload-script
    //<script>nativos.modulosNativos.exec('gnome-calculator')</script>

    addWindow = new BrowserWindow({
        title:'Sandbox RCE',
        webPreferences:{
            preload: path.join(app.getAppPath(), 'preload.js')
        }
    });
    addWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'nodeIntegrationRce.html'),
        protocol: 'file:',
        slashes: true,
    }));
    //Garbage collenction handle
    addWindow.on('close', function(){
        addWindow=null;
    });

}
function contextIsolationRceWindow(){

    addWindow = new BrowserWindow({
        title:'Context Isolation RCE',
        webPreferences:{
            sandbox: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    addWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'nodeIntegrationRce.html'),
        protocol: 'file:',
        slashes: true,
    }));
    
    //Garbage collenction handle
    addWindow.on('close', function(){
        addWindow=null;
    });

}
//Catch item:add
ipcMain.on('item:add', function(e, item){
    //Send to the main window
    mainWindow.webContents.send('item:add', item);
    addWindow.close();
});

//Create menu template
const mainMenuTemplate = [
    {
        label:'File',
        submenu:[
            {
                label:"Add Item",
                click(){
                    createAddWindow();
                }
            },
            {
                label:"Node Integration RCE",
                accelerator: process.plataform == 'darwin' ? 'Command+1' : 'Ctrl+1',
                click(){
                    nodeRceWindow();
                }
            },
            {
                label:"Sandbox RCE",
                accelerator: process.plataform == 'darwin' ? 'Command+2' : 'Ctrl+2',
                click(){
                    sandboxRceWindow();         
                }
            },
            {
                label:"Context Isolation RCE",
                accelerator: process.plataform == 'darwin' ? 'Command+3' : 'Ctrl+3',
                click(){
                    contextIsolationRceWindow();
                }
            },
            {
                label:"Preload Script RCE",
                accelerator: process.plataform == 'darwin' ? 'Command+4' : 'Ctrl+4',
                click(){
                    preloadScriptRceWindow();
                }
            },
            // {
            //     label:"Clear Items"
            // },
            {
                label:"Quit",
                accelerator: process.plataform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
                click(){
                    app.quit();
                }
            }
        ]
    }
];


// If mac, add empty object
if(process.plataform == 'darwin'){
    //add {} to the array's beginning
    mainMenuTemplate.unshift({});
}

//Add developer tools item if not in prod
if(process.env.NODE_ENV !== 'production'){
    mainMenuTemplate.push({
        label:'Dev Tools',
        submenu:[
            {
                label: 'Toggle DevTools',
                accelerator: process.plataform == 'darwin' ? 'Command+I' : 'Ctrl+I',
                click(item, focusedWindow){
                    focusedWindow.toggleDevTools();
                }
            },
            {
                role: 'reload'
            }
        ]
    });
}