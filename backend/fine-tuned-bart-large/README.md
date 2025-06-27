---
license: mit
library_name: transformers
language: en
datasets:
- your-dataset-name
metrics:
- rouge
base_model: facebook/bart-large
tags:
- text2text-generation
- summarization
- fine-tuned
pipeline_tag: summarization
model-index:
- name: fine-tuned-bart-large
  results:
  - task: summarization
    dataset: your-dataset-name
    metrics:
    - rouge1: 0.45
    - rouge2: 0.22
    - rougel: 0.40
---

# Fine-tuned BART Large Model

This repository contains a fine-tuned BART large model for text summarization tasks.

## Model Details

- Base model: facebook/bart-large
- Fine-tuned on: your-dataset-name
- License: MIT

## Usage

You can load this model using the Hugging Face Transformers library:

```python
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer

model_name = "ArchCoder/fine-tuned-bart-large"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSeq2SeqLM.from_pretrained(model_name)
```

Replace `"ArchCoder/fine-tuned-bart-large"` with your actual model repo name.

## Evaluation

The model was evaluated on the your-dataset-name dataset with the following metrics:

- ROUGE-1: 0.45
- ROUGE-2: 0.22
- ROUGE-L: 0.40

## License

This model is licensed under the MIT License.
