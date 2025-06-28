import React, { useState, useEffect } from 'react';

const ChartDisplay = ({ chartPath }) => {
    const [imageError, setImageError] = useState(false);
    const [imageLoading, setImageLoading] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);

    // Use the Hugging Face Space URL for production
    const backendUrl = 'https://archcoder-llm-excel-plotter-agent.hf.space';
    
    const handleImageLoad = () => {
        setImageLoading(false);
        setImageError(false);
        setImageLoaded(true);
    };

    const handleImageError = () => {
        setImageLoading(false);
        setImageError(true);
        setImageLoaded(false);
        console.log('Failed to load chart image from:', `${backendUrl}/${chartPath}`);
    };

    useEffect(() => {
        if (chartPath) {
            setImageLoading(true);
            setImageError(false);
            setImageLoaded(false);
        }
    }, [chartPath]);

    return (
        <div style={{textAlign:'center'}}>
            {chartPath ? (
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
                        Generated Chart
                    </h2>
                    
                    {/* Loading Animation */}
                    {imageLoading && (
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '15px',
                            padding: '40px 20px'
                        }}>
                            <div style={{
                                width: '50px',
                                height: '50px',
                                border: '4px solid #f3f3f3',
                                borderTop: '4px solid #4f8cff',
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite'
                            }} />
                            <div style={{
                                color:'#4f8cff', 
                                fontSize: '1.1em',
                                fontWeight: '500',
                                animation: 'pulse 2s infinite'
                            }}>
                                Generating your chart...
                            </div>
                        </div>
                    )}
                    
                    {/* Error State */}
                    {imageError && (
                        <div style={{
                            color:'#ff6b6b', 
                            padding: '20px',
                            backgroundColor: '#ffe8e8',
                            borderRadius: '8px',
                            border: '1px solid #ff6b6b',
                            animation: 'shake 0.5s ease'
                        }}>
                            <div style={{fontSize: '1.2em', marginBottom: '10px'}}>⚠️</div>
                            <div>Failed to load chart. Please try again.</div>
                            <button 
                                onClick={() => {
                                    setImageError(false);
                                    setImageLoading(true);
                                    // Force reload the image
                                    const img = new Image();
                                    img.onload = handleImageLoad;
                                    img.onerror = handleImageError;
                                    img.src = `${backendUrl}/${chartPath}?t=${Date.now()}`;
                                }}
                                style={{
                                    marginTop: '10px',
                                    padding: '8px 16px',
                                    backgroundColor: '#4f8cff',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.3s ease'
                                }}
                                onMouseOver={(e) => e.target.style.backgroundColor = '#3a7bd5'}
                                onMouseOut={(e) => e.target.style.backgroundColor = '#4f8cff'}
                            >
                                Retry
                            </button>
                        </div>
                    )}
                    
                    {/* Chart Image */}
                    {!imageLoading && !imageError && (
                        <div style={{
                            animation: imageLoaded ? 'zoomIn 0.8s ease' : 'none',
                            transform: imageLoaded ? 'scale(1)' : 'scale(0.95)',
                            transition: 'transform 0.3s ease'
                        }}>
                            <img 
                                src={`${backendUrl}/${chartPath}`} 
                                alt="Generated Chart" 
                                onLoad={handleImageLoad}
                                onError={handleImageError}
                                style={{
                                    maxWidth:'100%', 
                                    height:'auto', 
                                    border:'2px solid #ddd', 
                                    borderRadius:'12px',
                                    boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                                    transition: 'all 0.3s ease'
                                }}
                                onMouseOver={(e) => {
                                    e.target.style.transform = 'scale(1.02)';
                                    e.target.style.boxShadow = '0 12px 24px rgba(0,0,0,0.15)';
                                }}
                                onMouseOut={(e) => {
                                    e.target.style.transform = 'scale(1)';
                                    e.target.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
                                }}
                            />
                        </div>
                    )}
                </div>
            ) : (
                <div style={{
                    color:'#bfc7d1',
                    fontSize:'1.1em',
                    marginTop:20,
                    padding: '40px 20px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '12px',
                    border: '2px dashed #dee2e6',
                    animation: 'fadeIn 1s ease'
                }}>
                    <div style={{fontSize: '2em', marginBottom: '10px'}}>📊</div>
                    <div>No chart generated yet. Enter a query to see your chart here.</div>
                </div>
            )}
            
            <style jsx>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
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
                
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                @keyframes pulse {
                    0%, 100% {
                        opacity: 1;
                    }
                    50% {
                        opacity: 0.7;
                    }
                }
                
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
                
                @keyframes zoomIn {
                    from {
                        opacity: 0;
                        transform: scale(0.8);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
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

export default ChartDisplay;