// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { UploadRefusal, checkSelection, formatBytes, matchesAccept } from '../foundation';

const file = (name: string, size = 100, type = '') => ({ name, size, type });

describe('when checking a selection of files', () => {
    it('should accept everything when there is no list', () => matchesAccept(file('x.bin'), '').should.equal(true));

    it('should match extensions, types and wildcards without regard to case', () => {
        matchesAccept(file('Report.PDF'), '.pdf').should.equal(true);
        matchesAccept(file('a.png', 1, 'image/png'), 'image/*').should.equal(true);
        matchesAccept(file('a.txt', 1, 'text/plain'), 'application/pdf, image/*').should.equal(false);
        matchesAccept(file('a', 1, 'application/pdf'), '.pdf, application/pdf').should.equal(true);
    });

    it('should refuse a file of the wrong type or over the size, and say why', () => {
        const { accepted, refused } = checkSelection([file('a.pdf'), file('b.exe'), file('c.pdf', 5000)], { accept: '.pdf', maximumBytes: 1000, multiple: true });
        accepted.map(item => item.name).should.deep.equal(['a.pdf']);
        refused.map(item => `${item.file.name}:${item.reason}`).should.deep.equal(['b.exe:wrongType', 'c.pdf:tooLarge']);
    });

    it('should ignore the size when there is no limit', () => checkSelection([file('big', 1e12)], { accept: '', maximumBytes: 0, multiple: true }).accepted.length.should.equal(1));

    it('should take only one file when one is allowed, counting what is already selected', () => {
        checkSelection([file('a'), file('b')], { accept: '', maximumBytes: 0, multiple: false }).refused.map(item => item.reason).should.deep.equal([UploadRefusal.Single]);
        checkSelection([file('a')], { accept: '', maximumBytes: 0, multiple: false }, 1).accepted.length.should.equal(0);
    });

    it('should write sizes in the unit that fits, for the locale', () => {
        formatBytes(512, 'en-US').should.equal('512 B');
        formatBytes(1536, 'en-US').should.equal('1.5 KB');
        formatBytes(5 * 1024 * 1024, 'de-DE').should.equal('5 MB');
        formatBytes(1.5 * 1024 * 1024, 'de-DE').should.equal('1,5 MB');
    });
});
