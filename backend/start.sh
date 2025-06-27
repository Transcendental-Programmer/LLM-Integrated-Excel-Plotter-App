#!/bin/bash
# Start script for backend Flask app on Hugging Face Spaces

export FLASK_APP=app.py
export FLASK_ENV=production

# Run the Flask app on 0.0.0.0:7860
python backend/app.py
