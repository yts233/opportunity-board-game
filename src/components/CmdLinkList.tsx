import {Component} from "react";
import CmdLink from "./CmdLink";

export class CmdLinkList extends Component<{ links: { cmd: string, text?: string }[] }, { flag: boolean }> {
    constructor(props: { links: { cmd: string, text?: string }[] }) {
        super(props);
        this.state = {flag: true};
    }

    updateState(flag: boolean) {
        this.setState({flag: flag});
    }

    render() {
        return <>{this.props.links.map((p, i) => <CmdLink key={i} parent={this}
                                                          cmd={p.cmd}
                                                          canRepeat={this.state.flag}>{p.text ?? p.cmd}</CmdLink>)}</>;
    }
}