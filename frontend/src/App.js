import React, { useState } from 'react';
import Chatbot from './components/Chatbot';
import ChartDisplay from './components/ChartDisplay';
import FileUpload from './components/FileUpload';
import './main.css';

const App = () => {
    const [chartPath, setChartPath] = useState('');
    const [uploadedFilePath, setUploadedFilePath] = useState('');

    return (
        <div className="app-container">
            <div className="header">
                <h1>Excel Plotter Chatbot</h1>
                <p style={{color:'#4f8cff', fontWeight:500, marginTop:0}}>AI-powered Excel charting with natural language</p>
            </div>
            <div className="section-card">
                <FileUpload onUploadSuccess={setUploadedFilePath} />
            </div>
            <div className="section-card">
                <Chatbot setChartPath={setChartPath} uploadedFilePath={uploadedFilePath} />
            </div>
            <div className="section-card">
                <ChartDisplay chartPath={chartPath} />
            </div>
        </div>
    );
};

export default App;