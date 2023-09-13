import BasicButton from "@/components/BasicButton";
import { buyGame, getGames, shorten } from "@/components/utils";
import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useEffect, useState } from "react";


type ReturnableGame = {
    id: number,
    creator: string,
    cost_to_play: number,
    reward_per_win: number,
    wins_left: number;
    price: { vec: [number | undefined]; };
};
export default function Shop() {
    const [games, setGames] = useState<ReturnableGame[]>([]);
    const wallet = useWallet();
    useEffect(() => {
        getGames().then(games => {
            let newGames = games[0] as unknown as ReturnableGame[];
            //@ts-ignore
            newGames = newGames.filter(game => game.price.vec[0] !== undefined);
            console.log(newGames);
            setGames(newGames);
        });
    }, []);
    const buy = async (id: number) => {
        const response = await buyGame(id, wallet.signAndSubmitTransaction);
        if (response) {
            window.location.reload();
        }
        console.log(response);

    };
    return (
        <div className="w-screen h-screen flex flex-col justify-start items-center bg-gray-50 p-10 gap-6">
            <p className="text-5xl font-extrabold text-indigo-700 hover:cursor-pointer" onClick={() => window.location.href = "/"}>Stickman!</p>
            <div className="flex flex-row w-full justify-center items-center gap-4 bg-white rounded-lg shadow-md p-4">
                <WalletSelector />
                <p className="text-lg text-gray-700">Click on the games below to play!</p>
                <BasicButton text="Create Your Own Level" onClick={() => window.location.href = "/create"} />
                <BasicButton text="Your Account" onClick={() => window.location.href = `/${wallet.account?.address}`} />
            </div>
            <p className="text-2xl font-bold text-gray-700">Games for Sale</p>
            <div className="flex flex-col gap-4 w-full">
                {games &&
                    games.map((game: ReturnableGame, i: number) => <ReturnableGameModel key={i} {...game} buy={buy} />)
                }
            </div>
        </div>
    );
};

function ReturnableGameModel({ id, creator, cost_to_play, reward_per_win, wins_left, buy }: ReturnableGame & { buy: (id: number) => any; }) {
    return (
        <div className="flex flex-row w-full justify-between items-center gap-4 bg-white rounded-lg shadow-md p-4">
            <p className="text-md font-medium text-gray-700">Game {id} owned by {shorten(creator)}</p>
            <BasicButton text={`${cost_to_play > 0 ? `Play for ${cost_to_play}` : "Play"}`} onClick={() => window.location.href = `/play/${id}`} />
            <p className="text-sm text-gray-500">Reward: {reward_per_win}</p>
            <BasicButton text="Buy" onClick={() => buy(id)} />
        </div>
    );
}