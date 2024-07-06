import pandas as pd
import torch
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM, Seq2SeqTrainer, Seq2SeqTrainingArguments
from sklearn.model_selection import train_test_split

data = pd.read_csv('data/train_data.csv')
queries = data['query'].tolist()
arguments = data['arguments'].tolist()

train_queries, eval_queries, train_arguments, eval_arguments = train_test_split(queries, arguments, test_size=0.2, random_state=42)

tokenizer = AutoTokenizer.from_pretrained("facebook/bart-large")
model = AutoModelForSeq2SeqLM.from_pretrained("facebook/bart-large")

train_encodings = tokenizer(train_queries, truncation=True, padding=True)
eval_encodings = tokenizer(eval_queries, truncation=True, padding=True)

with tokenizer.as_target_tokenizer():
    train_labels = tokenizer(train_arguments, truncation=True, padding=True)
    eval_labels = tokenizer(eval_arguments, truncation=True, padding=True)

class PlotDataset(torch.utils.data.Dataset):
    def __init__(self, encodings, labels):
        self.encodings = encodings
        self.labels = labels

    def __getitem__(self, idx):
        item = {key: torch.tensor(val[idx]) for key, val in self.encodings.items()}
        item['labels'] = torch.tensor(self.labels['input_ids'][idx])
        return item

    def __len__(self):
        return len(self.encodings.input_ids)

train_dataset = PlotDataset(train_encodings, train_labels)
eval_dataset = PlotDataset(eval_encodings, eval_labels)

training_args = Seq2SeqTrainingArguments(
    output_dir='./results',
    per_device_train_batch_size=2,
    per_device_eval_batch_size=2,
    num_train_epochs=3,
    logging_dir='./logs',
    logging_steps=10,
    save_steps=500,
    save_total_limit=2,
    evaluation_strategy="epoch",
    predict_with_generate=True,
    generation_max_length=100,  
)
trainer = Seq2SeqTrainer(
    model=model,
    args=training_args,
    train_dataset=train_dataset,
    eval_dataset=eval_dataset,
    tokenizer=tokenizer,
)

trainer.train()

trainer.save_model("fine-tuned-bart-large")
tokenizer.save_pretrained("fine-tuned-bart-large")

print("Model and tokenizer fine-tuned and saved as 'fine-tuned-bart-large'")