import React, { useState, useEffect, useRef } from 'react';

export default function NexusArena() {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState('lobby'); // lobby, spawning, playing, finished
  const [player, setPlayer] = useState(null);
  const [players, setPlayers] = useState([]);
  const [zones, setZones] = useState([]);
  const [powerUps, setPowerUps] = useState([]);
  const [kills, setKills] = useState(0);
  const [balance, setBalance] = useState(5000);
  const [leaderboard, setLeaderboard] = useState([]);
  const [zonePhase, setZonePhase] = useState(1);
  const [timeLeft, setTimeLeft] = useState(60);
  const gameLoopRef = useRef(null);

  const ARENA_WIDTH = 1000;
  const ARENA_HEIGHT = 800;
  const MAX_PLAYERS = 100;

  // Initialize game
  const startGame = () => {
    if (balance < 50) {
      alert('Need at least 50 NEXUS to play!');
      return;
    }

    setBalance(prev => prev - 50);
    setGameState('spawning');
    setKills(0);
    setZonePhase(1);
    setTimeLeft(60);

    // Create player
    const newPlayer = {
      id: Math.random(),
      x: Math.random() * ARENA_WIDTH,
      y: Math.random() * ARENA_HEIGHT,
      vx: 0,
      vy: 0,
      radius: 15,
      health: 100,
      maxHealth: 100,
      speed: 3,
      alive: true,
      color: `hsl(${Math.random() * 360}, 100%, 50%)`
    };

    setPlayer(newPlayer);

    // Create random players (AI)
    const aiPlayers = Array(49).fill().map((_, i) => ({
      id: i,
      x: Math.random() * ARENA_WIDTH,
      y: Math.random() * ARENA_HEIGHT,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      radius: 15,
      health: 100,
      maxHealth: 100,
      speed: 2,
      alive: true,
      color: `hsl(${Math.random() * 360}, 80%, 50%)`
    }));

    setPlayers([newPlayer, ...aiPlayers]);

    // Initial zone
    setZones([{
      x: ARENA_WIDTH / 2,
      y: ARENA_HEIGHT / 2,
      radius: 400,
      phase: 1
    }]);

    // Spawn power-ups
    const pups = Array(20).fill().map((_, i) => ({
      id: i,
      x: Math.random() * ARENA_WIDTH,
      y: Math.random() * ARENA_HEIGHT,
      type: ['shield', 'health', 'speed'][Math.floor(Math.random() * 3)],
      radius: 8
    }));

    setPowerUps(pups);

    setTimeout(() => setGameState('playing'), 3000);
  };

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing' || !player || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let currentPlayers = [...players];
    let currentZone = zones[0];

    const gameLoop = () => {
      // Update player positions (AI)
      currentPlayers = currentPlayers.map(p => {
        if (!p.alive) return p;

        let newX = p.x + p.vx;
        let newY = p.y + p.vy;

        // Bounce off walls
        if (newX < 0 || newX > ARENA_WIDTH) p.vx *= -1;
        if (newY < 0 || newY > ARENA_HEIGHT) p.vy *= -1;

        newX = Math.max(0, Math.min(ARENA_WIDTH, newX));
        newY = Math.max(0, Math.min(ARENA_HEIGHT, newY));

        // Damage from zone
        const distToZoneCenter = Math.hypot(newX - currentZone.x, newY - currentZone.y);
        if (distToZoneCenter > currentZone.radius) {
          p.health -= 0.5;
        }

        // Random direction changes
        if (Math.random() < 0.02) {
          p.vx = (Math.random() - 0.5) * 4;
          p.vy = (Math.random() - 0.5) * 4;
        }

        return {
          ...p,
          x: newX,
          y: newY,
          health: Math.max(0, p.health),
          alive: p.health > 0
        };
      });

      // Check collisions
      for (let i = 0; i < currentPlayers.length; i++) {
        for (let j = i + 1; j < currentPlayers.length; j++) {
          const p1 = currentPlayers[i];
          const p2 = currentPlayers[j];

          if (!p1.alive || !p2.alive) continue;

          const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);

          if (dist < p1.radius + p2.radius) {
            // Simple collision: smaller or lower health loses
            if (p1.health < p2.health) {
              p1.health -= 30;
              if (p1.id === player.id) setKills(k => k + 1);
            } else {
              p2.health -= 30;
              if (p2.id === player.id) setKills(k => k + 1);
            }
          }
        }
      }

      // Power-up collection
      let newPowerUps = [...powerUps];
      currentPlayers = currentPlayers.map(p => {
        if (!p.alive) return p;

        newPowerUps = newPowerUps.filter(pup => {
          const dist = Math.hypot(p.x - pup.x, p.y - pup.y);

          if (dist < p.radius + pup.radius) {
            switch (pup.type) {
              case 'shield':
                return false;
              case 'health':
                p.health = Math.min(p.maxHealth, p.health + 25);
                return false;
              case 'speed':
                p.speed = 4;
                setTimeout(() => {
                  p.speed = 2;
                }, 5000);
                return false;
              default:
                return true;
            }
          }
          return true;
        });

        return p;
      });

      setPowerUps(newPowerUps);

      // Draw
      ctx.fillStyle = '#050810';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw zone
      ctx.strokeStyle = 'rgba(255, 107, 157, 0.5)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(currentZone.x, currentZone.y, currentZone.radius, 0, Math.PI * 2);
      ctx.stroke();

      // Draw players
      currentPlayers.forEach(p => {
        if (!p.alive) return;

        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.health / p.maxHealth;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        // Health bar
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#00D9FF';
        ctx.fillRect(p.x - 20, p.y - 30, (p.health / p.maxHealth) * 40, 5);
      });

      // Draw power-ups
      powerUps.forEach(pup => {
        ctx.fillStyle = pup.type === 'shield' ? '#FFD700' : pup.type === 'health' ? '#00FF00' : '#FF6B9D';
        ctx.beginPath();
        ctx.arc(pup.x, pup.y, pup.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      setPlayers(currentPlayers);

      // Check for winners
      const alivePlayers = currentPlayers.filter(p => p.alive);
      if (alivePlayers.length <= 1) {
        setGameState('finished');
        if (player?.alive) {
          setBalance(prev => prev + 500); // Winner gets 500
          const winners = alivePlayers.map(p => ({
            id: p.id,
            kills,
            reward: 500
          }));
          setLeaderboard(winners);
        }
        return;
      }

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState, player, players, zones, powerUps, kills]);

  // Zone shrink timer
  useEffect(() => {
    if (gameState !== 'playing') return;

    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setZones(prevZones => {
            const newZone = { ...prevZones[0] };
            newZone.radius *= 0.75;
            newZone.phase += 1;
            return [newZone];
          });
          setZonePhase(p => p + 1);
          return 60;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState]);

  return (
    <div className="nexus-arena">
      <div className="arena-header">
        <h1>⚔️ NEXUS ARENA 3036</h1>
        <div className="arena-stats">
          <span className="stat">💰 {balance.toFixed(0)} NEXUS</span>
          {gameState === 'playing' && (
            <>
              <span className="stat">⚔️ Kills: {kills}</span>
              <span className="stat">🛡️ Phase: {zonePhase}</span>
              <span className="stat">⏱️ {timeLeft}s</span>
            </>
          )}
        </div>
      </div>

      {gameState === 'lobby' && (
        <div className="lobby-section">
          <div className="lobby-card">
            <h2>BATTLE ROYALE</h2>
            <p>100 players enter. Only 1 can survive.</p>
            <div className="rules">
              <h3>⚙️ MECHANICS</h3>
              <ul>
                <li>Shrinking safe zone forces combat</li>
                <li>Collect power-ups for advantages</li>
                <li>Eliminate players for kills & rewards</li>
                <li>Last survivor wins 500 NEXUS</li>
              </ul>
            </div>
            <button className="btn-join" onClick={startGame}>
              ⚔️ ENTER ARENA (50 NEXUS)
            </button>
          </div>
        </div>
      )}

      {(gameState === 'spawning' || gameState === 'playing') && (
        <div className="arena-container">
          <canvas
            ref={canvasRef}
            width={ARENA_WIDTH}
            height={ARENA_HEIGHT}
            className="arena-canvas"
          />
        </div>
      )}

      {gameState === 'finished' && (
        <div className="finished-section">
          <div className="result-card">
            {player?.alive ? (
              <>
                <h2>🎉 VICTORY!</h2>
                <p>You survived with {kills} eliminations</p>
                <p className="reward">+500 NEXUS</p>
              </>
            ) : (
              <>
                <h2>💀 ELIMINATED</h2>
                <p>You got {kills} eliminations before falling</p>
                <p>Better luck next time, warrior</p>
              </>
            )}
            <button className="btn-again" onClick={startGame}>
              🔄 PLAY AGAIN
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
