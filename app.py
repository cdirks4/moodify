from flask import Flask, request, jsonify, Response, send_from_directory
from flask_cors import CORS
import logging
import traceback
from youtube import download_audio

app = Flask(__name__)
CORS(app)

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.route('/')
def serve_index():
    """Serve index.html"""
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    """Serve static files"""
    return send_from_directory('.', path)

@app.route('/api/transform', methods=['POST'])
def transform_audio():
    """Transform YouTube URL to audio."""
    try:
        # Log request
        logger.info("Received /api/transform request")
        
        # Validate request
        if not request.is_json:
            logger.error("Request is not JSON")
            return jsonify({'error': 'Request must be JSON'}), 400

        data = request.get_json()
        if not data or 'url' not in data:
            logger.error("No URL in request data")
            return jsonify({'error': 'No URL provided'}), 400

        url = data['url']
        logger.info(f"Processing request for URL: {url}")
        
        try:
            # Download audio
            logger.info("Starting audio download...")
            audio_data = download_audio(url)
            
            # Create response
            logger.info("Creating response...")
            response = Response(audio_data, mimetype='audio/mpeg')
            response.headers['Content-Disposition'] = 'attachment; filename=audio.mp3'
            
            logger.info("Successfully processed request")
            return response
            
        except ValueError as e:
            logger.error(f"Value error: {str(e)}")
            return jsonify({'error': str(e)}), 400
        except Exception as e:
            logger.error(f"Error processing audio: {str(e)}\n{traceback.format_exc()}")
            return jsonify({'error': 'Failed to process audio', 'details': str(e)}), 500
            
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}\n{traceback.format_exc()}")
        return jsonify({
            'error': 'Internal server error',
            'message': str(e),
            'traceback': traceback.format_exc()
        }), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({
        'status': 'healthy',
        'message': 'Service is running'
    }), 200

if __name__ == '__main__':
    app.run(debug=True)
