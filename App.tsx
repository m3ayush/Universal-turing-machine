import React, { useState, useCallback, useEffect } from 'react';
import { TMDefinition, Preset } from './types';
import { useTuringMachine } from './hooks/useTuringMachine';
import { ControlPanel } from './components/ControlPanel';
import { MachineVisualizer } from './components/MachineVisualizer';

// Preset for a Turing machine that increments a binary number
const PRESET_BINARY_INCREMENT: TMDefinition = {
    states: ['q_right', 'q_flip', 'q_halt'],
    alphabet: ['0', '1', '_'],
    blankSymbol: '_',
    initialState: 'q_right',
    acceptState: 'q_halt',
    transitions: [
        { currentState: 'q_right', readSymbol: '0', nextState: 'q_right', writeSymbol: '0', move: 'R' },
        { currentState: 'q_right', readSymbol: '1', nextState: 'q_right', writeSymbol: '1', move: 'R' },
        { currentState: 'q_right', readSymbol: '_', nextState: 'q_flip', writeSymbol: '_', move: 'L' },
        { currentState: 'q_flip', readSymbol: '1', nextState: 'q_flip', writeSymbol: '0', move: 'L' },
        { currentState: 'q_flip', readSymbol: '0', nextState: 'q_halt', writeSymbol: '1', move: 'N' },
        { currentState: 'q_flip', readSymbol: '_', nextState: 'q_halt', writeSymbol: '1', move: 'N' },
    ],
};

// Preset for Binary Subtraction (a-b)
const PRESET_BINARY_SUBTRACTION: TMDefinition = {
    states: [
        'scan_right', 'check_b', 'cleanup', 'return_to_b',
        'decrement_b', 'flip_b_zeros', 'find_separator_for_a',
        'return_to_a', 'decrement_a', 'flip_a_zeros', 'rewind', 'halt'
    ],
    alphabet: ['0', '1', '_'],
    blankSymbol: '_',
    initialState: 'scan_right',
    acceptState: 'halt',
    transitions: [
        // 1. Go to the far right to begin the process
        { currentState: 'scan_right', readSymbol: '0', nextState: 'scan_right', writeSymbol: '0', move: 'R' },
        { currentState: 'scan_right', readSymbol: '1', nextState: 'scan_right', writeSymbol: '1', move: 'R' },
        { currentState: 'scan_right', readSymbol: '_', nextState: 'check_b', writeSymbol: '_', move: 'L' },

        // 2. Check if b is all zeros by scanning left
        { currentState: 'check_b', readSymbol: '0', nextState: 'check_b', writeSymbol: '0', move: 'L' },
        { currentState: 'check_b', readSymbol: '1', nextState: 'return_to_b', writeSymbol: '1', move: 'R' }, // Found a 1, b is not zero. Go back to start decrementing b.
        { currentState: 'check_b', readSymbol: '_', nextState: 'cleanup', writeSymbol: '_', move: 'R' }, // Reached separator, b is 0. Go to cleanup.

        // 3. Cleanup: b is 0. Erase the separator and remnants of b.
        { currentState: 'cleanup', readSymbol: '0', nextState: 'cleanup', writeSymbol: '_', move: 'R' },
        { currentState: 'cleanup', readSymbol: '1', nextState: 'cleanup', writeSymbol: '_', move: 'R' },
        { currentState: 'cleanup', readSymbol: '_', nextState: 'halt', writeSymbol: '_', move: 'N' },

        // 4. Return to the right of b to start decrementing it
        { currentState: 'return_to_b', readSymbol: '0', nextState: 'return_to_b', writeSymbol: '0', move: 'R' },
        { currentState: 'return_to_b', readSymbol: '1', nextState: 'return_to_b', writeSymbol: '1', move: 'R' },
        { currentState: 'return_to_b', readSymbol: '_', nextState: 'decrement_b', writeSymbol: '_', move: 'L' },

        // 5. Decrement b: find the rightmost 1, flip it, and flip subsequent 0s.
        { currentState: 'decrement_b', readSymbol: '1', nextState: 'find_separator_for_a', writeSymbol: '0', move: 'L' }, // Found 1, flip to 0, proceed to decrement a.
        { currentState: 'decrement_b', readSymbol: '0', nextState: 'flip_b_zeros', writeSymbol: '1', move: 'L' },       // Found 0, flip to 1, must now find a 1.
        
        { currentState: 'flip_b_zeros', readSymbol: '0', nextState: 'flip_b_zeros', writeSymbol: '1', move: 'L' },
        { currentState: 'flip_b_zeros', readSymbol: '1', nextState: 'find_separator_for_a', writeSymbol: '0', move: 'L' },

        // 6. b is decremented. Move left until we pass the separator to find a.
        { currentState: 'find_separator_for_a', readSymbol: '0', nextState: 'find_separator_for_a', writeSymbol: '0', move: 'L' },
        { currentState: 'find_separator_for_a', readSymbol: '1', nextState: 'find_separator_for_a', writeSymbol: '1', move: 'L' },
        { currentState: 'find_separator_for_a', readSymbol: '_', nextState: 'return_to_a', writeSymbol: '_', move: 'L' },
        
        // 7. Move to the separator between a and b to start decrementing a
        { currentState: 'return_to_a', readSymbol: '0', nextState: 'return_to_a', writeSymbol: '0', move: 'L' },
        { currentState: 'return_to_a', readSymbol: '1', nextState: 'return_to_a', writeSymbol: '1', move: 'L' },
        { currentState: 'return_to_a', readSymbol: '_', nextState: 'decrement_a', writeSymbol: '_', move: 'L' },

        // 8. Decrement a: same logic as decrementing b.
        { currentState: 'decrement_a', readSymbol: '1', nextState: 'rewind', writeSymbol: '0', move: 'L' }, // Found 1, flip to 0, rewind to restart loop.
        { currentState: 'decrement_a', readSymbol: '0', nextState: 'flip_a_zeros', writeSymbol: '1', move: 'L' },// Found 0, flip to 1.
        { currentState: 'decrement_a', readSymbol: '_', nextState: 'rewind', writeSymbol: '_', move: 'R' }, // Edge case for a=1 -> 0

        { currentState: 'flip_a_zeros', readSymbol: '0', nextState: 'flip_a_zeros', writeSymbol: '1', move: 'L' },
        { currentState: 'flip_a_zeros', readSymbol: '1', nextState: 'rewind', writeSymbol: '0', move: 'L' },
        { currentState: 'flip_a_zeros', readSymbol: '_', nextState: 'rewind', writeSymbol: '_', move: 'R' }, // Edge case for a=100 -> 011

        // 9. Rewind: a is decremented. Go to far right to start the loop over.
        { currentState: 'rewind', readSymbol: '0', nextState: 'rewind', writeSymbol: '0', move: 'R' },
        { currentState: 'rewind', readSymbol: '1', nextState: 'rewind', writeSymbol: '1', move: 'R' },
        { currentState: 'rewind', readSymbol: '_', nextState: 'scan_right', writeSymbol: '_', move: 'R' },
    ],
};

// Preset for Unary Addition (a+b)
const PRESET_UNARY_ADDITION: TMDefinition = {
    states: ['q_move_right', 'q_go_end', 'q_erase_one', 'q_halt'],
    alphabet: ['1', '_'],
    blankSymbol: '_',
    initialState: 'q_move_right',
    acceptState: 'q_halt',
    transitions: [
        { currentState: 'q_move_right', readSymbol: '1', nextState: 'q_move_right', writeSymbol: '1', move: 'R' },
        { currentState: 'q_move_right', readSymbol: '_', nextState: 'q_go_end', writeSymbol: '1', move: 'R' },
        { currentState: 'q_go_end', readSymbol: '1', nextState: 'q_go_end', writeSymbol: '1', move: 'R' },
        { currentState: 'q_go_end', readSymbol: '_', nextState: 'q_erase_one', writeSymbol: '_', move: 'L' },
        { currentState: 'q_erase_one', readSymbol: '1', nextState: 'q_halt', writeSymbol: '_', move: 'N' },
    ],
};

// Preset for 3-State Busy Beaver
const PRESET_BUSY_BEAVER: TMDefinition = {
    states: ['a', 'b', 'c', 'halt'],
    alphabet: ['_', '1'],
    blankSymbol: '_',
    initialState: 'a',
    acceptState: 'halt',
    transitions: [
        { currentState: 'a', readSymbol: '_', nextState: 'b', writeSymbol: '1', move: 'R' },
        { currentState: 'a', readSymbol: '1', nextState: 'c', writeSymbol: '1', move: 'L' },
        { currentState: 'b', readSymbol: '_', nextState: 'a', writeSymbol: '1', move: 'L' },
        { currentState: 'b', readSymbol: '1', nextState: 'b', writeSymbol: '1', move: 'R' },
        { currentState: 'c', readSymbol: '_', nextState: 'b', writeSymbol: '1', move: 'L' },
        { currentState: 'c', readSymbol: '1', nextState: 'halt', writeSymbol: '1', move: 'N' },
    ],
};

const presets: Preset[] = [
    {
        name: 'Binary Increment',
        description: 'Adds one to a binary number. E.g., `1011` becomes `1100`.',
        tapeInput: '1011',
        definition: PRESET_BINARY_INCREMENT,
    },
    {
        name: 'Binary Subtraction',
        description: 'Subtracts second binary number from the first. E.g., `1101_101` (13-5) becomes `1000` (8).',
        tapeInput: '1101_101',
        definition: PRESET_BINARY_SUBTRACTION,
    },
    {
        name: 'Unary Addition',
        description: 'Adds two unary numbers separated by a blank. E.g., `111_11` becomes `11111`.',
        tapeInput: '111_11',
        definition: PRESET_UNARY_ADDITION,
    },
    
];


const App: React.FC = () => {
    const [tmDefinition, setTmDefinition] = useState<TMDefinition>(presets[0].definition);
    const [tapeInput, setTapeInput] = useState<string>(presets[0].tapeInput);
    const [speed, setSpeed] = useState<number>(500);
    const [error, setError] = useState<string | null>(null);
    const [activePresetName, setActivePresetName] = useState<string>(presets[0].name);

    const { machineState, initialize, step, run, pause } = useTuringMachine();

    const runInitialization = useCallback(() => {
        try {
            setError(null);
            initialize(tmDefinition, tapeInput);
        } catch (e) {
            if (e instanceof Error) {
                setError(e.message);
            } else {
                setError("An unknown error occurred during initialization.");
            }
        }
    }, [initialize, tmDefinition, tapeInput]);
    
    useEffect(() => {
        runInitialization();
    }, [runInitialization]);

    const handleSelectPreset = (preset: Preset) => {
        pause();
        setTmDefinition(preset.definition);
        setTapeInput(preset.tapeInput);
        setActivePresetName(preset.name);
    };

    const handleRun = () => {
        const interval = Math.max(50, 1000 - speed);
        run(interval);
    };
    
    return (
        <div className="min-h-screen bg-gradient-to-br from-[#4F46E5] to-[#1E293B] text-gray-200 flex flex-col p-4 md:p-8 font-sans">
            <header className="text-center mb-6">
                <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight flex items-center justify-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-amber-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                    Interactive Simulation
                </h1>
                <p className="text-indigo-200 mt-2 text-lg">A Modern Universal Turing Machine Simulator</p>
            </header>
            
            <main className="flex-grow grid grid-cols-1 xl:grid-cols-2 gap-8">
                <MachineVisualizer
                    machineState={machineState}
                    onStep={step}
                    onRun={handleRun}
                    onPause={pause}
                    onReset={runInitialization}
                    speed={speed}
                    setSpeed={setSpeed}
                    error={error}
                    tapeInput={tapeInput}
                    blankSymbol={tmDefinition.blankSymbol}
                />
                <ControlPanel
                    definition={tmDefinition}
                    // FIX: Pass the correct state setter function 'setTmDefinition'.
                    setDefinition={setTmDefinition}
                    tapeInput={tapeInput}
                    setTapeInput={setTapeInput}
                    onInitialize={runInitialization}
                    presets={presets}
                    onSelectPreset={handleSelectPreset}
                    activePresetName={activePresetName}
                />
            </main>
        </div>
    );
};

export default App;
