// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { renderToStaticMarkup } from 'react-dom/server';
import { renderSafeNodes } from '../editor/renderSafeNodes';
import { safeImageUrl, safeLinkUrl } from '../editor/safeUrls';
import { sanitizeHtml } from '../editor/sanitizeHtml';
import { serializeSafeNodes } from '../editor/serializeSafeNodes';
import { forbiddenInOutput, hostileHtml } from './given/hostile_html';

describe('when sanitizing hostile html', () => {
    const nodes = sanitizeHtml(hostileHtml);
    const serialized = serializeSafeNodes(nodes);
    const rendered = renderToStaticMarkup(<>{renderSafeNodes(nodes)}</>);

    for (const forbidden of forbiddenInOutput) {
        it(`should leave '${forbidden.replace('\t', '<tab>')}' out of the serialized and the rendered output`, () => {
            serialized.toLowerCase().should.not.contain(forbidden.toLowerCase());
            rendered.toLowerCase().should.not.contain(forbidden.toLowerCase());
        });
    }

    it('should keep the plain content', () => {
        serialized.should.contain('<p>hi</p>');
        serialized.should.contain('styled');
        serialized.should.contain('click');
    });

    it('should make the links it keeps safe to follow', () => {
        renderToStaticMarkup(<>{renderSafeNodes(sanitizeHtml('<a href="https://example.com/a?b=1&c=2" target="_blank" onclick="x()">ok</a>'))}</>)
            .should.equal('<a href="https://example.com/a?b=1&amp;c=2" rel="noopener noreferrer">ok</a>');
    });

    describe('and an image is a small raster data url', () => {
        it('should keep it, and only it', () => {
            const png = 'data:image/png;base64,iVBORw0KGgo=';
            serializeSafeNodes(sanitizeHtml(`<img src="${png}" alt="dot" onerror="x()">`)).should.equal(`<img src="${png}" alt="dot">`);
        });
    });

    describe('and the nesting is far deeper than any document', () => {
        it('should flatten it instead of overflowing the stack', () => {
            const depth = 5000;
            serializeSafeNodes(sanitizeHtml('<div>'.repeat(depth) + 'deep' + '</div>'.repeat(depth))).should.contain('deep');
        });
    });

    describe('and a url is judged', () => {
        it('should allow http, https, mailto, tel and relative links', () => {
            ['https://a.example', 'http://a.example/x', 'mailto:a@b.example', 'tel:+4712345678', '/path', '#anchor', 'page.html'].map(safeLinkUrl)
                .should.deep.equal(['https://a.example', 'http://a.example/x', 'mailto:a@b.example', 'tel:+4712345678', '/path', '#anchor', 'page.html']);
        });

        it('should refuse every other scheme however it is disguised', () => {
            ['javascript:alert(1)', ' JaVaScRiPt:alert(1)', 'java\tscript:alert(1)', 'java\nscript:alert(1)', 'data:text/html,x', 'vbscript:x', 'file:///etc/passwd', ''].map(safeLinkUrl)
                .should.deep.equal([undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined]);
        });

        it('should refuse every image that is not a raster data url', () => {
            ['https://a.example/x.png', 'data:image/svg+xml;base64,AAAA', 'data:image/png,AAAA', 'javascript:x', 'data:text/html;base64,AAAA'].map(safeImageUrl)
                .should.deep.equal([undefined, undefined, undefined, undefined, undefined]);
        });
    });
});
