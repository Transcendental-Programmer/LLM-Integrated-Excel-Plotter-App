import matplotlib.pyplot as plt
import pandas as pd
import os
import logging
import time

class ChartGenerator:
    def __init__(self, data=None):
        logging.info("Initializing ChartGenerator")
        if data is not None:
            self.data = data
        else:
            self.data = pd.read_excel(os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'sample_data.xlsx'))

    def generate_chart(self, plot_args):
        start_time = time.time()
        logging.info(f"Generating chart with arguments: {plot_args}")
        
        fig, ax = plt.subplots()
        for y in plot_args['y']:
            color = plot_args.get('color', None)
            if plot_args.get('chart_type', 'line') == 'bar':
                ax.bar(self.data[plot_args['x']], self.data[y], label=y, color=color)
            else:
                ax.plot(self.data[plot_args['x']], self.data[y], label=y, color=color)
        
        ax.set_xlabel(plot_args['x'])
        ax.legend()
        

        chart_filename = 'chart.png'
        output_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'static', 'images')
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)
        
        full_path = os.path.join(output_dir, chart_filename)
        
        if os.path.exists(full_path):
            os.remove(full_path)
        
        plt.savefig(full_path)
        
        logging.info(f"Chart generated and saved to {full_path}")
        
        return os.path.join('static', 'images', chart_filename)