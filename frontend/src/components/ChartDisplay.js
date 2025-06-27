import React, { useState, useEffect } from 'react';

const ChartDisplay = ({ chartPath }) => {
    const [imageError, setImageError] = useState(false);
    const [imageLoading, setImageLoading] = useState(false);

    // Use the Hugging Face Space URL for production
    const backendUrl = 'https://archcoder-llm-excel-plotter-agent.hf.space';
    
    const handleImageLoad = () => {
        setImageLoading(false);
        setImageError(false);
    };

    const handleImageError = () => {
        setImageLoading(false);
        setImageError(true);
        console.log('Failed to load chart image from:', `${backendUrl}/${chartPath}`);
    };

    useEffect(() => {
        if (chartPath) {
            setImageLoading(true);
            setImageError(false);
        }
    }, [chartPath]);

    return (
        <div style={{textAlign:'center'}}>
            {chartPath ? (
                <>
                  <h2 style={{color:'#2a3b8f', marginBottom:10}}>Generated Chart</h2>
                  {imageLoading && (
                    <div style={{color:'#4f8cff', marginBottom:10}}>Loading chart...</div>
                  )}
                  {imageError && (
                    <div style={{color:'#ff6b6b', marginBottom:10}}>
                      Failed to load chart. Please try again.
                    </div>
                  )}
                  <img 
                      src={`${backendUrl}/${chartPath}`} 
                      alt="Generated Chart" 
                      onLoad={handleImageLoad}
                      onError={handleImageError}
                      style={{maxWidth:'100%', height:'auto', border:'1px solid #ddd', borderRadius:'8px'}}
                  />
                </>
            ) : (
                <div style={{color:'#bfc7d1',fontSize:'1.1em',marginTop:20}}>
                  No chart generated yet. Enter a query to see your chart here.
                </div>
            )}
        </div>
    );
};

export default ChartDisplay;