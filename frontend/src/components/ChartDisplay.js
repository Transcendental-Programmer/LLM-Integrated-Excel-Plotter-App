import React from 'react';

const ChartDisplay = ({ chartPath }) => {
    return (
        <div>
            {chartPath && (
                <img 
                    src={`http://localhost:5000/${chartPath}`} 
                    alt="Generated Chart" 
                    style={{ maxWidth: '100%', height: 'auto' }} 
                />
            )}
        </div>
    );
};

export default ChartDisplay;