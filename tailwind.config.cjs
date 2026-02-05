/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        colors: {
            'academic-blue': '#1e3a8a', // Primary Blue
            'academic-teal': '#0d9488', // Accent Teal
            'academic-gray': '#f3f4f6', // Background Gray
            'surface-white': '#ffffff', // Card White
        },
    },
},
    plugins: [],
}
