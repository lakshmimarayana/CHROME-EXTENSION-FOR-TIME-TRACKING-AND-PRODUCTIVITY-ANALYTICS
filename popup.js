document.addEventListener('DOMContentLoaded', () => {
    const statusDiv = document.getElementById('status');
    const currentTabDiv = document.getElementById('current-tab');
    const timeList = document.getElementById('time-list');
    const viewDashboardBtn = document.getElementById('view-dashboard');
    const openOptionsBtn = document.getElementById('open-options');

    function formatTime(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${hours}h ${minutes}m ${seconds}s`;
    }

    chrome.runtime.sendMessage({ action: 'getTrackingData' }, (response) => {
        if (response) {
            const { activeTab, accumulated, isIdle } = response;

            statusDiv.textContent = isIdle ? 'Status: Idle' : 'Status: Active';

            if (activeTab && activeTab.url) {
                currentTabDiv.innerHTML = `<strong>Current:</strong> ${activeTab.title || activeTab.url}`;
            }

            timeList.innerHTML = '';
            const sortedDomains = Object.keys(accumulated).sort((a, b) => accumulated[b].total - accumulated[a].total);

            if (sortedDomains.length === 0) {
                timeList.innerHTML = '<li>No activity tracked yet today.</li>';
            } else {
                sortedDomains.forEach(domain => {
                    const data = accumulated[domain];
                    const li = document.createElement('li');
                    li.innerHTML = `<strong>${domain}:</strong> Total ${formatTime(data.total)} | Prod: ${formatTime(data.productive)} | Unprod: ${formatTime(data.unproductive)}`;
                    timeList.appendChild(li);
                });
            }
        } else {
            statusDiv.textContent = 'Error: Could not retrieve tracking data.';
        }
    });

    viewDashboardBtn.addEventListener('click', () => {
        // Replace with your actual dashboard URL
        chrome.tabs.create({ url: 'http://localhost:4000/dashboard' });
    });

    openOptionsBtn.addEventListener('click', () => {
        chrome.runtime.openOptionsPage();
    });
});
