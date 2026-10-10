/// <reference types="vitest/config" />

import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Inlines the built script into the page as a classic script, so the example is one self-contained HTML file -
 * the shape a VS Code or Event Models webview loads under a content security policy that allows inline
 * script and nothing from the network.
 */
function inlineIntoPage(): Plugin {
    return {
        name: 'scene-webview-inline',
        apply: 'build',
        enforce: 'post',
        generateBundle(_, bundle) {
            const page = Object.values(bundle).find(output => output.fileName === 'index.html');
            if (!page || page.type !== 'asset') return;
            let html = String(page.source);
            for (const [fileName, output] of Object.entries(bundle)) {
                if (output.type !== 'chunk') continue;
                const tag = new RegExp(`<script[^>]*src="\\./${fileName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^>]*></script>`);
                const code = output.code.replace(/<\/script/gi, '<\\/script');
                // A replacer function, so `$&` and friends in the code are not read as replacement patterns.
                html = html.replace(tag, () => '').replace('</body>', () => `<script>${code}</script>\n</body>`);
                delete bundle[fileName];
            }
            page.source = html;
        },
    };
}

// Builds the embedded-host example in `webview/` into `dist-webview/index.html`.
export default defineConfig({
    root: 'webview',
    base: './',
    plugins: [react(), inlineIntoPage()],
    define: { 'process.env.NODE_ENV': JSON.stringify('production') },
    build: {
        outDir: '../dist-webview',
        emptyOutDir: true,
        assetsInlineLimit: Number.MAX_SAFE_INTEGER,
        cssCodeSplit: false,
        modulePreload: false,
        rollupOptions: { output: { format: 'iife' } },
    },
});
