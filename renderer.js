const sourceSelect = document.getElementById('sourceSelect');
const audioSelect = document.getElementById('audioSelect');
const qualitySelect = document.getElementById('qualitySelect');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const videoElement = document.getElementById('preview');
const readmeModal = document.getElementById('readmeModal');
const readmeBtn = document.getElementById('readmeBtn');
const closeModal = document.getElementById('closeModal');

const convertBtn = document.getElementById('convertBtn');
const selectFileBtn = document.getElementById('selectFileBtn');
const convertModeSelect = document.getElementById('convertModeSelect');
const progressContainer = document.getElementById('progressContainer');
const conversionProgress = document.getElementById('conversionProgress');
const progressText = document.getElementById('progressText');
const cancelConvertBtn = document.getElementById('cancelConvertBtn');
const statusText = document.getElementById('statusText');
let lastSavedFilePath = '';

let mediaRecorder;
let stream;

const consentCheckbox = document.getElementById('consentCheckbox');
startBtn.disabled = true; // Disable by default

consentCheckbox.onchange = () => {
    startBtn.disabled = !consentCheckbox.checked;
};

async function populateSources() {
    const sources = await window.electronAPI.getSources();
    
    // Create categories
    const screenGroup = document.createElement('optgroup');
    screenGroup.label = '🖥️ Entire Screens';
    
    const windowGroup = document.createElement('optgroup');
    windowGroup.label = '🪟 Application Windows';

    // Sort sources into their respective categories
    sources.forEach(source => {
        const option = document.createElement('option');
        option.value = source.id;
        option.innerText = source.name;
        
        if (source.id.startsWith('screen')) {
            screenGroup.appendChild(option);
        } else if (source.id.startsWith('window')) {
            windowGroup.appendChild(option);
        }
    });

    // Add them to the dropdown
    sourceSelect.appendChild(screenGroup);
    sourceSelect.appendChild(windowGroup);
}

async function populateAudioDevices() {
    try {
        const tempStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const devices = await navigator.mediaDevices.enumerateDevices();
        tempStream.getTracks().forEach(track => track.stop()); 

        const audioInputs = devices.filter(device => device.kind === 'audioinput');
        
        audioInputs.forEach(device => {
            const option = document.createElement('option');
            option.value = device.deviceId;
            option.innerText = device.label || `Audio Device ${audioSelect.length}`;
            audioSelect.appendChild(option);
        });
    } catch (err) {
        console.error("Audio permission error:", err);
    }
}

populateSources();
populateAudioDevices();

startBtn.onclick = async () => {
    if (!sourceSelect.value) {
        alert('Please select a screen or window to record.');
        return;
    }

    const canStart = await window.electronAPI.startFile();
    if (!canStart) return; 

    const videoConstraints = {
        audio: false,
        video: {
            mandatory: {
                chromeMediaSource: 'desktop',
                chromeMediaSourceId: sourceSelect.value
            }
        }
    };

    try {
        stream = await navigator.mediaDevices.getUserMedia(videoConstraints);

        if (audioSelect.value !== 'none') {
            const audioStream = await navigator.mediaDevices.getUserMedia({ 
                audio: { deviceId: { exact: audioSelect.value } } 
            });
            stream.addTrack(audioStream.getAudioTracks()[0]);
        }

        videoElement.srcObject = stream;

        const options = {
            mimeType: 'video/webm; codecs=vp9',
            videoBitsPerSecond: parseInt(qualitySelect.value)
        };
        
        mediaRecorder = new MediaRecorder(stream, options);

        mediaRecorder.ondataavailable = async (e) => {
            if (e.data.size > 0) {
                const buffer = await e.data.arrayBuffer();
                window.electronAPI.writeChunk(buffer); 
            }
        };

        mediaRecorder.onstop = async () => {
            lastSavedFilePath = await window.electronAPI.stopFile();
            statusText.innerText = '✅ Saved as WebM!';
            statusText.style.color = '#a6e3a1';
            convertBtn.style.display = 'block';
        };

        mediaRecorder.start(1000); // 1-second chunks to disk
        
        startBtn.disabled = true;
        sourceSelect.disabled = true;
        audioSelect.disabled = true;
        stopBtn.disabled = false;
        
    } catch (e) {
        console.error(e);
        alert('Error starting recording. Check Mac Privacy settings for Screen/Mic.');
    }
};

stopBtn.onclick = () => {
    mediaRecorder.stop();
    stream.getTracks().forEach(track => track.stop());
    
    startBtn.disabled = false;
    sourceSelect.disabled = false;
    audioSelect.disabled = false;
    stopBtn.disabled = true;
};

// --- Modal Logic ---
// Open the modal when the guide button is clicked
readmeBtn.onclick = () => {
    readmeModal.style.display = 'block';
};

// Close the modal when the 'X' is clicked
closeModal.onclick = () => {
    readmeModal.style.display = 'none';
};

// Close the modal if the user clicks anywhere outside of the popup box
window.onclick = (event) => {
    if (event.target === readmeModal) {
        readmeModal.style.display = 'none';
    }
};

// --- Listen to live FFmpeg progress ---
window.electronAPI.onProgress((data) => {
    if (data.percent !== null) {
        // WebM HAS duration metadata: Show exact 0-100%
        conversionProgress.value = data.percent;
        progressText.innerText = `${data.percent}%`;
    } else if (data.timemark) {
        // WebM is MISSING duration: Show indeterminate sliding bar + timestamp
        conversionProgress.removeAttribute('value'); // Makes the bar slide continuously
        
        // Clean up the timestamp (remove the milliseconds at the end)
        const cleanTime = data.timemark.split('.')[0]; 
        progressText.innerText = `Converted: ${cleanTime}`;
    }
});

// --- Cancel Button Logic ---
cancelConvertBtn.onclick = async () => {
    await window.electronAPI.cancelConversion();
};

// --- Unified Conversion Engine ---
async function runConversion(filePath) {
    if (!filePath) return;

    // Lock the UI
    statusText.innerText = '⏳ Converting to MP4...';
    statusText.style.color = '#f9e2af';
    convertBtn.disabled = true;
    selectFileBtn.disabled = true;
    convertModeSelect.disabled = true;

    // Show Progress Bar
    progressContainer.style.display = 'block';
    conversionProgress.value = 0;
    progressText.innerText = '0%';

    try {
        const mode = convertModeSelect.value;
        await window.electronAPI.convertToMp4(filePath, mode);
        
        statusText.innerText = `✅ Converted Successfully! Saved to same folder.`;
        statusText.style.color = '#a6e3a1';
    } catch (error) {
        // Check if the error was caused by the user clicking Cancel
        if (error.includes('SIGKILL') || error.includes('kill')) {
            statusText.innerText = '⚠️ Conversion Cancelled.';
            statusText.style.color = '#fab387';
        } else {
            console.error(error);
            statusText.innerText = '❌ Error converting file.';
            statusText.style.color = '#f38ba8';
        }
    } finally {
        // Unlock the UI
        convertBtn.disabled = false;
        selectFileBtn.disabled = false;
        convertModeSelect.disabled = false;
        progressContainer.style.display = 'none'; // Hide progress bar
    }
}

// --- Button Triggers ---
convertBtn.onclick = () => runConversion(lastSavedFilePath);

selectFileBtn.onclick = async () => {
    const filePath = await window.electronAPI.selectWebm();
    runConversion(filePath);
};
