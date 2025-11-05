let mediaRecorder;
let audioChunks = [];
let audioBlob;

const recordBtn = document.getElementById('recordBtn');
const stopBtn = document.getElementById('stopBtn');
const uploadBtn = document.getElementById('uploadBtn');
const audioPlayer = document.getElementById('audioPlayer');
const audioPlayback = document.getElementById('audioPlayback');
const statusIndicator = document.getElementById('statusIndicator');
const statusText = document.getElementById('statusText');
const loadingIndicator = document.getElementById('loadingIndicator');
const transcriptionsList = document.getElementById('transcriptionsList');

// Request microphone access and setup recorder
async function setupRecorder() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        
        mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
        };
        
        mediaRecorder.onstop = () => {
            audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            const audioUrl = URL.createObjectURL(audioBlob);
            audioPlayer.src = audioUrl;
            audioPlayback.style.display = 'block';
            statusText.textContent = 'Recording complete';
            statusIndicator.classList.remove('recording');
        };
        
    } catch (error) {
        console.error('Error accessing microphone:', error);
        alert('Unable to access microphone. Please check permissions.');
    }
}

// Start recording
recordBtn.addEventListener('click', async () => {
    if (!mediaRecorder) {
        await setupRecorder();
    }
    
    audioChunks = [];
    audioPlayback.style.display = 'none';
    
    mediaRecorder.start();
    recordBtn.disabled = true;
    stopBtn.disabled = false;
    statusText.textContent = 'Recording...';
    statusIndicator.classList.add('recording');
});

// Stop recording
stopBtn.addEventListener('click', () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
        recordBtn.disabled = false;
        stopBtn.disabled = true;
    }
});

// Upload and transcribe
uploadBtn.addEventListener('click', async () => {
    if (!audioBlob) {
        alert('No audio recorded');
        return;
    }
    
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');
    
    // Show loading indicator
    loadingIndicator.style.display = 'block';
    audioPlayback.style.display = 'none';
    uploadBtn.disabled = true;
    
    try {
        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (response.ok) {
            // Add transcription to the list
            addTranscriptionToList(result);
            
            // Reset UI
            audioBlob = null;
            audioPlayer.src = '';
            statusText.textContent = 'Transcription complete! Ready to record again.';
            
            // Show success message briefly
            setTimeout(() => {
                statusText.textContent = 'Ready to record';
            }, 3000);
        } else {
            alert('Error: ' + result.error);
            statusText.textContent = 'Error occurred. Please try again.';
        }
    } catch (error) {
        console.error('Error uploading audio:', error);
        alert('Failed to upload audio. Please try again.');
        statusText.textContent = 'Upload failed. Please try again.';
    } finally {
        loadingIndicator.style.display = 'none';
        uploadBtn.disabled = false;
    }
});

// Add transcription to the list
function addTranscriptionToList(data) {
    // Remove empty state if it exists
    const emptyState = transcriptionsList.querySelector('.empty-state');
    if (emptyState) {
        emptyState.remove();
    }
    
    const transcriptionItem = document.createElement('div');
    transcriptionItem.className = 'transcription-item';
    
    const timestamp = formatTimestamp(data.timestamp);
    
    transcriptionItem.innerHTML = `
        <div class="transcription-header">
            <span>Recording #${data.id}</span>
            <span>${timestamp}</span>
        </div>
        <div class="transcription-text">${data.transcription}</div>
    `;
    
    // Add to the beginning of the list
    transcriptionsList.insertBefore(transcriptionItem, transcriptionsList.firstChild);
}

// Format timestamp
function formatTimestamp(timestamp) {
    const year = timestamp.substring(0, 4);
    const month = timestamp.substring(4, 6);
    const day = timestamp.substring(6, 8);
    const hour = timestamp.substring(9, 11);
    const minute = timestamp.substring(11, 13);
    const second = timestamp.substring(13, 15);
    
    return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}

// Load existing transcriptions on page load
async function loadTranscriptions() {
    try {
        const response = await fetch('/api/transcriptions');
        const data = await response.json();
        
        if (data.transcriptions && data.transcriptions.length > 0) {
            // Remove empty state
            const emptyState = transcriptionsList.querySelector('.empty-state');
            if (emptyState) {
                emptyState.remove();
            }
            
            // Add each transcription (in reverse order to show newest first)
            data.transcriptions.reverse().forEach(transcription => {
                addTranscriptionToList(transcription);
            });
        }
    } catch (error) {
        console.error('Error loading transcriptions:', error);
    }
}

// Initialize
loadTranscriptions();
