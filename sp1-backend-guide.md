# SP1 Backend Development Guide

## Prerequisites (Install on Ubuntu Server)

### 1. Install Rust
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
```

### 2. Install SP1
```bash
curl -L https://sp1up.succinct.xyz | bash
sp1up
```

### 3. Install Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

## Directory Structure
```
/home/ubuntu/ice-cold-beer/
├── public/              # Static game files (served by Nginx)
├── server/              # Node.js API server
│   ├── index.js
│   ├── package.json
│   └── proofs/         # Generated proof files
├── sp1-program/         # SP1 zkVM program
│   ├── Cargo.toml
│   └── src/
│       └── main.rs     # Event verification logic
└── sp1-script/          # SP1 proof generation
    ├── Cargo.toml
    └── src/
        └── main.rs     # Proof generation logic
```

## Implementation Steps

### Step 1: Create SP1 Program
The zkVM program that verifies game events:

```rust
// sp1-program/src/main.rs
#![no_main]
sp1_zkvm::entrypoint!(main);

pub fn main() {
    // Read game events and claimed score
    let events = sp1_zkvm::io::read::<Vec<GameEvent>>();
    let claimed_score = sp1_zkvm::io::read::<u32>();
    
    // Commit public values
    sp1_zkvm::io::commit(&claimed_score);
    
    // Verify events lead to claimed score
    let is_valid = verify_game_events(events, claimed_score);
    sp1_zkvm::io::commit(&is_valid);
}
```

### Step 2: Create Node.js API
Simple Express server to handle proof requests:

```javascript
// server/index.js
const express = require('express');
const { spawn } = require('child_process');
const app = express();

app.post('/api/prove-score', async (req, res) => {
    const { events, finalScore } = req.body;
    
    // Spawn SP1 prover process
    const prover = spawn('cargo', ['run', '--bin', 'prove'], {
        cwd: '/home/ubuntu/ice-cold-beer/sp1-script',
        env: {
            ...process.env,
            EVENTS: JSON.stringify(events),
            SCORE: finalScore.toString()
        }
    });
    
    // Handle proof generation...
});

app.listen(3000);
```

### Step 3: Environment Setup
Copy `.env` file to server with:
```
NETWORK_PRIVATE_KEY=<your_key>
SP1_PROVER=network
NETWORK_RPC_URL=https://rpc.production.succinct.xyz
```

### Step 4: Update Game Frontend
Modify game.js to:
1. Record events during gameplay
2. Submit events to API on game completion
3. Display proof generation status

## Testing Workflow
1. Play the game and complete a level
2. Game submits events to API
3. API triggers SP1 proof generation (30-60 seconds)
4. Proof is returned to frontend
5. Player can share verifiable proof of achievement

## Security Considerations
- Validate input on server before proof generation
- Rate limit API endpoints
- Store proofs temporarily (clean up old ones)
- Consider adding authentication for production
