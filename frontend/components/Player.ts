


export default class Player {
    x: number;
    y: number;
    vy: number;
    width: number;
    height: number;
    gravity: number;
    jumping: boolean;
    leftPressed: boolean;
    rightPressed: boolean;
    speed: number;
    maxHealth: number;
    health: number;
    rotation: number;
    rotationDelta: number;
    src: string;
    constructor(x: number, y: number, width: number, height: number, speed: number, maxHealth: number) {
        this.x = x;
        this.y = y;
        this.vy = 0; // Vertical velocity
        this.gravity = 0.5; // Gravity
        this.jumping = false;
        this.width = width;
        this.leftPressed = false;
        this.rightPressed = false;
        this.height = height;
        this.speed = speed;
        this.maxHealth = maxHealth;
        this.health = maxHealth;
        this.rotation = 0;
        this.rotationDelta = 0.05;
        this.src = "/player.png";
        document.addEventListener('keydown', (e: KeyboardEvent) => {
            switch (e.code) {
                case 'ArrowUp':
                    e.preventDefault();
                    if (!this.jumping) {
                        this.jump(10);
                    }
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    this.leftPressed = true;
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.rightPressed = true;
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    break;
                default:
                    // Do nothing for other keys
                    break;
            }
        });
        document.addEventListener('keyup', (e: KeyboardEvent) => {
            switch (e.code) {
                case 'ArrowLeft':
                    e.preventDefault();
                    this.leftPressed = false;
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.rightPressed = false;
                    break;
                default:
                    break;
            }
        });
    }
    draw(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, update: boolean) {
        if (update) {
            this.update(canvas);
        }

        // Save the current context state
        context.save();

        // Move the coordinate system to the center of the image
        context.translate(this.x, this.y);

        // Rotate the coordinate system by the desired angle
        context.rotate(this.rotation);

        // Draw the image in the modified coordinate system.
        // Notice the position offsets are now negative half-width and half-height,
        // because the coordinate system itself was translated.
        let img = document.createElement('img');
        img.src = this.src;
        context.drawImage(img, -this.width / 2, -this.height / 2, this.width, this.height);

        // Restore the context state
        context.restore();
    }
    update(canvas: HTMLCanvasElement) {
        if (this.y + this.height / 2 >= canvas.height) { // Ground level (change this value based on your setup)
            this.y = canvas.height - this.height / 2;
            this.vy = 0;
            this.jumping = false;
        } else {
            this.vy += this.gravity;
            this.y += this.vy;
        }

        if (this.rightPressed || this.leftPressed) {
            this.rotation += this.rotationDelta;
            if (this.rotation > Math.PI / 8) {
                this.rotation = Math.PI / 8;
                this.rotationDelta *= -1;
            } else if (this.rotation < -Math.PI / 8) {
                this.rotation = -Math.PI / 8;
                this.rotationDelta *= -1;
            }
        }
        if (this.rightPressed) this.x += this.speed;
        if (this.leftPressed) this.x -= this.speed;
        if (this.x + this.width / 2 > canvas.width) this.x = canvas.width - this.width / 2;
        if (this.x - this.width / 2 < 0) this.x = this.width / 2;
        if (this.y - this.height / 2 < 0) this.y = this.height / 2;
    }
    jump(amount: number) {
        if (!this.jumping) {
            this.vy = -amount; // Upward force (change this value to control jump height)
            this.y -= 10;
            this.jumping = true;
        }
    }
}