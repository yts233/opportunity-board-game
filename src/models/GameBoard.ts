import Chessman from "./Chessman";

export type ChessmanMoveType = 'move' | 'eat' | 'perish' | 'swap' | false;

const moveTable = [
    [1, 4, 5],
    [-1, 1, 4, 5],
    [-1, 1, 4, 5],
    [-1, 4, 5],
    [-4, 5],
    [-5, -4, 1, 4, 5],
    [-5, -4, -1, 1, 4, 5],
    [-5, -4, -1, 4, 5],
    [-5, 4],
    [-5, -4, 1, 4],
    [-5, -4, -1, 1, 4, 5],
    [-5, -4, -1, 1, 4, 5],
    [-5, -4, -1, 5],
    [-4, 1, 5],
    [-4, -1, 1, 5],
    [-5, -4, -1, 1, 4, 5],
    [-5, -1, 1, 4],
    [-5, -1, 4],
    [-5, 1, 4, 5],
    [-5, -4, -1, 1, 4, 5],
    [-5, -4, -1, 1, 4, 5],
    [-4, -1, 4, 5],
    [-4, 5],
    [-5, -4, 1, 4, 5],
    [-5, -4, -1, 1, 4, 5],
    [-5, -4, -1, 4, 5],
    [-5, 4],
    [-5, -4, 1],
    [-5, -4, -1, 1],
    [-5, -4, -1, 1],
    [-5, -4, -1]
]

export default class GameBoard {
    private readonly _slots: (Chessman | undefined)[];

    constructor(slots: (Chessman | undefined)[] = []) {
        this._slots = Array.from(slots);
    }

    onUpdate = (oldSlot: number, chessman?: Chessman) => {
    };

    get snapshot() {
        return new GameBoard(this._slots);
    }

    get slots() {
        return Array.from(this._slots);
    }

    get chessmen() {
        return this._slots.filter(p => p);
    }

    get usChessmen(): Chessman[] {
        return this._slots.filter(p => p && p.owner === 'us') as Chessman[];
    }

    get enemyChessmen(): Chessman[] {
        return this._slots.filter(p => p && p.owner === 'enemy') as Chessman[];
    }

    getChessman(slot: number) {
        if (isNaN(slot) || slot < 0 || slot > 30)
            throw new Error('invalid slot');
        return this._slots[slot];
    }

    requireChessman(slot: number) {
        let chessman = this.getChessman(slot);
        if (!chessman)
            throw new Error('no chessman');
        return chessman;
    }

    setChessman(slot: number, chessman?: Chessman) {
        if (isNaN(slot) || slot < 0 || slot > 30)
            throw new Error('invalid slot');
        if (!chessman) {
            this._slots[slot] = undefined;
            this.onUpdate(slot, undefined);
            return;
        }
        let oldSlot = -1;
        if (chessman.slot >= 0 && this._slots[chessman.slot] === chessman) {
            this._slots[chessman.slot] = undefined!;
            oldSlot = chessman.slot;
        }
        this._slots[slot] = chessman;
        chessman.slot = slot;
        this.onUpdate(oldSlot, chessman);
    }

    moveChessman(slot: number, chessman: Chessman) {
        if (isNaN(slot) || slot < 0 || slot > 30)
            throw new Error('invalid slot');
        if (!this._slots[chessman.slot] || this._slots[chessman.slot] !== chessman)
            throw new Error('chess not found');
        this.setChessman(slot, chessman);
    }

    swapChessman(slot1: number, slot2: number) {
        if (slot1 === slot2 || isNaN(slot1) || slot1 < 0 || slot1 > 30 || isNaN(slot2) || slot2 < 0 || slot2 > 30)
            throw new Error('invalid slot');
        let chessman1 = this._slots[slot1];
        let chessman2 = this._slots[slot2];
        if (!chessman1 || !chessman2)
            throw new Error('no chessman');
        this.setChessman(slot2, chessman1);
        this.setChessman(slot1, chessman2);
    }

    static getSlots(firstHand: boolean) {
        return firstHand ? [0, 1, 2, 3, 5, 6, 7] : [23, 24, 25, 27, 28, 29, 30];
    }

    private _onInteract: ((slot: number, chessman?: Chessman) => void)[] = [];
    private _rejectInteract: (() => void)[] = [];

    interact(slot: number) {
        let chessman = this._slots[slot];
        let a = this._onInteract;
        this._onInteract = [];
        a.forEach(e => e(slot, chessman));
    }

    requestInteract(callback?: (slot: number, chessman?: Chessman) => void, rejectCallback?: () => void) {
        let a: () => void | undefined;
        if (rejectCallback)
            a = this._rejectInteract[this._rejectInteract.push(rejectCallback)];
        if (callback)
            this._onInteract.push((slot, chessman) => {
                if (a)
                    this._rejectInteract.splice(this._rejectInteract.indexOf(a), 1);
                callback(slot, chessman);
            });
    }

    waitInteract() {
        return new Promise<{ slot: number, chessman?: Chessman }>((resolve, reject) => {
            let a = this._rejectInteract[this._rejectInteract.push(() => {
                reject();
            })];
            this._onInteract.push((slot, chessman) => {
                resolve({slot: slot, chessman: chessman});
                this._rejectInteract.splice(this._onInteract.indexOf(a), 1);
            });
        });
    }

    rejectAllInteracts() {
        this._onInteract = [];
        let a = this._rejectInteract;
        this._rejectInteract = [];
        a.forEach(p => p());
    }

    getMoveSlots(slotA: number): { slot: number, type: ChessmanMoveType }[] {
        function getMoveType(chessmanA: Chessman, chessmanB?: Chessman): ChessmanMoveType {
            if (!chessmanB)
                return 'move';
            if (chessmanA.canEat(chessmanB))
                return 'eat';
            if (chessmanA.canPerish(chessmanB))
                return 'perish';
            return false;
        }

        let moveTable = GameBoard.getMoveToSlots(slotA);

        let chessmanA = this.getChessman(slotA);
        if (!chessmanA)
            return [];
        let res: { slot: number, type: ChessmanMoveType }[] = [];
        for (const slotB of moveTable) {
            let chessmanB = this.getChessman(slotB);
            if (!chessmanB || chessmanA.owner !== chessmanB?.owner) {
                let type = getMoveType(chessmanA, chessmanB);
                if (type)
                    res.push({slot: slotB, type: type});
            }
        }
        if (chessmanA.type === 'wizard' && chessmanA.flag)
            (chessmanA.owner === 'enemy' ? this.enemyChessmen : this.usChessmen).forEach(p => {
                if (p !== chessmanA)
                    res.push({slot: p.slot, type: 'swap'});
            })
        return res;
    }

    static getMoveToSlots(slot: number) {
        if (isNaN(slot) || slot < 0 || slot > 30)
            throw new Error('invalid slot');
        return moveTable[slot].map(p => slot + p);
    }
}