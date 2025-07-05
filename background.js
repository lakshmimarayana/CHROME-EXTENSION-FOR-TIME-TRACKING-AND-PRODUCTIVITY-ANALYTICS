// Constants
const IDLE_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes of inactivity to consider idle
const TRACKING_INTERVAL_MS = 1000; // Track every second

let activeTabInfo = { url: null, title: null, startTime: null };
let accumulatedTime = {}; // { 'domain.com': { total: 0, productive: 0, unproductive: 0 } }
let lastActivityTime = Date.now();
let isIdle = false;
let userId = null; // Will be set after user logs in via dashboard

// Helper to get domain from URL
function getDomainFromUrl(url) {
    try {
        const urlObj = new URL(url);
        return urlObj.hostname;
    } catch (e) {
        return null;
    }
}

// Function to classify URL (simplified, ideally from backend/user settings)
async function classifyUrl(url) {
    const domain = getDomainFromUrl(url);
    if (!domain) return 'unknown';

    // Retrieve user-defined categories from storage
    const storedSettings = await chrome.storage.sync.get('websiteCategories');
    const categories = storedSettings.websiteCategories || {};

    if (categories.productive && categories.productive.includes(domain)) {
        return 'productive';
    }
    if (categories.unproductive && categories.unproductive.includes(domain)) {
        return 'unproductive';
    }

    // Default classification (can be improved with a categorized list or ML model)
    if (domain.includes('facebook.com') || domain.includes('twitter.com') || domain.includes('instagram.com')) {
        return 'unproductive';
    }
    if (domain.includes('stackoverflow.com') || domain.includes('github.com') || domain.includes('leetcode.com')) {
        return 'productive';
    }
    return 'neutral'; // Default for unclassified sites
}

// Update active tab tracking
async function updateActiveTab() {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        if (tabs.length > 0) {
            const currentTab = tabs[0];
            const currentUrl = currentTab.url;
            const currentTitle = currentTab.title;
            const currentDomain = getDomainFromUrl(currentUrl);

            if (currentDomain && currentDomain !== activeTabInfo.url) { // Domain changed
                // Record time for previous active tab
                if (activeTabInfo.url && activeTabInfo.startTime && !isIdle) {
                    const timeSpent = Date.now() - activeTabInfo.startTime;
                    const prevDomain = getDomainFromUrl(activeTabInfo.url);

                    if (prevDomain) {
                        if (!accumulatedTime[prevDomain]) {
                            accumulatedTime[prevDomain] = { total: 0, productive: 0, unproductive: 0 };
                        }
                        accumulatedTime[prevDomain].total += timeSpent;

                        const classification = await classifyUrl(activeTabInfo.url);
                        if (classification === 'productive') {
                            accumulatedTime[prevDomain].productive += timeSpent;
                        } else if (classification === 'unproductive') {
                            accumulatedTime[prevDomain].unproductive += timeSpent;
                        }
                    }
                }

                // Start tracking for new active tab
                activeTabInfo = {
                    url: currentUrl,
                    title: currentTitle,
                    startTime: Date.now()
                };
                lastActivityTime = Date.now(); // Reset activity for new tab
            } else if (currentDomain && currentDomain === activeTabInfo.url) {
                // Same tab, just update activity time
                lastActivityTime = Date.now();
            }
        }
    });
}

// Periodically check for idle state
async function checkIdleState() {
    chrome.idle.queryState(IDLE_THRESHOLD_MS / 1000, (state) => {
        const wasIdle = isIdle;
        isIdle = (state === "idle" || state === "locked");

        if (isIdle && !wasIdle) {
            console.log("Browser is idle. Pausing tracking.");
            // If idle, record time for current active tab if any
            if (activeTabInfo.url && activeTabInfo.startTime) {
                const timeSpent = Date.now() - activeTabInfo.startTime;
                const prevDomain = getDomainFromUrl(activeTabInfo.url);

                if (prevDomain) {
                    if (!accumulatedTime[prevDomain]) {
                        accumulatedTime[prevDomain] = { total: 0, productive: 0, unproductive: 0 };
                    }
                    accumulatedTime[prevDomain].total += timeSpent;
                    // No productivity classification needed here as it's idle time
                }
                activeTabInfo.startTime = null; // Mark as paused
            }
        } else if (!isIdle && wasIdle) {
            console.log("Browser is no longer idle. Resuming tracking.");
            // If active again, resume tracking the current tab
            activeTabInfo.startTime = Date.now();
            lastActivityTime = Date.now();
        }
    });
}


// Save accumulated data to local storage and then sync to backend
async function saveData() {
    if (!userId) {
        console.warn("User not logged in, not syncing data to backend.");
        // Save to local storage for later sync
        await chrome.storage.local.set({ accumulatedTimeData: accumulatedTime });
        return;
    }

    // Prepare data for backend
    const dataToSend = {
        userId: userId,
        timestamp: Date.now(),
        dailyData: accumulatedTime
    };

    try {
        const response = await fetch('YOUR_BACKEND_API_URL/api/track', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // 'Authorization': `Bearer ${userToken}` // If using token-based auth
            },
            body: JSON.stringify(dataToSend)
        });

        if (response.ok) {
            console.log("Time data synced to backend successfully!");
            accumulatedTime = {}; // Clear after successful sync
            await chrome.storage.local.remove('accumulatedTimeData'); // Clear local cache
        } else {
            console.error("Failed to sync data to backend:", response.statusText);
            // On failure, persist locally for next attempt
            await chrome.storage.local.set({ accumulatedTimeData: accumulatedTime });
        }
    } catch (error) {
        console.error("Network error while syncing data:", error);
        // On network error, persist locally
        await chrome.storage.local.set({ accumulatedTimeData: accumulatedTime });
    }
}

// Listen for tab updates
chrome.tabs.onActivated.addListener(updateActiveTab);
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.active) {
        updateActiveTab();
    }
});

// Initial load
updateActiveTab();

// Set up periodic alarms
chrome.alarms.create('trackingAlarm', { periodInMinutes: TRACKING_INTERVAL_MS / 60000 }); // e.g., every 1 second
chrome.alarms.create('idleCheckAlarm', { periodInMinutes: IDLE_THRESHOLD_MS / 60000 }); // e.g., every 5 minutes
chrome.alarms.create('saveDataAlarm', { periodInMinutes: 10 }); // Save data every 10 minutes

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'trackingAlarm') {
        if (!isIdle && activeTabInfo.url && activeTabInfo.startTime) {
            const domain = getDomainFromUrl(activeTabInfo.url);
            if (domain) {
                if (!accumulatedTime[domain]) {
                    accumulatedTime[domain] = { total: 0, productive: 0, unproductive: 0 };
                }
                accumulatedTime[domain].total += TRACKING_INTERVAL_MS;
                classifyUrl(activeTabInfo.url).then(classification => {
                    if (classification === 'productive') {
                        accumulatedTime[domain].productive += TRACKING_INTERVAL_MS;
                    } else if (classification === 'unproductive') {
                        accumulatedTime[domain].unproductive += TRACKING_INTERVAL_MS;
                    }
                });
            }
        }
    } else if (alarm.name === 'idleCheckAlarm') {
        checkIdleState();
    } else if (alarm.name === 'saveDataAlarm') {
        saveData();
    }
});

// Listen for messages from popup/options page
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getTrackingData') {
        sendResponse({
            activeTab: activeTabInfo,
            accumulated: accumulatedTime,
            isIdle: isIdle
        });
    } else if (request.action === 'setUserId') {
        userId = request.userId;
        console.log(`User ID set in background: ${userId}`);
        // Attempt to sync any pending local data after user logs in
        chrome.storage.local.get('accumulatedTimeData', (result) => {
            if (result.accumulatedTimeData) {
                accumulatedTime = { ...accumulatedTime, ...result.accumulatedTimeData };
                saveData(); // Try to sync merged data
            }
        });
        sendResponse({ success: true });
    } else if (request.action === 'updateWebsiteCategories') {
        // Categories are already stored via chrome.storage.sync by options page
        // No direct action needed here, classifyUrl will pick them up
        sendResponse({ success: true });
    }
    return true; // Indicates asynchronous response
});

// On installation, set up default categories (if not already set)
chrome.runtime.onInstalled.addListener(async () => {
    const storedSettings = await chrome.storage.sync.get('websiteCategories');
    if (!storedSettings.websiteCategories) {
        await chrome.storage.sync.set({
            websiteCategories: {
                productive: ['github.com', 'stackoverflow.com', 'leetcode.com', 'developer.mozilla.org'],
                unproductive: ['facebook.com', 'twitter.com', 'instagram.com', 'youtube.com', 'netflix.com']
            }
        });
        console.log("Default website categories set.");
    }
});
