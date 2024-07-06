import pandas as pd
import os
import logging

class DataProcessor:
    def __init__(self):
        logging.info("Initializing DataProcessor")
        data_path = '../data/sample_data.xlsx'
        self.data = pd.read_excel(data_path)

