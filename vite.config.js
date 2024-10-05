export default {
    root: 'src/', // Ensure index.html is inside src/
    publicDir: '../static/', // Path to public directory
    server: {
        host: true, // Accessible on local network
        open: true, // Open browser on start
    },
    build: {
        outDir: '../dist', // Output directory
        emptyOutDir: true, // Clean directory before build
        sourcemap: true, // Include sourcemaps for debugging
    },
}
