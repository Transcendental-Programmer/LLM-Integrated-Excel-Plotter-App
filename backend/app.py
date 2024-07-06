from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from llm_agent import LLM_Agent
import os
import logging
import time
from dotenv import load_dotenv

load_dotenv()


logging.basicConfig(level=logging.INFO)
logging.getLogger('matplotlib').setLevel(logging.WARNING)
logging.getLogger('PIL').setLevel(logging.WARNING)

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), '..', 'static'))

CORS(app)
agent = LLM_Agent()

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

if __name__ == '__main__':
    app.run(debug=True)
