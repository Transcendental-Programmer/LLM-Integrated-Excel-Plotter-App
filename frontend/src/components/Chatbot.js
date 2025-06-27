import React, { useState } from 'react';
import axios from 'axios';

const MODEL_OPTIONS = [
  { label: 'Fine-tuned BART', value: 'bart' },
  { label: 'Flan-T5-Base (HuggingFace API)', value: 'flan-t5-base' },
  { label: 'Flan-UL2 (HuggingFace API)', value: 'flan-ul2' },
];

const Chatbot = ({ setChartPath, uploadedFilePath }) => {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [model, setModel] = useState('bart');

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleModelChange = (e) => {
    setModel(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { query: input, model };
      if (uploadedFilePath) payload.file_path = uploadedFilePath;
      // Use the Hugging Face Space URL for production
      const apiUrl = 'https://archcoder-llm-excel-plotter-agent.hf.space/plot';
      const result = await axios.post(apiUrl, payload);
      setResponse(result.data.response);
      setChartPath(result.data.chart_path);
    } catch (error) {
      setResponse('Error: Unable to process your request');
    }
  };

  return (
    <div>
      <h2 style={{color:'#2a3b8f', marginBottom:10}}>Chatbot</h2>
      <form onSubmit={handleSubmit} style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
        <input type="text" value={input} onChange={handleInputChange} placeholder="Enter your query here" style={{flex:1}} />
        <select value={model} onChange={handleModelChange} style={{padding:'8px',borderRadius:'6px',border:'1px solid #bfc7d1'}}>
          {MODEL_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
        <button type="submit">Submit</button>
      </form>
      {response && <div className="response-box">{response}</div>}
      {uploadedFilePath && <div style={{fontSize:'0.9em',color:'#4f8cff',marginTop:6}}>Using uploaded file for queries.</div>}
    </div>
  );
};

export default Chatbot;