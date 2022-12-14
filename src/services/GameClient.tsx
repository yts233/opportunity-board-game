import {HubConnection, HubConnectionBuilder} from "@microsoft/signalr";
import GameSession from "../models/GameSession";

const testAddress = false;
const serverAddress = testAddress ? 'https://localhost:7242/hub' : 'https://api.yts233.tk/obghub';

export default class GameClient {
    constructor() {
        this._connection = new HubConnectionBuilder().withUrl(serverAddress).build();
        this._connection.on('Message', (connectionId: string, type: string, message: string) => this.onMessage(connectionId, type, message));
        this._connection.on('GlobalMessage', (connectionId: string, type: string, message: string) => this.onGlobalMessage(connectionId, type, message));
        this._connection.onclose(p => GameSession.current.console.logErr(<>断开连接 {p?.toString()}</>));
    }

    private _connection: HubConnection;

    private _callbackOnce: ((connectionId: string, type: string, message: string) => void)[] = [];
    private _globalCallbackOnce: ((connectionId: string, type: string, message: string) => void)[] = [];
    private _callbacks: ((connectionId: string, type: string, message: string) => void)[] = [];
    private _globalCallbacks: ((connectionId: string, type: string, message: string) => void)[] = [];

    private onMessage(connectionId: string, type: string, message: string) {
        let a = this._callbackOnce;
        this._callbackOnce = [];
        a.forEach(e => e(connectionId, type, message));
        Array.from(this._callbacks).forEach(e => e(connectionId, type, message));
        console.log('<-', connectionId, type, message)
    }

    private onGlobalMessage(connectionId: string, type: string, message: string) {
        let a = this._globalCallbackOnce;
        this._globalCallbackOnce = [];
        a.forEach(e => e(connectionId, type, message));
        Array.from(this._globalCallbacks).forEach(e => e(connectionId, type, message));
        console.log('<- global:', connectionId, type, message)
    }

    get connectionId() {
        return this._connection.connectionId;
    }

    async start() {
        await this._connection.start();
    }

    async stop() {
        await this._connection.stop();
    }

    async sendMessage(connectionId: string, type: string, message: string) {
        console.log('->', connectionId, type, message)
        await this._connection.send('SendMessage', connectionId, type, message);
    }

    async sendGlobalMessage(type: string, message: string) {
        console.log('-> global', type, message)
        await this._connection.send('SendGlobalMessage', type, message);
    }

    private removeAnElement<T>(arr: T[], item: T) {
        let index = arr.indexOf(item);
        if (index !== -1)
            arr.splice(index, 1);
    }

    listen(callback: (connectionId: string, type: string, message: string) => void) {
        this._callbacks.push(callback);
        return () => this.removeAnElement(this._callbacks, callback);
    }

    listenOnce(callback: (connectionId: string, type: string, message: string) => void) {
        this._callbackOnce.push(callback);
        return () => this.removeAnElement(this._callbackOnce, callback);
    }

    listenGlobal(callback: (connectionId: string, type: string, message: string) => void) {
        this._globalCallbacks.push(callback);
        return () => this.removeAnElement(this._globalCallbacks, callback);
    }

    listenGlobalOnce(callback: (connectionId: string, type: string, message: string) => void) {
        this._globalCallbackOnce.push(callback);
        return () => this.removeAnElement(this._globalCallbackOnce, callback);
    }
}
