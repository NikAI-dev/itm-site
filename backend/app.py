from flask import Flask, jsonify, request, send_file
from werkzeug.utils import secure_filename
from flask_cors import CORS
import os, tempfile
from io import BytesIO

from image_to_minecraft.minecraftifier import converter_bytes

app = Flask(__name__)
CORS(app) # Enable CORS for all routes


@app.post("/minecraftify")
def minecraftify_api():
    if "image" not in request.files:
        return jsonify({"error": "Missing file field 'image'"}), 400
    
    f = request.files["image"]
    if f.filename == "":
        return jsonify({"error": "Empty filename"}), 400
    
    width = request.form.get("width", type=int, default=128)
    image_bytes = f.read()
    result_img = converter_bytes(image_bytes= image_bytes, width= width,blocks_dir= "/Users/Nikita/Desktop/Random programs/itm site/backend/", blocks_json="blocks.json")

    buf = BytesIO()
    result_img.save(buf, format="PNG")
    buf.seek(0)

    return send_file(buf, mimetype="image/png")
    

if __name__ == '__main__':
    app.run(debug=True)
