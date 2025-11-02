
import { useState, useCallback, useRef, useEffect } from 'react';
import { TMDefinition, TMState, TMStatus, TMTransition } from '../types';

const TAPE_SIZE_BUFFER = 50;

export const useTuringMachine = () => {
    const [machineState, setMachineState] = useState<TMState>({
        tape: [],
        head: 0,
        currentState: '',
        steps: 0,
        status: 'idle',
    });

    const transitionsRef = useRef<Map<string, TMTransition>>(new Map());
    const definitionRef = useRef<TMDefinition | null>(null);
    const intervalRef = useRef<number | null>(null);

    // Effect to clear interval if machine halts for any reason
    useEffect(() => {
        if (machineState.status !== 'running' && intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, [machineState.status]);


    const initialize = useCallback((definition: TMDefinition, input: string) => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = null;

        // Validation
        if (!definition.initialState || !definition.states.includes(definition.initialState)) {
            throw new Error("Initial state is not defined or not in the set of states.");
        }
        if (!definition.acceptState || !definition.states.includes(definition.acceptState)) {
            throw new Error("Accept state is not defined or not in the set of states.");
        }

        const transitionMap = new Map<string, TMTransition>();
        for (const t of definition.transitions) {
            transitionMap.set(`${t.currentState},${t.readSymbol}`, t);
        }
        transitionsRef.current = transitionMap;
        definitionRef.current = definition;

        const tapeArray = (input || '').split('');
        const initialTape = [
            ...Array(TAPE_SIZE_BUFFER).fill(definition.blankSymbol),
            ...tapeArray,
            ...Array(TAPE_SIZE_BUFFER).fill(definition.blankSymbol),
        ];
        
        setMachineState({
            tape: initialTape,
            head: TAPE_SIZE_BUFFER,
            currentState: definition.initialState,
            steps: 0,
            status: 'idle',
        });
    }, []);

    const step = useCallback(() => {
        setMachineState(prevState => {
            const { head, tape, currentState, steps, status } = prevState;

            if (status !== 'idle' && status !== 'paused' && status !== 'running') return prevState;
            if (!definitionRef.current) return prevState;

            if (currentState === definitionRef.current.acceptState) {
                return { ...prevState, status: 'halted-accept' };
            }

            const readSymbol = tape[head] || definitionRef.current.blankSymbol;
            const transitionKey = `${currentState},${readSymbol}`;
            const rule = transitionsRef.current.get(transitionKey);

            if (!rule) {
                return { ...prevState, status: 'error' };
            }

            const newTape = [...tape];
            newTape[head] = rule.writeSymbol;

            let newHead = head;
            if (rule.move === 'R') newHead++;
            if (rule.move === 'L') newHead--;
            
            // Extend tape if head goes out of bounds
            if (newHead < 0) {
                newTape.unshift(definitionRef.current.blankSymbol);
                newHead = 0;
            } else if (newHead >= newTape.length) {
                newTape.push(definitionRef.current.blankSymbol);
            }

            const nextState = rule.nextState;
            const newStatus = nextState === definitionRef.current?.acceptState ? 'halted-accept' : prevState.status;

            return {
                tape: newTape,
                head: newHead,
                currentState: nextState,
                steps: steps + 1,
                status: newStatus === 'halted-accept' ? newStatus : (prevState.status === 'idle' ? 'paused' : prevState.status),
            };
        });
    }, []);

    const run = (interval: number) => {
        if (intervalRef.current) clearInterval(intervalRef.current);

        setMachineState(prev => {
            if (prev.status === 'halted-accept' || prev.status === 'error') {
                 if (intervalRef.current) clearInterval(intervalRef.current);
                 return prev;
            }
            return {...prev, status: 'running'};
        });

        intervalRef.current = window.setInterval(step, interval);
    };

    const pause = useCallback(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = null;
        setMachineState(prev => prev.status === 'running' ? { ...prev, status: 'paused' } : prev);
    }, []);

    const reset = useCallback(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (definitionRef.current) {
            initialize(definitionRef.current, '');
        }
    }, [initialize]);

    return { machineState, initialize, step, reset, run, pause };
};
