import { Game } from "./Game";
import Player from "./Player";


export class GameObject {
    x: number;
    y: number;
    width: number;
    height: number;
    touched: boolean;
    drawSelf: (context: CanvasRenderingContext2D) => any;
    constructor(x: number, y: number, width: number, height: number, src: string | null, color: string | null) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.touched = false;
        if (src) {
            this.drawSelf = (context: CanvasRenderingContext2D) => {
                let img = document.createElement('img');
                img.src = src;
                context.drawImage(img, this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
            };
        } else {
            this.drawSelf = (context: CanvasRenderingContext2D) => {
                context.fillStyle = color ?? 'red';
                context.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
            };
        }
    }
    touch() {
        this.touched = !this.touched;
    }
    draw(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {
        this.drawSelf(context);
    }
    checkCollision(player: Player): [boolean, "left" | "right" | "top" | "bottom"] {
        const playerLeft = player.x - player.width / 2;
        const playerRight = player.x + player.width / 2;
        const playerTop = player.y - player.height / 2;
        const playerBottom = player.y + player.height / 2;

        const platformLeft = this.x - this.width / 2;
        const platformRight = this.x + this.width / 2;
        const platformTop = this.y - this.height / 2;
        const platformBottom = this.y + this.height / 2;

        if (playerRight > platformLeft && playerLeft < platformRight &&
            playerBottom > platformTop && playerTop < platformBottom) {

            const overlapX = Math.min(playerRight - platformLeft, platformRight - playerLeft);
            const overlapY = Math.min(playerBottom - platformTop, platformBottom - playerTop);

            if (overlapX < overlapY) {
                // Horizontal collision
                if (player.x < this.x) {
                    return [true, "left"];
                } else {
                    return [true, "right"];
                }
            } else {
                // Vertical collision
                if (player.y < this.y) {
                    return [true, "top"];
                } else {
                    return [true, "bottom"];
                }
            }
        }
        return [false, "top"];
    }
    update(_player: Player) {
        // Do nothing
    }
}

export class Platform extends GameObject {
    constructor(x: number, y: number, width: number, height: number) {
        super(x, y, width, height, "/platform0.png", null);
    }
    update(player: Player) {
        const [collided, direction] = this.checkCollision(player);
        if (collided) {
            switch (direction) {
                case "left":
                    player.x = this.x - this.width / 2 - player.width / 2;
                    break;
                case "right":
                    player.x = this.x + this.width / 2 + player.width / 2;
                    break;
                case "top":
                    player.y = this.y - this.height / 2 - player.height / 2;
                    player.vy = 0;
                    player.jumping = false;
                    break;
                case "bottom":
                    player.y = this.y + this.height / 2 + player.height / 2;
                    player.vy = 0;
                    break;
            }
        }
    }
}
export class Spikes extends GameObject {
    damage: number;
    constructor(x: number, y: number, width: number, height: number, damage: number) {
        super(x, y, width, height, "/spike.png", null);
        this.damage = damage;
    }
    update(player: Player) {
        const [collided, direction] = this.checkCollision(player);
        if (collided) {
            switch (direction) {
                case "left":
                    player.x = this.x - this.width / 2 - player.width / 2;
                    player.jump(5);
                    player.health -= this.damage;
                    break;
                case "right":
                    player.x = this.x + this.width / 2 + player.width / 2;
                    player.jump(5);
                    player.health -= this.damage;
                    break;
                case "top":
                    player.y = this.y - this.height / 2 - player.height / 2;
                    player.vy = 0;
                    player.jumping = false;
                    player.jump(5);
                    player.health -= this.damage;
                    break;
                case "bottom":
                    player.y = this.y + this.height / 2 + player.height / 2;
                    player.vy = 0;
                    break;
            }

        }
    }
}
export class Health extends GameObject {
    health: number;
    constructor(x: number, y: number, width: number, health: number) {
        super(x, y, width, width, "/health.png", null);
        this.health = health;
    }
    update(player: Player) {
        const [collided, _] = this.checkCollision(player);
        if (collided) {
            player.health += this.health;
        }
    }
}

export class Goal extends GameObject {
    game: Game;
    constructor(x: number, y: number, width: number, game: Game) {
        super(x, y, width, width, "/goal.png", null);
        this.game = game;
    }
    update(player: Player) {
        const [collided, _] = this.checkCollision(player);
        if (collided) {
            this.game.end();
        }
    }
}

export class Bounce extends GameObject {
    amount: number;
    constructor(x: number, y: number, width: number, amount: number) {
        super(x, y, width, width, "/bounce.png", null);
        this.amount = amount;
    }
    update(player: Player) {
        const [collided, _] = this.checkCollision(player);
        if (collided) {
            player.jump(this.amount);
        }
    }
}