// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { JSDOM } from 'jsdom';

/**
 * A conformance run of the embedded-host example: the built `dist-webview/index.html` - one file, inline script,
 * a content security policy that allows nothing from the network - is loaded the way VS Code loads a webview,
 * with `acquireVsCodeApi` provided by the embedder and nothing else.
 */
const page = readFileSync(join(import.meta.dirname, '../dist-webview/index.html'), 'utf-8');

async function loadWebview() {
    const messages: { type: string; payload?: unknown }[] = [];
    const dom = new JSDOM(page, {
        runScripts: 'dangerously',
        pretendToBeVisual: true,
        url: 'vscode-webview://example/index.html',
        beforeParse(window) {
            // Messages are created in the page's realm; copy them into this one so assertions see plain objects.
            (window as unknown as { acquireVsCodeApi: () => unknown }).acquireVsCodeApi = () => ({ postMessage: (message: { type: string }) => messages.push(JSON.parse(JSON.stringify(message))) });
        },
    });
    for (let attempt = 0; attempt < 50 && !dom.window.document.querySelector('[data-acme-checklist]'); attempt++) {
        await new Promise(resolve => setTimeout(resolve, 20));
    }
    return { dom, messages };
}

describe('when loading the built webview page', () => {
    it('should be one self-contained file that loads nothing from the network', () => {
        page.should.not.match(/<script[^>]*\ssrc=/);
        page.should.not.match(/<link[^>]*\shref=/);
        page.should.contain("default-src 'none'");
    });

    it('should render the custom package set through the webview host and tell the embedder it is ready', async () => {
        const { dom, messages } = await loadWebview();
        const host = dom.window.document.querySelector('[data-scene-host-mode]')!;
        host.getAttribute('data-scene-host-mode')!.should.equal('webView');
        host.getAttribute('data-scene-host-blocked')!.should.equal('false');
        dom.window.document.body.textContent!.should.contain('Fridge below 5°C');
        messages[0].should.deep.equal({ type: 'ready' });
        dom.window.close();
    });

    it('should send a command to the embedder with its resolved arguments', async () => {
        const { dom, messages } = await loadWebview();
        const button = [...dom.window.document.querySelectorAll('button')].find(candidate => candidate.textContent === 'Record inspection')!;
        button.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
        await new Promise(resolve => setTimeout(resolve, 20));
        messages.filter(message => message.type === 'command').should.deep.equal([{ type: 'command', payload: { command: 'RecordInspection', arguments: { site: 'kitchen' } } }]);
        dom.window.close();
    });

    it('should need no Studio global', async () => {
        const { dom } = await loadWebview();
        Object.getOwnPropertyNames(dom.window).filter(name => /studio/i.test(name)).should.deep.equal([]);
        dom.window.close();
    });
});
