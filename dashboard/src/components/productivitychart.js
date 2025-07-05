import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

function ProductivityChart({ productive, unproductive, neutral }) {
    const data = {
        labels: ['Productive', 'Unproductive', 'Neutral'],
        datasets: [
            {
                data: [productive, unproductive, neutral],
                backgroundColor: ['#28a745', '#dc3545', '#ffc107'],
                borderColor: ['#fff', '#fff', '#fff'],
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        let label = context.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed !== null) {
                            label += formatTime(context.parsed);
                        }
                        return label;
                    }
                }
            }
        },
    };

    function formatTime(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${hours}h ${minutes}m ${seconds}s`;
    }

    return (
        <div style={{ maxWidth: '400px', margin: '0 auto' }}>
            <Pie data={data} options={options} />
        </div>
    );
}

export default ProductivityChart;
