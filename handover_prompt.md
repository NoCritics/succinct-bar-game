# Ice Cold Beer SP1 Game - Development Handover Prompt

## Project Overview
We're building an Ice Cold Beer arcade game with SP1 zero-knowledge proof integration. The game is complete and ready for deployment. SP1 backend will be developed directly on the server.

## Current Status
- ✅ Game fully implemented (HTML5/Canvas/JavaScript)
- ✅ 20 levels with progressive difficulty
- ✅ Physics-based gameplay working well
- 🔲 Needs deployment to server
- 🔲 SP1 backend to be developed on server

## Server Details
- Domain: succylongtimegames.space (DNS already configured)
- Server hostname: succinct.bar.game
- IP: 94.141.102.7
- OS: Ubuntu 20.04 LTS
- SSL email: vladislavkd99@gmail.com

## GitHub Repository
- User: https://github.com/NoCritics
- Repo name: ice-cold-beer-sp1
- Purpose: Storage/backup (not CI/CD since SP1 dev happens on server)

## Files to Push to Git
```
C:\Users\vladi\source\repos\succinct_bar_game\
├── index.html      # Game page
├── game.js         # Game logic (800+ lines)
└── style.css       # Retro wooden styling
```

## Files to Exclude from Git (.gitignore)
- .env (contains SP1 wallet private key)
- *.docx (instruction files)
- resources.txt
- paste.txt
- node_modules/
- SP1 build artifacts

## Game Implementation Details
- **Controls**: Q/A (left side), P/L (right side), SPACE (start/restart)
- **Physics**: Gravity=0.35, Friction=0.97, TiltForce=0.35
- **Bar**: Starts at bottom (height 450), moves between 100-500
- **Holes**: Spawn within bar's horizontal range (x: 230-570)
- **Scoring**: 100 points × level (+50 bonus after level 10)
- **Difficulty**: More holes, faster controls, clustered obstacles in later levels

## Deployment Plan

### Phase 1: Static Game Deployment
1. Create .gitignore and push game to GitHub
2. SSH to server and clone repo
3. Install Nginx
4. Configure Nginx to serve from /home/ubuntu/ice-cold-beer/public/
5. Set up SSL with Certbot
6. Test game is playable at https://succylongtimegames.space

### Phase 2: SP1 Integration (on server)
1. Copy .env file to server (contains NETWORK_PRIVATE_KEY)
2. Install Rust, SP1 toolchain, Node.js
3. Create directory structure:
   ```
   /home/ubuntu/ice-cold-beer/
   ├── public/          # Nginx serves from here
   ├── server/          # Node.js API
   ├── sp1-program/     # zkVM program
   └── sp1-script/      # Proof generation
   ```
4. Develop SP1 program to verify game scores
5. Create Node.js API that spawns SP1 prover on-demand
6. Update game.js to submit scores to API
7. Configure Nginx as reverse proxy for API

## SP1 Development Notes
- MUST be done on Linux (Ubuntu server) - Windows/WSL won't work
- Use "network" prover mode with Succinct Network
- Proof generation takes 30-60 seconds
- On-demand proving (not systemd service)
- API endpoint: POST /api/score with {score, level}

## Important Context from Previous Session
- Previous attempts with Bevy/WASM failed due to dependency issues
- Simple HTML5/Canvas approach works best
- Bar must start at bottom to prevent instant game-over
- All holes must spawn within bar's reachable range
- SP1 requires native Linux, not WSL

## Next Steps
1. Create .gitignore
2. Initialize git and push to GitHub  
3. Deploy static game to server
4. Test game works on production
5. Begin SP1 development directly on server

## Resources Available
The following files exist locally but shouldn't be in git:
- Full setup sp1 instructions.docx (comprehensive SP1 docs)
- game guide.docx (game requirements)
- resources.txt (SP1 examples/links)
- .env (contains wallet credentials)

These files contain all the detailed SP1 implementation instructions and should be referenced when developing the backend on the server.
