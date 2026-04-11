const { app, BrowserWindow, ipcMain, desktopCapturer, dialog, shell, systemPreferences, session } = require('electron');
const path = require('path');
const fs = require('fs');

const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');

// In packaged builds, ffmpeg-static is unpacked outside the ASAR archive.
// The require() path still points inside app.asar, so we fix it to app.asar.unpacked.
const ffmpegPath = ffmpegStatic.replace('app.asar', 'app.asar.unpacked');
ffmpeg.setFfmpegPath(ffmpegPath);

let mainWindow;
let writeStream; 
let currentFilePath;

// --- NEW: Wrap window creation in a reusable function ---
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 750,
    icon: path.join(__dirname, 'assets', 'icon.png'), 
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  mainWindow.loadFile('index.html');
}

app.whenReady().then(async () => {
  // On macOS, explicitly request camera & microphone access so the OS shows
  // the permission prompt and the app appears in System Settings > Privacy.
  if (process.platform === 'darwin') {
    await systemPreferences.askForMediaAccess('camera');
    await systemPreferences.askForMediaAccess('microphone');
  }

  // Explicitly allow media permissions at the Electron session level.
  // Without this, packaged builds silently block getUserMedia requests.
  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    const allowed = ['media', 'display-capture', 'mediaKeySystem', 'camera', 'microphone']; 
    callback(allowed.includes(permission));
  });

  session.defaultSession.setPermissionCheckHandler((webContents, permission) => {
    const allowed = ['media', 'display-capture', 'mediaKeySystem', 'camera', 'microphone']; 
    return allowed.includes(permission);
  });

  // --- NEW: Call the function to create the initial window ---
  createWindow();

  // --- NEW: Listen for macOS dock clicks ---
  app.on('activate', () => {
    // If the app is active but no windows are open (e.g., user clicked the red 'X'), recreate the window
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

ipcMain.handle('check-updates', async () => {
  try {
    const response = await fetch('https://api.github.com/repos/chirag-ganguli/pro-recorder/releases/latest');
    const data = await response.json();
    const latestVersion = data.tag_name;
    if (!latestVersion) return null;
    
    const currentVersion = app.getVersion();
    const cleanLatest = latestVersion.replace(/^v/, '');
    const cleanCurrent = currentVersion.replace(/^v/, '');
    
    const vL = cleanLatest.split('.').map(Number);
    const vC = cleanCurrent.split('.').map(Number);
    
    let isNewer = false;
    for(let i=0; i<Math.max(vL.length, vC.length); i++) {
       const left = vL[i] || 0;
       const right = vC[i] || 0;
       if (left > right) { isNewer = true; break; }
       if (left < right) { break; }
    }
    
    if (isNewer) {
        return { available: true, version: cleanLatest, url: data.html_url };
    }
    return { available: false };
  } catch(e) {
    console.error('Update check failed:', e);
    return { available: false };
  }
});

ipcMain.handle('open-url', (event, url) => {
    shell.openExternal(url);
});

// Fetch screens and windows to record
ipcMain.handle('get-sources', async () => {
  try {
    const sources = await desktopCapturer.getSources({ types: ['window', 'screen'] });
    return sources.map(source => ({ id: source.id, name: source.name }));
  } catch (error) {
    console.error("OS Blocked Screen Capture:", error.message);
    // Return an empty array so the frontend doesn't break, 
    // it just won't populate the dropdown.
    return []; 
  }
});

// Prompt user for save location and open file stream
ipcMain.handle('start-recording-file', async () => {
  const { filePath } = await dialog.showSaveDialog(mainWindow, {
    title: 'Save Recording',
    defaultPath: `Recording-${Date.now()}.webm`,
    filters: [{ name: 'Movies', extensions: ['webm'] }]
  });

  if (filePath) {
    currentFilePath = filePath; // Save the path
    writeStream = fs.createWriteStream(filePath);
    return true; 
  }
  return false; 
});

ipcMain.handle('stop-recording-file', () => {
  if (writeStream) {
    writeStream.end();
    writeStream = null;
  }
  return currentFilePath;
});

ipcMain.handle('select-webm-file', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    title: 'Select a WebM file to convert',
    filters: [{ name: 'WebM Video', extensions: ['webm'] }],
    properties: ['openFile']
  });

  if (canceled || filePaths.length === 0) {
    return null; // User clicked cancel
  }
  return filePaths[0]; // Return the path of the file they selected
});

// FFMPEG Conversion Variables
let activeFfmpegCommand = null;

// The Conversion Engine
ipcMain.handle('convert-to-mp4', async (event, inputPath, mode) => {
  const outputPath = inputPath.replace('.webm', '.mp4');
  
  return new Promise((resolve, reject) => {
    activeFfmpegCommand = ffmpeg(inputPath);

    // Apply settings based on what the user selected in the dropdown
    if (mode === 'fast') {
      activeFfmpegCommand.outputOptions(['-c:v copy', '-c:a aac']);
    } else {
      activeFfmpegCommand.outputOptions([
        '-c:v libx264', '-preset fast', '-crf 23', '-pix_fmt yuv420p', 
        '-c:a aac', '-b:a 192k'
      ]);
    }

    activeFfmpegCommand
      .on('progress', (progress) => {
        // Send the percentage back to the frontend live
        if (mainWindow) {
          mainWindow.webContents.send('ffmpeg-progress', {
            percent: progress.percent ? Math.round(progress.percent) : null,
            timemark: progress.timemark // Looks like '00:01:23.45'
          });
        }
      })
      .on('end', () => {
        activeFfmpegCommand = null;
        resolve(outputPath);
      })
      .on('error', (err) => {
        activeFfmpegCommand = null;
        reject(err.message);
      })
      .save(outputPath);
  });
});

// The Cancel Engine
ipcMain.handle('cancel-conversion', () => {
  if (activeFfmpegCommand) {
    activeFfmpegCommand.kill('SIGKILL'); // Force kill the background process
    activeFfmpegCommand = null;
    return true;
  }
  return false;
});

// Receive video chunks every second and write to disk
ipcMain.on('write-chunk', (event, arrayBuffer) => {
  if (writeStream) {
    writeStream.write(Buffer.from(arrayBuffer));
  }
});

// Close the file stream when recording stops
ipcMain.on('stop-recording-file', () => {
  if (writeStream) {
    writeStream.end();
    writeStream = null;
  }
});

// Keep app alive in dock on Mac when all windows are closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});