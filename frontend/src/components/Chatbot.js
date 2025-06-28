import React, { useState, useEffect } from 'react';
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

// Sample data that matches the training data structure
const SAMPLE_DATA = [
  { Year: 'FY12', Sales: 1000, 'Employee expense': 10, EBITDA: 900, EBIT: 800, 'Net profit': 650, RoCE: 0.27, interest: 90, 'WC %': 0.1 },
  { Year: 'FY13', Sales: 1100, 'Employee expense': 30, EBITDA: 600, EBIT: 300, 'Net profit': 150, RoCE: 0.09, interest: 87, 'WC %': 0.09 },
  { Year: 'FY14', Sales: 1210, 'Employee expense': 490, EBITDA: 800, EBIT: 750, 'Net profit': 600, RoCE: 0.21, interest: 80, 'WC %': 0.08 },
  { Year: 'FY15', Sales: 1331, 'Employee expense': 90, EBITDA: 1100, EBIT: 1000, 'Net profit': 850, RoCE: 0.25, interest: 23, 'WC %': 0.07 },
  { Year: 'FY16', Sales: 1464.1, 'Employee expense': 89, EBITDA: 1200, EBIT: 1000, 'Net profit': 850, RoCE: 0.23, interest: 4, 'WC %': 0.06 }
];

const Chatbot = ({ setChartPath, uploadedFilePath }) => {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [model, setModel] = useState('bart');
  const [loading, setLoading] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [usingSampleData, setUsingSampleData] = useState(false);
  const [chartPolling, setChartPolling] = useState(false);

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

  // Function to check if chart image is available
  const checkChartAvailability = async (chartPath) => {
    try {
      const backendUrl = 'https://archcoder-llm-excel-plotter-agent.hf.space';
      const response = await fetch(`${backendUrl}/${chartPath}?t=${Date.now()}`, {
        method: 'HEAD',
        mode: 'no-cors'
      });
      return true;
    } catch (error) {
      console.log('Chart not yet available, retrying...');
      return false;
    }
  };

  // Polling mechanism for chart availability
  useEffect(() => {
    let pollInterval;
    
    if (chartPolling && response && response.includes('chart_path')) {
      // Extract chart path from response if it's a string
      let currentChartPath = '';
      try {
        if (typeof response === 'string' && response.includes('chart_path')) {
          // Try to parse the response as JSON
          const parsedResponse = JSON.parse(response);
          currentChartPath = parsedResponse.chart_path || '';
        }
      } catch (e) {
        // If parsing fails, the response might be the chart path directly
        currentChartPath = response;
      }

      if (currentChartPath) {
        console.log('Starting chart polling for:', currentChartPath);
        pollInterval = setInterval(async () => {
          const isAvailable = await checkChartAvailability(currentChartPath);
          if (isAvailable) {
            console.log('Chart is now available!');
            setChartPath(currentChartPath);
            setChartPolling(false);
            clearInterval(pollInterval);
          }
        }, 2000); // Check every 2 seconds

        // Stop polling after 30 seconds
        setTimeout(() => {
          if (pollInterval) {
            console.log('Chart polling timeout');
            setChartPolling(false);
            clearInterval(pollInterval);
          }
        }, 30000);
      }
    }

    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [chartPolling, response, setChartPath]);

  const handleUseSampleData = async () => {
    setLoading(true);
    setUsingSampleData(true);
    try {
      // Convert sample data to CSV format
      const csvContent = [
        'Year,Sales,Employee expense,EBITDA,EBIT,Net profit,RoCE,interest,WC %',
        ...SAMPLE_DATA.map(row => 
          `${row.Year},${row.Sales},${row['Employee expense']},${row.EBITDA},${row.EBIT},${row['Net profit']},${row.RoCE},${row.interest},${row['WC %']}`
        )
      ].join('\n');

      // Create a File object from the CSV content
      const sampleFile = new File([csvContent], 'sample_data.csv', { type: 'text/csv' });
      
      // First upload the sample data
      const formData = new FormData();
      formData.append('file', sampleFile);
      
      console.log('Uploading sample data...');
      
      const uploadUrl = 'https://archcoder-llm-excel-plotter-agent.hf.space/upload';
      const uploadResult = await axios.post(uploadUrl, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000
      });
      
      console.log('Sample data uploaded:', uploadResult.data);
      
      // Now use the uploaded file for the query
      const payload = { 
        query: "plot the sales in the years with red line", 
        model,
        file_path: uploadResult.data.file_path
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
      
      // Start polling for chart availability
      if (result.data.chart_path) {
        setChartPolling(true);
        // Also set the chart path immediately in case it's already available
        setChartPath(result.data.chart_path);
      }
      
    } catch (error) {
      console.error('Error using sample data:', error);
      setResponse(`Error: ${error.response?.data?.error || error.message || 'Unable to use sample data'}`);
      setUsingSampleData(false);
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
      
      // Start polling for chart availability
      if (result.data.chart_path) {
        setChartPolling(true);
        // Also set the chart path immediately in case it's already available
        setChartPath(result.data.chart_path);
      }
      
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
            
            {/* Sample Data Option - Enhanced */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px',
              backgroundColor: '#f0f8ff',
              borderRadius: '8px',
              border: '2px solid #4f8cff',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: '0',
                left: '0',
                right: '0',
                height: '3px',
                background: 'linear-gradient(90deg, #4f8cff, #2a3b8f, #4f8cff)',
                animation: 'shimmer 2s infinite'
              }} />
              <div style={{fontSize: '1.5em'}}>🚀</div>
              <div style={{flex: 1}}>
                <div style={{fontWeight: '600', color: '#2a3b8f', marginBottom: '4px', fontSize: '1.1em'}}>
                  🎯 Recommended: Try with Sample Data First!
                </div>
                <div style={{fontSize: '0.9em', color: '#666', lineHeight: '1.4'}}>
                  <strong>Why?</strong> Our sample data is perfectly matched with our training data, ensuring the best results. 
                  It contains all the financial metrics (Sales, EBITDA, EBIT, etc.) that our AI model knows how to visualize.
                </div>
              </div>
              <button
                onClick={handleUseSampleData}
                disabled={loading}
                style={{
                  background: 'linear-gradient(135deg, #2a8f4f, #1f6b3a)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 20px',
                  borderRadius: '8px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '1em',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  opacity: loading ? 0.6 : 1,
                  boxShadow: '0 4px 8px rgba(42, 143, 79, 0.3)'
                }}
                onMouseOver={(e) => {
                  if (!loading) {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 12px rgba(42, 143, 79, 0.4)';
                  }
                }}
                onMouseOut={(e) => {
                  if (!loading) {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 8px rgba(42, 143, 79, 0.3)';
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
                    Loading...
                  </div>
                ) : (
                  '🚀 Use Sample Data'
                )}
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
          {chartPolling && (
            <div style={{
              marginTop: '8px',
              fontSize: '0.9em',
              color: '#4f8cff',
              fontStyle: 'italic'
            }}>
              🔄 Checking for chart availability...
            </div>
          )}
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
      
      {/* Sample data indicator */}
      {usingSampleData && (
        <div style={{
          fontSize:'0.9em',
          color:'#2a8f4f',
          marginTop:10,
          padding: '8px 12px',
          backgroundColor: '#e8f5e8',
          borderRadius: '6px',
          border: '1px solid #2a8f4f',
          animation: 'fadeIn 0.5s ease'
        }}>
          🚀 Using sample data for queries.
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
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default Chatbot;