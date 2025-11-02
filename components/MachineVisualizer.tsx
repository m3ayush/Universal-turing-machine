import React, { useRef, useEffect, useMemo } from 'react';
import { TMState } from '../types';
import { PlayIcon, PauseIcon, StepIcon, ResetIcon } from './icons';

interface MachineVisualizerProps {
    machineState: TMState;
    onStep: () => void;
    onRun: () => void;
    onPause: () => void;
    onReset: () => void;
    speed: number;
    setSpeed: (speed: number) => void;
    error: string | null;
    tapeInput: string;
    blankSymbol: string;
}

export const MachineVisualizer: React.FC<MachineVisualizerProps> = ({
    machineState, onStep, onRun, onPause, onReset, speed, setSpeed, error, tapeInput, blankSymbol
}) => {
    const { status, steps, currentState, head } = machineState;
    const isRunning = status === 'running';
    const isHalted = status === 'halted-accept' || status === 'error';

    const output = useMemo(() => {
        const tape = machineState.tape;
        if (!tape || tape.length === 0) return '';

        const firstCharIndex = tape.findIndex(char => char !== blankSymbol);
        if (firstCharIndex === -1) return ''; // All blanks

        let lastCharIndex = -1;
        for (let i = tape.length - 1; i >= 0; i--) {
            if (tape[i] !== blankSymbol) {
                lastCharIndex = i;
                break;
            }
        }
    
        return tape.slice(firstCharIndex, lastCharIndex + 1).join('');
    }, [machineState.tape, blankSymbol]);
    
    return (
        <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl shadow-2xl flex flex-col space-y-4 border border-slate-700/50">
            
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50 font-mono text-center">
                <p className="text-lg"><span className="text-slate-400">Input:</span> <span className="text-white font-bold">{tapeInput}</span> &rarr; <span className="text-slate-400">Output:</span> <span className="text-white font-bold">{output}</span></p>
            </div>

            <div className="flex-grow flex flex-col justify-center items-center space-y-4 bg-slate-900/50 p-6 rounded-xl border border-slate-700/50">
                <TapeVisualizer tape={machineState.tape} head={machineState.head} />
            </div>

            <div className="grid grid-cols-3 gap-4">
                <InfoCard label="Current State" value={currentState || 'N/A'} status={status} />
                <InfoCard label="Head Position" value={head.toString()} />
                <InfoCard label="Step Count" value={steps.toString()} />
            </div>

            {error && <div className="text-center text-red-400 bg-red-900/50 p-3 rounded-lg border border-red-500/50">{error}</div>}

            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                <div className="flex items-center justify-center space-x-4">
                     <ControlButton onClick={onReset} disabled={isRunning} title="Reset">
                        <ResetIcon className="w-5 h-5" /> Previous
                    </ControlButton>

                     <ControlButton onClick={onStep} disabled={isRunning || isHalted} title="Step Forward">
                        Next Step <StepIcon className="w-5 h-5" />
                    </ControlButton>
                </div>
                 <div className="mt-4 flex items-center justify-center space-x-4">
                    {isRunning ? (
                        <button onClick={onPause} title="Pause" className="bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-bold py-2 px-6 rounded-lg flex items-center transition-colors shadow-lg hover:shadow-yellow-500/50">
                            <PauseIcon className="w-6 h-6" />
                        </button>
                    ) : (
                        <button onClick={onRun} disabled={isHalted} title="Run" className="bg-green-500 hover:bg-green-400 text-slate-900 font-bold py-2 px-6 rounded-lg flex items-center transition-colors shadow-lg hover:shadow-green-500/50">
                            <PlayIcon className="w-6 h-6" />
                        </button>
                    )}
                    <input
                        type="range"
                        min="0"
                        max="950"
                        value={speed}
                        onChange={(e) => setSpeed(Number(e.target.value))}
                        className="w-full max-w-xs h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                        disabled={isRunning}
                    />
                </div>
            </div>
        </div>
    );
};

const InfoCard: React.FC<{label: string, value: string, status?: TMState['status']}> = ({ label, value, status }) => {
    const getStatusColor = () => {
        switch (status) {
            case 'running': return 'text-blue-400';
            case 'paused': return 'text-yellow-400';
            case 'halted-accept': return 'text-green-400';
            case 'error': return 'text-red-400';
            default: return 'text-white';
        }
    }
    
    return (
        <div className="bg-slate-900/50 p-4 rounded-xl text-center border border-slate-700/50">
            <p className="text-sm text-slate-400 uppercase tracking-wider">{label}</p>
            <p className={`text-3xl font-bold font-mono ${status ? getStatusColor() : 'text-white'}`}>{value}</p>
        </div>
    );
};

const ControlButton: React.FC<{ onClick: () => void; disabled?: boolean; title: string; children: React.ReactNode; className?: string }> = 
({ onClick, disabled, title, children }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        title={title}
        className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:bg-slate-600/50 disabled:text-slate-400 disabled:cursor-not-allowed"
    >
        {children}
    </button>
);


const TapeVisualizer: React.FC<{tape: string[], head: number}> = ({ tape, head }) => {
    const headRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (headRef.current && containerRef.current) {
            const containerWidth = containerRef.current.offsetWidth;
            const headLeft = headRef.current.offsetLeft;
            const headWidth = headRef.current.offsetWidth;
            containerRef.current.scrollTo({
                left: headLeft - containerWidth / 2 + headWidth / 2,
                behavior: 'smooth',
            });
        }
    }, [head]);

    return (
        <div className="w-full relative py-4">
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[12px] border-t-amber-400"></div>
            <div ref={containerRef} className="w-full overflow-x-auto pb-2 flex justify-start no-scrollbar">
                <div className="flex items-center space-x-1.5 px-[50%]">
                    {tape.map((symbol, index) => (
                        <div
                            key={index}
                            ref={index === head ? headRef : null}
                            className={`w-14 h-14 flex items-center justify-center text-3xl font-bold font-mono border-2 rounded-lg transition-all duration-300 ${
                                index === head ? 'bg-amber-400 border-amber-300 text-slate-900 scale-110 shadow-lg shadow-amber-400/30' : 'bg-slate-700 border-slate-600'
                            }`}
                        >
                            {symbol}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};