import GameConsole from "./GameConsole";
import Chessman, {ChessmanOwner, ChessmanType, chessmanTypeToId} from "./Chessman";
import {Translations} from "../lang/Translations";
import GameSession from "./GameSession";
import CmdLink from "../components/CmdLink";
import {CmdLinkList} from "../components/CmdLinkList";
import {PlayLog} from "../components/PlayLog";
import GameBoard from "./GameBoard";

export class GameLogic {
    private readonly _console: GameConsole;
    private readonly _session: GameSession;
    private _waitSecondHand: boolean = false;
    private _waitFirstHand: boolean = false;
    private _pool: Chessman[] = [];

    constructor(session: GameSession) {
        this._console = session.console;
        this._session = session;
        this._console.onSendCmd = cmd => cmd[0] === '$' ? this.processCmd(cmd.substring(1), true) : this.processCmd(cmd);
    }

    processCmd(cmdline: string, isRemote = false) {
        if (cmdline.startsWith('#')) {
            this._console.log(<PlayLog
                isRemote={isRemote}>{isRemote ? '敌方' : '我方'}{': '}{cmdline.substring(1)}</PlayLog>, true);
            if (!isRemote)
                this.sendMessage('chat', cmdline.substring(1));
            return;
        }
        this._console.log(<PlayLog isRemote={isRemote}>{isRemote ? '敌方' : '我方'}{' -> '}<CmdLink
            cmd={cmdline.substring(0)}/></PlayLog>);
        for (let cmd of cmdline.trim().split(';').map(p => p.trim())) {
            if (!cmd)
                continue;
            let args = cmd.trim().split(' ').map(p => p.trim());
            switch (args[0]) {
                case 'start':
                    this.startGameLogic(args);
                    break;
                case 'place':
                    let owner: ChessmanOwner | null = args[1] === 'u' ? 'us' : args[1] === 'e' ? 'enemy' : null;
                    if (!owner)
                        throw new Error('invalid owner');
                    let slot = parseInt(args[2]);
                    let t = parseInt(args[3]);
                    let sel = ['king', 'wizard', 'knight', 'infantry', 'spearman', 'arsonist', 'civilian'] as ChessmanType[];
                    if (isNaN(t) || t < 0 || t >= sel.length)
                        throw new Error('invalid type');
                    let type = sel[t];
                    this._session.board.setChessman(slot, new Chessman(type, owner));
                    this._console.log(<PlayLog
                        isRemote={isRemote}>{Translations.owner[owner]}的{Translations.chessman[type]}放入
                        Slot:{slot}</PlayLog>);
                    break;
                case 'eat':
                    let slot3 = parseInt(args[1]);
                    let chessman = this._session.board.requireChessman(slot3);
                    this._session.board.setChessman(slot3, undefined);
                    this._console.log(<PlayLog
                        isRemote={isRemote}>{Translations.owner[chessman.owner]}的{Translations.chessman[chessman.type]}在
                        Slot:{slot3} 被吃掉了</PlayLog>);
                    break;
                case 'move': {
                    let slot1 = parseInt(args[1]);
                    let slot2 = parseInt(args[2]);
                    let chessman = this._session.board.requireChessman(slot1);
                    this._session.board.moveChessman(slot2, chessman);
                    this._console.log(<PlayLog
                        isRemote={isRemote}>{Translations.owner[chessman.owner]}的{Translations.chessman[chessman.type]}从
                        Slot:{slot1} 移到 Slot:{slot2}</PlayLog>);
                    break;
                }
                case 'swap': {
                    let slot1 = parseInt(args[1]);
                    let slot2 = parseInt(args[2]);
                    let chessman1 = this._session.board.requireChessman(slot1);
                    let chessman2 = this._session.board.requireChessman(slot2);
                    this._session.board.swapChessman(slot1, slot2);
                    this._console.log(<PlayLog
                        isRemote={isRemote}>{Translations.owner[chessman1.owner]} {Translations.chessman[chessman1.type]} Slot:{slot1} 与 {Translations.owner[chessman2.owner]} {Translations.chessman[chessman2.type]} Slot:{slot2} 交换</PlayLog>);
                    break;
                }
                case 'next':
                    this._session.board.rejectAllInteracts();
                    if (isRemote || args[1] === 'repeat') {
                        this._console.log(<PlayLog system>轮到你了</PlayLog>);
                        if (this._waitSecondHand) {
                            this._waitSecondHand = false;
                            this.processCmd('start second response')
                        } else {
                            if (args[1] === 'change') {
                                this._console.log(<PlayLog system>你的子被吃了 <CmdLink cmd={'change'}
                                                                                        canRepeat>换子</CmdLink>
                                    <CmdLink cmd={'next repeat'}
                                             canRepeat>不了</CmdLink></PlayLog>);
                            } else {
                                this._console.log(<PlayLog system>选择一个棋子发送命令 <CmdLink cmd={'next'}
                                                                                                canRepeat>不了</CmdLink></PlayLog>);
                                this.singleActionLogic();
                            }
                        }
                    } else
                        this._console.log(<PlayLog system>等待对方命令</PlayLog>)
                    if (!isRemote && !this._waitFirstHand)
                        this.sendMessage('command', 'next');
                    if (this._waitFirstHand) {
                        this._waitFirstHand = false;
                        this.sendMessage('command', 'start second response');
                    }
                    break;
                case 'change':
                    this.changeLogic();
                    break;
                case 'multiplayer':
                    this.multiplayerLogic();
                    break;
                case 'connect':
                    this.connectLogic(args);
                    break;
                default:
                    throw new Error('invalid command')
            }
        }
    }

    startGameLogic(args: string[]) {
        if (args.length === 1) {
            this._console.log(<PlayLog system>请选择你的先后手
                <CmdLinkList
                    links={[{cmd: 'start first', text: '先手'},
                        {cmd: 'start second', text: '后手'}]}/></PlayLog>);
            return;
        }
        if (args.length >= 2) {
            switch (args[1]) {
                case 'first':
                    this._console.log(<PlayLog>你是先手</PlayLog>);
                    this._waitFirstHand = true;
                    this.prepareCardLogic(true);
                    break;
                case 'second':
                    if (args[2] === 'response')
                        this.prepareCardLogic(false);
                    else {
                        this._console.log(<PlayLog>你是后手，等待对方操作</PlayLog>);
                        this.sendMessage('command', 'start first response');
                        this._waitSecondHand = true;
                    }
                    break;
                default:
                    throw new Error('invalid hand');
            }
        }
    }

    prepareCardLogic(firstHand: boolean) {
        let pool = Chessman.getStartupPool('us');
        let slots = GameBoard.getSlots(firstHand);
        let cmd = '', remoteCmd = '';
        for (const slot of slots) {
            let i = Math.floor(Math.random() * pool.length);
            let chessman = pool[i];
            pool.splice(i, 1);
            cmd += `place u ${slot} ${chessmanTypeToId(chessman.type)};`;
            remoteCmd += `place e ${slot} ${chessmanTypeToId(chessman.type)};`;
        }
        this.processCmd(cmd);
        this.sendMessage('command', remoteCmd);
        this._console.log(<PlayLog system>选择一个我方棋子交换位置 <CmdLink cmd={'next'}
                                                                            canRepeat>不了</CmdLink></PlayLog>);
        this._pool = pool;

        let sess = this._session;
        let con = this._console;

        function requestSwapA() {
            sess.board.requestInteract((slot, chessman) => {
                if (!chessman || chessman.owner !== 'us') {
                    requestSwapA();
                    return;
                }
                con.log(<PlayLog system>选择另一个我方棋子</PlayLog>);
                requestSwapB(slot, chessman);
                chessman.selected = true;
            });
        }

        let shadow = this;

        function requestSwapB(slotA: number, chessmanA: Chessman) {
            sess.board.requestInteract((slot, chessman) => {
                if (!chessman || chessman.owner !== 'us') {
                    requestSwapB(slotA, chessmanA);
                    return;
                }
                chessmanA.selected = false;
                if (slotA === slot) {
                    con.log(<PlayLog system>你还可以继续布阵 <CmdLink cmd={'next'}
                                                                      canRepeat>不了</CmdLink></PlayLog>);
                    requestSwapA();
                    return;
                }
                let cmd = `swap ${slotA} ${slot}`;
                shadow.processCmd(cmd);
                shadow.sendMessage('command', cmd);
                con.log(<PlayLog system>你还可以继续布阵 <CmdLink cmd={'next'}
                                                                  canRepeat>不了</CmdLink></PlayLog>);
                requestSwapA();
            }, () => chessmanA.selected = false);
        }

        requestSwapA();
    }

    singleActionLogic() {
        let shadow = this;

        function requestMoveA() {
            shadow._session.board.requestInteract((slot, chessman) => {
                if (!chessman || chessman.owner === 'enemy') {
                    requestMoveA();
                    return;
                }
                chessman.selected = true;
                shadow._console.log(<PlayLog system>选择另一个棋子</PlayLog>);
                requestMoveB(slot, chessman);
            });
        }

        function requestMoveB(slot1: number, chessman1: Chessman) {
            let validMoves = shadow._session.board.getMoveSlots(slot1);
            shadow._session.board.requestInteract((slot2, chessman2) => {
                chessman1.selected = false;
                let move = validMoves.find(p => p.slot === slot2);
                if (!move) {
                    shadow._console.logErr(<>不能这样移动</>);
                    requestMoveA();
                    return;
                }
                switch (move.type) {
                    case 'move':
                        shadow.processCmd(`move ${slot1} ${slot2}`);
                        shadow.sendMessage('command', `move ${slot1} ${slot2}`);
                        break;
                    case 'eat':
                        shadow.processCmd(`eat ${slot2};move ${slot1} ${slot2}`);
                        shadow.sendMessage('command', `eat ${slot1};move ${slot1} ${slot2}`);
                        break;
                    case 'perish':
                        shadow.processCmd(`eat ${slot1};eat ${slot2}`);
                        shadow.sendMessage('command', `eat ${slot1};eat ${slot2}`);
                        break;
                    case 'swap':
                        shadow.processCmd(`swap ${slot1} ${slot2}`);
                        shadow.sendMessage('command', `swap ${slot1} ${slot2}`);
                        break;
                }
                if (move.type === 'eat' || move.type === 'perish')
                    shadow.sendMessage('command', 'next change');
                else shadow.sendMessage('command', 'next');
            });
        }

        requestMoveA();
    }

    private multiplayerLogic() {
        this._console.log(<PlayLog system>正在连接到服务器</PlayLog>)
        this._session.client.start().then(() => {
                this.connectedLogic();
            }
        ).catch(ex => {
            this._console.logErr(<>{ex.Message}</>);
        });
    }

    private connectedLogic() {
        this._console.log(<PlayLog system>已连接到服务器
            <CmdLink cmd={'connect ask'} canRepeat>加入到其他伙伴</CmdLink>
            <CmdLink cmd={'connect wait'} canRepeat>等待其他伙伴加入</CmdLink></PlayLog>);
    }

    private connectLogic(args: string[]) {
        let client = this._session.client;
        switch (args[1]) {
            case 'ask':
                let id = prompt('输入对方的ID');
                if (!id || id === this._session.client.connectionId) {
                    this.connectedLogic();
                    return;
                }
                this.processCmd('connect try ' + id);
                break;
            case 'wait': {
                this._console.log(<PlayLog system>你的ID为 {client.connectionId}</PlayLog>);
                client.listen((connectionId, type) => {
                    if (type !== 'try')
                        return;
                    if (this._session.connected)
                        client.sendMessage(connectionId, 'tryCallback', 'playing').catch(ex => this._console.logErr(ex));
                    else
                        this._console.log(<PlayLog system>{connectionId} 请求连接
                            <CmdLink cmd={'connect accept ' + connectionId} canRepeat>同意</CmdLink>
                            <CmdLink cmd={'connect deny ' + connectionId} canRepeat>拒绝</CmdLink>
                        </PlayLog>);
                });
                break;
            }
            case 'try': {
                if (!args[2])
                    throw new Error('id needed');
                let a = client.listen((connectionId, type, message) => {
                    if (connectionId !== args[2] || type !== 'tryCallback')
                        return;
                    a();
                    if (message === 'deny' || message === 'playing') {
                        if (message === 'deny')
                            this._console.logErr(<>对方拒绝了你的连接请求</>);
                        else
                            this._console.logErr(<>对方正在游戏，无法连接</>);
                        this.connectedLogic();
                    } else
                        this.processCmd('connect set ' + connectionId);
                })
                client.sendMessage(args[2], 'try', '').catch(ex => {
                    this._console.logErr(ex);
                    a();
                    this.connectedLogic();
                });
                this._console.log(<PlayLog system>等待对方确认</PlayLog>);
                break;
            }
            case 'accept':
                if (!args[2])
                    throw new Error('id needed');
                this._session.remoteId = args[2];
                client.sendMessage(args[2], 'tryCallback', 'accept').catch(ex => this._console.logErr(ex));
                this._console.logErr(<PlayLog>已与 {args[2]} 建立连接</PlayLog>);
                this.processCmd('start');
                client.listen((connectionId, type, message) => this.onMessage(connectionId, type, message));
                break;
            case 'deny':
                if (!args[2])
                    throw new Error('id needed');
                client.sendMessage(args[2], 'tryCallback', 'deny').catch(ex => this._console.logErr(ex));
                break;
            case 'set':
                if (!args[2])
                    throw new Error('id needed');
                this._session.remoteId = args[2];
                this._console.logErr(<PlayLog>已与 {args[2]} 建立连接</PlayLog>);
                client.listen((connectionId, type, message) => this.onMessage(connectionId, type, message));
                break;
            default:
                throw new Error('invalid connect command');
        }
    }

    sendMessage(type: string, message: string, connectionId: string = this._session.remoteId ?? '') {
        if (connectionId)
            this._session.client.sendMessage(connectionId, type, message).catch(ex => this._session.console.logErr(ex));
    }

    private onMessage(connectionId: string, type: string, message: string) {
        switch (type) {
            case 'try':
                this.sendMessage('tryCallback', 'playing', connectionId);
                break;
            case 'command':
                this.processCmd(message, true);
                break;
            case 'chat':
                this.processCmd('#' + message, true);
                break;
        }
    }

    private changeLogic() {
        let pool = this._pool;
        let index = Math.floor(Math.random() * pool.length);
        let chessman = pool.splice(index, 1)[0];
        if (!chessman)
            throw new Error('no chessmen');
        pool.push(chessman);

        this._console.log(<PlayLog system>你抽到了{Translations.chessman[chessman.type]}, 请选择一个棋子
            <CmdLink cmd={'next repeat'}
                     canRepeat>不了</CmdLink></PlayLog>);

        let shadow = this;

        function requestChange() {
            shadow._session.board.requestInteract((slot, chessman1) => {
                if (!chessman1 || chessman1.owner === 'enemy') {
                    requestChange();
                    return;
                }
                pool.pop();
                pool.push(chessman1);
                let cmd = `place u ${slot} ${chessmanTypeToId(chessman.type)};next`;
                shadow.processCmd(cmd);
                shadow.sendMessage('command', cmd);
            });
        }

        requestChange();
    }
}