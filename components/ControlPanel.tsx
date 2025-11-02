
import React, { useState } from 'react';
import { TMDefinition, TMTransition, Preset } from '../types';
import { PlayIcon } from './icons';

interface ControlPanelProps {
    definition: TMDefinition;
    setDefinition: React.Dispatch<React.SetStateAction<TMDefinition>>;
    tapeInput: string;
    setTapeInput: (value: string) => void;
    onInitialize: () => void;
    presets: Preset[];
    onSelectPreset: (preset: Preset) => void;
    activePresetName: string;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
    definition, setDefinition, tapeInput, setTapeInput, onInitialize, presets, onSelectPreset, activePresetName
}) => {
    const [newTransition, setNewTransition] = useState<TMTransition>({
        currentState: '', readSymbol: '', nextState: '', writeSymbol: '', move: 'R'
    });

    const handleDefinitionChange = <K extends keyof TMDefinition>(key: K, value: TMDefinition[K]) => {
        setDefinition(prev => ({ ...prev, [key]: value }));
    };
    
    const handleStringListChange = (key: 'states' | 'alphabet', value: string) => {
        handleDefinitionChange(key, value.split(',').map(s => s.trim()).filter(Boolean));
    };

    const handleAddTransition = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTransition.currentState || !newTransition.readSymbol || !newTransition.nextState || !newTransition.writeSymbol) {
            alert("Please fill all fields for the new transition.");
            return;
        }
        handleDefinitionChange('transitions', [...definition.transitions, newTransition]);
        setNewTransition({ currentState: '', readSymbol: '', nextState: '', writeSymbol: '', move: 'R' });
    };

    const handleRemoveTransition = (index: number) => {
        const newTransitions = definition.transitions.filter((_, i) => i !== index);
        handleDefinitionChange('transitions', newTransitions);
    };

    return (
        <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl shadow-2xl flex flex-col space-y-6 border border-slate-700/50">
            
            {/* Preset Loader */}
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-amber-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h12A2.25 2.25 0 0120.25 6v3.776" />
                    </svg>
                    Load an Operation
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {presets.map((preset) => (
                        <button
                            key={preset.name}
                            onClick={() => onSelectPreset(preset)}
                            title={preset.description}
                            className={`p-3 rounded-lg text-sm font-semibold transition-all duration-200 text-center ${
                                activePresetName === preset.name
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                                    : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                            }`}
                        >
                            {preset.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tape Input */}
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-amber-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                    Try Your Own Input
                </h3>
                <div className="flex space-x-3">
                    <input
                        type="text"
                        value={tapeInput}
                        onChange={(e) => setTapeInput(e.target.value)}
                        className="flex-grow bg-slate-700/50 p-3 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none border border-slate-600/50 font-mono text-lg"
                        placeholder="Enter string (e.g., 1011)"
                    />
                    <button onClick={onInitialize} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center transition-all shadow-lg hover:shadow-indigo-500/50">
                        <PlayIcon className="w-5 h-5 mr-2" /> Run
                    </button>
                </div>
                 <p className="text-sm text-slate-400 mt-2">Enter a string using only characters from the alphabet.</p>
            </div>


            {/* Manual Definition */}
            <div>
                <h3 className="text-xl font-bold mb-3 text-white">Machine Definition</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField label="States" placeholder="q0, q1, halt" value={definition.states.join(', ')} onChange={e => handleStringListChange('states', e.target.value)} />
                    <InputField label="Alphabet" placeholder="0, 1" value={definition.alphabet.filter(s => s !== definition.blankSymbol).join(', ')} onChange={e => handleStringListChange('alphabet', e.target.value)} />
                    <InputField label="Initial State" placeholder="q0" value={definition.initialState} onChange={e => handleDefinitionChange('initialState', e.target.value)} />
                    <InputField label="Accept State" placeholder="halt" value={definition.acceptState} onChange={e => handleDefinitionChange('acceptState', e.target.value)} />
                    <InputField label="Blank Symbol" placeholder="_" value={definition.blankSymbol} onChange={e => handleDefinitionChange('blankSymbol', e.target.value)} />
                </div>
            </div>

            {/* Transitions */}
            <div>
                <h3 className="text-xl font-bold mb-3 text-white">Transition Rules (δ)</h3>
                <div className="max-h-48 overflow-y-auto bg-slate-900/50 p-3 rounded-lg border border-slate-700/50 space-y-2">
                     {definition.transitions.map((t, i) => (
                        <div key={i} className="flex items-center space-x-2 p-2 text-sm bg-slate-700/70 rounded-md font-mono">
                            <span className="flex-1 text-slate-300">δ(<span className="text-amber-300">{t.currentState}</span>, <span className="text-sky-300">{t.readSymbol}</span>) → (<span className="text-amber-300">{t.nextState}</span>, <span className="text-sky-300">{t.writeSymbol}</span>, <span className="text-fuchsia-300">{t.move}</span>)</span>
                            <button onClick={() => handleRemoveTransition(i)} className="text-red-400 hover:text-red-300 font-sans text-xl font-bold leading-none">&times;</button>
                        </div>
                    ))}
                     {definition.transitions.length === 0 && <p className="text-center text-slate-400">No transitions defined.</p>}
                </div>
                 <form onSubmit={handleAddTransition} className="grid grid-cols-2 md:grid-cols-6 gap-2 mt-3 p-3 border border-slate-700/50 rounded-lg bg-slate-900/50">
                    <SmallInput placeholder="State" value={newTransition.currentState} onChange={e => setNewTransition({...newTransition, currentState: e.target.value})} />
                    <SmallInput placeholder="Read" value={newTransition.readSymbol} onChange={e => setNewTransition({...newTransition, readSymbol: e.target.value})} />
                    <SmallInput placeholder="Next" value={newTransition.nextState} onChange={e => setNewTransition({...newTransition, nextState: e.target.value})} />
                    <SmallInput placeholder="Write" value={newTransition.writeSymbol} onChange={e => setNewTransition({...newTransition, writeSymbol: e.target.value})} />
                    <select value={newTransition.move} onChange={e => setNewTransition({...newTransition, move: e.target.value as 'L'|'R'|'N'})} className="bg-slate-700 text-sm p-2 rounded-md focus:ring-2 focus:ring-indigo-400 focus:outline-none border border-slate-600/50">
                        <option value="L">Left (L)</option>
                        <option value="R">Right (R)</option>
                        <option value="N">Neutral (N)</option>
                    </select>
                    <button type="submit" className="bg-green-600 hover:bg-green-500 text-white font-bold rounded-md text-xl">+</button>
                </form>
            </div>

        </div>
    );
};

const InputField: React.FC<{ label: string; value: string; placeholder: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }> = ({ label, value, placeholder, onChange }) => (
    <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">{label}</label>
        <input type="text" value={value} placeholder={placeholder} onChange={onChange} className="mt-1 w-full bg-slate-700/50 p-2 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none border border-slate-600/50" />
    </div>
);

const SmallInput: React.FC<{ placeholder: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }> = ({ placeholder, value, onChange }) => (
    <input type="text" placeholder={placeholder} value={value} onChange={onChange} className="bg-slate-700 text-sm p-2 rounded-md focus:ring-2 focus:ring-indigo-400 focus:outline-none border border-slate-600/50" />
);
