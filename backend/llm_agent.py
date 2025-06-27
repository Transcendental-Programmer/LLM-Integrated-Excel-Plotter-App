import torch
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
from data_processor import DataProcessor
from chart_generator import ChartGenerator
from image_verifier import ImageVerifier
from huggingface_hub import login
import logging
import time
import os
from dotenv import load_dotenv
import ast
import requests

load_dotenv()

class LLM_Agent:
    def __init__(self, data_path=None):
        logging.info("Initializing LLM_Agent")
        self.data_processor = DataProcessor(data_path)
        self.chart_generator = ChartGenerator(self.data_processor.data)
        self.image_verifier = ImageVerifier()

        model_path = os.path.join(os.path.dirname(__file__), "fine-tuned-bart-large")
        self.query_tokenizer = AutoTokenizer.from_pretrained(model_path)
        self.query_model = AutoModelForSeq2SeqLM.from_pretrained(model_path)

    def validate_plot_args(plot_args):
        required_keys = ['x', 'y', 'chart_type']
        if not all(key in plot_args for key in required_keys):
            return False
        if not isinstance(plot_args['y'], list):
            plot_args['y'] = [plot_args['y']]
        return True

    def process_request(self, data):
        start_time = time.time()
        logging.info(f"Processing request data: {data}")
        query = data['query']
        data_path = data.get('file_path')
        model_choice = data.get('model', 'bart')

        # Few-shot + persona prompt for Flan-UL2 (best model)
        flan_prompt = (
            "You are VizBot, an expert data visualization assistant. "
            "Given a user's natural language request about plotting data, output ONLY a valid Python dictionary with keys: x, y, chart_type, and color (if specified). "
            "Do not include any explanation or extra text.\n\n"
            "Example 1:\n"
            "User: plot the sales in the years with red line\n"
            "Output: {'x': 'Year', 'y': ['Sales'], 'chart_type': 'line', 'color': 'red'}\n\n"
            "Example 2:\n"
            "User: show employee expenses and net profit over the years\n"
            "Output: {'x': 'Year', 'y': ['Employee expense', 'Net profit'], 'chart_type': 'line'}\n\n"
            "Example 3:\n"
            "User: display the EBITDA for each year with a blue bar\n"
            "Output: {'x': 'Year', 'y': ['EBITDA'], 'chart_type': 'bar', 'color': 'blue'}\n\n"
            f"User: {query}\nOutput:"
        )

        # Re-initialize data processor and chart generator if a file is specified
        if data_path:
            self.data_processor = DataProcessor(data_path)
            self.chart_generator = ChartGenerator(self.data_processor.data)

        if model_choice == 'bart':
            # Use local fine-tuned BART model
            inputs = self.query_tokenizer(query, return_tensors="pt", max_length=512, truncation=True)
            outputs = self.query_model.generate(**inputs, max_length=100, num_return_sequences=1)
            response_text = self.query_tokenizer.decode(outputs[0], skip_special_tokens=True)
        elif model_choice == 'flan-t5-base':
            # Use Hugging Face Inference API with Flan-T5-Base model
            api_url = "https://api-inference.huggingface.co/models/google/flan-t5-base"
            headers = {"Authorization": f"Bearer {os.getenv('HUGGINGFACEHUB_API_TOKEN')}", "Content-Type": "application/json"}
            response = requests.post(api_url, headers=headers, json={"inputs": flan_prompt})
            if response.status_code != 200:
                logging.error(f"Hugging Face API error: {response.status_code} {response.text}")
                response_text = "Error: Unable to get response from Flan-T5-Base API. Please try again later."
            else:
                try:
                    resp_json = response.json()
                    response_text = resp_json[0]['generated_text'] if isinstance(resp_json, list) else resp_json.get('generated_text', '')
                except Exception as e:
                    logging.error(f"Error parsing Hugging Face API response: {e}, raw: {response.text}")
                    response_text = f"Error: Unexpected response from Flan-T5-Base API."
        elif model_choice == 'flan-ul2':
            # Use Hugging Face Inference API with Flan-UL2 model
            api_url = "https://api-inference.huggingface.co/models/google/flan-ul2"
            # Corrected model name to "google/flan-ul2" does not exist, use "google/flan-t5-xxl" as best available
            api_url = "https://api-inference.huggingface.co/models/google/flan-t5-xxl"
            headers = {"Authorization": f"Bearer {os.getenv('HUGGINGFACEHUB_API_TOKEN')}", "Content-Type": "application/json"}
            response = requests.post(api_url, headers=headers, json={"inputs": flan_prompt})
            if response.status_code != 200:
                logging.error(f"Hugging Face API error: {response.status_code} {response.text}")
                response_text = "Error: Unable to get response from Flan-T5-XXL API. Please try again later."
            else:
                try:
                    resp_json = response.json()
                    response_text = resp_json[0]['generated_text'] if isinstance(resp_json, list) else resp_json.get('generated_text', '')
                except Exception as e:
                    logging.error(f"Error parsing Hugging Face API response: {e}, raw: {response.text}")
                    response_text = f"Error: Unexpected response from Flan-T5-XXL API."
        else:
            # Default fallback to local fine-tuned BART model
            inputs = self.query_tokenizer(query, return_tensors="pt", max_length=512, truncation=True)
            outputs = self.query_model.generate(**inputs, max_length=100, num_return_sequences=1)
            response_text = self.query_tokenizer.decode(outputs[0], skip_special_tokens=True)

        logging.info(f"LLM response text: {response_text}")
        try:
            plot_args = ast.literal_eval(response_text)
        except (SyntaxError, ValueError):
            plot_args = {'x': 'Year', 'y': ['Sales'], 'chart_type': 'line'}
            logging.warning(f"Invalid LLM response. Using default plot args: {plot_args}")
        if LLM_Agent.validate_plot_args(plot_args):
            chart_path = self.chart_generator.generate_chart(plot_args)
        else:
            logging.warning("Invalid plot arguments. Using default.")
            chart_path = self.chart_generator.generate_chart({'x': 'Year', 'y': ['Sales'], 'chart_type': 'line'})
        verified = self.image_verifier.verify(chart_path, query)
        end_time = time.time()
        logging.info(f"Processed request in {end_time - start_time} seconds")
        return {
            "response": response_text,
            "chart_path": chart_path,
            "verified": verified
        }
