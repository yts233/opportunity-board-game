import './App.css'
import Board from "./components/Board";
import ControlPanel from './components/ControlPanel';
import GameSession from "./models/GameSession";

export default function App() {
    return (
        <div className={"App-container"}>
            <Board board={GameSession.current.board} onInteract={p => GameSession.current.board.interact(p)}/>
            <ControlPanel/>
        </div>
    );
}
