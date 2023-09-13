module module_addr::stickman {

    use std::signer;
    use aptos_std::simple_map::SimpleMap;
    use aptos_framework::account::SignerCapability;
    use std::string::String;
    use std::vector;
    use aptos_std::simple_map;
    use aptos_framework::account;
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_framework::coin;
    use std::option::{Self, Option};

    struct State has key {
        games: SimpleMap<u64, Game>,
        next_game_id: u64,
        cap: SignerCapability,
    }
    struct Game has store, drop, copy {
        id: u64,
        creator: address,
        plays: SimpleMap<address, Play>,
        data: GameData,
        cost_to_play: u64,
        reward_per_win: u64,
        wins_left: u64,
        price: Option<u64>,
    }
    struct Play has store, drop, copy {
        player: address,
    }
    struct GameData has store, drop, copy {
        components: vector<Component>,
        gravity: u64,
        damage: u64,
        player_health: u64,
        health_gained: u64,
        player_speed: u64
    }
    struct Component has store, drop, copy {
        x: u64,
        y: u64,
        width: u64,
        height: u64,
        type: String
    }
    struct ReturnableGame has store, drop, copy {
        id: u64,
        creator: address,
        cost_to_play: u64,
        reward_per_win: u64,
        wins_left: u64,
        price: Option<u64>,
    }
    const SEED: vector<u8> = b"stickman";

    const ErrorVectorsNotSameLength: u64 = 1;
    const ErrorGameDoesNotExist: u64 = 2;
    const ErrorUserTooPoor: u64 = 3;
    const ErrorAlreadyPlaying: u64 = 4;
    const ErrorNotPlaying: u64 = 5;
    const ErrorNoWinsLeft: u64 = 6;
    const ErrorUserNotAdmin: u64 = 7;
    const ErrorPlaysExist: u64 = 8;
    const ErrorUserAdmin: u64 = 9;
    const ErrorGameNotForSale: u64 = 10;

    fun init_module(admin: &signer) {
        let (signer, cap) = account::create_resource_account(admin, SEED);
        let state = State {
            games: simple_map::create(),
            next_game_id: 0,
            cap
        };
        coin::register<AptosCoin>(&signer);
        move_to<State>(&signer, state)
    }
    public entry fun uploadGame(user: &signer, x: vector<u64>, y: vector<u64>, width: vector<u64>, height: vector<u64>,
                                type: vector<String>, gravity: u64, damage: u64, player_health: u64, health_gained: u64,
                                player_speed: u64, cost_to_play: u64, reward_per_win: u64) acquires State {
        assert_vec_same_length<u64, String>(&x, &y, &width, &height, &type);
        let state = get_state();
        let user_address = signer::address_of(user);
        assert_user_can_pay(user_address, reward_per_win * 10);
        let resource_address = account::create_resource_address(&@module_addr, SEED);
        coin::transfer<AptosCoin>(user, resource_address, reward_per_win * 10);
        let next_id = get_next_id(&mut state.next_game_id);
        let i = 0;
        let components = vector<Component>[];
        while (i < vector::length(&x)) {
            let component = Component {
                x: *vector::borrow(&x, i),
                y: *vector::borrow(&y, i),
                width: *vector::borrow(&width, i),
                height: *vector::borrow(&height, i),
                type: *vector::borrow(&type, i),
            };
            i = i + 1;
            vector::push_back(&mut components, component)
        };
        let game = Game {
            id: next_id,
            creator: user_address,
            plays: simple_map::create(),
            data: GameData {
                gravity,
                damage,
                player_health,
                player_speed,
                health_gained,
                components,
            },
            cost_to_play,
            reward_per_win,
            wins_left: 10,
            price: option::none()
        };
        simple_map::add(&mut state.games, next_id, game)
    }
    public entry fun list_game(user: &signer, game_id: u64, price: u64) acquires State {
        let user_address = signer::address_of(user);
        let state = get_state();
        assert_game_exists(&state.games, &game_id);
        let game = simple_map::borrow_mut(&mut state.games, &game_id);
        assert_user_admin(game, user_address);
        game.price = option::some(price);
    }
    public entry fun buy_game(user: &signer, game_id: u64) acquires State {
        let user_address = signer::address_of(user);
        let state = get_state();
        assert_game_exists(&state.games, &game_id);
        let game = simple_map::borrow_mut(&mut state.games, &game_id);
        assert_user_not_admin(user_address, game);
        assert_game_for_sale(game);
        let cost = *option::borrow(&game.price);
        assert_user_can_pay(user_address, cost);
        coin::transfer<AptosCoin>(user, game.creator, cost);
        game.price = option::none();
        game.creator = user_address
    }
    public entry fun delete_game(user: &signer, game_id: u64) acquires State {
        let user_address = signer::address_of(user);
        let state = get_state();
        assert_game_exists(&state.games, &game_id);
        let game = simple_map::borrow_mut(&mut state.games, &game_id);
        assert_user_admin(game, user_address);
        assert_no_plays(game);
        let resource_signer = account::create_signer_with_capability(&state.cap);
        coin::transfer<AptosCoin>(&resource_signer, user_address, game.reward_per_win * game.wins_left);
        simple_map::remove(&mut state.games, &game_id);
    }
    public entry fun start_play(user: &signer, game_id: u64) acquires State {
        let user_address = signer::address_of(user);
        let state = get_state();
        assert_game_exists(&state.games, &game_id);
        let game = simple_map::borrow_mut(&mut state.games, &game_id);
        assert_wins_left(game);
        //assert_user_not_playing(&game.plays, &user_address);
        if (user_address != game.creator) {
            assert_user_can_pay(user_address, game.cost_to_play);
            coin::transfer<AptosCoin>(user, game.creator, game.cost_to_play)
        };
        let play = Play {
            player: user_address,
        };
        simple_map::upsert(&mut game.plays, user_address, play);
    }
    public entry fun end_play(user: &signer, game_id: u64, win: bool) acquires State {
        let user_address = signer::address_of(user);
        let state = get_state();
        assert_game_exists(&state.games, &game_id);
        let game = simple_map::borrow_mut(&mut state.games, &game_id);
        assert_user_playing(&game.plays, &user_address);
        let resource_signer = account::create_signer_with_capability(&state.cap);
        if (win) {
            game.wins_left = game.wins_left - 1;
            coin::transfer<AptosCoin>(&resource_signer, user_address, game.reward_per_win);
        };
        simple_map::remove(&mut game.plays, &user_address);
    }
    public entry fun end_game(admin: &signer, user_address: address, game_id: u64, win: bool) acquires State {
        let admin_address = signer::address_of(admin);
        assert!(admin_address == @module_addr, ErrorUserNotAdmin);
        let state = get_state();
        assert_game_exists(&state.games, &game_id);
        let game = simple_map::borrow_mut(&mut state.games, &game_id);
        assert_user_playing(&game.plays, &user_address);
        let resource_signer = account::create_signer_with_capability(&state.cap);
        if (win) {
            game.wins_left = game.wins_left - 1;
            coin::transfer<AptosCoin>(&resource_signer, user_address, game.reward_per_win);
        };
        simple_map::remove(&mut game.plays, &user_address);
    }
    public entry fun refill_game(user: &signer, game_id: u64, amount: u64) acquires State {
        let user_address = signer::address_of(user);
        let state = get_state();
        assert_game_exists(&state.games, &game_id);
        let game = simple_map::borrow_mut(&mut state.games, &game_id);
        assert_user_can_pay(user_address, amount * game.reward_per_win);
        let resource_address = account::create_resource_address(&@module_addr, SEED);
        coin::transfer<AptosCoin>(user, resource_address, amount * game.reward_per_win)
    }
    #[view]
    public fun get_games(): vector<ReturnableGame> acquires State {
        let state = get_state();
        let i = 0;
        let keys = simple_map::keys(&state.games);
        let result = vector<ReturnableGame>[];
        while (i < vector::length(&keys)) {
            let game = simple_map::borrow(&state.games, vector::borrow(&keys, i));
            let returnable = ReturnableGame {
                id: game.id,
                creator: game.creator,
                cost_to_play: game.cost_to_play,
                reward_per_win: game.reward_per_win,
                wins_left: game.wins_left,
                price: game.price,
            };
            i = i + 1; // REMEMBER !!!!!!!!!!!!!!!
            vector::push_back(&mut result, returnable)
        };
        result
    }
    #[view]
    public fun get_game(game_id: u64): Game acquires State {
        let state = get_state();
        assert_game_exists(&state.games, &game_id);
        *simple_map::borrow(&state.games, &game_id)
    }
    inline fun get_next_id(id: &mut u64): u64 {
        let next_id = *id;
        *id = *id + 1;
        next_id
    }
    inline fun get_state(): &mut State acquires State {
        let resource_address = account::create_resource_address(&@module_addr, SEED);
        borrow_global_mut<State>(resource_address)
    }
    inline fun assert_game_for_sale(game: &Game) {
        assert!(option::is_some(&game.price), ErrorGameNotForSale)
    }
    inline fun assert_user_not_admin(user: address, game: &Game) {
        assert!(user != game.creator, ErrorUserAdmin)
    }
    inline fun assert_no_plays(game: &Game) {
        assert!(simple_map::length(&game.plays) == 0, ErrorPlaysExist)
    }
    inline fun assert_user_admin(game: &Game, user: address) {
        assert!(user == game.creator, ErrorUserNotAdmin)
    }
    inline fun assert_wins_left(game: &Game) {
        assert!(game.wins_left > 0, ErrorNoWinsLeft)
    }
    inline fun assert_user_can_pay(user: address, cost: u64) {
        assert!(coin::balance<AptosCoin>(user) >= cost, ErrorUserTooPoor)
    }
    inline fun assert_user_playing(plays: &SimpleMap<address, Play>, user: &address) {
        assert!(simple_map::contains_key(plays, user), ErrorNotPlaying)
    }
    inline fun assert_user_not_playing(plays: &SimpleMap<address, Play>, user: &address) {
        assert!(!simple_map::contains_key(plays, user), ErrorAlreadyPlaying)
    }
    inline fun assert_game_exists(games: &SimpleMap<u64, Game>, id: &u64) {
        assert!(simple_map::contains_key(games, id), ErrorGameDoesNotExist)
    }
    inline fun assert_vec_same_length<T, F>(v1: &vector<T>, v2: &vector<T>, v3: &vector<T>, v4: &vector<T>, v5: &vector<F>) {
        assert!(vector::length(v1) == vector::length(v2) && vector::length(v3) == vector::length(v4) &&
        vector::length(v3) == vector::length(v5) && vector::length(v1) == vector::length(v4), ErrorVectorsNotSameLength)
    }
}