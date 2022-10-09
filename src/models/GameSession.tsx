import GameBoard from "./GameBoard";
import GameConsole from "./GameConsole";
import CmdLink from "../components/CmdLink";
import {GameLogic} from "./GameLogic";
import GameClient from "../services/GameClient";

export default class GameSession {
    constructor() {
        this._console.log(<><CmdLink cmd={'multiplayer'} canRepeat>多人模式</CmdLink><CmdLink cmd={'start'}
                                                                                              canRepeat>调试模式</CmdLink></>);
    }

    get console(): GameConsole {
        return this._console;
    }

    get board(): GameBoard {
        return this._board;
    }

    get client(): GameClient {
        return this._client;
    }

    private _board = new GameBoard();
    private _console = new GameConsole();
    private _cmdInterpreter = new GameLogic(this);
    private _client = new GameClient();

    get connected() {
        return !!this.remoteId;
    } ;

    remoteId = '';

    static current = new GameSession();
}