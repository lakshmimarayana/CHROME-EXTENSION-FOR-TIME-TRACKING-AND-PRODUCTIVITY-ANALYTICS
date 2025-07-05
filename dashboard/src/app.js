import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import ProductivityChart from './components/ProductivityChart';
import WebsiteTable from './components/WebsiteTable';
import './App.css'; // For dashboard specific styles

const BACKEND_URL = 'http://localhost:4000/api'; // Your backend URL

function App() {
    const [userId, setUserId] = useState('');
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [localUserId, setLocalUserId] = useState(''); // To manage input field

    useEffect(() => {
        // Load user ID from local storage (simulate extension setting it)
        const storedUserId = localStorage.getItem('productivityTrackerUserId');
        if (storedUserId) {
            setUserId(storedUserId);
            setLocalUserId(storedUserId);
        }
    }, []);

    const fetchWeeklyReport = async (id) => {
        if (!id) return;
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${BACKEND_URL}/report/weekly/${id}`);
            setReportData(response.data);
            console.log("Fetched report:", response.data);
        } catch (err) {
            console.error('Error fetching weekly report:', err);
            setError('Failed to load weekly report. Make sure User ID is correct and backend is running.');
            setReportData(null);
        } finally {
            setLoading(false);
        }
    };

    const handleUserIdChange = (e) => {
        setLocalUserId(e.target.value);
    };

    const handleSaveUserId = () => {
        if (localUserId.trim()) {
            setUserId(localUserId.trim());
            localStorage.setItem('productivityTrackerUserId', localUserId.trim());
            // In a real scenario, you'd send this to the extension too
            // For now, we assume the extension uses its own saved ID.
            fetchWeeklyReport(localUserId.trim()); // Fetch report immediately
        } else {
            alert("Please enter a User ID.");
        }
    };

    // Fetch report whenever userId state changes
    useEffect(() => {
        if (userId) {
            fetchWeeklyReport(userId);
        }
    }, [userId]);

    return (
        <div className="dashboard-container">
            <h1>Productivity Analytics Dashboard</h1>

            <div className="user-id-input-section">
                <label htmlFor="dashboard-user-id">Your User ID:</label>
                <input
                    type="text"
                    id="dashboard-user-id"
                    value={localUserId}
                    onChange={handleUserIdChange}
                    placeholder="Enter your user ID"
                />
                <button onClick={handleSaveUserId}>Set User ID</button>
            </div>

            {!userId && (
                <p className="message-info">Please set your User ID to view analytics.</p>
            )}

            {loading && <p className="loading-message">Loading report...</p>}
            {error && <p className="error-message">{error}</p>}

            {userId && reportData && (
                <div className="report-section">
                    <h2>Weekly Productivity Report ({format(new Date(), 'MMM dd, yyyy')})</h2>
                    <p>Total time tracked: {formatTime(reportData.totalTime)}</p>
                    <p>Productive time: {formatTime(reportData.productiveTime)}</p>
                    <p>Unproductive time: {formatTime(reportData.unproductiveTime)}</p>
                    <p>Neutral time: {formatTime(reportData.neutralTime)}</p>

                    <div className="chart-section">
                        <h3>Productivity Distribution</h3>
                        <ProductivityChart
                            productive={reportData.productiveTime}
                            unproductive={reportData.unproductiveTime}
                            neutral={reportData.neutralTime}
                        />
                    </div>

                    <div className="website-breakdown-section">
                        <h3>Website Usage Breakdown</h3>
                        <WebsiteTable data={reportData.websiteBreakdown} />
                    </div>
                </div>
            )}
        </div>
    );
}

function formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours}h ${minutes}m ${seconds}s`;
}

export default App;
