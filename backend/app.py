from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from llm_agent import LLM_Agent
import os
import logging
import time
from dotenv import load_dotenv
from werkzeug.utils import secure_filename

load_dotenv()


logging.basicConfig(level=logging.INFO)
logging.getLogger('matplotlib').setLevel(logging.WARNING)
logging.getLogger('PIL').setLevel(logging.WARNING)

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), '..', 'static'))

CORS(app)
agent = LLM_Agent()

UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), '..', 'data', 'uploads')
ALLOWED_EXTENSIONS = {'csv', 'xls', 'xlsx'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def index():
    logging.info("Index route accessed")
    return "Welcome to the Excel Plotter API. Use the /plot endpoint to make requests."

@app.route('/plot', methods=['POST'])
def plot():
    start_time = time.time()
    data = request.json
    logging.info(f"Received request data: {data}")
    
    response = agent.process_request(data)
    
    end_time = time.time()
    logging.info(f"Processed request in {end_time - start_time} seconds")
    
    return jsonify(response)


@app.route('/static/<path:filename>')
def serve_static(filename):
    logging.info(f"Serving static file: {filename}")
    return send_from_directory(app.static_folder, filename)

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        # Optionally, validate columns here using DataProcessor
        dp = LLM_Agent().data_processor.__class__(file_path)
        columns = dp.get_columns()
        preview = dp.preview(5)
        return jsonify({'message': 'File uploaded successfully', 'columns': columns, 'preview': preview, 'file_path': file_path})
    else:
        return jsonify({'error': 'Invalid file type'}), 400

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=7860)