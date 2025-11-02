
export type MoveDirection = 'L' | 'R' | 'N';

export interface TMTransition {
    currentState: string;
    readSymbol: string;
    nextState: string;
    writeSymbol: string;
    move: MoveDirection;
}

export interface TMDefinition {
    states: string[];
    alphabet: string[];
    blankSymbol: string;
    initialState: string;
    acceptState: string;
    transitions: TMTransition[];
}

export type TMStatus = 'idle' | 'running' | 'paused' | 'halted-accept' | 'error';

export interface TMState {
    tape: string[];
    head: number;
    currentState: string;
    steps: number;
    status: TMStatus;
}

export interface Preset {
    name: string;
    description: string;
    tapeInput: string;
    definition: TMDefinition;
}
