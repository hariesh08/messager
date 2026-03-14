// ================================================
// dashboard.js
// Handles saving and displaying the user's messages
// ================================================

import { supabaseClient } from './supabase-client.js';
import { requireAuth, logoutUser } from './auth.js';

let currentUser = null;

// Dom refs (assigned after DOMContentLoaded)
let messageInput, saveBtn, messagesList, msgCount, userEmailEl;

async function init() {
    // Guard: redirect to login if not authenticated
    const session = await requireAuth();
    currentUser = session.user;

    // Wire up DOM elements
    messageInput = document.getElementById('message-input');
    saveBtn = document.getElementById('save-btn');
    messagesList = document.getElementById('messages-list');
    msgCount = document.getElementById('msg-count');
    userEmailEl = document.getElementById('user-email');

    if (userEmailEl) userEmailEl.textContent = currentUser.email;

    // Logout button
    document.getElementById('logout-btn')?.addEventListener('click', () => {
        logoutUser();
    });

    // Save button
    saveBtn?.addEventListener('click', handleSave);

    // Allow Ctrl+Enter to save
    messageInput?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            handleSave();
        }
    });

    // Load existing messages
    await loadMessages();
}

/**
 * Insert a new message into the database.
 */
async function handleSave() {
    const content = messageInput.value.trim();
    if (!content) {
        flashInput();
        return;
    }

    setLoading(true);

    const { error } = await supabaseClient
        .from('messages')
        .insert({ content, user_id: currentUser.id });

    setLoading(false);

    if (error) {
        console.error('Error saving message:', error.message);
        showToast('Failed to save message. Please try again.', 'error');
        return;
    }

    messageInput.value = '';
    showToast('Message saved!', 'success');
    await loadMessages();
}

/**
 * Fetch all messages for the logged-in user.
 * RLS ensures they only get their own rows.
 */
async function loadMessages() {
    // Show skeleton loaders
    renderSkeletons(3);

    const { data: messages, error } = await supabaseClient
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error loading messages:', error.message);
        messagesList.innerHTML = `<p style="color:var(--danger);text-align:center;padding:2rem">
      Error loading messages: ${error.message}</p>`;
        return;
    }

    renderMessages(messages || []);
}

/**
 * Render the messages array into the DOM.
 */
function renderMessages(messages) {
    // Update count badge
    if (msgCount) msgCount.textContent = `${messages.length} message${messages.length !== 1 ? 's' : ''}`;

    if (messages.length === 0) {
        messagesList.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">💬</div>
        <p>No messages yet. Write something above!</p>
      </div>`;
        return;
    }

    messagesList.innerHTML = messages.map((msg, i) => `
    <div class="message-item" style="animation-delay:${i * 0.05}s">
      <div class="message-content">${escapeHtml(msg.content)}</div>
      <div class="message-meta">
        <span class="message-ts">${formatDate(msg.created_at)}</span>
      </div>
    </div>
  `).join('');
}

/**
 * Render placeholder skeleton cards while loading.
 */
function renderSkeletons(count) {
    messagesList.innerHTML = Array.from({ length: count }, () =>
        `<div class="skeleton"></div>`
    ).join('');
}

// ---- Helpers ----

function setLoading(isLoading) {
    saveBtn.disabled = isLoading;
    if (isLoading) {
        saveBtn.classList.add('loading');
        saveBtn.querySelector('.btn-text').textContent = 'Saving…';
    } else {
        saveBtn.classList.remove('loading');
        saveBtn.querySelector('.btn-text').textContent = 'Save Message';
    }
}

function flashInput() {
    messageInput.style.borderColor = 'var(--danger)';
    messageInput.style.boxShadow = '0 0 0 3px rgba(248,113,113,0.2)';
    messageInput.focus();
    setTimeout(() => {
        messageInput.style.borderColor = '';
        messageInput.style.boxShadow = '';
    }, 1000);
}

function escapeHtml(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function formatDate(isoString) {
    const date = new Date(isoString);
    return date.toLocaleString(undefined, {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
}

let toastTimer;
function showToast(message, type = 'success') {
    // Reuse or create toast element
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.style.cssText = `
      position:fixed; bottom:1.5rem; right:1.5rem; z-index:999;
      padding:0.75rem 1.25rem; border-radius:10px;
      font-size:0.875rem; font-weight:500;
      backdrop-filter:blur(16px); animation:fadeIn 0.2s ease;
      transition:opacity 0.3s ease;
    `;
        document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.style.opacity = '1';

    if (type === 'success') {
        toast.style.background = 'rgba(52,211,153,0.15)';
        toast.style.border = '1px solid rgba(52,211,153,0.35)';
        toast.style.color = 'var(--success)';
    } else {
        toast.style.background = 'rgba(248,113,113,0.15)';
        toast.style.border = '1px solid rgba(248,113,113,0.35)';
        toast.style.color = 'var(--danger)';
    }

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toast.style.opacity = '0'; }, 2800);
}

document.addEventListener('DOMContentLoaded', init);
