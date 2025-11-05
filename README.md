# 🎙️ Audio Transcription Web App

A modern web application that allows users to record audio messages, save them, and automatically transcribe them using OpenAI's Whisper model.

## Features

✨ **Audio Recording**: Record audio directly from your browser using the Web Audio API

💾 **Audio Storage**: Automatically saves recorded audio files to the server

🤖 **AI Transcription**: Uses OpenAI Whisper model to transcribe audio to text with high accuracy

📝 **View Transcriptions**: Browse all your transcriptions with timestamps

🎨 **Modern UI**: Beautiful, responsive interface with smooth animations

## Prerequisites

- Python 3.8 or higher
- A modern web browser with microphone support
- FFmpeg (required by Whisper)

## Installation

### 1. Install FFmpeg

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install ffmpeg
```

**MacOS:**
```bash
brew install ffmpeg
```

**Windows:**
Download from [ffmpeg.org](https://ffmpeg.org/download.html)

### 2. Install Python Dependencies

```bash
pip install -r requirements.txt
```

Note: The first time you run the app, Whisper will download the "base" model (~140MB). This happens automatically.

## Usage

### 1. Start the Server

```bash
python app.py
```

The server will start on `http://localhost:5000`

### 2. Open in Browser

Navigate to `http://localhost:5000` in your web browser.

### 3. Record Audio

1. Click **"Start Recording"** to begin recording
2. Speak your message
3. Click **"Stop Recording"** when done
4. Preview your recording
5. Click **"Upload & Transcribe"** to process the audio

### 4. View Transcriptions

All transcriptions appear below the recording interface with:
- Recording ID number
- Timestamp
- Full transcribed text

## API Endpoints

### POST `/api/upload`
Upload and transcribe an audio file.

**Request:**
- Content-Type: `multipart/form-data`
- Body: Audio file with key `audio`

**Response:**
```json
{
  "success": true,
  "transcription": "Your transcribed text here",
  "id": 1,
  "timestamp": "20231105_143022"
}
```

### GET `/api/transcriptions`
Get all transcriptions.

**Response:**
```json
{
  "transcriptions": [
    {
      "id": 1,
      "filename": "audio_20231105_143022.webm",
      "transcription": "Your transcribed text",
      "timestamp": "20231105_143022"
    }
  ]
}
```

### GET `/api/transcriptions/<id>`
Get a specific transcription by ID.

## File Structure

```
/workspace/
├── app.py                 # Flask backend server
├── requirements.txt       # Python dependencies
├── README.md             # This file
├── templates/
│   └── index.html        # Main HTML page
├── static/
│   ├── css/
│   │   └── style.css     # Styles
│   └── js/
│       └── app.js        # Frontend JavaScript
└── uploads/              # Stored audio files (created automatically)
```

## Technology Stack

**Backend:**
- Flask - Python web framework
- OpenAI Whisper - AI transcription model
- Flask-CORS - Cross-origin resource sharing

**Frontend:**
- HTML5 - Structure
- CSS3 - Styling with modern gradients and animations
- JavaScript - Audio recording and API integration
- MediaRecorder API - Browser audio recording

## Whisper Model Options

The app uses the "base" model by default. You can change this in `app.py`:

- `tiny` - Fastest, least accurate (~39M parameters)
- `base` - Good balance (default, ~74M parameters)
- `small` - Better accuracy (~244M parameters)
- `medium` - High accuracy (~769M parameters)
- `large` - Best accuracy, slowest (~1550M parameters)

Change the model:
```python
model = whisper.load_model("small")  # or tiny, medium, large
```

## Notes

- Audio files are stored in the `uploads/` directory
- Transcriptions are stored in memory (will be lost on server restart)
- For production use, consider adding a database for persistent storage
- The app requires microphone permissions in your browser

## Troubleshooting

**"Unable to access microphone"**
- Grant microphone permissions in your browser
- Check that your microphone is connected and working

**Slow transcription**
- Use a smaller Whisper model (`tiny` or `base`)
- Ensure you have adequate CPU/GPU resources

**Import errors**
- Make sure all dependencies are installed: `pip install -r requirements.txt`
- Install FFmpeg (required by Whisper)

## License

MIT License - Feel free to use and modify as needed!
