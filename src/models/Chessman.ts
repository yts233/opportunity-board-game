import GameBoard from "./GameBoard";

export type ChessmanType = 'king' | 'wizard' | 'knight' | 'infantry' | 'spearman' | 'arsonist' | 'civilian';
export type ChessmanOwner = 'us' | 'enemy';

const countTable = {
    'king': 1,
    'wizard': 1,
    'knight': 2,
    'infantry': 2,
    'spearman': 2,
    'arsonist': 2,
    'civilian': 4
}

export function chessmanTypeToId(type: ChessmanType) {
    return {
        'king': 0,
        'wizard': 1,
        'knight': 2,
        'infantry': 3,
        'spearman': 4,
        'arsonist': 5,
        'civilian': 6
    }[type];
}

/**
 * 克制表
 */
const eatTable = {
    'king': ['knight', 'infantry', 'spearman', 'wizard'],
    'wizard': ['civilian'],
    'knight': ['civilian', 'infantry', 'wizard'],
    'infantry': ['civilian', 'spearman', 'wizard'],
    'spearman': ['civilian', 'knight', 'wizard'],
    'arsonist': [] as string[],
    'civilian': ['king']
};

/**
 * 同归于尽表
 */
const perishTable = {
    'king': ['king'],
    'wizard': ['wizard', 'arsonist'],
    'knight': ['knight', 'arsonist'],
    'infantry': ['infantry', 'arsonist'],
    'spearman': ['spearman', 'arsonist'],
    'arsonist': ['king', 'wizard', 'knight', 'infantry', 'spearman', 'arsonist', 'civilian'],
    'civilian': ['civilian', 'arsonist']
}

/**
 * 棋子
 */
export default class Chessman {
    flag: boolean = true;

    get selected(): boolean {
        return this._selected;
    }

    set selected(value: boolean) {
        this._selected = value;
        if (this.board)
            this.board.onUpdate(this.slot, this);
    }

    type: ChessmanType;
    owner: ChessmanOwner;
    slot: number;
    private _selected = false;
    board?: GameBoard;

    constructor(type: ChessmanType, owner: ChessmanOwner, slot: number = -1) {
        this.type = type;
        this.owner = owner;
        this.slot = slot;
    }

    canEat(other: Chessman): boolean {
        return other.owner !== this.owner && eatTable[this.type].indexOf(other.type) !== -1;
    }

    canPerish(other: Chessman): boolean {
        return other.owner !== this.owner && perishTable[this.type].indexOf(other.type) !== -1;
    }

    static getStartupPool(owner: ChessmanOwner) {
        let pool = [];
        for (const type in countTable) {
            // @ts-ignore
            let value = countTable[type] as number;
            while (value--)
                pool.push(new Chessman(type as ChessmanType, owner));
        }
        return pool;
    }
}
