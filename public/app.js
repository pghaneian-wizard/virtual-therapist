// Generate or retrieve session ID
function getSessionId() {
  let sessionId = localStorage.getItem('therapist-session-id');
  if (!sessionId) {
    sessionId = 'session-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('therapist-session-id', sessionId);
  }
  return sessionId;
}

const sessionId = getSessionId();
const chatMessages = document.getElementById('chatMessages');
const messageInput = document.getElementById('messageInput');
const typingIndicator = document.getElementById('typingIndicator');
const sendBtn = document.getElementById('sendBtn');

// Auto-resize textarea
messageInput.addEventListener('input', function() {
  this.style.height = 'auto';
  this.style.height = Math.min(this.scrollHeight, 120) + 'px';
});

// Handle Enter key
function handleKeyDown(event) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
}

// Scroll to bottom of chat
function scrollToBottom() {
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Add message to chat
function addMessage(content, isUser = false) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${isUser ? 'user' : 'assistant'}`;
  
  const avatar = document.createElement('div');
  avatar.className = 'message-avatar';
  avatar.textContent = isUser ? '👤' : 'JW';
  
  const contentDiv = document.createElement('div');
  contentDiv.className = 'message-content';
  
  // Split content into paragraphs
  const paragraphs = content.split('\n').filter(p => p.trim());
  paragraphs.forEach(p => {
    const para = document.createElement('p');
    para.textContent = p;
    contentDiv.appendChild(para);
  });
  
  messageDiv.appendChild(avatar);
  messageDiv.appendChild(contentDiv);
  chatMessages.appendChild(messageDiv);
  
  scrollToBottom();
}

// Show/hide typing indicator
function showTyping(show) {
  typingIndicator.classList.toggle('active', show);
  if (show) scrollToBottom();
}

// Send message
async function sendMessage() {
  const message = messageInput.value.trim();
  if (!message) return;
  
  // Clear input
  messageInput.value = '';
  messageInput.style.height = 'auto';
  
  // Add user message
  addMessage(message, true);
  
  // Disable send button
  sendBtn.disabled = true;
  
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
      throw new Error('Network response was not ok');
    }
    
    const data = await response.json();
    
    // Hide typing indicator
    showTyping(false);
    
    // Add assistant message
    addMessage(data.message);
    
  } catch (error) {
    console.error('Error:', error);
    showTyping(false);
    addMessage("I'm having a little trouble connecting right now. Please try again in a moment. 💛");
  }
  
  // Re-enable send button
  sendBtn.disabled = false;
  messageInput.focus();
}

// Start new chat
async function startNewChat() {
  if (!confirm('Start a fresh conversation? Your current chat will be cleared.')) {
    return;
  }
  
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
  
  // Generate new session ID
  const newSessionId = 'session-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  localStorage.setItem('therapist-session-id', newSessionId);
  
  // Clear chat messages except welcome
  chatMessages.innerHTML = '';
  
  // Add welcome message back
  const welcomeDiv = document.createElement('div');
  welcomeDiv.className = 'message assistant';
  welcomeDiv.innerHTML = `
    <div class="message-avatar">JW</div>
    <div class="message-content">
      <p>Hello, I'm Jennifer. 💛</p>
      <p>This is a safe space for you to share whatever's on your mind. There's no judgment here—just a listening ear and support.</p>
      <p>What would you like to talk about today?</p>
    </div>
  `;
  chatMessages.appendChild(welcomeDiv);
  
  // Reload page to reset session
  location.reload();
}

// Focus input on load
messageInput.focus();
