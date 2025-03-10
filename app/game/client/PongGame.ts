import * as Phaser from 'phaser';
import { Client, Room } from 'colyseus.js';

export class PongGame extends Phaser.Scene {
  private paddles: Map<string, Phaser.GameObjects.Rectangle> = new Map();
  private ball?: Phaser.GameObjects.Arc;
  private scores: Map<string, Phaser.GameObjects.Text> = new Map();
  private room?: Room;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;

  constructor() {
    super({ key: 'PongGame' });
  }

  init(data: { room: Room }) {
    this.room = data.room;
  }

  create() {
    this.cursors = this.input.keyboard?.createCursorKeys();

    // Set up game objects
    this.room?.state.players.forEach((player, sessionId) => {
      const paddle = this.add.rectangle(player.x, player.y, 10, 100, 0xFFFFFF);
      this.paddles.set(sessionId, paddle);

      const score = this.add.text(
        player.x < 400 ? 200 : 600,
        50,
        '0',
        { fontSize: '32px', color: '#FFF' }
      );
      score.setOrigin(0.5);
      this.scores.set(sessionId, score);
    });

    this.ball = this.add.circle(400, 300, 5, 0xFFFFFF);

    // Listen for state changes
    this.room?.state.players.onAdd((player, sessionId) => {
      const paddle = this.add.rectangle(player.x, player.y, 10, 100, 0xFFFFFF);
      this.paddles.set(sessionId, paddle);

      const score = this.add.text(
        player.x < 400 ? 200 : 600,
        50,
        '0',
        { fontSize: '32px', color: '#FFF' }
      );
      score.setOrigin(0.5);
      this.scores.set(sessionId, score);
    });

    this.room?.state.players.onRemove((_, sessionId) => {
      this.paddles.get(sessionId)?.destroy();
      this.paddles.delete(sessionId);
      this.scores.get(sessionId)?.destroy();
      this.scores.delete(sessionId);
    });

    // Update listener
    this.room?.state.listen("ball", (ball) => {
      if (this.ball) {
        this.ball.setPosition(ball.x, ball.y);
      }
    });
  }

  update() {
    if (!this.room || !this.cursors) return;

    const myPaddle = this.paddles.get(this.room.sessionId);
    if (!myPaddle) return;

    if (this.cursors.up.isDown && myPaddle.y > 50) {
      this.room.send("move", { y: myPaddle.y - 10 });
    }
    else if (this.cursors.down.isDown && myPaddle.y < 550) {
      this.room.send("move", { y: myPaddle.y + 10 });
    }

    // Update paddle positions
    this.room.state.players.forEach((player, sessionId) => {
      const paddle = this.paddles.get(sessionId);
      if (paddle) {
        paddle.setPosition(player.x, player.y);
      }
      const score = this.scores.get(sessionId);
      if (score) {
        score.setText(player.score.toString());
      }
    });
  }
}
