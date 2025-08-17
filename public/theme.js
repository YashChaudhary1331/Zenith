// In theme.js

document.addEventListener('DOMContentLoaded', () => {
    const themeToggleButton = document.getElementById('theme-toggle-btn');
    const htmlElement = document.documentElement; // Get the <html> element

    // Function to apply the theme
    const applyTheme = (theme) => {
        if (theme === 'dark') {
            htmlElement.classList.add('dark');
            themeToggleButton.textContent = '☀️'; // Sun icon for light mode
        } else {
            htmlElement.classList.remove('dark');
            themeToggleButton.textContent = '🌙'; // Moon icon for dark mode
        }
    };

    // Function to toggle the theme
    const toggleTheme = () => {
        const currentTheme = htmlElement.classList.contains('dark') ? 'light' : 'dark';
        localStorage.setItem('theme', currentTheme); // Save the preference
        applyTheme(currentTheme);
    };

    // Add click listener to the button
    themeToggleButton.addEventListener('click', toggleTheme);

    // --- Check for saved theme on page load ---
    const savedTheme = localStorage.getItem('theme');
    // Check system preference if no theme is saved
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme) {
        applyTheme(savedTheme);
    } else if (prefersDark) {
        applyTheme('dark');
    } else {
        applyTheme('light');
    }
});