import BasicButton from "@/components/BasicButton";
import { getGames, listGame, refillGame, shorten } from "@/components/utils";
import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

type ReturnableGame = {
    id: number,
    creator: string,
    cost_to_play: number,
    reward_per_win: number,
    wins_left: number;
    price: { vec: [number | undefined]; };
};
export default function Account() {
    const router = useRouter();
    const wallet = useWallet();
    const [notSelling, setNotSelling] = useState<ReturnableGame[]>([]);
    const [selling, setSelling] = useState<ReturnableGame[]>([]);
    useEffect(() => {
        if (router.isReady && wallet.account) {
            const { account } = router.query;
            if (account == wallet.account.address) {
                getGames().then(games => {
                    let newGames = games[0] as unknown as ReturnableGame[];
                    newGames = newGames.filter(game => game.creator == account);
                    let notSelling = newGames.filter(game => game.price.vec[0] == undefined);
                    let selling = newGames.filter(game => game.price.vec[0] != undefined);
                    console.log(selling, notSelling);
                    setNotSelling(notSelling);
                    setSelling(selling);
                });
            } else {
                window.location.href = "/";
            }
        }
    }, [router.isReady, wallet]);
    const list = async (id: number) => {
        const response = await listGame(id, 10, wallet.signAndSubmitTransaction);
        console.log(response);
        window.location.reload();
    };
    const unlist = async (id: number) => {
        //not implemented
    };
    const refill = async (id: number) => {
        const response = await refillGame(id, 10, wallet.signAndSubmitTransaction);
        console.log(response);
        window.location.reload();
    };
    return (
        <div className="w-screen h-screen bg-gray-50 flex flex-col justify-start items-center p-10 gap-4">
            <p className="text-5xl font-extrabold text-indigo-700 hover:cursor-pointer" onClick={() => window.location.href = "/"}>Stickman!</p>
            <div className="flex flex-row w-full justify-center items-center gap-4">
                <BasicButton text="Create Your Own Level" onClick={() => window.location.href = "/create"} />
                <WalletSelector />
                <BasicButton text="View shop" onClick={() => window.location.href = "/shop"} />
            </div>
            <p className="text-4xl font-medium">Your games</p>
            <p className="text-2xl font-semibold">Unlisted Games</p>
            {notSelling &&
                notSelling.map((game: ReturnableGame, i: number) => <ReturnableGameModel key={i} {...game} canList={true} list={list} unlist={unlist} refill={refill} />)
            }
            <p className="text-2xl font-semibold">Listed Games</p>
            {selling &&
                selling.map((game: ReturnableGame, i: number) => <ReturnableGameModel key={i} {...game} canList={false} list={list} unlist={unlist} refill={refill} />)
            }
        </div>
    );
};
function ReturnableGameModel({ id, creator, cost_to_play, reward_per_win, wins_left, canList, list, unlist, refill }: ReturnableGame & { canList: boolean, list: (id: number) => any; unlist: (id: number) => any; refill: (id: number) => any; }) {
    return (
        <div className="flex flex-row w-full justify-center items-center gap-4 border-2 border-black rounded-lg p-2">
            <p className="text-base font-medium">Game {id}</p>
            <BasicButton text={`Play`} onClick={() => window.location.href = `/play/${id}`} />
            <p className="text-base font-medium">Reward: {reward_per_win}</p>
            {canList ?
                <>
                    <BasicButton text="List" onClick={() => list(id)} />
                    <BasicButton text="Refill" onClick={() => refill(id)} />
                </>
                :
                <BasicButton text="Unlist" onClick={() => unlist(id)} />
            }
        </div>
    );
}