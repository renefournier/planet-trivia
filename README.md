# 🌍 Planet Trivia

A location-based Trivial Pursuit game that generates questions specific to your geographic location using AI. Two players compete to fill their "pie" by correctly answering questions across 6 categories, all tailored to their current location.

## 🎮 How It Works

1. **Get Permission**: App requests your location
2. **Generate Questions**: AI creates 6 Trivial Pursuit questions based on your area
3. **Take Turns**: Players alternate answering questions
4. **Fill Your Pie**: Correct answers fill category segments
5. **Win**: First player to complete all 6 categories wins!

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or pnpm
- AI API key (OpenAI or Anthropic)

### Installation
```bash
git clone <repository-url>
cd planet-trivia
npm install
```

### Environment Setup
Create `.env` file:
```bash
# AI Service (choose one)
OPENAI_API_KEY=your_openai_key_here
# OR
ANTHROPIC_API_KEY=your_anthropic_key_here

# Geocoding Service
GEOCODING_API_KEY=your_geocoding_key_here  # Optional: for enhanced location data

# App Settings
PUBLIC_APP_NAME=Planet Trivia
PUBLIC_DEFAULT_LOCATION=Victoria,BC,Canada  # Fallback location
```

### Development
```bash
npm run dev
# Opens http://localhost:5173
```

### Build & Deploy
```bash
npm run build
npm run preview  # Test production build locally

# Deploy to Netlify
netlify deploy --prod
```

## 🏗️ Architecture

### Tech Stack
- **Frontend**: SvelteKit + TypeScript
- **Backend**: Node.js API routes
- **Storage**: IndexedDB via localforage (no database needed)
- **AI**: OpenAI GPT-3.5-turbo or Anthropic Claude Haiku
- **Deployment**: Netlify
- **Styling**: Tailwind CSS (recommended)

### Key Features
- **Geolocation**: Browser geolocation with reverse geocoding
- **Local Storage**: Game state persisted locally
- **Question Deduplication**: No repeated questions per session
- **Responsive Design**: Works on mobile and desktop
- **Offline Resilience**: Cached game states survive page refreshes

## 🎯 Game Rules

### Categories
1. **Geography** - Local landmarks, physical features
2. **Entertainment** - Theaters, festivals, venues  
3. **History** - Historical events, notable figures
4. **Arts & Literature** - Museums, artists, writers
5. **Science & Nature** - Wildlife, climate, research
6. **Sports & Leisure** - Teams, venues, activities

### Turn Flow
- Player 1 attempts question first
- If wrong → Player 2 tries same question  
- Next round → Player 2 goes first
- Continue alternating until someone wins

### Winning
Fill all 6 pie segments (one per category)

## 🔧 Development Guide

### Project Structure
```
src/
├── lib/
│   ├── stores/          # Svelte stores for state management
│   ├── components/      # Reusable UI components  
│   ├── api/            # Client-side API helpers
│   └── utils/          # Shared utilities
├── routes/
│   ├── +page.svelte    # Main game interface
│   └── api/            # Server-side API endpoints
└── static/             # Static assets
```

### Key Components
- **GameBoard.svelte**: Main game interface
- **PlayerPie.svelte**: Individual player progress
- **QuestionCard.svelte**: Question display and answering
- **LocationSetup.svelte**: Geolocation handling

### API Endpoints
- `POST /api/generate-questions` - Generate location-based questions
- `GET /api/reverse-geocode` - Convert coordinates to location names

### State Management
Game state handled by Svelte stores backed by localforage:
- Player progress and scores
- Current question and turn
- Location data
- Question history (for deduplication)

## 🌍 Location Features

### Geolocation
- Requests browser permission for precise location
- Falls back to IP-based location if denied
- Caches location to avoid repeated requests

### Question Generation
- AI generates questions specific to your area (50km radius)
- Includes local landmarks, history, culture, and events
- Avoids overly obscure or Google-searchable questions
- Questions cached to prevent repetition

## 🎨 Customization

### Adding New Categories
1. Update `CategoryType` in `src/lib/types.ts`
2. Add category to AI prompt template
3. Update UI components for new category

### AI Model Configuration
Switch between AI providers in `src/routes/api/generate-questions/+server.ts`:
```typescript
// OpenAI
import OpenAI from 'openai';

// Anthropic  
import Anthropic from '@anthropic-ai/sdk';
```

### Styling
Default setup uses utility-first CSS. Add your preferred styling framework:
```bash
# Tailwind CSS
npm install -D tailwindcss @tailwindcss/typography
npx tailwindcss init -p

# Or use vanilla CSS in src/app.css
```

## 🚦 Testing

### Manual Testing Checklist
- [ ] Geolocation permission flow
- [ ] Question generation and display
- [ ] Turn alternation mechanics
- [ ] Scoring and pie filling
- [ ] Win condition detection
- [ ] Game state persistence
- [ ] Error handling (network failures, location denied)

### Location Testing
Test with different locations by temporarily hardcoding coordinates:
```typescript
// For testing specific locations
const testLocation = {
  latitude: 48.4284,   // Victoria, BC
  longitude: -123.3656
};
```

## 📱 Mobile Considerations

- Touch-friendly button sizes
- Responsive layout for small screens  
- Consider device orientation changes
- Test geolocation accuracy on mobile vs desktop

## 🔒 Security Notes

- API keys stored server-side only
- Input validation on all endpoints
- Rate limiting on AI API calls
- Sanitize AI-generated content before display

## 🐛 Troubleshooting

### Common Issues

**Geolocation not working:**
- Check HTTPS requirement for geolocation
- Verify browser permissions
- Test fallback location logic

**Questions not generating:**
- Verify AI API key is set correctly
- Check API rate limits
- Review prompt template formatting

**Game state not persisting:**
- Check browser IndexedDB support
- Clear localStorage/IndexedDB and retry
- Verify localforage initialization

## 📄 License

MIT License - Feel free to use and modify for your projects!

## 🤝 Contributing

This is a personal project, but suggestions and improvements are welcome via issues or pull requests.

---

**Built with ❤️ in Victoria, BC 🇨🇦**