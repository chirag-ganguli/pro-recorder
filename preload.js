const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getSources: () => ipcRenderer.invoke('get-sources'),
  startFile: () => ipcRenderer.invoke('start-recording-file'),
  writeChunk: (buffer) => ipcRenderer.send('write-chunk', buffer),
  stopFile: () => ipcRenderer.invoke('stop-recording-file'),
  selectWebm: () => ipcRenderer.invoke('select-webm-file'),
  
  // Updated FFmpeg functions:
  convertToMp4: (filePath, mode) => ipcRenderer.invoke('convert-to-mp4', filePath, mode),
  cancelConversion: () => ipcRenderer.invoke('cancel-conversion'),
  onProgress: (callback) => ipcRenderer.on('ffmpeg-progress', (event, value) => callback(value))
});