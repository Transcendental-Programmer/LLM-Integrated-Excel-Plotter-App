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
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleModelChange = (e) => {
    setModel(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    setLoading(true);
    try {
      const payload = { query: input, model };
      if (uploadedFilePath) payload.file_path = uploadedFilePath;
      
      console.log('Sending request to backend:', payload);
      
      // Use the Hugging Face Space URL for production
      const apiUrl = 'https://archcoder-llm-excel-plotter-agent.hf.space/plot';
      const result = await axios.post(apiUrl, payload, {
        timeout: 60000, // 60 second timeout
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log('Backend response:', result.data);
      
      setResponse(result.data.response);
      setChartPath(result.data.chart_path);
      
      // Log the chart path for debugging
      console.log('Chart path set to:', result.data.chart_path);
      console.log('Full chart URL:', `https://archcoder-llm-excel-plotter-agent.hf.space/${result.data.chart_path}`);
      
    } catch (error) {
      console.error('Error making request:', error);
      setResponse(`Error: ${error.response?.data?.error || error.message || 'Unable to process your request'}`);
      setChartPath(''); // Clear chart path on error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 style={{color:'#2a3b8f', marginBottom:10}}>Chatbot</h2>
      <form onSubmit={handleSubmit} style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
        <input 
          type="text" 
          value={input} 
          onChange={handleInputChange} 
          placeholder="Enter your query here" 
          style={{flex:1}}
          disabled={loading}
        />
        <select 
          value={model} 
          onChange={handleModelChange} 
          style={{padding:'8px',borderRadius:'6px',border:'1px solid #bfc7d1'}}
          disabled={loading}
        >
          {MODEL_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
        <button type="submit" disabled={loading}>
          {loading ? 'Processing...' : 'Submit'}
        </button>
      </form>
      {response && <div className="response-box">{response}</div>}
      {uploadedFilePath && <div style={{fontSize:'0.9em',color:'#4f8cff',marginTop:6}}>Using uploaded file for queries.</div>}
    </div>
  );
};

export default Chatbot;