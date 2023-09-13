export const ABI = {"address":"0x94d3a82d23f7002e86fd322f5457a4ea59c841dc016d00fde6144c39e33be4e9","name":"stickman","friends":[],"exposed_functions":[{"name":"buy_game","visibility":"public","is_entry":true,"is_view":false,"generic_type_params":[],"params":["&signer","u64"],"return":[]},{"name":"delete_game","visibility":"public","is_entry":true,"is_view":false,"generic_type_params":[],"params":["&signer","u64"],"return":[]},{"name":"end_game","visibility":"public","is_entry":true,"is_view":false,"generic_type_params":[],"params":["&signer","address","u64","bool"],"return":[]},{"name":"end_play","visibility":"public","is_entry":true,"is_view":false,"generic_type_params":[],"params":["&signer","u64","bool"],"return":[]},{"name":"get_game","visibility":"public","is_entry":false,"is_view":true,"generic_type_params":[],"params":["u64"],"return":["0x94d3a82d23f7002e86fd322f5457a4ea59c841dc016d00fde6144c39e33be4e9::stickman::Game"]},{"name":"get_games","visibility":"public","is_entry":false,"is_view":true,"generic_type_params":[],"params":[],"return":["vector<0x94d3a82d23f7002e86fd322f5457a4ea59c841dc016d00fde6144c39e33be4e9::stickman::ReturnableGame>"]},{"name":"list_game","visibility":"public","is_entry":true,"is_view":false,"generic_type_params":[],"params":["&signer","u64","u64"],"return":[]},{"name":"refill_game","visibility":"public","is_entry":true,"is_view":false,"generic_type_params":[],"params":["&signer","u64","u64"],"return":[]},{"name":"start_play","visibility":"public","is_entry":true,"is_view":false,"generic_type_params":[],"params":["&signer","u64"],"return":[]},{"name":"uploadGame","visibility":"public","is_entry":true,"is_view":false,"generic_type_params":[],"params":["&signer","vector<u64>","vector<u64>","vector<u64>","vector<u64>","vector<0x1::string::String>","u64","u64","u64","u64","u64","u64","u64"],"return":[]}],"structs":[{"name":"Component","is_native":false,"abilities":["copy","drop","store"],"generic_type_params":[],"fields":[{"name":"x","type":"u64"},{"name":"y","type":"u64"},{"name":"width","type":"u64"},{"name":"height","type":"u64"},{"name":"type","type":"0x1::string::String"}]},{"name":"Game","is_native":false,"abilities":["copy","drop","store"],"generic_type_params":[],"fields":[{"name":"id","type":"u64"},{"name":"creator","type":"address"},{"name":"plays","type":"0x1::simple_map::SimpleMap<address, 0x94d3a82d23f7002e86fd322f5457a4ea59c841dc016d00fde6144c39e33be4e9::stickman::Play>"},{"name":"data","type":"0x94d3a82d23f7002e86fd322f5457a4ea59c841dc016d00fde6144c39e33be4e9::stickman::GameData"},{"name":"cost_to_play","type":"u64"},{"name":"reward_per_win","type":"u64"},{"name":"wins_left","type":"u64"},{"name":"price","type":"0x1::option::Option<u64>"}]},{"name":"GameData","is_native":false,"abilities":["copy","drop","store"],"generic_type_params":[],"fields":[{"name":"components","type":"vector<0x94d3a82d23f7002e86fd322f5457a4ea59c841dc016d00fde6144c39e33be4e9::stickman::Component>"},{"name":"gravity","type":"u64"},{"name":"damage","type":"u64"},{"name":"player_health","type":"u64"},{"name":"health_gained","type":"u64"},{"name":"player_speed","type":"u64"}]},{"name":"Play","is_native":false,"abilities":["copy","drop","store"],"generic_type_params":[],"fields":[{"name":"player","type":"address"}]},{"name":"ReturnableGame","is_native":false,"abilities":["copy","drop","store"],"generic_type_params":[],"fields":[{"name":"id","type":"u64"},{"name":"creator","type":"address"},{"name":"cost_to_play","type":"u64"},{"name":"reward_per_win","type":"u64"},{"name":"wins_left","type":"u64"},{"name":"price","type":"0x1::option::Option<u64>"}]},{"name":"State","is_native":false,"abilities":["key"],"generic_type_params":[],"fields":[{"name":"games","type":"0x1::simple_map::SimpleMap<u64, 0x94d3a82d23f7002e86fd322f5457a4ea59c841dc016d00fde6144c39e33be4e9::stickman::Game>"},{"name":"next_game_id","type":"u64"},{"name":"cap","type":"0x1::account::SignerCapability"}]}]} as const