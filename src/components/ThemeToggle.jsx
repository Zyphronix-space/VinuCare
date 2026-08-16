import { useTheme } from '../context/ThemeContext';
import { SunIcon, MoonIcon } from './ui/Icons';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      className={`theme-toggle ${isDark ? 'is-dark' : ''}`}
      onClick={toggleTheme}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label="Toggle dark mode"
      aria-pressed={isDark}
    >
      <span className="theme-toggle-track">
        <span className="theme-toggle-icon sun"><SunIcon size={13} /></span>
        <span className="theme-toggle-icon moon"><MoonIcon size={13} /></span>
        <span className="theme-toggle-knob" />
      </span>
    </button>
  );
}