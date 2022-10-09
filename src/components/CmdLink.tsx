import {Component, ReactNode} from "react";
import GameSession from "../models/GameSession";
import {CmdLinkList} from "./CmdLinkList";

export default class CmdLink extends Component<{ cmd: string, parent?: CmdLinkList, children?: ReactNode, canRepeat?: boolean, canCrossCmd?: boolean }, { flag: boolean }> {
    constructor(props: { cmd: string, parent?: CmdLinkList, children?: ReactNode, canRepeat?: boolean, canNotCrossLog?: boolean }) {
        super(props);
        this.state = {flag: props.canRepeat ?? false};
    }

    componentDidMount() {
        let d = GameSession.current.console.listenOnLog(p => {
            if (!this.props.canCrossCmd) {
                this.updateState(false);
            }
            d();
        });
    }

    render() {
        return (
            <button
                onClick={() => {
                    if (this.state.flag) {
                        GameSession.current.console.sendCmd(this.props.cmd)
                        this.setState({flag: false});
                        if (this.props.parent)
                            this.props.parent.updateState(false);
                    }
                }}
                disabled={!this.props.canRepeat || !this.state.flag}>{this.props.children ?? this.props.cmd}</button>
        );
    }

    private updateState(flag: boolean) {
        this.setState({flag: flag})
    }
}

