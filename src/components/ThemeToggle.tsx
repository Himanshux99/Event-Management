import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle: React.FC = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button 
            onClick={toggleTheme}
            className="p-3 border-[3px] border-foreground rounded-xl shadow-neu-sm bg-background hover:shadow-neu active:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition-all"
            aria-label="Toggle theme"
        >
            {theme === 'light' ? (
                <Moon className="w-5 h-5 text-foreground" />
            ) : (
                <Sun className="w-5 h-5 text-foreground" />
            )}
        </button>
    );
};

export default ThemeToggle;