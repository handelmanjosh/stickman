import { createClient } from "@thalalabs/surf";
import { AptosAccount, AptosClient, BCS, FaucetClient, HexString, Network, Provider, TxnBuilderTypes } from "aptos";
import { ABI } from "./abi";
import { createEntryPayload } from "@thalalabs/surf";
import { Types } from 'aptos';
import { Component } from "./Game";
import { Serializer } from "v8";
export const network =
    process.env.NEXT_PUBLIC_NETWORK === "devnet"
        ? Network.DEVNET
        : process.env.NEXT_PUBLIC_NETWORK === "testnet"
            ? Network.TESTNET
            : process.env.NEXT_PUBLIC_NETWORK === "mainnet"
                ? Network.MAINNET
                : Network.LOCAL;

export const provider = new Provider(network);
export const client = createClient({
    nodeUrl: provider.aptosClient.nodeUrl,
}).useABI(ABI);
const localClient = new AptosClient("https://fullnode.testnet.aptoslabs.com");
export async function createGame(components: Component[], gravity: number, damage: number, player_health: number, health_gained: number,
    player_speed: number, cost_to_play: number, reward_per_win: number, sign: (n: any) => any) {
    const xs: number[] = [];
    const ys: number[] = [];
    const widths: number[] = [];
    const heights: number[] = [];
    const types: string[] = [];
    for (const component of components) {
        xs.push(Math.floor(component.x));
        ys.push(Math.floor(component.y));
        widths.push(Math.floor(component.width));
        heights.push(Math.floor(component.height));
        types.push(component.type);
    }
    const payload = {
        type: "entry_function_payload",
        ...createEntryPayload(ABI,
            {
                function: "uploadGame",
                type_arguments: [],
                arguments: [xs, ys, widths, heights, types, gravity, damage, player_health, health_gained, player_speed, cost_to_play, reward_per_win],
            },
        ).rawPayload
    };

    // const provider = new Provider(Network.TESTNET);
    // const faucetClient = new FaucetClient('https://fullnode.testnet.aptoslabs.com', 'https://faucet.testnet.aptoslabs.com');
    // const acc = new AptosAccount(new HexString("0x3212dc58ea52a6e46d5ea1c2c2ad838965f1bbb8e942d21196d1773c49de33dc").toUint8Array());
    // //await faucetClient.fundAccount(acc.address(), 1000000000);
    // const serialize = (a: any[]) => {
    //     return (() => {
    //         const serializer = new BCS.Serializer();
    //         serializer.serializeU32AsUleb128(a.length);
    //         a.forEach((b) => {
    //             serializer.serializeU64(b);
    //         });

    //         return serializer.getBytes();
    //     })();
    // };
    // const r = await provider.generateSignSubmitWaitForTransaction(
    //     acc,
    //     new TxnBuilderTypes.TransactionPayloadEntryFunction(
    //         TxnBuilderTypes.EntryFunction.natural(
    //             "0x91c575f853bfb1ae7a6b2f7a36ce589ed1226aca86daad8f9c537e803638681f::stickman",
    //             "uploadGame",
    //             [],
    //             [
    //                 serialize(xs),
    //                 serialize(ys),
    //                 serialize(widths),
    //                 serialize(heights),
    //                 (() => {
    //                     const serializer = new BCS.Serializer();
    //                     serializer.serializeU32AsUleb128(types.length);
    //                     types.forEach((type) => {
    //                         serializer.serializeStr(type);
    //                     });

    //                     return serializer.getBytes();
    //                 })(),
    //                 BCS.bcsSerializeUint64(gravity),
    //                 BCS.bcsSerializeUint64(damage),
    //                 BCS.bcsSerializeUint64(player_health),
    //                 BCS.bcsSerializeUint64(health_gained),
    //                 BCS.bcsSerializeUint64(player_speed),
    //                 BCS.bcsSerializeUint64(cost_to_play),
    //                 BCS.bcsSerializeUint64(reward_per_win),
    //             ]
    //         )
    //     )
    // );
    // console.log(r);

    // console.log(payload);
    console.log("here");
    const response = await sign(payload);
    console.log("responded");
    console.log(response);
    const result = (await provider.waitForTransactionWithResult(response.hash)) as Types.UserTransaction;
    return result;
}
export async function deleteGame(game_id: number, sign: any) {
    const payload = {
        type: "entry_function_payload",
        ...createEntryPayload(ABI,
            {
                function: "delete_game",
                type_arguments: [],
                arguments: [game_id],
            },
        ).rawPayload
    };
    const response = await sign(payload);
    const result = (await provider.waitForTransactionWithResult(response.hash)) as Types.UserTransaction;
    return result;
}
export async function startPlay(game_id: number, sign: any) {
    const payload = {
        type: "entry_function_payload",
        ...createEntryPayload(ABI,
            {
                function: "start_play",
                type_arguments: [],
                arguments: [game_id],
            },
        ).rawPayload
    };
    const response = await sign(payload);
    const result = (await provider.waitForTransactionWithResult(response.hash)) as Types.UserTransaction;
    return result;
}
export async function endPlay(game_id: number, win: boolean, sign: any) {
    // DO NOT USE ANYMORE
    const payload = {
        type: "entry_function_payload",
        ...createEntryPayload(ABI,
            {
                function: "end_play",
                type_arguments: [],
                arguments: [game_id, win],
            },
        ).rawPayload
    };
    const response = await sign(payload);
    const result = (await provider.waitForTransactionWithResult(response.hash)) as Types.UserTransaction;
    return result;
}
export async function endGame(user_address: string, game_id: number, win: boolean) {
    const admin = new AptosAccount(new HexString("ea7be4577093c671604f0d8ba8d458b061f415570a9a882cfbd151f4b0e5fdad").toUint8Array());
    const rawTxn = await localClient.generateTransaction(admin.address(), {
        function: `${admin.address()}::stickman::end_game`,
        type_arguments: [],
        arguments: [user_address, game_id, win],
    });
    const bcsTxn = await localClient.signTransaction(admin, rawTxn);
    const pendingTxn = await localClient.submitTransaction(bcsTxn);
    const txnHash = pendingTxn.hash;
    const status = await localClient.waitForTransaction(txnHash, { checkSuccess: true });
    console.log("Ended game", status);
    return status;
}
export async function refillGame(game_id: number, amount: number, sign: any) {
    const payload = {
        type: "entry_function_payload",
        ...createEntryPayload(ABI,
            {
                function: "refill_game",
                type_arguments: [],
                arguments: [game_id, amount],
            },
        ).rawPayload
    };
    const response = await sign(payload);
    const result = (await provider.waitForTransactionWithResult(response.hash)) as Types.UserTransaction;
    return result;
}
export async function listGame(game_id: number, price: number, sign: any) {
    const payload = {
        type: "entry_function_payload",
        ...createEntryPayload(ABI,
            {
                function: "list_game",
                type_arguments: [],
                arguments: [game_id, price],
            },
        ).rawPayload
    };
    const response = await sign(payload);
    const result = (await provider.waitForTransactionWithResult(response.hash)) as Types.UserTransaction;
    return result;
}
export async function buyGame(game_id: number, sign: any) {
    const payload = {
        type: "entry_function_payload",
        ...createEntryPayload(ABI,
            {
                function: "buy_game",
                type_arguments: [],
                arguments: [game_id],
            },
        ).rawPayload
    };
    const response = await sign(payload);
    const result = (await provider.waitForTransactionWithResult(response.hash)) as Types.UserTransaction;
    return result;
}
export async function getGames() {
    const games = await client.view.get_games({
        type_arguments: [],
        arguments: [],
    });
    return games;
}
export async function getGame(game_id: number) {
    const game = await client.view.get_game({
        type_arguments: [],
        arguments: [game_id],
    });
    return game;
}
export function shorten(address: string) {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
}