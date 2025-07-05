import React from 'react';

function WebsiteTable({ data }) {
    const sortedWebsites = Object.keys(data).sort((a, b) => data[b].total - data[a].total);

    function formatTime(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${hours}h ${minutes}m ${seconds}s`;
    }

    return (
        <div className="website-table-container">
            <table>
                <thead>
                    <tr>
                        <th>Website</th>
                        <th>Total Time</th>
                        <th>Productive Time</th>
                        <th>Unproductive Time</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedWebsites.length === 0 ? (
                        <tr>
                            <td colSpan="4">No website data available.</td>
                        </tr>
                    ) : (
                        sortedWebsites.map(domain => (
                            <tr key={domain}>
                                <td>{domain}</td>
                                <td>{formatTime(data[domain].total)}</td>
                                <td>{formatTime(data[domain].productive)}</td>
                                <td>{formatTime(data[domain].unproductive)}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default WebsiteTable;
