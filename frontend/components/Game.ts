import { Bounce, GameObject, Goal, Health, Platform, Spikes } from "./GameObject";
import Player from "./Player";

export type Component = {
    x: number;
    y: number;
    width: number;
    height: number;
    type: string;
};
type GameData = {
    components: Component[],
    gravity: number,
    damage: number,
    player_health: number,
    health_gained: number,
    player_speed: number,
};
export class Game {
    gameObjects!: GameObject[];
    player!: Player;
    onEnd: (e?: any) => any;
    playing: boolean;
    address!: string;
    constructor(onEnd: (e?: any) => any) {
        // this.player = new Player(100, 100, 20, 20, 5, 20)
        // this.gameObjects = []
        // const platform = new Platform(100, 200, 200, 20);
        // this.gameObjects.push(platform);
        // const spikes = new Spikes(400, 200, 200, 10, 10);
        // this.gameObjects.push(spikes);
        this.playing = false;
        this.onEnd = onEnd;
    }
    edit(): boolean {
        this.playing = false;
        return true;
    }
    canPlay(components: Component[], globalVariables: { gravity: number, damage: number, playerHealth: number, healthGained: number; playerSpeed: number; }): boolean {
        return components.filter(component => component.type === "player").length >= 1 &&
            components.filter(component => component.type === "goal").length >= 1;
    }
    play(components: Component[], globalVariables: { gravity: number, damage: number, playerHealth: number, healthGained: number; playerSpeed: number; }): boolean {
        if (components.filter(component => component.type === "player").length >= 1 &&
            components.filter(component => component.type === "goal").length >= 1) {
            const player = components.find(component => component.type === "player") as Component;
            const goal = components.find(component => component.type === "goal") as Component;
            this.player = new Player(player.x + player.width / 2, player.y + player.height / 2, player.width, player.height, globalVariables.playerSpeed || 5, globalVariables.playerHealth || 20);
            this.player.gravity = globalVariables.gravity || 0.5;
            //@ts-ignore
            this.gameObjects = components.map((component) => {
                switch (component.type) {
                    case "platform":
                        return new Platform(component.x + component.width / 2, component.y + component.height / 2, component.width, component.height);
                    case "spike":
                        return new Spikes(component.x + component.width / 2, component.y + component.height / 2, component.width, component.height, globalVariables.damage || 10);
                    case "health":
                        return new Health(component.x + component.width / 2, component.y + component.height / 2, component.width, globalVariables.healthGained || 10);
                    case "bounce":
                        return new Bounce(component.x + component.width / 2, component.y + component.height / 2, component.width, 10);
                    default:
                        return undefined;
                }
            }).filter((gameObject) => gameObject !== undefined);
            this.gameObjects.push(new Goal(goal.x + goal.width / 2, goal.y + goal.width / 2, goal.width, this));
            this.playing = true;
            return true;
        } else {
            return false;
        }
    }
    draw(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, update: boolean = true) {
        if (this.playing) {
            if (this.player.health <= 0) {
                this.end();
            }
            this.gameObjects.forEach((gameObject) => {
                gameObject.draw(canvas, context);
                if (update) {
                    gameObject.update(this.player);
                }
            });
            this.player.draw(canvas, context, true);
        }
    }
    end() {
        this.player.gravity = 0;
        this.player.vy = 0;
        if (this.player.health <= 0) {
            this.player.src = "/dead.png";
            this.player.speed = 0;
            setTimeout(() => {
                this.playing = false;
                this.onEnd(this);
            }, 1000);
        } else {
            this.playing = false;
            this.onEnd(this);
        }
    }
    load(components: Component[], globalVariables: { gravity: number, damage: number, playerHealth: number, healthGained: number; playerSpeed: number; }) {
        if (components.filter(component => component.type === "player").length >= 1 &&
            components.filter(component => component.type === "goal").length >= 1) {
            const player = components.find(component => component.type === "player") as Component;
            const goal = components.find(component => component.type === "goal") as Component;
            this.player = new Player(player.x + player.width / 2, player.y + player.height / 2, player.width, player.height, globalVariables.playerSpeed || 5, globalVariables.playerHealth || 20);
            this.player.gravity = globalVariables.gravity || 0.5;
            //@ts-ignore
            this.gameObjects = components.map((component) => {
                switch (component.type) {
                    case "platform":
                        return new Platform(component.x + component.width / 2, component.y + component.height / 2, component.width, component.height);
                    case "spike":
                        return new Spikes(component.x + component.width / 2, component.y + component.height / 2, component.width, component.height, globalVariables.damage || 10);
                    case "health":
                        return new Health(component.x + component.width / 2, component.y + component.height / 2, component.width, globalVariables.healthGained || 10);
                    case "bounce":
                        return new Bounce(component.x + component.width / 2, component.y + component.height / 2, component.width, 10);
                    default:
                        return undefined;
                }
            }).filter((gameObject) => gameObject !== undefined);
            console.log(this.gameObjects);
            this.gameObjects.push(new Goal(goal.x + goal.width / 2, goal.y + goal.width / 2, goal.width, this));
        }
    }
}
class GameConfiguration {
    player: { x: number, y: number, gravity: number; };
    gameObjects: { x: number, y: number, width: number, height: number, damage?: number, health?: number, name: string, amount?: number; }[];
    constructor(player: Player, gameObjects: GameObject[]) {
        this.player = {
            gravity: player.gravity,
            x: player.x,
            y: player.y,
        },
            this.gameObjects = gameObjects.map((gameObject) => {
                const basic = {
                    x: gameObject.x,
                    y: gameObject.y,
                    width: gameObject.width,
                    height: gameObject.height,
                };
                let other: any;
                let gameObject2 = gameObject as any;
                if (gameObject2.constructor.name === "Spikes") {
                    other.damage = gameObject2.damage;
                    other.name = gameObject2.constructor.name;
                } else if (gameObject2.constructor.name === "Health") {
                    other.health = gameObject2.health;
                    other.name = gameObject2.constructor.name;
                } else if (gameObject2.constructor.name === "Bounce") {
                    other.amount = gameObject2.amount;
                    other.name = gameObject2.constructor.name;
                } else {
                    other.name = gameObject2.constructor.name;
                }
                return { ...basic, ...other };
            });
    }
    serialize() {
        return {
            player: this.player,
            gameObjects: this.gameObjects,
        };
    }
}