import { useEffect, useRef, useState } from 'react';
import { Game } from '@/components/Game';
import BasicButton from '@/components/BasicButton';
import { DraggableComponent, DraggableComponentParent } from '@/components/DraggableComponent';
import { createGame } from '@/components/utils';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { WalletSelector } from '@aptos-labs/wallet-adapter-ant-design';


let context: CanvasRenderingContext2D;
let game: Game;

type Component = {
    x: number;
    y: number;
    width: number;
    height: number;
    type: string;
};
type ComponentSpawner = {
    type: string;
    initialData: { width: number, height: number; };
    src: string;
};
const componentSpawners: ComponentSpawner[] = [
    { type: "platform", initialData: { width: 200, height: 50 }, src: "/platform0.png" },
    { type: "player", initialData: { width: 60, height: 60 }, src: "/player.png" },
    { type: "goal", initialData: { width: 60, height: 60 }, src: "/goal.png" },
    { type: "bounce", initialData: { width: 60, height: 60 }, src: "/bounce.png" },
    { type: "spike", initialData: { width: 200, height: 50 }, src: "/spike.png" },
    { type: "heart", initialData: { width: 60, height: 60 }, src: "/heart.png" },
];

export default function Home() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [components, setComponents] = useState<Component[]>([]);
    const [viewGlobalParams, setViewGlobalParams] = useState<boolean>(false);
    const [gravity, setGravity] = useState<number>(0.5);
    const [damage, setDamage] = useState<number>(10);
    const [playerHealth, setPlayerHealth] = useState<number>(20);
    const [healthGained, setHealthGained] = useState<number>(10);
    const [playerSpeed, setPlayerSpeed] = useState<number>(10);
    const [aptFee, setAptFee] = useState<number>(0.1);
    const [aptReward, setAptReward] = useState<number>(0.1);
    const wallet = useWallet();
    useEffect(() => {
        if (canvasRef.current) {
            canvasRef.current.width = 800;
            canvasRef.current.height = 800;
            context = canvasRef.current.getContext('2d')!;
        }
    }, [canvasRef]);
    useEffect(() => {
        game = new Game(() => setIsPlaying(false));
        frame(0);
    }, []);
    const frame = (time: number) => {
        if (context) {
            clearCanvas(canvasRef.current!, context);
            game.draw(canvasRef.current!, context);
        }
        requestAnimationFrame(frame);
    };
    useEffect(() => {
        setComponents(components => {
            const newComponents = [...components];
            return newComponents;
        });
    }, [isPlaying]);
    const clearCanvas = (canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) => {
        context.fillStyle = 'white';
        context.fillRect(0, 0, canvas.width, canvas.height);
    };
    const adjustToCanvas = (rect: DOMRect, component: Component): Component => {
        const styledBy = document.getElementById(`component-parent-${component.type}`)!.getBoundingClientRect();
        let diff = { x: styledBy.x - rect.x, y: styledBy.y - rect.y };
        return {
            x: component.x + diff.x,
            y: component.y + diff.y,
            width: component.width,
            height: component.height,
            type: component.type,
        };
    };
    const play = () => {
        if (game) {
            const rect = canvasRef.current!.getBoundingClientRect();
            let adjustedComponents = components.map(component => adjustToCanvas(rect, component));

            let globalVariables: any = { gravity, damage, playerHealth, healthGained, playerSpeed };
            if (game.play(adjustedComponents, globalVariables)) {
                setIsPlaying(true);
            } else {
                alert("You need to add a player and a goal to play");
            }
        }
    };
    const updateComponents = (added: Component[]) => {
        setComponents(prevComponents => {
            let newComponents = prevComponents.filter(component => component.type !== added[0].type);
            newComponents = newComponents.concat(added);
            return newComponents;
        });
    };
    const publish = async () => {
        const rect = canvasRef.current!.getBoundingClientRect();
        let adjustedComponents = components.map(component => adjustToCanvas(rect, component));
        let globalVariables: any = { gravity, damage, playerHealth, healthGained, playerSpeed };
        if (game.canPlay(adjustedComponents, globalVariables)) {
            const result = await createGame(adjustedComponents, Math.floor(globalVariables.gravity * 10), globalVariables.damage,
                globalVariables.playerHealth, globalVariables.healthGained, globalVariables.playerSpeed,
                Math.floor(aptFee * 10), Math.floor(aptReward * 10), wallet.signAndSubmitTransaction);
            console.log(result);
        } else {
            alert("Cannot publish game without a player and a goal");
        }
    };
    return (
        <div className="w-screen pt-10 flex flex-col justify-center items-center gap-4">
            <p className="text-5xl font-extrabold text-indigo-700 hover:cursor-pointer" onClick={() => window.location.href = "/"}>Stickman!</p>
            <div className="flex flex-row justify-center items-center gap-4 w-full">
                <BasicButton text="My Account" onClick={() => window.location.href = `/${wallet.account?.address}`} />
                <WalletSelector />
                <BasicButton text="Home" onClick={() => window.location.href = "/"} />
            </div>
            <div className="w-auto h-auto relative border-2 border-black rounded-lg">
                <canvas ref={canvasRef} className="border-2 border-black -z-50 rounded-lg" />
                {!isPlaying &&
                    <div className="absolute bottom-0 right-0 m-4">
                        <BasicButton onClick={play} text="play" />
                    </div>
                }
                {!isPlaying &&
                    <div className="absolute top-0 right-0 m-4">
                        <BasicButton onClick={() => setViewGlobalParams(true)} text="modify global parameters" />
                    </div>
                }
                {!isPlaying &&
                    <div className="absolute bottom-0 left-0 m-4">
                        <BasicButton onClick={publish} text="publish" />
                    </div>
                }
                {
                    viewGlobalParams &&
                    <div className="absolute top-0 left-0 w-full h-full bg-gray-600/60 flex flex-col justify-center items-center gap-2 rounded-lg">
                        <div className="flex flex-row justify-center items-center gap-2">
                            <p>Gravity</p>
                            <input
                                type="range"
                                min="0.1"
                                max="3"
                                step="0.1"
                                value={gravity}
                                onChange={(e) => setGravity(parseFloat(e.target.value))}
                            />
                            <span>{gravity}</span>
                        </div>
                        <div className="flex flex-row justify-center items-center gap-2">
                            <p>Player Health</p>
                            <input
                                type="range"
                                min="5"
                                max="200"
                                step="5"
                                value={playerHealth}
                                onChange={(e) => setPlayerHealth(parseFloat(e.target.value))}
                            />
                            <span>{playerHealth}</span>
                        </div>
                        <div className="flex flex-row justify-center items-center gap-2">
                            <p>Health Gained</p>
                            <input
                                type="range"
                                min="5"
                                max="50"
                                step="5"
                                value={healthGained}
                                onChange={(e) => setHealthGained(parseFloat(e.target.value))}
                            />
                            <span>{healthGained}</span>
                        </div>
                        <div className="flex flex-row justify-center items-center gap-2">
                            <p>Spike Damage</p>
                            <input
                                type="range"
                                min="5"
                                max="200"
                                step="5"
                                value={damage}
                                onChange={(e) => setDamage(parseFloat(e.target.value))}
                            />
                            <span>{damage}</span>
                        </div>
                        <div className="flex flex-row justify-center items-center gap-2">
                            <p>Player Speed</p>
                            <input
                                type="range"
                                min="2"
                                max="30"
                                step="2"
                                value={playerSpeed}
                                onChange={(e) => setPlayerSpeed(parseFloat(e.target.value))}
                            />
                            <span>{playerSpeed}</span>
                        </div>
                        <div className="flex flex-row justify-center items-center gap-2">
                            <p>APT Fee</p>
                            <input
                                type="range"
                                min="0.1"
                                max="50"
                                step="0.1"
                                value={aptFee}
                                onChange={(e) => setAptFee(parseFloat(e.target.value))}
                            />
                            <span>{aptFee}</span>
                        </div>
                        <div className="flex flex-row justify-center items-center gap-2">
                            <p>APT Reward</p>
                            <input
                                type="range"
                                min="0.1"
                                max="200"
                                step="0.1"
                                value={aptReward}
                                onChange={(e) => setAptReward(parseFloat(e.target.value))}
                            />
                            <span>{aptReward}</span>
                        </div>
                        <BasicButton onClick={() => setViewGlobalParams(false)} text="Confirm" />
                    </div>
                }
            </div>
            {!isPlaying &&
                <div className="flex flex-row justify-center items-center gap-4 w-full">
                    {componentSpawners.map((spawner: ComponentSpawner, index: number) => {
                        return <DraggableComponentParent {...spawner} key={index} report={updateComponents} start={components.filter((component) => component.type == spawner.type).map((component, i) => { return { ...component, id: i }; })} />;
                    })}
                </div>
            }
        </div>
    );
}
