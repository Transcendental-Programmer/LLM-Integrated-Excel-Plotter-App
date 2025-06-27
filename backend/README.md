# Backend for Excel Plotter App

This backend is a Flask application serving the Excel Plotter API.

## Deployment on Hugging Face Spaces

- Ensure the fine-tuned BART large model files are included in the `backend/fine-tuned-bart-large/` directory or uploaded to Hugging Face Hub.
- The app runs on port 7860.
- To start the app, run:

```bash
bash start.sh
```

- The `requirements.txt` includes all necessary dependencies.
- Make sure to set any required environment variables in the Hugging Face Space settings.

## Using the Fine-tuned BART Large Model from Hugging Face Hub

You can load the fine-tuned BART large model directly from Hugging Face Hub in your backend code as follows:

```python
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer

model_name = "ArchCoder/fine-tuned-bart-large"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSeq2SeqLM.from_pretrained(model_name)
```

Replace `"ArchCoder/fine-tuned-bart-large"` with your actual model repository name if different.

Make sure your backend code (e.g., in `llm_agent.py` or wherever the model is loaded) uses this method to load the model from the Hub instead of local files.

## Notes

- Static files are served from the `static` directory.
- Adjust API URLs in the frontend to point to the deployed backend URL.
