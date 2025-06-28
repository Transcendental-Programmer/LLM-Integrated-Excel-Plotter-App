import React, { useState } from 'react';
import axios from 'axios';

const MODEL_OPTIONS = [
  { label: 'Fine-tuned BART', value: 'bart' },
  { label: 'Flan-T5-Base (HuggingFace API)', value: 'flan-t5-base' },
  { label: 'Flan-UL2 (HuggingFace API)', value: 'flan-ul2' },
];

const SAMPLE_QUERIES = [
  "plot the sales in the years with red line",
  "show employee expenses and net profit over the years",
  "display the EBITDA for each year with a blue bar",
  "plot the RoCE over time",
  "show the interest payments each year with a green bar",
  "display the working capital percentage over the years",
  "plot the EBIT for each year with an orange line",
  "show sales and EBIT over the years",
  "display the net profit in a bar chart",
  "plot the employee expenses each year with a red line",
  "show the annual sales in a bar chart",
  "display EBIT and EBITDA over the years",
  "plot the RoCE for each year with a purple line",
  "show the interest and working capital percentage",
  "display the annual net profit with a blue bar"
];

const Chatbot = ({ setChartPath, uploadedFilePath }) => {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [model, setModel] = useState('bart');
  const [loading, setLoading] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleModelChange = (e) => {
    setModel(e.target.value);
  };

  const handleSampleQuery = (query) => {
    setInput(query);
    setShowInstructions(false);
  };

  const handleUseSampleData = async () => {
    setLoading(true);
    try {
      // Use the sample data path
      const sampleDataPath = '/home/user/app/../data/sample_data.csv';
      const payload = { 
        query: "plot the sales for year FY12 with a red line", 
        model,
        file_path: sampleDataPath
      };
      
      console.log('Using sample data with payload:', payload);
      
      const apiUrl = 'https://archcoder-llm-excel-plotter-agent.hf.space/plot';
      const result = await axios.post(apiUrl, payload, {
        timeout: 60000,
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log('Backend response:', result.data);
      
      setResponse(result.data.response);
      setChartPath(result.data.chart_path);
      
    } catch (error) {
      console.error('Error using sample data:', error);
      setResponse(`Error: ${error.response?.data?.error || error.message || 'Unable to use sample data'}`);
    } finally {
      setLoading(false);
    }
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
    <div style={{
      animation: 'fadeInUp 0.6s ease',
      padding: '20px',
      backgroundColor: '#f8f9fa',
      borderRadius: '12px',
      border: '1px solid #e9ecef',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{
        color:'#2a3b8f', 
        marginBottom:20,
        animation: 'slideInDown 0.8s ease'
      }}>
        Chatbot
      </h2>

      {/* Instructions Section */}
      <div style={{
        marginBottom: '20px',
        padding: '16px',
        backgroundColor: '#e8f4fd',
        borderRadius: '8px',
        border: '1px solid #4f8cff',
        animation: 'fadeIn 0.8s ease'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px'
        }}>
          <h4 style={{margin: 0, color: '#2a3b8f'}}>💡 How to use</h4>
          <button
            onClick={() => setShowInstructions(!showInstructions)}
            style={{
              background: 'none',
              border: 'none',
              color: '#4f8cff',
              cursor: 'pointer',
              fontSize: '1.2em',
              padding: '4px 8px',
              borderRadius: '4px',
              transition: 'background-color 0.3s ease'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#d1e7ff'}
            onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            {showInstructions ? '−' : '+'}
          </button>
        </div>
        
        {showInstructions && (
          <div style={{animation: 'slideInUp 0.4s ease'}}>
            <p style={{margin: '0 0 12px 0', color: '#2a3b8f', fontSize: '0.95em'}}>
              Write natural language queries to generate charts. These examples are from our training data:
            </p>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              marginBottom: '12px',
              maxHeight: '300px',
              overflowY: 'auto'
            }}>
              {SAMPLE_QUERIES.map((query, index) => (
                <button
                  key={index}
                  onClick={() => handleSampleQuery(query)}
                  style={{
                    background: '#4f8cff',
                    color: 'white',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '16px',
                    fontSize: '0.85em',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    animation: `fadeInUp 0.4s ease ${index * 0.05}s both`,
                    whiteSpace: 'nowrap'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.backgroundColor = '#3a7bd5';
                    e.target.style.transform = 'translateY(-1px)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.backgroundColor = '#4f8cff';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  {query}
                </button>
              ))}
            </div>
            
            {/* Sample Data Option */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              backgroundColor: '#f0f8ff',
              borderRadius: '6px',
              border: '1px solid #4f8cff'
            }}>
              <div style={{fontSize: '1.2em'}}>📊</div>
              <div style={{flex: 1}}>
                <div style={{fontWeight: '500', color: '#2a3b8f', marginBottom: '4px'}}>
                  Try with Sample Data
                </div>
                <div style={{fontSize: '0.9em', color: '#666'}}>
                  Use our sample financial data to test the system
                </div>
              </div>
              <button
                onClick={handleUseSampleData}
                disabled={loading}
                style={{
                  background: '#2a8f4f',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '0.9em',
                  transition: 'all 0.3s ease',
                  opacity: loading ? 0.6 : 1
                }}
                onMouseOver={(e) => {
                  if (!loading) {
                    e.target.style.backgroundColor = '#1f6b3a';
                    e.target.style.transform = 'translateY(-1px)';
                  }
                }}
                onMouseOut={(e) => {
                  if (!loading) {
                    e.target.style.backgroundColor = '#2a8f4f';
                    e.target.style.transform = 'translateY(0)';
                  }
                }}
              >
                {loading ? 'Loading...' : 'Use Sample Data'}
              </button>
            </div>
          </div>
        )}
      </div>
      
      <form onSubmit={handleSubmit} style={{
        display:'flex',
        alignItems:'center',
        gap:15,
        marginBottom:20,
        flexWrap: 'wrap'
      }}>
        <input 
          type="text" 
          value={input} 
          onChange={handleInputChange} 
          placeholder="Enter your query here (e.g., plot the sales in the years with red line)" 
          style={{
            flex:1,
            minWidth: '200px',
            padding: '12px 16px',
            border: '2px solid #e9ecef',
            borderRadius: '8px',
            fontSize: '1em',
            transition: 'all 0.3s ease',
            backgroundColor: loading ? '#f8f9fa' : 'white'
          }}
          disabled={loading}
          onFocus={(e) => {
            e.target.style.borderColor = '#4f8cff';
            e.target.style.boxShadow = '0 0 0 3px rgba(79, 140, 255, 0.1)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#e9ecef';
            e.target.style.boxShadow = 'none';
          }}
        />
        <select 
          value={model} 
          onChange={handleModelChange} 
          style={{
            padding:'12px 16px',
            borderRadius:'8px',
            border:'2px solid #e9ecef',
            fontSize: '1em',
            backgroundColor: loading ? '#f8f9fa' : 'white',
            transition: 'all 0.3s ease',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
          disabled={loading}
        >
          {MODEL_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
        <button 
          type="submit" 
          disabled={loading}
          style={{
            padding: '12px 24px',
            backgroundColor: loading ? '#6c757d' : '#4f8cff',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1em',
            fontWeight: '500',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseOver={(e) => {
            if (!loading) {
              e.target.style.backgroundColor = '#3a7bd5';
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
            }
          }}
          onMouseOut={(e) => {
            if (!loading) {
              e.target.style.backgroundColor = '#4f8cff';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }
          }}
        >
          {loading ? (
            <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
              <div style={{
                width: '16px',
                height: '16px',
                border: '2px solid #ffffff40',
                borderTop: '2px solid white',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              Processing...
            </div>
          ) : (
            'Submit'
          )}
        </button>
      </form>
      
      {/* Response with animation */}
      {response && (
        <div style={{
          animation: 'slideInUp 0.5s ease',
          padding: '16px',
          backgroundColor: response.includes('Error') ? '#ffe8e8' : '#e8f5e8',
          border: `1px solid ${response.includes('Error') ? '#ff6b6b' : '#2a8f4f'}`,
          borderRadius: '8px',
          marginBottom: '10px'
        }}>
          <div style={{
            color: response.includes('Error') ? '#d13a3a' : '#2a8f4f',
            fontWeight: '500',
            marginBottom: '8px'
          }}>
            {response.includes('Error') ? '⚠️ Error' : '✅ Response'}
          </div>
          <div style={{
            color: response.includes('Error') ? '#d13a3a' : '#2a8f4f',
            fontSize: '0.95em',
            lineHeight: '1.5'
          }}>
            {response}
          </div>
        </div>
      )}
      
      {/* File path indicator */}
      {uploadedFilePath && (
        <div style={{
          fontSize:'0.9em',
          color:'#4f8cff',
          marginTop:10,
          padding: '8px 12px',
          backgroundColor: '#f0f8ff',
          borderRadius: '6px',
          border: '1px solid #4f8cff',
          animation: 'fadeIn 0.5s ease'
        }}>
          📁 Using uploaded file for queries.
        </div>
      )}
      
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default Chatbot;