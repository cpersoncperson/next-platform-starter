'use client';

import { useEffect, useState } from 'react';
import { Client } from 'colyseus.js';
import dynamic from 'next/dynamic';

// Dynamically import Phaser component to avoid SSR issues
const PongGame = dynamic(() => import('./components/PongGame'), {
  ssr: false
});

export default function PongPage() {
  const [gameRoom, setGameRoom] = useState(null);
  const [status, setStatus] = useState('connecting');

  useEffect(() => {
    const client = new Client('ws://localhost:2567');
    
    async function joinGame() {
      try {
        const room = await client.joinOrCreate('pong');
        setGameRoom(room);
        setStatus('joined');
      } catch (e) {
        setStatus('error');
        console.error('Failed to join game:', e);
      }
    }

    joinGame();
  }, []);

  if (status === 'connecting') {
    return <div>Connecting to game server...</div>;
  }

  if (status === 'error') {
    return <div>Failed to connect to game server</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1>Multiplayer Pong</h1>
      {gameRoom && <PongGame room={gameRoom} />}
    </div>
  );
}
