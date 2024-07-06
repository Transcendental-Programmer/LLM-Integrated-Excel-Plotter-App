import React, { useState } from 'react';
import Chatbot from './components/Chatbot';
import ChartDisplay from './components/ChartDisplay';

const App = () => {
    const [chartPath, setChartPath] = useState('');

    return (
        <div>
            <h1>Excel Plotter Chatbot</h1>
            <Chatbot setChartPath={setChartPath} />
            <ChartDisplay chartPath={chartPath} />
        </div>
    );
};

export default App;