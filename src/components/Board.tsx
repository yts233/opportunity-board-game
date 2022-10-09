import './Board.css'
import "../lang/Translations";
import {Translations} from "../lang/Translations";
import GameBoard from "../models/GameBoard";
import {Component} from "react";
import Chessman from "../models/Chessman";

class BoardSlot extends Component<{ slots: (Chessman | undefined)[], slot: number, bold?: boolean, onInteract?: (slot: number) => void }> {
    render() {
        let className = this.props.bold ? "BoardSlot BoardSlot-bold" : "BoardSlot";
        let chessman = this.props.slots[this.props.slot];
        let name = chessman ? Translations.chessman[chessman.type] : '';
        if (chessman) {
            className += ' Chessman Chessman-' + chessman.owner;
            if (chessman.selected)
                className += ' Chessman-selected';
        } else className += ' BoardSlot-empty';
        return (
            <div className={className} onClick={() => {
                if (this.props.onInteract)
                    this.props.onInteract(this.props.slot);
                this.updateState();
            }}><span className={"BoardSlot-slot-id"}>{this.props.slot}</span>{name}</div>
        );
    }

    updateState() {
        this.setState({});
    }
}

function LineH() {
    return (
        <div className={"LineH-container"}>
            <div className={"LineHV LineH"}></div>
        </div>
    );
}

function LineV(props: { noL?: boolean, noR?: boolean }) {
    let l = props.noL ? null :
        <div className={"LineHV LineV LineV-L"}></div>;
    let r = props.noR ? null :
        <div className={"LineHV LineV LineV-R"}></div>;
    return (
        <div className={"LineV-container"}>
            {l}
            {r}
        </div>);
}

export default class Board extends Component<{ board: GameBoard, onInteract?: (slot: number) => void }, { slots: (Chessman | undefined)[] }> {
    constructor(props: { board: GameBoard, onInteract?: (slot: number) => void }) {
        super(props);
        this.state = {slots: props.board.slots};
        props.board.onUpdate = () => this.updateState();
    }

    render() {
        return (
            <div className={"Board"} ref={r => {
                if (r)
                    r.onselectstart = () => false;
                return r;
            }}>
                <div className={"Board-column"}>
                    <BoardSlot onInteract={this.props.onInteract} slots={this.state.slots} slot={27} bold/>
                    <LineH/>
                    <BoardSlot onInteract={this.props.onInteract} slots={this.state.slots} slot={28} bold/>
                    <LineH/>
                    <BoardSlot onInteract={this.props.onInteract} slots={this.state.slots} slot={29} bold/>
                    <LineH/>
                    <BoardSlot onInteract={this.props.onInteract} slots={this.state.slots} slot={30} bold/>
                </div>
                <div className={"Board-column"}>
                    <BoardSlot onInteract={this.props.onInteract} slots={this.state.slots} slot={22}/>
                    <LineV noL/>
                    <BoardSlot onInteract={this.props.onInteract} slots={this.state.slots} slot={23} bold/>
                    <LineH/>
                    <LineV/>
                    <BoardSlot onInteract={this.props.onInteract} slots={this.state.slots} slot={24} bold/>
                    <LineH/>
                    <LineV/>
                    <BoardSlot onInteract={this.props.onInteract} slots={this.state.slots} slot={25} bold/>
                    <LineV/>
                    <BoardSlot onInteract={this.props.onInteract} slots={this.state.slots} slot={26}/>
                    <LineV noR/>
                </div>
                <div className={"Board-column"}>
                    <BoardSlot onInteract={this.props.onInteract} slots={this.state.slots} slot={18}/>
                    <LineH/>
                    <LineV/>
                    <BoardSlot onInteract={this.props.onInteract} slots={this.state.slots} slot={19}/>
                    <LineH/>
                    <LineV/>
                    <BoardSlot onInteract={this.props.onInteract} slots={this.state.slots} slot={20}/>
                    <LineH/>
                    <LineV/>
                    <BoardSlot onInteract={this.props.onInteract} slots={this.state.slots} slot={21}/>
                    <LineV/>
                </div>
                <div className={"Board-column"}>
                    <BoardSlot onInteract={this.props.onInteract} slots={this.state.slots} slot={13}/>
                    <LineH/>
                    <LineV noL/>
                    <BoardSlot onInteract={this.props.onInteract} slots={this.state.slots} slot={14}/>
                    <LineH/>
                    <LineV noL/>
                    <BoardSlot onInteract={this.props.onInteract} slots={this.state.slots} slot={15}/>
                    <LineH/>
                    <LineV/>
                    <BoardSlot onInteract={this.props.onInteract} slots={this.state.slots} slot={16}/>
                    <LineH/>
                    <LineV noR/>
                    <BoardSlot onInteract={this.props.onInteract} slots={this.state.slots} slot={17}/>
                    <LineV noR/>
                </div>
                <div className={"Board-column"}>
                    <BoardSlot onInteract={this.props.onInteract} slots={this.state.slots} slot={9}/>
                    <LineH/>
                    <LineV noR/>
                    <BoardSlot onInteract={this.props.onInteract} slots={this.state.slots} slot={10}/>
                    <LineH/>
                    <LineV/>
                    <BoardSlot onInteract={this.props.onInteract} slots={this.state.slots} slot={11}/>
                    <LineH/>
                    <LineV/>
                    <BoardSlot onInteract={this.props.onInteract} slots={this.state.slots} slot={12}/>
                    <LineV noL/>
                </div>
                <div className={"Board-column"}>
                    <BoardSlot onInteract={this.props.onInteract} slots={this.state.slots} slot={4}/>
                    <LineV noL/>
                    <BoardSlot onInteract={this.props.onInteract} slots={this.state.slots} slot={5} bold/>
                    <LineH/>
                    <LineV/>
                    <BoardSlot onInteract={this.props.onInteract} slots={this.state.slots} slot={6} bold/>
                    <LineH/>
                    <LineV/>
                    <BoardSlot onInteract={this.props.onInteract} slots={this.state.slots} slot={7} bold/>
                    <LineV/>
                    <BoardSlot onInteract={this.props.onInteract} slots={this.state.slots} slot={8}/>
                    <LineV noR/>
                </div>
                <div className={"Board-column"}>
                    <BoardSlot onInteract={this.props.onInteract} slots={this.state.slots} slot={0} bold/>
                    <LineH/>
                    <LineV/>
                    <BoardSlot onInteract={this.props.onInteract} slots={this.state.slots} slot={1} bold/>
                    <LineH/>
                    <LineV/>
                    <BoardSlot onInteract={this.props.onInteract} slots={this.state.slots} slot={2} bold/>
                    <LineH/>
                    <LineV/>
                    <BoardSlot onInteract={this.props.onInteract} slots={this.state.slots} slot={3} bold/>
                    <LineV/>
                </div>
            </div>
        );
    }

    updateState() {
        this.setState({slots: this.props.board.slots});
    }
}