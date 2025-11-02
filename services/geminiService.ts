
import { GoogleGenAI, Type } from "@google/genai";
import { TMDefinition, TMTransition, MoveDirection } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const tmDefinitionSchema = {
    type: Type.OBJECT,
    properties: {
        states: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "A list of all unique state names, e.g., ['q0', 'q1', 'accept']",
        },
        alphabet: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "A list of symbols allowed on the tape, not including the blank symbol, e.g., ['0', '1']",
        },
        blankSymbol: {
            type: Type.STRING,
            description: "The symbol representing a blank cell on the tape, e.g., '_'",
        },
        initialState: {
            type: Type.STRING,
            description: "The name of the starting state, e.g., 'q0'",
        },
        acceptState: {
            type: Type.STRING,
            description: "The name of the state that signifies acceptance, e.g., 'accept'",
        },
        transitions: {
            type: Type.ARRAY,
            description: "An array of transition rules.",
            items: {
                type: Type.OBJECT,
                properties: {
                    currentState: { type: Type.STRING },
                    readSymbol: { type: Type.STRING },
                    nextState: { type: Type.STRING },
                    writeSymbol: { type: Type.STRING },
                    move: { 
                        type: Type.STRING,
                        enum: ['L', 'R', 'N'],
                        description: "Direction to move the tape head: Left, Right, or Neutral."
                    },
                },
                required: ['currentState', 'readSymbol', 'nextState', 'writeSymbol', 'move'],
            },
        },
    },
    required: ['states', 'alphabet', 'blankSymbol', 'initialState', 'acceptState', 'transitions'],
};


export const generateMachineDefinition = async (prompt: string): Promise<TMDefinition> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction: "You are an expert in computer science and automata theory. Your task is to generate a complete and valid JSON definition for a Turing Machine based on the user's request. Ensure all states mentioned in transitions are declared in the 'states' list. The alphabet should contain all non-blank symbols used. Adhere strictly to the provided JSON schema.",
                responseMimeType: "application/json",
                responseSchema: tmDefinitionSchema,
            },
        });

        const jsonText = response.text.trim();
        const parsedJson = JSON.parse(jsonText);
        
        // Basic validation, more can be added
        if (!parsedJson.states || !parsedJson.transitions) {
            throw new Error("AI returned incomplete machine definition.");
        }

        // Add blank symbol to alphabet if not present for completeness, as it's a valid tape symbol
        const fullAlphabet = [...new Set([...parsedJson.alphabet, parsedJson.blankSymbol])];

        return { ...parsedJson, alphabet: fullAlphabet };
    } catch (error) {
        console.error("Error generating Turing Machine definition:", error);
        throw new Error("Failed to communicate with the AI model or parse its response.");
    }
};
