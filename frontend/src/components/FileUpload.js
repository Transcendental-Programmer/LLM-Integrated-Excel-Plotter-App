import React, { useState } from 'react';
import axios from 'axios';

const FileUpload = ({ onUploadSuccess }) => {
    const [file, setFile] = useState(null);
    const [columns, setColumns] = useState([]);
    const [preview, setPreview] = useState([]);
    const [message, setMessage] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [showSampleData, setShowSampleData] = useState(false);

    const sampleData = [
        { Year: 'FY12', Sales: 1000, 'Employee expense': 10, EBITDA: 900, EBIT: 800, 'Net profit': 650, RoCE: 0.27, interest: 90, 'WC %': 0.1 },
        { Year: 'FY13', Sales: 1100, 'Employee expense': 30, EBITDA: 600, EBIT: 300, 'Net profit': 150, RoCE: 0.09, interest: 87, 'WC %': 0.09 },
        { Year: 'FY14', Sales: 1210, 'Employee expense': 490, EBITDA: 800, EBIT: 750, 'Net profit': 600, RoCE: 0.21, interest: 80, 'WC %': 0.08 },
        { Year: 'FY15', Sales: 1331, 'Employee expense': 90, EBITDA: 1100, EBIT: 1000, 'Net profit': 850, RoCE: 0.25, interest: 23, 'WC %': 0.07 },
        { Year: 'FY16', Sales: 1464.1, 'Employee expense': 89, EBITDA: 1200, EBIT: 1000, 'Net profit': 850, RoCE: 0.23, interest: 4, 'WC %': 0.06 }
    ];

    const sampleColumns = ['Year', 'Sales', 'Employee expense', 'EBITDA', 'EBIT', 'Net profit', 'RoCE', 'interest', 'WC %'];

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setMessage('');
        setColumns([]);
        setPreview([]);
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) return;
        
        setIsUploading(true);
        setUploadProgress(0);
        
        // Simulate upload progress
        const progressInterval = setInterval(() => {
            setUploadProgress(prev => {
                if (prev >= 90) {
                    clearInterval(progressInterval);
                    return 90;
                }
                return prev + 10;
            });
        }, 200);

        const formData = new FormData();
        formData.append('file', file);
        
        try {
            const res = await axios.post('https://archcoder-llm-excel-plotter-agent.hf.space/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            
            clearInterval(progressInterval);
            setUploadProgress(100);
            
            // Add delay to show completion
            setTimeout(() => {
                setColumns(res.data.columns);
                setPreview(res.data.preview);
                setMessage(res.data.message);
                if (onUploadSuccess) onUploadSuccess(res.data.file_path);
                setIsUploading(false);
                setUploadProgress(0);
            }, 500);
            
        } catch (err) {
            clearInterval(progressInterval);
            setMessage('Upload failed.');
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    return (
        <div>
            <h2 style={{color:'#2a3b8f', marginBottom:10}}>Upload Data File</h2>
            
            {/* Sample Data Preview Section */}
            <div style={{
                marginBottom: '20px',
                padding: '16px',
                backgroundColor: '#f0f8ff',
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
                    <h4 style={{margin: 0, color: '#2a3b8f'}}>📊 Sample Data Available</h4>
                    <button
                        onClick={() => setShowSampleData(!showSampleData)}
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
                        {showSampleData ? '−' : '+'}
                    </button>
                </div>
                
                {showSampleData && (
                    <div style={{animation: 'slideInUp 0.4s ease'}}>
                        <p style={{margin: '0 0 12px 0', color: '#2a3b8f', fontSize: '0.95em'}}>
                            Our sample data contains financial metrics for FY12-FY16. You can use this data to test the system without uploading your own file.
                        </p>
                        
                        {/* Sample Columns */}
                        <div style={{marginBottom: '12px'}}>
                            <h5 style={{margin: '0 0 8px 0', color: '#4f8cff'}}>Available Columns:</h5>
                            <div style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: '6px'
                            }}>
                                {sampleColumns.map((col, index) => (
                                    <span key={col} style={{
                                        backgroundColor: '#e8f4fd',
                                        padding: '4px 8px',
                                        borderRadius: '12px',
                                        fontSize: '0.85em',
                                        border: '1px solid #4f8cff',
                                        animation: `fadeInUp 0.4s ease ${index * 0.05}s both`
                                    }}>
                                        {col}
                                    </span>
                                ))}
                            </div>
                        </div>
                        
                        {/* Sample Data Table */}
                        <div>
                            <h5 style={{margin: '0 0 8px 0', color: '#4f8cff'}}>Sample Data Preview:</h5>
                            <div style={{
                                overflowX: 'auto',
                                border: '1px solid #ddd',
                                borderRadius: '6px',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}>
                                <table style={{
                                    width: '100%',
                                    borderCollapse: 'collapse',
                                    fontSize: '0.85em'
                                }}>
                                    <thead>
                                        <tr style={{backgroundColor: '#f8f9fa'}}>
                                            {sampleColumns.map((col) => (
                                                <th key={col} style={{
                                                    padding: '6px 8px',
                                                    textAlign: 'left',
                                                    borderBottom: '2px solid #ddd',
                                                    fontWeight: 'bold',
                                                    fontSize: '0.9em'
                                                }}>
                                                    {col}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sampleData.map((row, idx) => (
                                            <tr key={idx} style={{
                                                animation: `fadeInUp 0.4s ease ${idx * 0.1}s both`,
                                                backgroundColor: idx % 2 === 0 ? '#fff' : '#f8f9fa'
                                            }}>
                                                {sampleColumns.map((col) => (
                                                    <td key={col} style={{
                                                        padding: '4px 6px',
                                                        borderBottom: '1px solid #eee',
                                                        fontSize: '0.85em'
                                                    }}>
                                                        {row[col]}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            
            <form onSubmit={handleUpload} style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
                <input 
                    type="file" 
                    accept=".csv,.xls,.xlsx" 
                    onChange={handleFileChange}
                    disabled={isUploading}
                    style={{
                        opacity: isUploading ? 0.6 : 1,
                        transition: 'opacity 0.3s ease'
                    }}
                />
                <button 
                    type="submit" 
                    disabled={isUploading}
                    style={{
                        opacity: isUploading ? 0.6 : 1,
                        transition: 'opacity 0.3s ease',
                        position: 'relative'
                    }}
                >
                    {isUploading ? 'Uploading...' : 'Upload'}
                </button>
            </form>
            
            {/* Upload Progress Bar */}
            {isUploading && (
                <div style={{
                    width: '100%',
                    height: '4px',
                    backgroundColor: '#f0f0f0',
                    borderRadius: '2px',
                    marginBottom: '10px',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        width: `${uploadProgress}%`,
                        height: '100%',
                        backgroundColor: '#4f8cff',
                        borderRadius: '2px',
                        transition: 'width 0.3s ease',
                        animation: uploadProgress < 100 ? 'pulse 1.5s infinite' : 'none'
                    }} />
                </div>
            )}
            
            {/* Message with animation */}
            {message && (
                <div style={{
                    color: message.includes('success') ? '#2a8f4f' : '#d13a3a',
                    margin: 0,
                    padding: '8px 12px',
                    borderRadius: '6px',
                    backgroundColor: message.includes('success') ? '#e8f5e8' : '#ffe8e8',
                    border: `1px solid ${message.includes('success') ? '#2a8f4f' : '#d13a3a'}`,
                    animation: 'slideIn 0.5s ease',
                    transition: 'all 0.3s ease'
                }}>
                    {message}
                </div>
            )}
            
            {/* Columns with animation */}
            {columns.length > 0 && (
                <div style={{
                    marginTop: 10,
                    animation: 'fadeInUp 0.6s ease'
                }}>
                    <h4 style={{margin:'8px 0 4px 0',color:'#4f8cff'}}>Columns:</h4>
                    <ul style={{
                        listStyle: 'none',
                        padding: 0,
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '8px'
                    }}>
                        {columns.map((col, index) => (
                            <li key={col} style={{
                                backgroundColor: '#f0f8ff',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                border: '1px solid #4f8cff',
                                fontSize: '0.9em',
                                animation: `fadeInUp 0.6s ease ${index * 0.1}s both`
                            }}>
                                {col}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            
            {/* Preview table with animation */}
            {preview.length > 0 && (
                <div style={{
                    marginTop: 10,
                    animation: 'fadeInUp 0.8s ease'
                }}>
                    <h4 style={{margin:'8px 0 4px 0',color:'#4f8cff'}}>Preview:</h4>
                    <div style={{
                        overflowX: 'auto',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                        <table className="preview-table" style={{
                            width: '100%',
                            borderCollapse: 'collapse',
                            fontSize: '0.9em'
                        }}>
                            <thead>
                                <tr style={{backgroundColor: '#f8f9fa'}}>
                                    {Object.keys(preview[0]).map((col) => (
                                        <th key={col} style={{
                                            padding: '8px',
                                            textAlign: 'left',
                                            borderBottom: '2px solid #ddd',
                                            fontWeight: 'bold'
                                        }}>
                                            {col}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {preview.map((row, idx) => (
                                    <tr key={idx} style={{
                                        animation: `fadeInUp 0.6s ease ${idx * 0.1}s both`,
                                        backgroundColor: idx % 2 === 0 ? '#fff' : '#f8f9fa'
                                    }}>
                                        {Object.values(row).map((val, i) => (
                                            <td key={i} style={{
                                                padding: '6px 8px',
                                                borderBottom: '1px solid #eee'
                                            }}>
                                                {val}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            
            <style jsx>{`
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
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
                
                @keyframes pulse {
                    0%, 100% {
                        opacity: 1;
                    }
                    50% {
                        opacity: 0.7;
                    }
                }
            `}</style>
        </div>
    );
};

export default FileUpload;
