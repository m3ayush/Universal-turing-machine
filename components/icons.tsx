
import React from 'react';

type IconProps = React.HTMLAttributes<SVGElement>;

export const PlayIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" {...props}>
        <path d="M8 5v14l11-7z" />
    </svg>
);

export const PauseIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" {...props}>
        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
    </svg>
);

export const StepIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" {...props}>
        <path d="m15 18-6-6 6-6v12Zm-2-6-6-6v12l6-6Z"/>
    </svg>
);

export const ResetIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" {...props}>
        <path d="m9 18 6-6-6-6v12Zm2-6 6-6v12l-6-6Z"/>
    </svg>
);
