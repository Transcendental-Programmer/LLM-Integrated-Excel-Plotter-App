import React from 'react';

const ChartDisplay = ({ chartPath }) => {
    return (
        <div style={{textAlign:'center'}}>
            {chartPath ? (
                <>
                  <h2 style={{color:'#2a3b8f', marginBottom:10}}>Generated Chart</h2>
                  <img 
                      src={`http://localhost:5000/${chartPath}`} 
                      alt="Generated Chart" 
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