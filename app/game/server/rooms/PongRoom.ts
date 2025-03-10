import { Room, Client } from "@colyseus/core";
import { Schema, type, ArraySchema } from "@colyseus/schema";

class Player extends Schema {
  @type("number") x: number = 0;
  @type("number") y: number = 0;
  @type("number") score: number = 0;
}

class Ball extends Schema {
  @type("number") x: number = 400;
  @type("number") y: number = 300;
  @type("number") velocityX: number = 0;
  @type("number") velocityY: number = 0;
}

class PongState extends Schema {
  @type(Ball) ball = new Ball();
  @type({ map: Player }) players = new ArraySchema<Player>();
}

export class PongRoom extends Room<PongState> {
  maxClients = 2;
  
  onCreate() {
    this.setState(new PongState());

    this.onMessage("move", (client, data) => {
      const player = this.state.players.get(client.sessionId);
      if (player) {
        player.y = data.y;
      }
    });

    this.setSimulationInterval((deltaTime) => this.update(deltaTime));
  }

  onJoin(client: Client) {
    const player = new Player();
    player.x = this.state.players.size === 0 ? 50 : 750;
    player.y = 300;
    this.state.players.set(client.sessionId, player);

    if (this.state.players.size === 2) {
      this.startGame();
    }
  }

  onLeave(client: Client) {
    this.state.players.delete(client.sessionId);
  }

  startGame() {
    const ball = this.state.ball;
    ball.x = 400;
    ball.y = 300;
    ball.velocityX = 300 * (Math.random() > 0.5 ? 1 : -1);
    ball.velocityY = 300 * (Math.random() * 2 - 1);
  }

  update(deltaTime: number) {
    if (this.state.players.size < 2) return;

    const ball = this.state.ball;
    ball.x += ball.velocityX * deltaTime / 1000;
    ball.y += ball.velocityY * deltaTime / 1000;

    // Ball collision with top and bottom
    if (ball.y <= 0 || ball.y >= 600) {
      ball.velocityY *= -1;
    }

    // Check paddle collisions
    this.state.players.forEach((player) => {
      if (this.checkPaddleCollision(ball, player)) {
        ball.velocityX *= -1.1; // Increase speed slightly
        ball.velocityY = (ball.y - player.y) * 2; // Add spin based on hit position
      }
    });

    // Score points
    if (ball.x <= 0 || ball.x >= 800) {
      const scorer = ball.x <= 0 ? 1 : 0;
      const players = Array.from(this.state.players.values());
      if (players[scorer]) {
        players[scorer].score += 1;
      }
      this.startGame();
    }
  }

  private checkPaddleCollision(ball: Ball, player: Player): boolean {
    const paddleWidth = 10;
    const paddleHeight = 100;
    return (
      ball.x >= player.x - paddleWidth / 2 &&
      ball.x <= player.x + paddleWidth / 2 &&
      ball.y >= player.y - paddleHeight / 2 &&
      ball.y <= player.y + paddleHeight / 2
    );
  }
}
