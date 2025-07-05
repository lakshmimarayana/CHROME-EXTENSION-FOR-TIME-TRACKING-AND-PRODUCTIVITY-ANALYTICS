# CHROME-EXTENSION-FOR-TIME-TRACKING-AND-PRODUCTIVITY-ANALYTICS

*NAME*: Krishnapuram Lakshminarayana

*COMPANY*: CODTECH IT SOLUTIONS

*INTERN ID*: CT08DM647

*DOMAIN*: FULL STACK WEB DEVELOPMENT

*DURATION*: 8 WEEKS

*MENTOR NAME*: NEELA SANTOSH

#DESCRIPTION:
Developing a Chrome extension for time tracking and productivity analytics involves a fascinating blend of frontend (extension UI), background scripting (for tracking), and a robust backend with a dashboard. Here's a breakdown of how you'd approach building such a system, incorporating best practices and key technologies.

# Core Components:

Chrome Extension (Frontend & Background):

Manifest V3: The latest and recommended manifest version for Chrome Extensions.

Background Service Worker: A script that runs in the background, continuously monitoring browser activity. It's event-driven and goes idle when not needed to save resources.

Content Script: Injected into web pages to potentially interact with their DOM (e.g., to categorize content, though for simple domain tracking, the background script is sufficient).

Popup UI: The small interface that appears when you click the extension icon in the toolbar, showing quick stats or controls.

Options Page: A dedicated page for users to configure settings (e.g., define productive/unproductive websites, set reporting preferences).

Permissions: Crucial for accessing browser data (e.g., tabs, activeTab, history, storage, alarms).

Backend (Node.js with Express, or Python with Django/Flask):

API Endpoints: To receive time tracking data from the extension, store user settings, and serve analytics data for the dashboard.

User Authentication: To secure user data (e.g., OAuth 2.0, JWT).

Data Processing: To aggregate raw tracking data into meaningful productivity metrics.

Scheduled Tasks: For generating weekly reports.

Database (MongoDB or PostgreSQL):

MongoDB (NoSQL): Excellent for flexible schema, storing potentially large amounts of varied time-series data (e.g., each website visit as a document).

PostgreSQL (Relational): Good for structured user data, website categories, and potentially aggregated analytics if you pre-process data into relational tables.

Dashboard (React.js or Vue.js):

Data Visualization: Charts, graphs, and tables to display productivity trends.

User Interface: Intuitive UI for viewing reports, managing website categories, and setting goals.

Authentication Integration: Connects with the backend's authentication system

# To Load the Extension:

Open Chrome and go to chrome://extensions.

Enable "Developer mode" (toggle switch in the top right).

Click "Load unpacked".

Select the chrome_extension folder.

Pin the extension to your toolbar for easy access.
# Backend Development (Node.js with Express & MongoDB)
Initialize Backend Project:

Create backend folder. Open terminal in backend and run:
npm init -y
npm install express mongoose body-parser cors jsonwebtoken bcryptjs # For user auth later
npm install --save-dev nodemon
# To run the Backend:

Make sure you have MongoDB running (default port 27017).

In the backend directory, run: nodemon server.js (or node server.js).
# How to Use and Test the Complete System:
Start MongoDB: Ensure your MongoDB server is running.

Start Backend: In the backend directory, run nodemon server.js. (Check terminal for "Backend server running on port 4000").

Start Dashboard: In the dashboard directory, run npm start. (This will open http://localhost:3000 in your browser).

Load Chrome Extension:

Go to chrome://extensions in your Chrome browser.

Enable "Developer mode".

Click "Load unpacked" and select your chrome_extension folder.

Pin the extension to your toolbar.

Configure Extension:

Click the extension icon in your toolbar.

Click "Settings" (or go to chrome://extensions, click "Details" for your extension, and then "Extension options").

In the options page:

Enter a User ID (e.g., user123). This ID links your extension data to your dashboard. Click "Save User ID".

Add domains to "Productive" and "Unproductive" lists (e.g., github.com for productive, facebook.com for unproductive). Click "Save Categories".

Browse Websites:

Start Browse. Go to productive sites (e.g., GitHub, Stack Overflow) and unproductive sites (e.g., Facebook, YouTube).

Keep Chrome active for a few minutes on each type of site. The extension tracks time every second and tries to sync data to the backend every 10 minutes.

You can open the extension popup to see real-time accumulated data.

View Dashboard Analytics:

Go to http://localhost:3000 (your dashboard URL).

Enter the same User ID (user123) you used in the extension settings and click "Set User ID".

You should now see your weekly productivity report, including time breakdown by category and by individual website. The data will reflect what the extension has sent to the backend.

