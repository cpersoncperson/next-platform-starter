'use client';

import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { PongGame as PongGameScene } from '../client/PongGame';

export default function PongGame({ room }) {
  const gameRef = useRef(null);

  useEffect(() => {
    if (gameRef.current) return;

    const config = {
      type: Phaser.AUTO,
      parent: 'game-container',
      width: 800,
      height: 600,
      backgroundColor: '#000',
      scene: PongGameScene
    };

    gameRef.current = new Phaser.Game(config);
    gameRef.current.scene.start('PongGame', { room });

    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, [room]);

  return <div id="game-container" className="border-2 border-white rounded-lg overflow-hidden" />;
}
