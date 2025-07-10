// Ice Cold Beer Game Logic
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const levelElement = document.getElementById('level');
const statusBar = document.getElementById('statusBar');

// Game constants
const GRAVITY = 0.35; // Increased from 0.3
const FRICTION = 0.97; // Slightly less friction
const TILT_FORCE = 0.35; // Increased from 0.3
const BAR_SPEED = 3;
const BALL_RADIUS = 12;
const HOLE_RADIUS = 18;
const BAR_WIDTH = 400;
const BAR_THICKNESS = 8;
const MAX_TILT = Math.PI / 6; // 30 degrees

// Game state
let gameState = 'waiting'; // waiting, playing, gameOver, levelComplete
let score = 0;
let level = 1;
let targetHole = null;

// Bar properties
const bar = {
    leftHeight: 450,  // Start near bottom
    rightHeight: 450, // Start near bottom
    minHeight: 100,
    maxHeight: 500,
    centerX: canvas.width / 2,
    width: BAR_WIDTH
};

// Ball properties
const ball = {
    x: canvas.width / 2,
    y: 450 - BALL_RADIUS - 5, // Start on the bar
    vx: 0,
    vy: 0,
    radius: BALL_RADIUS,
    onBar: true
};

// Level configurations
const levels = [
    { holes: 3, speed: 1.0, targetIndex: 0 },
    { holes: 4, speed: 1.1, targetIndex: 1 },
    { holes: 5, speed: 1.2, targetIndex: 2 },
    { holes: 6, speed: 1.3, targetIndex: 2 },
    { holes: 7, speed: 1.4, targetIndex: 3 },
    { holes: 8, speed: 1.5, targetIndex: 3 },
    { holes: 9, speed: 1.6, targetIndex: 4 },
    { holes: 10, speed: 1.7, targetIndex: 4 },
    { holes: 11, speed: 1.8, targetIndex: 5 },
    { holes: 12, speed: 1.9, targetIndex: 5 },
    { holes: 13, speed: 2.0, targetIndex: 6 },
    { holes: 14, speed: 2.1, targetIndex: 6 },
    { holes: 15, speed: 2.2, targetIndex: 7 },
    { holes: 16, speed: 2.3, targetIndex: 7 },
    { holes: 17, speed: 2.4, targetIndex: 8 },
    { holes: 18, speed: 2.5, targetIndex: 8 },
    { holes: 19, speed: 2.6, targetIndex: 9 },
    { holes: 20, speed: 2.7, targetIndex: 9 }
];

// Holes array
let holes = [];

// Keyboard state
const keys = {};

// Initialize keyboard listeners
document.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
    
    if (e.key === ' ') {
        e.preventDefault();
        if (gameState === 'waiting' || gameState === 'gameOver') {
            startGame();
        } else if (gameState === 'levelComplete') {
            nextLevel();
        }
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
});

// Initialize game
function init() {
    generateHoles();
    resetBall();
    draw();
}

// Generate holes for current level
function generateHoles() {
    holes = [];
    const levelConfig = levels[level - 1];
    const holeCount = levelConfig.holes;
    
    // Calculate the bar's actual reachable horizontal range
    // Bar extends from centerX - width/2 to centerX + width/2
    const barLeftEdge = bar.centerX - bar.width / 2;  // 200
    const barRightEdge = bar.centerX + bar.width / 2; // 600
    
    // Holes must be within the bar's horizontal range
    // Add margin to ensure they're definitely reachable
    const margin = HOLE_RADIUS + BALL_RADIUS;
    const minX = barLeftEdge + margin;
    const maxX = barRightEdge - margin;
    
    // Vertical range based on bar movement
    // Ensure holes spawn above the bar's starting position with safe gap
    const startingBarHeight = 450; // Bar starts near bottom
    const safeGap = 60; // Reduced from 80 for more challenge
    const minY = bar.minHeight - 30; // Slightly above highest bar position
    const maxY = startingBarHeight - safeGap; // Well above starting bar position
    
    // Ensure we stay within canvas bounds
    const safeMinX = Math.max(minX, HOLE_RADIUS + 20);
    const safeMaxX = Math.min(maxX, canvas.width - HOLE_RADIUS - 20);
    const safeMinY = Math.max(minY, HOLE_RADIUS + 20);
    const safeMaxY = Math.min(maxY, canvas.height - 100);
    
    for (let i = 0; i < holeCount; i++) {
        // Distribute holes evenly across the horizontal space
        const x = safeMinX + (safeMaxX - safeMinX) * (i / (holeCount - 1));
        
        // Randomize vertical position within reachable range
        // Make hole placement more challenging in higher levels
        let y;
        if (i === levelConfig.targetIndex) {
            // Target hole - make it require more precise maneuvering in later levels
            if (level > 10) {
                // Later levels: target can be anywhere
                y = safeMinY + Math.random() * (safeMaxY - safeMinY);
            } else {
                // Early levels: target in middle range
                const midRangeMin = safeMinY + (safeMaxY - safeMinY) * 0.2;
                const midRangeMax = safeMinY + (safeMaxY - safeMinY) * 0.8;
                y = midRangeMin + Math.random() * (midRangeMax - midRangeMin);
            }
        } else {
            // Dark holes - cluster some of them in later levels
            if (level > 5 && Math.random() < 0.3) {
                // 30% chance to place near another hole for added difficulty
                const nearbyHole = holes[Math.floor(Math.random() * holes.length)];
                if (nearbyHole) {
                    y = nearbyHole.y + (Math.random() - 0.5) * 60;
                    y = Math.max(safeMinY, Math.min(safeMaxY, y));
                } else {
                    y = safeMinY + Math.random() * (safeMaxY - safeMinY);
                }
            } else {
                y = safeMinY + Math.random() * (safeMaxY - safeMinY);
            }
        }
        
        holes.push({
            x: x,
            y: y,
            radius: HOLE_RADIUS,
            isTarget: i === levelConfig.targetIndex,
            active: true
        });
    }
    
    targetHole = holes.find(h => h.isTarget);
}

// Reset ball position
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = bar.leftHeight - BALL_RADIUS - 5; // Place ball on bar at starting position
    ball.vx = 0;
    ball.vy = 0;
    ball.onBar = true;
}

// Start game
function startGame() {
    gameState = 'playing';
    score = 0;
    level = 1;
    bar.leftHeight = 450;  // Reset to bottom position
    bar.rightHeight = 450; // Reset to bottom position
    generateHoles();
    resetBall();
    statusBar.textContent = 'Guide the ball to the GREEN hole!';
    updateUI();
}

// Next level
function nextLevel() {
    level++;
    if (level > levels.length) {
        gameWin();
        return;
    }
    gameState = 'playing';
    bar.leftHeight = 450;  // Reset bar position FIRST
    bar.rightHeight = 450; // Reset bar position FIRST
    generateHoles();
    resetBall(); // Now reset ball AFTER bar is in position
    statusBar.textContent = `Level ${level} - Guide the ball to the GREEN hole!`;
    updateUI();
}

// Game over
function gameOver(reason) {
    gameState = 'gameOver';
    statusBar.textContent = `Game Over! ${reason} Press SPACE to restart`;
    canvas.classList.add('game-over');
    setTimeout(() => canvas.classList.remove('game-over'), 500);
}

// Game win
function gameWin() {
    gameState = 'gameOver';
    statusBar.textContent = `Incredible! You completed all 20 levels! Final Score: ${score}. Press SPACE to play again`;
}

// Level complete
function levelComplete() {
    gameState = 'levelComplete';
    const basePoints = 100;
    const levelBonus = level > 10 ? 50 : 0; // Extra bonus for levels above 10
    const points = (basePoints * level) + levelBonus;
    score += points;
    statusBar.textContent = `Level Complete! +${points} points! Press SPACE for next level`;
    canvas.classList.add('level-complete');
    setTimeout(() => canvas.classList.remove('level-complete'), 1000);
    updateUI();
}

// Update UI
function updateUI() {
    scoreElement.textContent = score;
    levelElement.textContent = level;
}

// Update game logic
function update() {
    if (gameState !== 'playing') return;
    
    // Handle bar controls
    const speedMultiplier = levels[level - 1].speed;
    
    if (keys['q'] && bar.leftHeight > bar.minHeight) {
        bar.leftHeight -= BAR_SPEED * speedMultiplier;
    }
    if (keys['a'] && bar.leftHeight < bar.maxHeight) {
        bar.leftHeight += BAR_SPEED * speedMultiplier;
    }
    if (keys['p'] && bar.rightHeight > bar.minHeight) {
        bar.rightHeight -= BAR_SPEED * speedMultiplier;
    }
    if (keys['l'] && bar.rightHeight < bar.maxHeight) {
        bar.rightHeight += BAR_SPEED * speedMultiplier;
    }
    
    // Calculate bar angle
    const leftX = bar.centerX - bar.width / 2;
    const rightX = bar.centerX + bar.width / 2;
    const angle = Math.atan2(bar.rightHeight - bar.leftHeight, bar.width);
    
    // Limit angle
    const limitedAngle = Math.max(-MAX_TILT, Math.min(MAX_TILT, angle));
    
    // Apply physics to ball
    ball.vy += GRAVITY;
    
    // Add tilt force
    ball.vx += Math.sin(limitedAngle) * TILT_FORCE;
    
    // Apply friction
    ball.vx *= FRICTION;
    
    // Update ball position
    ball.x += ball.vx;
    ball.y += ball.vy;
    
    // Check if ball is on bar
    if (ball.x >= leftX && ball.x <= rightX) {
        const barY = bar.leftHeight + (ball.x - leftX) * Math.tan(limitedAngle);
        
        if (ball.y + ball.radius >= barY && ball.y + ball.radius <= barY + BAR_THICKNESS + 5) {
            if (ball.vy > 0) {
                ball.y = barY - ball.radius;
                ball.vy = 0;
                ball.onBar = true;
            }
        } else {
            // Ball is leaving the bar - give it a small boost if moving fast
            if (ball.onBar && Math.abs(ball.vx) > 3) {
                ball.vy -= Math.abs(ball.vx) * 0.1; // Reduced from 0.15 for more challenge
            }
            ball.onBar = false;
        }
    } else {
        // Ball is leaving the bar - give it a small boost if moving fast
        if (ball.onBar && Math.abs(ball.vx) > 3) {
            ball.vy -= Math.abs(ball.vx) * 0.1; // Reduced from 0.15 for more challenge
        }
        ball.onBar = false;
    }
    
    // Check boundaries
    if (ball.x - ball.radius < 0 || ball.x + ball.radius > canvas.width) {
        ball.vx = -ball.vx * 0.8;
        ball.x = ball.x - ball.radius < 0 ? ball.radius : canvas.width - ball.radius;
    }
    
    // Check if ball fell off screen
    if (ball.y > canvas.height + 50) {
        gameOver('Ball fell off the screen!');
        return;
    }
    
    // Check hole collisions
    for (let hole of holes) {
        if (hole.active) {
            const dx = ball.x - hole.x;
            const dy = ball.y - hole.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < hole.radius - ball.radius / 2) {
                if (hole.isTarget) {
                    levelComplete();
                } else {
                    gameOver('Ball fell in the wrong hole!');
                }
                return;
            }
        }
    }
}

// Draw everything
function draw() {
    // Clear canvas with wood grain effect
    ctx.fillStyle = '#8B7355';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add subtle wood texture
    ctx.globalAlpha = 0.1;
    for (let i = 0; i < canvas.height; i += 4) {
        ctx.strokeStyle = '#654321';
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i + Math.sin(i * 0.01) * 2);
        ctx.stroke();
    }
    ctx.globalAlpha = 1;
    
    // Draw holes
    holes.forEach(hole => {
        if (hole.active) {
            // Hole shadow
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.beginPath();
            ctx.arc(hole.x + 2, hole.y + 2, hole.radius, 0, Math.PI * 2);
            ctx.fill();
            
            // Hole
            ctx.fillStyle = hole.isTarget ? '#4CAF50' : '#1a1a1a';
            ctx.beginPath();
            ctx.arc(hole.x, hole.y, hole.radius, 0, Math.PI * 2);
            ctx.fill();
            
            // Hole rim
            ctx.strokeStyle = '#8B6914';
            ctx.lineWidth = 3;
            ctx.stroke();
            
            // Target indicator
            if (hole.isTarget && gameState === 'playing') {
                ctx.strokeStyle = '#81C784';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(hole.x, hole.y, hole.radius + 5 + Math.sin(Date.now() * 0.003) * 3, 0, Math.PI * 2);
                ctx.stroke();
            }
        }
    });
    
    // Draw bar
    const leftX = bar.centerX - bar.width / 2;
    const rightX = bar.centerX + bar.width / 2;
    const angle = Math.atan2(bar.rightHeight - bar.leftHeight, bar.width);
    const limitedAngle = Math.max(-MAX_TILT, Math.min(MAX_TILT, angle));
    
    ctx.save();
    ctx.translate(bar.centerX, (bar.leftHeight + bar.rightHeight) / 2);
    ctx.rotate(limitedAngle);
    
    // Bar shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(-bar.width/2 + 5, 5, bar.width, BAR_THICKNESS);
    
    // Main bar
    ctx.fillStyle = '#654321';
    ctx.fillRect(-bar.width/2, -BAR_THICKNESS/2, bar.width, BAR_THICKNESS);
    
    // Bar highlights
    ctx.fillStyle = '#8B6914';
    ctx.fillRect(-bar.width/2, -BAR_THICKNESS/2, bar.width, 2);
    
    ctx.restore();
    
    // Draw joystick indicators
    // Left joystick
    ctx.fillStyle = '#3e2723';
    ctx.fillRect(50, bar.minHeight, 20, bar.maxHeight - bar.minHeight);
    ctx.fillStyle = '#8B6914';
    ctx.fillRect(55, bar.leftHeight - 10, 10, 20);
    
    // Right joystick
    ctx.fillStyle = '#3e2723';
    ctx.fillRect(canvas.width - 70, bar.minHeight, 20, bar.maxHeight - bar.minHeight);
    ctx.fillStyle = '#8B6914';
    ctx.fillRect(canvas.width - 65, bar.rightHeight - 10, 10, 20);
    
    // Draw ball
    // Ball shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.arc(ball.x + 3, ball.y + 3, ball.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Ball gradient
    const gradient = ctx.createRadialGradient(ball.x - 3, ball.y - 3, 0, ball.x, ball.y, ball.radius);
    gradient.addColorStop(0, '#e0e0e0');
    gradient.addColorStop(0.5, '#b0b0b0');
    gradient.addColorStop(1, '#808080');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Ball outline
    ctx.strokeStyle = '#606060';
    ctx.lineWidth = 1;
    ctx.stroke();
}

// Game loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Start the game
init();
gameLoop();
