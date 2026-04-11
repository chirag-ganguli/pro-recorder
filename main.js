const { app, BrowserWindow, ipcMain, desktopCapturer, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');
ffmpeg.setFfmpegPath(ffmpegStatic);

let mainWindow;
let writeStream; 

app.whenReady().then(() => {
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

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});