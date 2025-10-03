# Space Invaders Clone - Product Requirements Document

A nostalgic and engaging browser-based Space Invaders game that delivers classic arcade gameplay with modern React and TypeScript architecture.

**Experience Qualities**:
1. **Nostalgic** - Evokes the classic arcade experience with authentic game mechanics and visual style
2. **Responsive** - Smooth 60fps gameplay with immediate feedback to player actions  
3. **Engaging** - Progressive difficulty and clear scoring system that encourages replay

**Complexity Level**: Light Application (multiple features with basic state)
The game includes multiple interconnected systems (player controls, collision detection, wave progression, scoring) with persistent state management but remains focused on core gameplay mechanics.

## Essential Features

### Player Movement & Controls
- **Functionality**: Smooth horizontal ship movement and bullet firing
- **Purpose**: Core player interaction and agency in the game world
- **Trigger**: Arrow key presses and spacebar input
- **Progression**: Key press → movement calculation → position update → canvas redraw
- **Success criteria**: Ship moves smoothly within screen boundaries, bullets fire on spacebar with rate limiting

### Alien Wave System
- **Functionality**: Grid formation of invaders that move in synchronized patterns
- **Purpose**: Primary challenge and progression mechanism
- **Trigger**: Game start or completion of previous wave
- **Progression**: Wave spawn → horizontal movement → edge detection → downward shift → repeat
- **Success criteria**: Aliens move in formation, increase speed over time, trigger game over when reaching bottom

### Collision Detection & Scoring
- **Functionality**: Detect bullet-alien and alien-player impacts with point awards
- **Purpose**: Core game mechanics and player reward system
- **Trigger**: Entity overlap during frame updates
- **Progression**: Position check → collision calculation → entity removal → score update → UI refresh
- **Success criteria**: Accurate hit detection, immediate visual feedback, persistent score tracking

### Game State Management
- **Functionality**: Start screen, pause functionality, game over handling, and wave progression
- **Purpose**: Complete game experience with clear state transitions
- **Trigger**: Player actions or game conditions (all aliens destroyed, player defeated)
- **Progression**: State change → UI update → game loop adjustment → visual transition
- **Success criteria**: Smooth transitions between states, persistent high scores, clear win/lose conditions

## Edge Case Handling

- **Rapid Fire Prevention**: Rate limiting on bullet creation to prevent screen spam
- **Boundary Enforcement**: Ship and bullet position clamping to prevent off-screen entities
- **Wave Completion**: Graceful transition when no aliens remain active
- **Performance Optimization**: Entity cleanup and efficient collision detection for smooth framerates
- **Keyboard Focus**: Proper event handling to ensure controls work consistently

## Design Direction

The design should feel authentically retro and immediately familiar to arcade game enthusiasts, with crisp pixel-perfect graphics and satisfying game feel that prioritizes gameplay clarity over visual complexity.

## Color Selection

Triadic color scheme using classic arcade colors with high contrast for optimal gameplay visibility.

- **Primary Color**: Electric Blue (oklch(0.7 0.3 240)) - Communicates technology and space theme
- **Secondary Colors**: 
  - Alien Green (oklch(0.65 0.25 120)) - Classic invader identification
  - Warning Red (oklch(0.6 0.25 0)) - Danger states and player elements
- **Accent Color**: Bright Yellow (oklch(0.85 0.15 60)) - Score highlights and power-ups
- **Foreground/Background Pairings**:
  - Background (Deep Space Black oklch(0.1 0 0)): White text (oklch(0.95 0 0)) - Ratio 8.2:1 ✓
  - Primary (Electric Blue): White text (oklch(0.95 0 0)) - Ratio 4.8:1 ✓
  - Secondary (Alien Green): White text (oklch(0.95 0 0)) - Ratio 5.1:1 ✓
  - Accent (Bright Yellow): Black text (oklch(0.1 0 0)) - Ratio 6.3:1 ✓

## Font Selection

Monospace typography that evokes classic computer terminals and arcade cabinets while ensuring perfect readability for scores and UI elements.

- **Typographic Hierarchy**:
  - H1 (Game Title): JetBrains Mono Bold/32px/tight spacing
  - H2 (Wave Number): JetBrains Mono Medium/24px/normal spacing  
  - Body (Score/Instructions): JetBrains Mono Regular/16px/relaxed spacing
  - Small (High Score): JetBrains Mono Regular/14px/tight spacing

## Animations

Subtle and purposeful animations that enhance the retro arcade feel without distracting from precise gameplay, focusing on satisfying feedback for player actions.

- **Purposeful Meaning**: Quick, snappy animations reinforce the immediate responsiveness of classic arcade games
- **Hierarchy of Movement**: 
  - Primary: Smooth entity movement (ship, aliens, bullets) at 60fps
  - Secondary: UI state transitions and score animations
  - Tertiary: Explosion effects and particle feedback

## Component Selection

- **Components**: 
  - Card for game over and start screens with retro styling
  - Button for menu actions with pixel-perfect hover states
  - Canvas element as the primary game surface
  - Custom score display components with monospace styling
- **Customizations**: 
  - Custom game canvas component with optimal rendering setup
  - Retro-styled UI overlays with scanline effects
  - Custom hook for keyboard input handling
- **States**: 
  - Buttons: Clear pressed states with immediate visual feedback
  - Game states: Distinct visual modes for menu, playing, paused, game over
  - Entity states: Different sprites for alien types and destruction animations
- **Icon Selection**: Minimal pixel-art style icons for UI elements, avoiding modern iconography
- **Spacing**: Consistent 8px grid system matching classic pixel art constraints
- **Mobile**: Touch controls overlay for mobile devices with virtual D-pad and fire button, responsive canvas sizing