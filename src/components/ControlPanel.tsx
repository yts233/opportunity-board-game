import './ControlPanel.css'
import {Translations} from "../lang/Translations";
import {Component, ReactElement} from "react";
import GameSession from "../models/GameSession";

class LogPanel extends Component<{}, { logs?: ReactElement[] }> {
    private logList: HTMLUListElement | null = null;
    private _console = GameSession.current.console;

    constructor(props = {}) {
        super(props)
        this.state = {
            logs: this._console.logs
        };
    }

    componentDidMount() {
        this._console.onLog = () => {
            this.updateState();
        };
    }

    scrollToEnd() {
        this.logList?.scrollTo({behavior: 'smooth', top: 99999999})
    }

    render() {
        return (
            <ul className={'ControlPanel-log-list'} ref={p => {
                if (p) {
                    this.logList = p;
                    this.scrollToEnd();
                }
                return p;
            }}>
                {this.state.logs?.map((p, i) =>
                    <li key={i} className={'ControlPanel-log-list-item'}>{p}</li>)}
            </ul>
        );
    }

    updateState() {
        this.setState({logs: this._console.logs});
    }
}

export default class ControlPanel extends Component<{}, { ping?: number }> {
    constructor(props: {}) {
        super(props);
        this.state = {ping: undefined};
    }

    componentDidMount() {
        GameSession.current.onPing = ping => {
            this.setState({ping: ping});
        }
    }

    render() {
        let a = this.state.ping ? <span
            className={'ControlPanel-ping'}>{this.state.ping === -1 ? <>断开连接</> : <>{this.state.ping}ms</>}</span> : undefined;
        return (
            <div className={'ControlPanel'}>
                <h2 style={{color: '#333', marginTop: '.5rem'}}>{Translations.game.title} {a}</h2>
                <LogPanel/>
                <form className={'ControlPanel-cmd-panel'} ref={r => {
                    if (r)
                        r.onsubmit = e => {
                            GameSession.current.console.sendCmd('#' + ((e.target as HTMLFormElement).elements.namedItem('cmd') as HTMLInputElement).value);
                            ((e.target as HTMLFormElement).elements.namedItem('cmd') as HTMLInputElement).value = '';
                            return false;
                        };
                    return r;
                }}>
                    <input name={'cmd'} className={'ControlPanel-cmd-input'} required/>
                    <input type={'submit'} className={'ControlPanel-cmd-enter'} value={Translations.control.run}/>
                </form>
            </div>
        );
    }
}