# Planet Trivia: Location-Based Trivial Pursuit
## Product Requirements Document

### Project Overview
A SvelteKit webapp that generates location-specific Trivial Pursuit questions using geolocation and AI. Two players compete to fill all 6 category segments of their "pie" to win.

### Technical Stack
- **Frontend:** SvelteKit with TypeScript
- **Backend:** Node.js API endpoint
- **Storage:** Svelte stores backed by localforage (IndexedDB)
- **AI:** Inexpensive AI model (OpenAI GPT-3.5-turbo or Anthropic Claude Haiku)
- **Geolocation:** Browser Geolocation API + reverse geocoding
- **Deployment:** Netlify

### Core Game Mechanics

#### Players & Turns
- Always exactly 2 players
- Turn alternation: Player 1 attempts question first
- If Player 1 incorrect → Player 2 attempts same question
- Next round: Player 2 goes first (regardless of previous outcome)

#### Winning Condition
- Fill all 6 pie segments (one per category)
- Categories: Geography, Entertainment, History, Arts & Literature, Science & Nature, Sports & Leisure

#### Question Generation
- 6 questions per "card" (one per category)
- All questions localized to user's geographic area
- Questions stored to prevent repetition
- New card generated when current exhausted

### User Flow

#### Game Initialization
1. User opens app
2. Request geolocation permission
3. Get lat/lng coordinates
4. Reverse geocode to get location context
5. Generate initial question card via AI
6. Display game board with empty pies

#### Game Loop
1. Display current question for current player
2. Player answers (multiple choice or text input)
3. If correct: award category point, advance turn
4. If incorrect: other player attempts same question
5. Advance to next question with turn alternation
6. Check win condition after each correct answer
7. Generate new card when current exhausted

### Data Models

#### Game State (Svelte Store)
```typescript
interface GameState {
  players: {
    player1: PlayerState;
    player2: PlayerState;
  };
  currentPlayer: 1 | 2;
  currentQuestionIndex: number;
  currentCard: QuestionCard;
  location: LocationData;
  usedQuestions: Set<string>; // Question IDs to prevent repeats
  gameStatus: 'setup' | 'playing' | 'finished';
  winner?: 1 | 2;
}

interface PlayerState {
  name: string;
  pieSegments: {
    geography: boolean;
    entertainment: boolean;
    history: boolean;
    arts: boolean;
    science: boolean;
    sports: boolean;
  };
}

interface QuestionCard {
  id: string;
  location: string;
  questions: Question[];
  generated: Date;
}

interface Question {
  id: string;
  category: CategoryType;
  question: string;
  options: string[]; // For multiple choice
  correctAnswer: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface LocationData {
  latitude: number;
  longitude: number;
  city: string;
  region: string;
  country: string;
  displayName: string;
}

type CategoryType = 'geography' | 'entertainment' | 'history' | 'arts' | 'science' | 'sports';
```

### API Specifications

#### POST /api/generate-questions
**Request:**
```json
{
  "location": {
    "latitude": 48.4284,
    "longitude": -123.3656,
    "city": "Victoria",
    "region": "British Columbia",
    "country": "Canada"
  },
  "usedQuestionIds": ["q1", "q2", "q3"]
}
```

**Response:**
```json
{
  "card": {
    "id": "card_123",
    "location": "Victoria, BC, Canada",
    "questions": [
      {
        "id": "q_456",
        "category": "geography",
        "question": "What body of water separates Victoria from the mainland?",
        "options": ["Strait of Georgia", "Juan de Fuca Strait", "Haro Strait", "Johnstone Strait"],
        "correctAnswer": "Strait of Georgia",
        "difficulty": "easy"
      }
      // ... 5 more questions
    ]
  }
}
```

#### GET /api/reverse-geocode?lat={lat}&lng={lng}
**Response:**
```json
{
  "city": "Victoria",
  "region": "British Columbia", 
  "country": "Canada",
  "displayName": "Victoria, BC, Canada"
}
```

### AI Prompt Template
```
Generate 6 Trivial Pursuit questions specifically about {locationName} and the surrounding area within 50km. 

Categories required:
1. Geography - local landmarks, physical features, location facts
2. Entertainment - local theaters, festivals, celebrity connections, venues
3. History - local historical events, founding, notable figures
4. Arts & Literature - local artists, museums, literary connections
5. Science & Nature - local wildlife, climate, natural phenomena, research institutions
6. Sports & Leisure - local teams, sports venues, recreational activities

Requirements:
- Questions should be answerable by locals or visitors with moderate knowledge
- Avoid overly obscure details that require internet search
- Provide 4 multiple choice options per question
- Focus on {city}, {region}, {country} but can include nearby areas
- Make questions engaging and varied in difficulty

Exclude these previously used question IDs: {usedQuestionIds}

Format as valid JSON matching the Question interface.
```

### UI/UX Requirements

#### Game Board Layout
- Two player pies side by side
- Current question display prominently centered
- Turn indicator clearly visible
- Progress indicators for both players
- Category icons for visual clarity

#### Visual Design
- Colorful, game-like aesthetic
- Clear category color coding (standard TP colors)
- Responsive design for mobile and desktop
- Animated pie filling for correct answers
- Celebration animation for wins

#### Question Interface
- Large, readable question text
- Multiple choice buttons with hover states
- Timer optional (configurable)
- Answer feedback (correct/incorrect with explanation)
- Next question button

### Implementation Notes

#### Geolocation Handling
- Request permission on app load
- Fallback to IP-based location if denied
- Cache location to avoid repeated requests
- Error handling for location failures

#### State Persistence
- Use localforage to persist game state
- Auto-save after each question
- Resume interrupted games
- Clear completed games option

#### Performance Optimizations
- Preload next question card when 2 questions remain
- Cache reverse geocoding results
- Debounce API calls
- Lazy load question images if used

#### Error Handling
- Network failures during question generation
- Geolocation permission denied
- AI service unavailable
- Invalid question format responses

#### Security Considerations
- Rate limit API endpoints
- Validate all inputs server-side
- Sanitize AI-generated content
- Prevent client-side manipulation of scores

### File Structure
```
src/
├── lib/
│   ├── stores/
│   │   ├── gameState.ts
│   │   ├── location.ts
│   │   └── questions.ts
│   ├── components/
│   │   ├── GameBoard.svelte
│   │   ├── PlayerPie.svelte
│   │   ├── QuestionCard.svelte
│   │   └── LocationSetup.svelte
│   ├── api/
│   │   ├── ai.ts
│   │   ├── geocoding.ts
│   │   └── questions.ts
│   └── utils/
│       ├── storage.ts
│       ├── gameLogic.ts
│       └── constants.ts
├── routes/
│   ├── +page.svelte (main game)
│   ├── api/
│   │   ├── generate-questions/
│   │   │   └── +server.ts
│   │   └── reverse-geocode/
│   │       └── +server.ts
└── app.html
```

### Development Phases
1. **Phase 1:** Basic game structure, UI components, local state management
2. **Phase 2:** Geolocation integration, reverse geocoding
3. **Phase 3:** AI question generation, API integration
4. **Phase 4:** Game logic completion, win conditions
5. **Phase 5:** Polish, animations, error handling, testing