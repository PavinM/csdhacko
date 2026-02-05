/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'kec-green': '#8cc63f',
                'kec-blue': '#003366', // Darker professional blue for text
                'kec-light-blue': '#00a9e0', // Bright blue for accents
            },
        },
    },
    plugins: [],
}
