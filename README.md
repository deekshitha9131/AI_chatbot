# AI-Powered Chatbot Backend

A secure, scalable backend for an AI chatbot system with OpenAI/Gemini integration.

## Features

- **AI Integration**: OpenAI GPT and Google Gemini API support
- **User Management**: JWT-based authentication with role-based access
- **Chat History**: Complete query/response logging with filtering
- **Admin Panel**: Query logs monitoring and usage statistics
- **Security**: Rate limiting, helmet protection, secure API key management

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment**
   - Copy `.env` file and update with your API keys
   - Set MongoDB connection string
   - Configure JWT secret

3. **Start Server**
   ```bash
   npm run dev  # Development
   npm start    # Production
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Chat
- `POST /api/chat/query` - Send query to AI (requires auth)
- `GET /api/chat/history/:userId` - Get chat history (requires auth)

### Admin
- `GET /api/admin/logs` - Get all query logs (admin only)
- `GET /api/admin/stats` - Get usage statistics (admin only)

## Database Schema

### Users
- userId, name, email, password, role, createdAt

### ChatHistory
- chatId, userId, query, reply, model, tokens, timestamp

### AdminLogs
- logId, actionType, performedBy, details, timestamp

## Configuration

Update `.env` file with:
- MongoDB URI
- OpenAI/Gemini API keys
- JWT secret
- Model parameters (temperature, max tokens)

## Security Features

- JWT token authentication
- Role-based access control
- Rate limiting (100 requests/15min)
- Helmet security headers
- Password hashing with bcrypt