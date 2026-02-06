# Jennifer White - Virtual Therapist

A warm, supportive AI-powered chat application designed to provide emotional support and a safe space for users to talk through their feelings.

![Jennifer White Interface](screenshot.png)

## Features

- 🧡 **Warm, empathetic conversations** - Jennifer is trained to listen actively, validate feelings, and guide users toward healthier perspectives
- 💬 **Clean chat interface** - Mobile-friendly design with a calming color palette
- ⌨️ **Typing indicator** - Visual feedback when Jennifer is thinking
- 🚨 **Crisis detection** - Automatic alerts for mental health emergencies
- 📧 **Email notifications** - Crisis situations trigger alerts to designated contacts
- 💾 **Session persistence** - Conversations continue across page refreshes

## Setup

### Prerequisites

- Node.js 18+
- An Anthropic API key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/virtual-therapist.git
   cd virtual-therapist
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment:
   ```bash
   cp .env.example .env
   # Edit .env and add your ANTHROPIC_API_KEY
   ```

4. Start the server:
   ```bash
   npm start
   ```

5. Open http://localhost:3000 in your browser

## Configuration

### Required
- `ANTHROPIC_API_KEY` - Your Anthropic API key

### Optional
- `PORT` - Server port (default: 3000)
- `SMTP_HOST` - Email server for crisis alerts
- `SMTP_PORT` - SMTP port (default: 587)
- `SMTP_USER` - Email account username
- `SMTP_PASS` - Email account password/app password

## Crisis Protocol

Jennifer includes built-in crisis detection. When someone expresses suicidal ideation, self-harm, or other serious concerns:

1. Jennifer responds with compassion and care
2. An email alert is sent to the configured contact
3. Jennifer encourages reaching out to professional help (988 Suicide & Crisis Lifeline)

## Tech Stack

- **Frontend**: Vanilla HTML/CSS/JavaScript
- **Backend**: Node.js + Express
- **AI**: Anthropic Claude API
- **Email**: Nodemailer

## Disclaimer

Jennifer White is an AI assistant and is not a substitute for professional mental health care. If you're experiencing a mental health crisis, please contact:

- **988 Suicide & Crisis Lifeline** (US): Call or text 988
- **Crisis Text Line**: Text HOME to 741741
- **International Association for Suicide Prevention**: https://www.iasp.info/resources/Crisis_Centres/

## License

MIT
