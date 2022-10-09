import {ReactElement} from "react";

export default class GameConsole {
    private _logs: ReactElement[] = [];
    private _onLog: ((element: ReactElement | null) => void)[] = [];
    onLog: (element: ReactElement | null) => void = () => {
    }

    listenOnLog(callback: (element: ReactElement | null) => void) {
        this._onLog.push(callback);
        return () => this.unListenOnLog(callback);
    }

    unListenOnLog(callback: (element: ReactElement | null) => void) {
        let index = this._onLog.indexOf(callback);
        if (index !== -1)
            this._onLog.splice(index, 1);
    }

    onSendCmd: (cmd: string) => void = cmd => {
        console.log(cmd);
    };

    get logs() {
        return Array.from(this._logs);
    }

    log(log: ReactElement, suppressEvent = false) {
        this._logs.push(<><span className={'timestamp'}>{new Date().toLocaleTimeString()}</span>{log}</>);
        if (!suppressEvent) {
            let onLog = Array.from(this._onLog);
            onLog.forEach(p => p(log));
        }
        this.onLog(log);
    }

    logErr(log: ReactElement, suppressEvent = false) {
        this._logs.push(<><span className={'timestamp'}>{new Date().toLocaleTimeString()}</span><span
            style={{color: '#f22'}}>{log}</span></>);
        if (!suppressEvent) {
            let onLog = Array.from(this._onLog);
            onLog.forEach(p => p(log));
        }
        this.onLog(log);
    }

    clearLogs() {
        this._logs = [];
        this._onLog.forEach(p => p(null));
    }

    sendCmd(cmd: string) {
        try {
            if (cmd.startsWith('@'))
                this.onSendCmd(cmd.substring(1));
            else
                this.onSendCmd('#' + cmd.substring);
        } catch (ex) {
            this.logErr(<>{(ex as Error).message}</>);
            console.log(ex);
        }
    }

}
