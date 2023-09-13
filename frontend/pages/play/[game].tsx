import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design";
import BasicButton from "../../components/BasicButton";
import { useEffect, useReducer, useRef, useState } from "react";
import { useRouter } from "next/router";
import { endGame, endPlay, getGame, startPlay } from "../../components/utils";
import { Game as PlayableGame } from "../../components/Game";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
type Game = {
  id: number,
  creator: number,
  cost_to_play: number,
  reward_per_win: number,
  data: GameData;
};
type GameData = {
  components: Component[],
  gravity: number,
  damage: number,
  player_health: number,
  health_gained: number,
  player_speed: number,
};
type Component = {
  type: string,
  x: number,
  y: number,
  width: number,
  height: number,
};
function isNumeric(value: string | number): boolean {
  return !isNaN(Number(value));
}

function convertFieldsToNumbers(obj: any): any {
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];

      // If value is an object, recursively transform its fields
      if (typeof value === 'object') {
        convertFieldsToNumbers(value);
      } else if (typeof value === 'string' && isNumeric(value) && value[1] != "x") {
        obj[key] = Number(value);
      }
    }
  }
}
let playableGame: PlayableGame;
let context!: CanvasRenderingContext2D;
export default function Game() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [game, setGame] = useState<Game>();
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [win, setWin] = useState<boolean>(false);
  const { account, signAndSubmitTransaction } = useWallet();
  useEffect(() => {
    if (router.isReady) {
      const { game } = router.query;
      if (!Number.isNaN(Number(game))) {
        const game_id = Number(game);
        getGame(game_id).then(game => {
          let newGame = game[0] as unknown as Game;
          console.log(newGame);
          convertFieldsToNumbers(newGame);
          setGame(newGame);
        });
      } else {
        window.location.href = "/";
      }
    }
  }, [router.isReady]);
  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.width = 800;
      canvasRef.current.height = 800;
      context = canvasRef.current.getContext('2d')!;
    }
  }, [canvasRef]);
  useEffect(() => {
    if (game) {
      playableGame = new PlayableGame((thisGame: PlayableGame) => {
        setIsPlaying(false);
        setGameOver(true);
        game.data.gravity /= 10;
        const gameData = { gravity: game.data.gravity / 10, damage: game.data.damage, playerHealth: game.data.player_health, healthGained: game.data.health_gained, playerSpeed: game.data.player_speed };
        playableGame.load(game.data.components, gameData);
        let win = thisGame.player.health > 0;
        setWin(win);
        endGame(thisGame.address, Number(router.query.game), win);
      });
      frame(0);
    }
  }, [game]);
  useEffect(() => {
    if (playableGame && account) {
      playableGame.address = account.address;
    }
  }, [account]);
  const clearCanvas = (canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) => {
    context.fillStyle = 'white';
    context.fillRect(0, 0, canvas.width, canvas.height);
  };
  const frame = (t: number) => {
    if (playableGame) {
      clearCanvas(canvasRef.current!, context);
      playableGame.draw(canvasRef.current!, context, playableGame.playing);
    }
    requestAnimationFrame(frame);
  };
  const play = async () => {
    if (game) {
      const response = await startPlay(game.id, signAndSubmitTransaction);
      if (response) {
        setIsPlaying(true);
        playableGame.play(game.data.components, game.data as any);
      }
    }
  };
  const reset = async () => {
    if (game) {
      //const response = await endPlay(game.id, win, signAndSubmitTransaction);
      setIsPlaying(false);
      setGameOver(false);
      setWin(false);
      playableGame.load(game.data.components, game.data as any);
    }
  };
  return (
    <div className="w-screen flex flex-col justify-center items-center p-10 gap-4">
      <p className="text-5xl font-extrabold text-indigo-700 hover:cursor-pointer" onClick={() => window.location.href = "/"}>Stickman!</p>
      <div className="flex flex-row w-full justify-center items-center gap-4">
        <WalletSelector />
        <p className="text-lg font-medium">Click on the games below to play!</p>
        <BasicButton text="Create Your Own Level" onClick={() => window.location.href = "/create"} />
        <BasicButton text="View shop" onClick={() => window.location.href = "/shop"} />
      </div>
      <div className="relative w-auto h-auto border-2 border-black rounded-lg p-2">
        <canvas ref={canvasRef} className="border border-black rounded-lg" />
        {!isPlaying &&
          <div className="absolute top-0 left-0 w-full h-full flex flex-col justify-center items-center gap-4 bg-black bg-opacity-40">
            <BasicButton text="Play" onClick={play} />
          </div>
        }
        {gameOver &&
          <div className="absolute top-0 left-0 w-full h-full flex flex-col justify-center items-center gap-4 bg-black bg-opacity-40">
            <BasicButton text="Reset" onClick={reset} />
          </div>
        }
      </div>
    </div>
  );
}