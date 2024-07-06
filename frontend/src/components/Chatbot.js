import React, { useState } from 'react';
import axios from 'axios';

const Chatbot = ({ setChartPath }) => {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await axios.post('http://localhost:5000/plot', { query: input });
      setResponse(result.data.response);
      setChartPath(result.data.chart_path);
      console.log("Chart path received:", result.data.chart_path); 
    } catch (error) {
      console.error('Error fetching data from backend:', error);
      setResponse('Error: Unable to process your request');
    }
  };

  return (
    <div>
      <h2>Chatbot</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" value={input} onChange={handleInputChange} placeholder="Enter your query here" />
        <button type="submit">Submit</button>
      </form>
      {response && <div><h3>Response:</h3><p>{response}</p></div>}
    </div>
  );
};

export default Chatbot;