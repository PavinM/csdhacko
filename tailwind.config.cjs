/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // User Defined Palette
                'brand-green': '#8BC34A', // Main Brand (Headers)
                'brand-blue': '#03A9F4',  // Secondary (Nav)
                'brand-dark-blue': '#1A237E', // Text Headings
                'accent-orange': '#FF9800', // Stats/CTA
                'accent-purple': '#9C27B0', // Metrics
                'accent-red': '#FF5722',  // Actions
                'neutral-gray': '#F5F5F5', // Backgrounds

                // Mapped Legacy Colors (to preventing breaking existing classes immediately)
                'academic-blue': '#1A237E', // Mapping to Dark Blue
                'academic-teal': '#03A9F4', // Mapping to Brand Blue
                'academic-gray': '#F5F5F5',
                'surface-white': '#ffffff',
                'kec-blue': '#1A237E',
                'kec-green': '#8BC34A',
            },
            keyframes: {
                fadeInUp: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                fadeInDown: {
                    '0%': { opacity: '0', transform: 'translateY(-10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
            },
            animation: {
                'fade-in-up': 'fadeInUp 0.3s ease-out',
                'fade-in-down': 'fadeInDown 0.3s ease-out',
            },
        },
    },
    plugins: [],
}
