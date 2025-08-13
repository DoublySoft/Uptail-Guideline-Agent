# Uptail Guidelines Agent

A dynamic guidelines agent system for sales agents built with Next.js, Prisma, and PostgreSQL. Provides access to best practices and responses based on Parlant-style condition/action guidelines with intelligent selection and session management.

## 🚀 New Features

- **Dynamic Guidelines Agent**: AI-powered sales agent with intelligent guideline selection
- **Parlant Framework**: Condition/action-based guidelines that activate based on conversation context
- **Multi-LLM Support**: OpenAI and Vercel AI providers with easy switching
- **Session Management**: Automatic conversation summaries and context tracking
- **Test Interface**: Built-in testing page at `/test-agent`

## 🏗️ Architecture

The system implements a scalable per-agent architecture with:

- **Separation of Concerns**: API orchestration vs. business logic
- **Service Layer**: Data access abstraction through services
- **LLM Abstraction**: Provider-agnostic LLM interface
- **Guideline Selection**: Dynamic selection based on conversation context

## Data structure

### Principal Models

```typescript
// Guideline - Rule or guide for sales agents
interface Guideline {
  id: string;
  title: string;           // Guideline title
  content: string;         // Guideline content
  strength: 'hard' | 'soft'; // Guideline strength (mandatory/optional)
  priority: number;        // Priority (1-10, higher = more important)
  triggers: string[];      // Keywords that activate the guideline
  use_once: boolean;       // Whether it should be used only once per session
  createdAt: Date;         // Creation date
  updatedAt: Date;         // Last update date
}
```

```typescript
// Session - Conversation or interaction with a client
interface Session {
  id: string;
  createdAt: Date;         // Session start date
}
```

```typescript
// Message - Individual communication within a session
interface Message {
  id: string;
  sessionId: string;       // ID of the session it belongs to
  role: 'user' | 'assistant'; // Role of the message sender
  content: string;         // Message content
  createdAt: Date;         // Message creation date
}
```

```typescript
// Guideline Usage - Record of when a guideline was applied
interface GuidelineUsage {
  id: string;
  sessionId: string;       // ID of the session where it was used
  messageId: string;       // ID of the message where it was applied
  guidelineId: string;     // ID of the guideline used
  usedAt: Date;            // Date and time of usage
}
```

### Model Relationships

- **Session** → **Message** (1:N): A session can have multiple messages
- **Session** → **GuidelineUsage** (1:N): A session can record multiple guideline usages
- **Message** → **GuidelineUsage** (1:N): A message can apply multiple guidelines
- **Guideline** → **GuidelineUsage** (1:N): A guideline can be used multiple times

### Enums and Special Types

```typescript
enum GuidelineStrength {
  hard,  // Mandatory guideline that must be followed
  soft   // Optional guideline or recommendation
}

interface GuidelineQuery {
  strength?: 'hard' | 'soft';      // Filter by strength
  priority_min?: number;           // Minimum priority
  priority_max?: number;           // Maximum priority
  triggers?: string[];             // Filter by keywords
  use_once?: boolean;              // Filter by single use
  limit?: number;                  // Result limit
}
```

## 🎯 Agent Usage

### Quick Start

1. **Test the Agent**: Navigate to `/test-agent` to interact with the sales agent
2. **API Endpoint**: Use `POST /api/agent/respond` to integrate with your application
3. **Configuration**: Set your LLM provider and API keys in environment variables

### Example API Call

```bash
curl -X POST http://localhost:3000/api/agent/respond \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What does Uptail cost?",
    "sessionId": "optional-session-id"
  }'
```

### Response Format

```json
{
  "sessionId": "session-id",
  "reply": "I'd be happy to discuss pricing...",
  "hardGuidelinesUsed": ["sales-hard-001"],
  "softGuidelinesUsed": ["sales-soft-001"]
}
```

## 🛠️ Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd uptail-guideline-agent
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up database with Docker**

   ```bash
   # Start PostgreSQL with Docker
   npm run db:setup
   ```

4. **Configure environment variables**

   ```bash
   cp config.example.env .env
   # Edit .env with your API keys and configuration
   ```

   This command automatically:
   - Starts the PostgreSQL container
   - Generates the Prisma client
   - Runs migrations
   - Populates the database with sample data

5. **Manual configuration (optional)**

   ```bash
   # Create .env.local file
   cp config.example.env .env.local
   
   # Start only the database
   npm run db:up
   
   # Generate Prisma client
   npm run db:generate
   
   # Run migrations
   npm run db:migrate
   
   # Populate with sample data
   npm run db:seed
   ```

6. **Run in development**

   ```bash
   npm run dev
   ```

## API Usage

### Available Endpoints

#### GET `/api/guidelines`

Gets all guidelines.

#### POST `/api/guidelines`

Creates a new guideline.

**Body:**

```json
{
  "title": "New Guideline",
  "content": "Guideline content",
  "strength": "hard",
  "priority": 8,
  "triggers": ["word1", "word2"],
  "use_once": false
}
```

#### GET `/api/guidelines/[id]`

Gets a specific guideline by ID.

#### PUT `/api/guidelines/[id]`

Updates an existing guideline.

#### DELETE `/api/guidelines/[id]`

Deletes a guideline.

#### GET `/api/guidelines/search`

Searches guidelines with filters.

**Query Parameters:**

- `strength`: Filter by strength (`hard` or `soft`)
- `priority_min`: Minimum priority (1-10)
- `priority_max`: Maximum priority (1-10)
- `triggers`: Comma-separated triggers
- `use_once`: Filter by single-use guidelines
- `limit`: Maximum number of results

**Example:**

```bash
GET /api/guidelines/search?strength=hard&priority_min=8&limit=5
```

### Session Endpoints

#### GET `/api/sessions`

Gets all conversation sessions.

#### POST `/api/sessions`

Creates a new session.

#### GET `/api/sessions/[id]`

Gets a specific session by ID.

#### GET `/api/sessions/[id]/messages`

Gets all messages from a specific session.

#### POST `/api/sessions/[id]/messages`

Creates a new message in a specific session.

**Body:**

```json
{
  "role": "user",
  "content": "User message"
}
```

#### GET `/api/sessions/[id]/guideline-usage`

Gets the guideline usage history in a specific session.

### Message Endpoints

#### GET `/api/messages/[messageId]/guideline-usage`

Gets the guidelines applied in a specific message.

### Usage Examples

```typescript
// Get high priority guidelines
const response = await fetch('/api/guidelines/search?priority_min=8');
const guidelines = await response.json();
```

```typescript
// Get guidelines by triggers
const response = await fetch('/api/guidelines/search?triggers=price,cost');
const guidelines = await response.json();
```

```typescript
// Create new guideline
const newGuideline = await fetch('/api/guidelines', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: "New Guideline",
    content: "Content",
    strength: "hard",
    priority: 9,
    triggers: ["trigger1", "trigger2"]
  })
});
```

```typescript
// Create new session
const newSession = await fetch('/api/sessions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
});
```

```typescript
// Add message to a session
const newMessage = await fetch('/api/sessions/sessionId/messages', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    role: 'user',
    content: 'Hello, I need information about pricing'
  })
});
```

```typescript
// Get guideline usage history in a session
const usageHistory = await fetch('/api/sessions/sessionId/guideline-usage');
const usages = await usageHistory.json();
```

## Available Scripts

### Development

- `npm run dev` - Run in development mode
- `npm run build` - Build for production
- `npm run start` - Run in production mode
- `npm run lint` - Run linter

### Database

- `npm run db:setup` - Complete database setup
- `npm run db:up` - Start PostgreSQL container
- `npm run db:down` - Stop PostgreSQL container
- `npm run db:restart` - Restart PostgreSQL container
- `npm run db:logs` - View database logs
- `npm run db:generate` - Generate Prisma client
- `npm run db:migrate` - Run migrations
- `npm run db:seed` - Populate database
- `npm run db:studio` - Open Prisma Studio
- `npm run db:reset` - Reset and repopulate database

## Project Structure

```bash
src/
├── app/
│   ├── api/
│   │   ├── guidelines/
│   │   │   ├── route.ts           # GET, POST /api/guidelines
│   │   │   ├── [id]/route.ts      # GET, PUT, DELETE /api/guidelines/[id]
│   │   │   └── search/route.ts    # GET /api/guidelines/search
│   │   ├── sessions/
│   │   │   ├── route.ts           # GET, POST /api/sessions
│   │   │   ├── [id]/route.ts      # GET, PUT, DELETE /api/sessions/[id]
│   │   │   ├── [id]/messages/route.ts # GET, POST /api/sessions/[id]/messages
│   │   │   └── [id]/guideline-usage/route.ts # GET /api/sessions/[id]/guideline-usage
│   │   ├── messages/
│   │   │   └── [messageId]/guideline-usage/route.ts # GET /api/messages/[messageId]/guideline-usage
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
├── components/
│   ├── GuidelinesList.tsx         # List of available guidelines
│   ├── SessionsList.tsx           # List of conversation sessions
│   ├── MessagesList.tsx           # List of messages in a session
│   ├── SessionGuidelinesOverview.tsx # Summary of guidelines used in session
│   └── GuidelineUsageDetails.tsx  # Guideline usage details
├── services/
│   ├── guidelines.service.ts      # Service for guideline management
│   ├── sessions.service.ts        # Service for session management
│   ├── messages.service.ts        # Service for message management
│   └── guideline-usage.service.ts # Service for usage tracking
├── types/
│   ├── guideline.ts               # Types for guidelines
│   ├── session.ts                 # Types for sessions
│   ├── message.ts                 # Types for messages
│   └── guideline-usage.ts        # Types for guideline usage
└── prisma/
    ├── schema.prisma              # Database schema
    ├── migrations/                # Database migrations
    └── seed.ts                    # Initial data
```

## System Features

### Guideline Management

- **Intelligent Guidelines**: Priority and trigger system for automatic activation
- **Configurable Strength**: "Hard" (mandatory) and "soft" (recommendation) guidelines
- **Single Use**: Control of guidelines that should only be applied once per session
- **Advanced Search**: Filters by priority, strength, triggers and single use

### Session System

- **Organized Conversations**: Each client interaction is recorded as a session
- **Complete History**: Tracking of all messages and applied guidelines
- **Usage Tracking**: Detailed record of when and how guidelines are applied

### Complete RESTful API

- **Guideline CRUD**: Read guidelines
- **Session Management**: Create, read, delete and manage conversations
- **Message System**: Message exchange within sessions
- **Usage Analysis**: Endpoints to analyze guideline effectiveness

## Container Database

The project uses PostgreSQL with Docker for persistent data storage.

### Docker Configuration

- **Image:** PostgreSQL 15 Alpine
- **Port:** 5432
- **Database:** uptail_guidelines
- **User:** uptail_user
- **Password:** uptail_password
- **Volume:** postgres_data (persistent)

### Data Migration

Existing data in `guidelines.json` is automatically migrated when running `npm run db:seed`.

## Database Management

### Start/Stop

```bash
npm run db:up      # Start
npm run db:down    # Stop
npm run db:restart # Restart
```

### View Logs

```bash
npm run db:logs
```

### Direct Access

```bash
npm run db:studio  # Prisma web interface
```

### Reset

```bash
npm run db:reset   # Reset and repopulate
```

## Troubleshooting

### Connection Issues

- Verify Docker is running
- Check container is active: `docker ps`
- Verify environment variables in `.env.local`
- Review logs: `npm run db:logs`

### Prisma Issues

- Regenerate client: `npm run db:generate`
- Reset database: `npm run db:reset`
- Verify schema: `npm run db:studio`

### Port Conflicts

If port 5432 is occupied, modify `docker-compose.yml`:

```yaml
ports:
  - "5433:5432"  # Use different port
```

## License

This project is under the MIT License. See the `LICENSE` file for more details.
