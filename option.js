document.addEventListener('DOMContentLoaded', async () => {
    const productiveSitesInput = document.getElementById('productive-sites-input');
    const unproductiveSitesInput = document.getElementById('unproductive-sites-input');
    const saveCategoriesBtn = document.getElementById('save-categories');
    const categoryStatus = document.getElementById('category-status');

    const userIdInput = document.getElementById('user-id-input');
    const saveUserIdBtn = document.getElementById('save-user-id');
    const userIdStatus = document.getElementById('user-id-status');

    // Load saved settings
    const storedSettings = await chrome.storage.sync.get(['websiteCategories', 'userId']);
    if (storedSettings.websiteCategories) {
        productiveSitesInput.value = (storedSettings.websiteCategories.productive || []).join('\n');
        unproductiveSitesInput.value = (storedSettings.websiteCategories.unproductive || []).join('\n');
    }
    if (storedSettings.userId) {
        userIdInput.value = storedSettings.userId;
    }

    // Save categories
    saveCategoriesBtn.addEventListener('click', async () => {
        const productive = productiveSitesInput.value.split('\n').map(s => s.trim()).filter(s => s);
        const unproductive = unproductiveSitesInput.value.split('\n').map(s => s.trim()).filter(s => s);

        await chrome.storage.sync.set({
            websiteCategories: { productive, unproductive }
        });
        categoryStatus.textContent = 'Categories saved!';
        categoryStatus.style.color = 'green';
        // Notify background script about updated categories (though it re-reads on demand)
        chrome.runtime.sendMessage({ action: 'updateWebsiteCategories' });
    });

    // Save User ID
    saveUserIdBtn.addEventListener('click', async () => {
        const newUserId = userIdInput.value.trim();
        if (newUserId) {
            await chrome.storage.sync.set({ userId: newUserId });
            userIdStatus.textContent = 'User ID saved!';
            userIdStatus.style.color = 'green';
            // Send user ID to background script
            chrome.runtime.sendMessage({ action: 'setUserId', userId: newUserId }, (response) => {
                if (response && response.success) {
                    console.log('User ID successfully set in background.');
                }
            });
        } else {
            userIdStatus.textContent = 'Please enter a valid User ID.';
            userIdStatus.style.color = 'red';
        }
    });
});
