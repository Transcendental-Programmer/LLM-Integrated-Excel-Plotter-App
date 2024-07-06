from PIL import Image
import torch
from transformers import CLIPProcessor, CLIPModel
import os
import logging
import time
from dotenv import load_dotenv

load_dotenv()

class ImageVerifier:
    def __init__(self):
        logging.info("Initializing ImageVerifier")
        self.model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
        self.processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")

    def verify(self, image_path, query):
        start_time = time.time()
        logging.info(f"Verifying image {image_path} with query: {query}")
        
        full_image_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), image_path)
        
        image = Image.open(full_image_path)
        
        inputs = self.processor(text=[query], images=image, return_tensors="pt", padding=True)
        outputs = self.model(**inputs)
        logits_per_image = outputs.logits_per_image  
        probs = logits_per_image.softmax(dim=1)  
        
        verification_result = probs.argmax().item() == 0  
        end_time = time.time()
        
        logging.info(f"Image verification result: {verification_result} in {end_time - start_time} seconds")
        return verification_result
