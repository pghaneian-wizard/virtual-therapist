/**
 * Jennifer White - Virtual Therapist
 * Apple-like Glass Morphism UI
 */

// Session management
function getSessionId() {
  let sessionId = localStorage.getItem('therapist-session-id');
  if (!sessionId) {
    sessionId = `session-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    localStorage.setItem('therapist-session-id', sessionId);
  }
  return sessionId;
}

const sessionId = getSessionId();

// DOM Elements
const chatContainer = document.getElementById('chatContainer');
const chatMessages = document.getElementById('chatMessages');
const messageInput = document.getElementById('messageInput');
const typingIndicator = document.getElementById('typingIndicator');
const sendBtn = document.getElementById('sendBtn');

// Auto-resize textarea with smooth animation
function autoResizeTextarea() {
  messageInput.style.height = 'auto';
  const newHeight = Math.min(messageInput.scrollHeight, 120);
  messageInput.style.height = `${newHeight}px`;
}

messageInput.addEventListener('input', autoResizeTextarea);

// Handle keyboard shortcuts
function handleKeyDown(event) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
}

// Smooth scroll to bottom
function scrollToBottom(smooth = true) {
  requestAnimationFrame(() => {
    chatContainer.scrollTo({
      top: chatContainer.scrollHeight,
      behavior: smooth ? 'smooth' : 'auto'
    });
  });
}

// Create message element
function createMessageElement(content, isUser = false) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${isUser ? 'user' : 'assistant'} fade-in`;
  
  const avatar = document.createElement('div');
  avatar.className = 'message-avatar';
  
  const avatarSpan = document.createElement('span');
  avatarSpan.textContent = isUser ? '●' : 'JW';
  avatar.appendChild(avatarSpan);
  
  const bubble = document.createElement('div');
  bubble.className = `message-bubble${isUser ? '' : ' glass'}`;
  
  // Parse content into paragraphs
  const paragraphs = content.split('\n').filter(p => p.trim());
  paragraphs.forEach(text => {
    const p = document.createElement('p');
    p.textContent = text;
    bubble.appendChild(p);
  });
  
  messageDiv.appendChild(avatar);
  messageDiv.appendChild(bubble);
  
  return messageDiv;
}

// Add message to chat
function addMessage(content, isUser = false) {
  const message = createMessageElement(content, isUser);
  chatMessages.appendChild(message);
  scrollToBottom();
}

// Toggle typing indicator
function showTyping(show) {
  if (show) {
    typingIndicator.classList.add('active');
  } else {
    typingIndicator.classList.remove('active');
  }
  scrollToBottom();
}

// Send message to API
async function sendMessage() {
  const message = messageInput.value.trim();
  if (!message || sendBtn.disabled) return;
  
  // Clear and reset input
  messageInput.value = '';
  autoResizeTextarea();
  
  // Add user message
  addMessage(message, true);
  
  // Disable input during request
  sendBtn.disabled = true;
  messageInput.disabled = true;
  
  // Show typing indicator
  showTyping(true);
  
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message, sessionId })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Hide typing and show response
    showTyping(false);
    addMessage(data.message);
    
  } catch (error) {
    console.error('Error:', error);
    showTyping(false);
    addMessage("I'm having a little trouble connecting right now. Please try again in a moment. 💛");
  } finally {
    // Re-enable input
    sendBtn.disabled = false;
    messageInput.disabled = false;
    messageInput.focus();
  }
}

// Start new conversation
async function startNewChat() {
  // Modern confirmation dialog would be better, but using native for simplicity
  if (!confirm('Start a fresh conversation? Your current chat will be cleared.')) {
    return;
  }
  
  // Clear server session
  try {
    await fetch('/api/clear', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ sessionId })
    });
  } catch (error) {
    console.error('Error clearing session:', error);
  }
  
  // Generate new session
  const newSessionId = `session-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  localStorage.setItem('therapist-session-id', newSessionId);
  
  // Reload to reset state
  location.reload();
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  messageInput.focus();
  scrollToBottom(false);
  
  // Handle iOS keyboard
  if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
    messageInput.addEventListener('focus', () => {
      setTimeout(() => scrollToBottom(), 300);
    });
  }
});

// Prevent zoom on double-tap for iOS
let lastTouchEnd = 0;
document.addEventListener('touchend', (event) => {
  const now = Date.now();
  if (now - lastTouchEnd <= 300) {
    event.preventDefault();
  }
  lastTouchEnd = now;
}, false);
