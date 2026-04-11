const sourceSelect = document.getElementById('sourceSelect');
const audioSelect = document.getElementById('audioSelect');
const qualitySelect = document.getElementById('qualitySelect');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const videoElement = document.getElementById('preview');
const readmeModal = document.getElementById('readmeModal');
const readmeBtn = document.getElementById('readmeBtn');
const closeModal = document.getElementById('closeModal');
const updateBtn = document.getElementById('updateBtn');

const convertBtn = document.getElementById('convertBtn');
const selectFileBtn = document.getElementById('selectFileBtn');
const convertModeSelect = document.getElementById('convertModeSelect');
const progressContainer = document.getElementById('progressContainer');
const conversionProgress = document.getElementById('conversionProgress');
const progressText = document.getElementById('progressText');
const cancelConvertBtn = document.getElementById('cancelConvertBtn');
const statusText = document.getElementById('statusText');
let lastSavedFilePath = '';

const cameraSelect = document.getElementById('cameraSelect');
const cameraPreview = document.getElementById('cameraPreview');
const compositorCanvas = document.getElementById('compositor');
let compositorCtx = compositorCanvas.getContext('2d', { alpha: false });
let renderLoopId;
let camStream;
let isRecording = false;

let mediaRecorder;
let stream;
let previewStream;

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

async function populateDevices() {
    try {
        let tempStream;
        try { tempStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true }); }
        catch (e) {
            try { tempStream = await navigator.mediaDevices.getUserMedia({ audio: true }); } catch (e2) { }
        }

        const devices = await navigator.mediaDevices.enumerateDevices();
        if (tempStream) tempStream.getTracks().forEach(track => track.stop());

        const audioInputs = devices.filter(device => device.kind === 'audioinput');
        const videoInputs = devices.filter(device => device.kind === 'videoinput');

        audioInputs.forEach(device => {
            const option = document.createElement('option');
            option.value = device.deviceId;
            option.innerText = device.label || `Audio Device ${audioSelect.length}`;
            audioSelect.appendChild(option);
        });

        videoInputs.forEach(device => {
            const option = document.createElement('option');
            option.value = device.deviceId;
            option.innerText = device.label || `Camera Device ${cameraSelect.length}`;
            cameraSelect.appendChild(option);
        });
    } catch (err) {
        console.error("Device permission error:", err);
    }
}

populateSources();
populateDevices();

// Check for updates quietly in the background
window.electronAPI.checkUpdates().then(update => {
    if (update && update.available && update.version) {
        updateBtn.innerText = `✨ Update to v${update.version}`;
        updateBtn.style.display = 'block';
        updateBtn.onclick = () => window.electronAPI.openUrl(update.url);
    }
}).catch(() => {});

// --- Camera Selector Logic ---
cameraSelect.addEventListener('change', async () => {
    if (camStream) {
        camStream.getTracks().forEach(track => track.stop());
        camStream = null;
    }

    if (cameraSelect.value === 'none') {
        cameraPreview.style.display = 'none';
        cameraPreview.srcObject = null;
        return;
    }

    try {
        camStream = await navigator.mediaDevices.getUserMedia({
            video: { deviceId: { exact: cameraSelect.value } }
        });
        cameraPreview.srcObject = camStream;
        cameraPreview.style.display = 'block';
    } catch (e) {
        console.error('Camera error:', e);
    }
});

// --- Draggable Camera UI ---
let isDragging = false;
let dragOffsetX = 0, dragOffsetY = 0;

cameraPreview.addEventListener('mousedown', (e) => {
    isDragging = true;
    const rect = cameraPreview.getBoundingClientRect();
    dragOffsetX = e.clientX - rect.left;
    dragOffsetY = e.clientY - rect.top;
});

function getVideoActiveArea(video) {
    if (!video || !video.videoWidth || !video.videoHeight) return null;
    const videoRatio = video.videoWidth / video.videoHeight;
    const elementRatio = video.clientWidth / video.clientHeight;
    let renderWidth, renderHeight, xOffset, yOffset;

    if (elementRatio > videoRatio) {
        renderHeight = video.clientHeight;
        renderWidth = video.clientHeight * videoRatio;
        xOffset = (video.clientWidth - renderWidth) / 2;
        yOffset = 0;
    } else {
        renderWidth = video.clientWidth;
        renderHeight = video.clientWidth / videoRatio;
        xOffset = 0;
        yOffset = (video.clientHeight - renderHeight) / 2;
    }
    return { renderWidth, renderHeight, xOffset, yOffset };
}

window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const parentRect = cameraPreview.parentElement.getBoundingClientRect();

    let newLeft = e.clientX - parentRect.left - dragOffsetX;
    let newTop = e.clientY - parentRect.top - dragOffsetY;

    const area = getVideoActiveArea(videoElement);
    let minLeft = 0, minTop = 0;
    let maxLeft = parentRect.width - cameraPreview.offsetWidth;
    let maxTop = parentRect.height - cameraPreview.offsetHeight;

    if (area) {
        minLeft = area.xOffset;
        minTop = area.yOffset;
        maxLeft = area.xOffset + area.renderWidth - cameraPreview.offsetWidth;
        maxTop = area.yOffset + area.renderHeight - cameraPreview.offsetHeight;
    }

    newLeft = Math.max(minLeft, Math.min(newLeft, maxLeft));
    newTop = Math.max(minTop, Math.min(newTop, maxTop));

    cameraPreview.style.right = 'auto'; // Disable CSS right
    cameraPreview.style.left = `${newLeft}px`;
    cameraPreview.style.top = `${newTop}px`;
});

window.addEventListener('mouseup', () => {
    isDragging = false;
});

sourceSelect.addEventListener('change', async () => {
    if (previewStream) {
        previewStream.getTracks().forEach(track => track.stop());
    }

    if (!sourceSelect.value) {
        videoElement.srcObject = null;
        return;
    }

    try {
        const videoConstraints = {
            audio: false,
            video: {
                mandatory: {
                    chromeMediaSource: 'desktop',
                    chromeMediaSourceId: sourceSelect.value
                }
            }
        };
        previewStream = await navigator.mediaDevices.getUserMedia(videoConstraints);
        videoElement.srcObject = previewStream;
    } catch (e) {
        console.error('Preview error:', e);
    }
});

startBtn.onclick = async () => {
    if (!sourceSelect.value) {
        alert('Please select a screen or window to record.');
        return;
    }

    const canStart = await window.electronAPI.startFile();
    if (!canStart) return;

    if (previewStream) {
        previewStream.getTracks().forEach(track => track.stop());
        previewStream = null;
    }

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
        isRecording = true;

        let finalStreamToRecord = stream;

        // --- Canvas Composition Strategy ---
        if (camStream) {
            compositorCanvas.width = videoElement.videoWidth || 1920;
            compositorCanvas.height = videoElement.videoHeight || 1080;

            const combinedStream = compositorCanvas.captureStream(30);

            // Re-bind all audio tracks
            stream.getAudioTracks().forEach(track => combinedStream.addTrack(track));

            function renderLoop() {
                if (!isRecording) return;

                // Track dynamic sizing
                if (videoElement.videoWidth && videoElement.videoWidth !== compositorCanvas.width) {
                    compositorCanvas.width = videoElement.videoWidth;
                    compositorCanvas.height = videoElement.videoHeight;
                }

                // Clear backbuffer
                compositorCtx.clearRect(0, 0, compositorCanvas.width, compositorCanvas.height);

                // Render Screen
                if (videoElement.videoWidth > 0 && videoElement.videoHeight > 0) {
                    compositorCtx.drawImage(videoElement, 0, 0, compositorCanvas.width, compositorCanvas.height);
                }

                // Render Camera Overlay geometrically mapped
                if (cameraPreview.videoWidth > 0 && cameraPreview.videoHeight > 0) {
                    const area = getVideoActiveArea(videoElement);
                    const wrapperRect = videoElement.getBoundingClientRect();
                    const camRect = cameraPreview.getBoundingClientRect();

                    const relX = (camRect.left - wrapperRect.left) - area.xOffset;
                    const relY = (camRect.top - wrapperRect.top) - area.yOffset;

                    const scaleX = compositorCanvas.width / area.renderWidth;
                    const scaleY = compositorCanvas.height / area.renderHeight;

                    const finalX = relX * scaleX;
                    const finalY = relY * scaleY;
                    const finalW = camRect.width * scaleX;
                    const finalH = camRect.height * scaleY;

                    compositorCtx.save();
                    compositorCtx.beginPath();
                    if (compositorCtx.roundRect) {
                        compositorCtx.roundRect(finalX, finalY, finalW, finalH, 12 * scaleX);
                    } else {
                        compositorCtx.rect(finalX, finalY, finalW, finalH);
                    }
                    compositorCtx.clip();

                    const camRatio = cameraPreview.videoWidth / cameraPreview.videoHeight;
                    const targetRatio = finalW / finalH;
                    let sx = 0, sy = 0, sw = cameraPreview.videoWidth, sh = cameraPreview.videoHeight;

                    if (camRatio > targetRatio) {
                        sw = cameraPreview.videoHeight * targetRatio;
                        sx = (cameraPreview.videoWidth - sw) / 2;
                    } else {
                        sh = cameraPreview.videoWidth / targetRatio;
                        sy = (cameraPreview.videoHeight - sh) / 2;
                    }

                    compositorCtx.drawImage(cameraPreview, sx, sy, sw, sh, finalX, finalY, finalW, finalH);
                    compositorCtx.restore();

                    // Draw outer border ring (Glassmorphic vibe)
                    compositorCtx.strokeStyle = '#89b4fa';
                    compositorCtx.lineWidth = 3 * scaleX;
                    compositorCtx.beginPath();
                    if (compositorCtx.roundRect) {
                        compositorCtx.roundRect(finalX, finalY, finalW, finalH, 12 * scaleX);
                    } else {
                        compositorCtx.rect(finalX, finalY, finalW, finalH);
                    }
                    compositorCtx.stroke();
                }

                renderLoopId = requestAnimationFrame(renderLoop);
            }

            // Kickstart loop
            renderLoopId = requestAnimationFrame(renderLoop);
            finalStreamToRecord = combinedStream;
        }

        const options = {
            mimeType: 'video/webm; codecs=vp9',
            videoBitsPerSecond: parseInt(qualitySelect.value)
        };

        mediaRecorder = new MediaRecorder(finalStreamToRecord, options);

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
    isRecording = false; // Stop canvas render loop
    mediaRecorder.stop();
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }

    startBtn.disabled = false;
    sourceSelect.disabled = false;
    audioSelect.disabled = false;
    stopBtn.disabled = true;

    // Restart the preview
    sourceSelect.dispatchEvent(new Event('change'));
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
