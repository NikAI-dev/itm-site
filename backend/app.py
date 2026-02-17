"""
ITM-Site Backend: Image to Minecraft Converter API
Converts images to Minecraft-style block art

Security considerations:
- Input validation on all parameters
- File size limits enforced
- CORS restricted to allowed origins
- Debug mode disabled in production
- Error messages sanitized
"""

from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
import logging
from io import BytesIO
from pathlib import Path

from image_to_minecraft.minecraftifier import converter_bytes
from config import config

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# CORS configuration - restrict to allowed origins
cors_options = {
    "origins": config.ALLOWED_ORIGINS,
    "methods": ["POST"],
    "allow_headers": ["Content-Type"]
}
CORS(app, resources={"/minecraftify": cors_options})

# Configuration
app.config['MAX_CONTENT_LENGTH'] = config.MAX_FILE_SIZE_MB * 1024 * 1024
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}


def allowed_file(filename):
    """Validate file extension"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def validate_width(width):
    """Validate and constrain width parameter"""
    try:
        w = int(width)
        if w < config.MIN_IMAGE_WIDTH or w > config.MAX_IMAGE_WIDTH:
            return None
        return w
    except (ValueError, TypeError):
        return None


def timeout_handler(signum, frame):
    """Handle conversion timeout"""
    raise TimeoutError("Image conversion took too long")


@app.post("/minecraftify")
def minecraftify_api():
    """
    Convert an image to Minecraft blocks
    
    Expected form data:
    - image: PNG/JPG file (required)
    - width: number of horizontal blocks (optional, default: 128)
    
    Returns:
    - PNG image on success
    - JSON error on failure
    """
    
    # Validate file presence
    if "image" not in request.files:
        logger.warning("Request missing 'image' field")
        return jsonify({"error": "Missing file field 'image'"}), 400
    
    file = request.files["image"]
    
    if file.filename == "":
        logger.warning("Empty filename in request")
        return jsonify({"error": "Empty filename"}), 400
    
    # Validate file extension
    if not allowed_file(file.filename):
        logger.warning(f"Invalid file type: {file.filename}")
        return jsonify({"error": f"Invalid file type. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"}), 400
    
    # Validate width parameter
    width = request.form.get("width", "128")
    width = validate_width(width)
    if width is None:
        logger.warning(f"Invalid width parameter: {request.form.get('width')}")
        return jsonify({
            "error": f"Invalid width. Must be between {config.MIN_IMAGE_WIDTH} and {config.MAX_IMAGE_WIDTH}"
        }), 400
    
    try:
        # Read image bytes
        image_bytes = file.read()
        
        if not image_bytes:
            logger.warning("Empty image file")
            return jsonify({"error": "Image file is empty"}), 400
        
        # Log conversion attempt
        logger.info(f"Converting image: {secure_filename(file.filename)} with width={width}")
        
        try:
            # Perform conversion
            result_img = converter_bytes(
                image_bytes=image_bytes,
                width=width,
                blocks_dir=config.BLOCKS_DIR,
                blocks_json=config.BLOCKS_JSON
            )
            
            
        except TimeoutError:
            logger.error("Image conversion timed out")
            return jsonify({"error": "Conversion took too long. Try a smaller image or fewer blocks."}), 504
        
        # Save result to BytesIO
        buf = BytesIO()
        result_img.save(buf, format="PNG")
        buf.seek(0)
        
        logger.info(f"Conversion successful, returning {len(buf.getvalue())} bytes")
        return send_file(buf, mimetype="image/png")
    
    except ValueError as e:
        logger.error(f"Image format error: {str(e)}")
        return jsonify({"error": "Invalid image format or corrupted image"}), 400
    
    except FileNotFoundError as e:
        logger.error(f"Missing required file: {str(e)}")
        return jsonify({"error": "Server configuration error. Blocks file not found."}), 500
    
    except Exception as e:
        logger.error(f"Unexpected error during conversion: {str(e)}")
        return jsonify({"error": "Conversion failed. Please try a different image."}), 500


@app.get("/health")
def health_check():
    """Simple health check endpoint"""
    return jsonify({"status": "ok"}), 200


@app.errorhandler(413)
def request_entity_too_large(error):
    """Handle file too large error"""
    logger.warning(f"File upload exceeded {config.MAX_FILE_SIZE_MB} MB limit")
    return jsonify({
        "error": f"File too large. Maximum size: {config.MAX_FILE_SIZE_MB} MB"
    }), 413


@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({"error": "Endpoint not found"}), 404


if __name__ == '__main__':
    # Ensure blocks directory exists
    blocks_path = Path(config.BLOCKS_DIR) / config.BLOCKS_JSON
    if not blocks_path.exists():
        logger.error(f"Blocks file not found at {blocks_path}")
        logger.error(f"Make sure BLOCKS_DIR and BLOCKS_JSON are configured correctly in .env")
        exit(1)
    
    logger.info(f"Starting Flask server in {config.ENV} mode")
    logger.info(f"Blocks directory: {config.BLOCKS_DIR}")
    logger.info(f"Max file size: {config.MAX_FILE_SIZE_MB} MB")
    logger.info(f"CORS allowed origins: {config.ALLOWED_ORIGINS}")
    
    app.run(
        host=config.HOST,
        port=config.PORT,
        debug=config.DEBUG
    )
