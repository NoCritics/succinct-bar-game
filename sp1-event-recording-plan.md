# SP1 Event Recording Implementation Plan

## Overview
Instead of recording every keystroke, we'll record key game events that can be verified by SP1 to prove legitimate gameplay.

## Events to Record

### 1. Game Start
```javascript
{
  type: 'game_start',
  timestamp: Date.now()
}
```

### 2. Level Start
```javascript
{
  type: 'level_start',
  level: number,
  targetHoleIndex: number,
  holeCount: number,
  timestamp: Date.now()
}
```

### 3. Ball in Hole
```javascript
{
  type: 'ball_in_hole',
  level: number,
  holeIndex: number,
  isTarget: boolean,
  ballPos: {x: number, y: number},
  holePos: {x: number, y: number},
  distance: number,
  timestamp: Date.now()
}
```

### 4. Level Complete
```javascript
{
  type: 'level_complete',
  level: number,
  pointsEarned: number,
  totalScore: number,
  timestamp: Date.now()
}
```

### 5. Game Over / Game Win
```javascript
{
  type: 'game_over' | 'game_win',
  level: number,
  finalScore: number,
  reason?: string,
  timestamp: Date.now()
}
```

## Game Modifications Required

### 1. Add event recording array
```javascript
let gameEvents = [];
```

### 2. Add event recording function
```javascript
function recordEvent(event) {
    gameEvents.push(event);
    console.log('Event recorded:', event);
}
```

### 3. Insert recording calls at key points:
- Line ~159: `startGame()` - Record game_start
- Line ~166 & ~179: `startGame()` and `nextLevel()` - Record level_start
- Line ~321 & ~323: Hole collision detection - Record ball_in_hole
- Line ~203: `levelComplete()` - Record level_complete
- Line ~192 & ~196: `gameOver()` and `gameWin()` - Record game_over/game_win

### 4. Add API submission
```javascript
async function submitScore() {
    const response = await fetch('/api/prove-score', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            events: gameEvents,
            finalScore: score,
            level: level
        })
    });
    const result = await response.json();
    // Handle proof result
}
```

## SP1 Verification Logic

The Rust program will verify:

1. **Event Sequence**: game_start → level_start → ball_in_hole → level_complete (repeated for each level)
2. **Level Progression**: Levels increment by 1
3. **Correct Target**: Ball entered target hole for level completion
4. **Score Math**: Points match formula (100 × level + bonus)
5. **Timing Sanity**: Reasonable time between events
6. **Final State**: 20 levels completed for victory claim

## Why This Approach Works

- **Simple**: ~50 lines of modifications to game.js
- **Secure**: Can't fake 20 levels of correct hole entries
- **Efficient**: Only ~60-80 events for a full game
- **Verifiable**: SP1 can validate without physics simulation
