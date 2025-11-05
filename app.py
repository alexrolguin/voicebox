from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import os
from datetime import datetime
import whisper
import tempfile

app = Flask(__name__)
CORS(app)

# Create directories for storing audio files
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Load Whisper model (using base model for balance of speed and accuracy)
print("Loading Whisper model...")
model = whisper.load_model("base")
print("Model loaded successfully!")

# Store transcriptions in memory (in production, use a database)
transcriptions = []

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/upload', methods=['POST'])
def upload_audio():
    try:
        if 'audio' not in request.files:
            return jsonify({'error': 'No audio file provided'}), 400
        
        audio_file = request.files['audio']
        
        if audio_file.filename == '':
            return jsonify({'error': 'No selected file'}), 400
        
        # Generate unique filename with timestamp
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f'audio_{timestamp}.webm'
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        
        # Save the audio file
        audio_file.save(filepath)
        
        # Transcribe the audio
        print(f"Transcribing {filename}...")
        result = model.transcribe(filepath)
        transcription_text = result['text']
        
        # Store transcription
        transcription_data = {
            'id': len(transcriptions) + 1,
            'filename': filename,
            'filepath': filepath,
            'transcription': transcription_text,
            'timestamp': timestamp
        }
        transcriptions.append(transcription_data)
        
        return jsonify({
            'success': True,
            'transcription': transcription_text,
            'id': transcription_data['id'],
            'timestamp': timestamp
        })
    
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/transcriptions', methods=['GET'])
def get_transcriptions():
    return jsonify({'transcriptions': transcriptions})

@app.route('/api/transcriptions/<int:id>', methods=['GET'])
def get_transcription(id):
    transcription = next((t for t in transcriptions if t['id'] == id), None)
    if transcription:
        return jsonify(transcription)
    return jsonify({'error': 'Transcription not found'}), 404

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
