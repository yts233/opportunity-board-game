import GameBoard from "./GameBoard";
import GameConsole from "./GameConsole";
import {GameLogic} from "./GameLogic";
import GameClient from "../services/GameClient";
import Introduction from "../components/Introduction";

export default class GameSession {
    constructor() {
        this._console.log(<Introduction/>);
        //this._console.log(<><CmdLink cmd={'multiplayer'} canRepeat>多人模式</CmdLink><CmdLink cmd={'start'}
        //                                                                                      canRepeat>调试模式</CmdLink></>);
        this._logic.processCmd('multiplayer');
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
    private _logic = new GameLogic(this);
    private _client = new GameClient();

    get connected() {
        return !!this.remoteId;
    } ;

    remoteId = '';

    static current = new GameSession();

    onPing: (ping: number) => void = () => {
    };
}