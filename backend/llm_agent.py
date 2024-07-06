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

load_dotenv()

class LLM_Agent:
    def __init__(self):
        logging.info("Initializing LLM_Agent")
        self.data_processor = DataProcessor()
        self.chart_generator = ChartGenerator()
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
        logging.info(f"Query: {query}")
        
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