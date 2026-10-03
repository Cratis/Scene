// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { htmlToPlainText } from '../editor/htmlToPlainText';
import { hostileHtml } from './given/hostile_html';

describe('when converting html to plain text', () => {
    it('should drop the tags and keep the words, one line per block', () => {
        htmlToPlainText('<h1>Title</h1><p>One <strong>two</strong></p><ul><li>a</li><li>b</li></ul>').should.equal('Title\nOne two\na\nb');
    });

    it('should decode the common entities and numeric references into text', () => {
        htmlToPlainText('Fish &amp; chips &lt;3 &#65;&#x42; &nbsp;done &bogus; &#0;').should.equal('Fish & chips <3 AB  done &bogus; &#0;');
    });

    it('should drop script, style, svg and frames together with their content', () => {
        const text = htmlToPlainText(hostileHtml);
        text.should.contain('hi');
        text.should.not.contain('window.__');
        text.should.not.contain('outline');
        text.should.not.contain('<');
    });

    it('should keep a bare less-than sign that is not a tag', () => {
        htmlToPlainText('1 < 2 and 3 > 2').should.equal('1 < 2 and 3 > 2');
    });

    it('should finish quickly on unclosed tags and comments', () => {
        const started = performance.now();
        htmlToPlainText('<script'.repeat(20000) + '<!--'.repeat(20000) + '<p'.repeat(20000));
        (performance.now() - started).should.be.lessThan(1000);
    });
});
