// Initialize Socket.IO connection
const socket = io();

// DOM elements
const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');
const feed = document.getElementById('feed');
const refreshBtn = document.getElementById('refreshBtn');
const accountsList = document.getElementById('accountsList');
const newAccountInput = document.getElementById('newAccountInput');
const addAccountBtn = document.getElementById('addAccountBtn');
const addAccountStatus = document.getElementById('addAccountStatus');
const instagramStatus = document.getElementById('instagramStatus');
const notificationEmail = document.getElementById('notificationEmail');
const checkInterval = document.getElementById('checkInterval');
const saveSettingsBtn = document.getElementById('saveSettingsBtn');

// Connection status
socket.on('connect', () => {
    statusDot.classList.add('connected');
    statusText.textContent = 'Connected';
    console.log('Connected to server');
});

socket.on('disconnect', () => {
    statusDot.classList.remove('connected');
    statusText.textContent = 'Disconnected';
    console.log('Disconnected from server');
});

// Handle feed updates
socket.on('feedUpdate', (data) => {
    updateFeed(data);
});

// Update feed display
function updateFeed(posts) {
    if (posts.length === 0) {
        feed.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                <h3>No recent posts</h3>
                <p>Posts from the last 24 hours will appear here</p>
            </div>
        `;
        return;
    }

    feed.innerHTML = posts.map(post => createPostElement(post)).join('');
}

// Create post element with enhanced image handling
function createPostElement(post) {
    const timestamp = formatTimestamp(post.timestamp);
    const isVideo = post.type === 'video';
    const isCarousel = post.type === 'carousel';
    
    // Use proxy for media URLs to bypass CORS restrictions
    const proxyMediaUrl = `/api/proxy-image?url=${encodeURIComponent(post.media_url)}`;
    const proxyProfileUrl = `/api/proxy-image?url=${encodeURIComponent(post.profile_picture)}`;
    
    return `
        <div class="post-item" data-post-id="${post.id}">
            <div class="post-header">
                <img src="${proxyProfileUrl}" alt="${post.full_name}" class="post-avatar" 
                     onerror="this.src='https://api.dicebear.com/7.x/avataaars/svg?seed=${post.username}'"
                     onload="this.style.opacity='1'">
                <div class="post-user-info">
                    <div class="post-username">@${post.username}</div>
                    <div class="post-fullname">${post.full_name}</div>
                </div>
                <div class="post-timestamp">${timestamp}</div>
            </div>
            
            ${isVideo ? 
                `<video src="${proxyMediaUrl}" controls class="post-media" 
                        onerror="this.parentElement.innerHTML='<div class=\\'media-fallback\\' onclick=\\'viewOnInstagram(\\'${post.permalink}\\')\\'>📹 Video unavailable<br><small>Tap to view on Instagram</small></div>'"></video>` :
                isCarousel ?
                `<div class="post-media carousel-indicator">
                    <img src="${proxyMediaUrl}" alt="Post media" class="post-media"
                         onerror="this.parentElement.innerHTML='<div class=\\'media-fallback\\' onclick=\\'viewOnInstagram(\\'${post.permalink}\\')\\'>📷 Image unavailable<br><small>Tap to view on Instagram</small></div>'">
                    <div class="carousel-badge">📷</div>
                </div>` :
                `<img src="${proxyMediaUrl}" alt="Post media" class="post-media"
                      onerror="this.outerHTML='<div class=\\'media-fallback\\' onclick=\\'viewOnInstagram(\\'${post.permalink}\\')\\'>📷 Image unavailable<br><small>Tap to view on Instagram</small></div>'">`
            }
            
            ${post.caption ? `<div class="post-caption">${post.caption}</div>` : ''}
            
            <div class="post-actions">
                <button class="post-action" onclick="viewOnInstagram('${post.permalink}')">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                        <polyline points="15,3 21,3 21,9"/>
                        <line x1="10" y1="14" x2="21" y2="3"/>
                    </svg>
                    View on Instagram
                </button>
                <button class="post-action" onclick="copyLink('${post.permalink}')">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                    </svg>
                    Copy Link
                </button>
            </div>
        </div>
    `;
}

// Format timestamp to show relative time
function formatTimestamp(timestamp) {
    const now = new Date();
    const postTime = new Date(timestamp);
    const diffMs = now - postTime;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffMinutes < 1) {
        return 'Just now';
    } else if (diffMinutes < 60) {
        return `${diffMinutes}m ago`;
    } else if (diffHours < 24) {
        return `${diffHours}h ago`;
    } else {
        return postTime.toLocaleDateString() + ' ' + postTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    }
}

// Utility functions
function viewOnInstagram(url) {
    if (url && url !== '#') {
        window.open(url, '_blank');
    } else {
        alert('Instagram link not available');
    }
}

function copyLink(url) {
    if (url && url !== '#') {
        navigator.clipboard.writeText(url).then(() => {
            showNotification('Link copied to clipboard!');
        }).catch(() => {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = url;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            showNotification('Link copied to clipboard!');
        });
    } else {
        alert('Instagram link not available');
    }
}

function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #667eea;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        animation: slideInRight 0.3s ease-out;
    `;
    notification.textContent = message;
    
    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Refresh button
refreshBtn.addEventListener('click', async () => {
    refreshBtn.disabled = true;
    refreshBtn.innerHTML = `
        <div class="spinner" style="width: 16px; height: 16px; margin: 0;"></div>
        Refreshing...
    `;
    
    try {
        const response = await fetch('/api/feed');
        const data = await response.json();
        updateFeed(data);
        showNotification('Feed refreshed!');
    } catch (error) {
        console.error('Error refreshing feed:', error);
        showNotification('Error refreshing feed');
    } finally {
        refreshBtn.disabled = false;
        refreshBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M23 4v6h-6M1 20v-6h6M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
            </svg>
            Refresh
        `;
    }
});

// Settings
saveSettingsBtn.addEventListener('click', async () => {
    const email = notificationEmail.value.trim();
    const interval = checkInterval.value;
    
    if (!email) {
        showNotification('Please enter a notification email');
        return;
    }
    
    if (!isValidEmail(email)) {
        showNotification('Please enter a valid email address');
        return;
    }
    
    saveSettingsBtn.disabled = true;
    saveSettingsBtn.textContent = 'Saving...';
    
    try {
        const response = await fetch('/api/settings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                notificationEmail: email,
                checkInterval: interval
            })
        });
        
        if (response.ok) {
            showNotification('Settings saved successfully!');
        } else {
            throw new Error('Failed to save settings');
        }
    } catch (error) {
        console.error('Error saving settings:', error);
        showNotification('Error saving settings');
    } finally {
        saveSettingsBtn.disabled = false;
        saveSettingsBtn.textContent = 'Save Settings';
    }
});

// Email validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Load initial data
async function loadInitialData() {
    try {
        const response = await fetch('/api/feed');
        const data = await response.json();
        updateFeed(data);
    } catch (error) {
        console.error('Error loading initial data:', error);
        feed.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                <h3>Connection Error</h3>
                <p>Unable to load feed data. Please check your connection.</p>
            </div>
        `;
    }
}

// Add Account functionality
addAccountBtn.addEventListener('click', async () => {
    const username = newAccountInput.value.trim();
    
    if (!username) {
        showStatusMessage('Please enter a username', 'error');
        return;
    }
    
    // Remove @ if user included it
    const cleanUsername = username.replace('@', '');
    
    addAccountBtn.disabled = true;
    addAccountBtn.innerHTML = `
        <div class="spinner" style="width: 16px; height: 16px; margin: 0;"></div>
        Adding...
    `;
    
    try {
        const response = await fetch('/api/accounts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                accounts: [cleanUsername]
            })
        });
        
        if (response.ok) {
            const result = await response.json();
            showStatusMessage(`Successfully added @${cleanUsername}`, 'success');
            newAccountInput.value = '';
            loadAccounts(); // Refresh the accounts list
        } else {
            const error = await response.json();
            throw new Error(error.message || 'Failed to add account');
        }
    } catch (error) {
        console.error('Error adding account:', error);
        showStatusMessage(error.message || 'Error adding account', 'error');
    } finally {
        addAccountBtn.disabled = false;
        addAccountBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add
        `;
    }
});

// Enter key to add account
newAccountInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addAccountBtn.click();
    }
});

// Status message helper
function showStatusMessage(message, type = 'success') {
    addAccountStatus.textContent = message;
    addAccountStatus.className = `status-message ${type}`;
    
    // Clear message after 3 seconds
    setTimeout(() => {
        addAccountStatus.textContent = '';
        addAccountStatus.className = 'status-message';
    }, 3000);
}

// Load accounts list
async function loadAccounts() {
    try {
        const response = await fetch('/api/accounts');
        const accounts = await response.json();
        updateAccountsList(accounts);
    } catch (error) {
        console.error('Error loading accounts:', error);
        accountsList.innerHTML = '<div class="error">Error loading accounts</div>';
    }
}

// Update accounts list display
function updateAccountsList(accounts) {
    if (accounts.length === 0) {
        accountsList.innerHTML = '<div class="empty-accounts">No accounts added yet</div>';
        return;
    }
    
    accountsList.innerHTML = accounts.map(account => `
        <div class="account-item">
            <img src="${account.profile_picture || 'https://via.placeholder.com/40'}" alt="${account.full_name || account.username}" class="account-avatar">
            <div class="account-info">
                <span class="account-name">${account.full_name || account.username}</span>
                <span class="account-username">@${account.username}</span>
            </div>
            <button class="remove-account-btn" onclick="removeAccount('${account.username}')" title="Remove account">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
            </button>
        </div>
    `).join('');
}

// Remove account
async function removeAccount(username) {
    if (!confirm(`Remove @${username} from monitored accounts?`)) {
        return;
    }
    
    try {
        const response = await fetch('/api/accounts/remove', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username })
        });
        
        if (response.ok) {
            showStatusMessage(`Removed @${username}`, 'success');
            loadAccounts(); // Refresh the accounts list
        } else {
            throw new Error('Failed to remove account');
        }
    } catch (error) {
        console.error('Error removing account:', error);
        showStatusMessage('Error removing account', 'error');
    }
}

// Instagram status function
function showInstagramStatus(message, type = 'info') {
    instagramStatus.textContent = message;
    instagramStatus.className = `status-message ${type}`;
    
    if (type !== 'info') {
        // Clear message after 5 seconds for success/error
        setTimeout(() => {
            instagramStatus.textContent = '';
            instagramStatus.className = 'status-message';
        }, 5000);
    }
}

        // Show Instagram status (public profiles don't need connection)
        function showInstagramStatus() {
            const statusElement = document.getElementById('instagramStatus');
            if (statusElement) {
                statusElement.innerHTML = '<span class="status-success">✅ Ready to fetch real posts from public Instagram accounts</span>';
                statusElement.className = 'status-message success';
            }
        }

        // Initialize app
        document.addEventListener('DOMContentLoaded', () => {
            loadInitialData();
            loadAccounts(); // Load accounts list
            showInstagramStatus(); // Show ready status
            
            // Load saved settings from localStorage
            const savedEmail = localStorage.getItem('notificationEmail');
            const savedInterval = localStorage.getItem('checkInterval');
            
            if (savedEmail) {
                notificationEmail.value = savedEmail;
            }
            
            if (savedInterval) {
                checkInterval.value = savedInterval;
            }
        });

// Auto-save settings to localStorage
notificationEmail.addEventListener('input', () => {
    localStorage.setItem('notificationEmail', notificationEmail.value);
});

checkInterval.addEventListener('change', () => {
    localStorage.setItem('checkInterval', checkInterval.value);
}); 