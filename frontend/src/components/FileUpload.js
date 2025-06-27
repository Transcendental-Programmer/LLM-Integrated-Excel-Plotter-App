import React, { useState } from 'react';
import axios from 'axios';

const FileUpload = ({ onUploadSuccess }) => {
    const [file, setFile] = useState(null);
    const [columns, setColumns] = useState([]);
    const [preview, setPreview] = useState([]);
    const [message, setMessage] = useState('');

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);
        try {
            const res = await axios.post('http://localhost:5000/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setColumns(res.data.columns);
            setPreview(res.data.preview);
            setMessage(res.data.message);
            if (onUploadSuccess) onUploadSuccess(res.data.file_path);
        } catch (err) {
            setMessage('Upload failed.');
        }
    };

    return (
        <div>
            <h2 style={{color:'#2a3b8f', marginBottom:10}}>Upload Data File</h2>
            <form onSubmit={handleUpload} style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
                <input type="file" accept=".csv,.xls,.xlsx" onChange={handleFileChange} />
                <button type="submit">Upload</button>
            </form>
            {message && <p style={{color: message.includes('success') ? '#2a8f4f' : '#d13a3a', margin:0}}>{message}</p>}
            {columns.length > 0 && (
                <div style={{marginTop:10}}>
                    <h4 style={{margin:'8px 0 4px 0',color:'#4f8cff'}}>Columns:</h4>
                    <ul>{columns.map((col) => <li key={col}>{col}</li>)}</ul>
                </div>
            )}
            {preview.length > 0 && (
                <div style={{marginTop:10}}>
                    <h4 style={{margin:'8px 0 4px 0',color:'#4f8cff'}}>Preview:</h4>
                    <table className="preview-table">
                        <thead>
                            <tr>{Object.keys(preview[0]).map((col) => <th key={col}>{col}</th>)}</tr>
                        </thead>
                        <tbody>
                            {preview.map((row, idx) => (
                                <tr key={idx}>
                                    {Object.values(row).map((val, i) => <td key={i}>{val}</td>)}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default FileUpload;
