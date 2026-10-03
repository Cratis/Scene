// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { resolveUploadTarget } from '../file/resolveUploadTarget';

const page = 'https://app.example';

describe('when resolving an upload target', () => {
    const resolve = (url: string | undefined, allowed: string[] = []) => resolveUploadTarget(url, page, allowed);

    it('should accept no address at all', () => {
        resolve(undefined).should.deep.equal({ isValid: true, url: undefined });
        resolve('').should.deep.equal({ isValid: true, url: undefined });
    });

    it('should accept an address on the origin of the page, relative or absolute', () => {
        resolve('/uploads').should.deep.equal({ isValid: true, url: '/uploads' });
        resolve('uploads/v1?kind=a').should.deep.equal({ isValid: true, url: 'uploads/v1?kind=a' });
        resolve('https://app.example/uploads').should.deep.equal({ isValid: true, url: 'https://app.example/uploads' });
    });

    it('should refuse another origin unless the host allows it', () => {
        resolve('https://files.example/up').isValid.should.equal(false);
        resolve('http://localhost:5180/steal').isValid.should.equal(false);
        resolve('https://files.example/up', ['https://files.example']).should.deep.equal({ isValid: true, url: 'https://files.example/up' });
        resolve('https://files.example/up', ['https://files.example/with/a/path']).isValid.should.equal(true);
        resolve('https://other.example/up', ['https://files.example']).isValid.should.equal(false);
    });

    it('should refuse an origin that only looks like the page', () => {
        for (const url of ['https://app.example.evil.example/up', 'https://app.example@evil.example/up', 'http://app.example/up', 'https://app.example:8443/up']) {
            resolve(url).isValid.should.equal(false);
        }
    });

    it('should treat a protocol-relative address as naming its own host', () => {
        resolve('//evil.example/up').isValid.should.equal(false);
        resolve('//files.example/up', ['https://files.example']).should.deep.equal({ isValid: true, url: 'https://files.example/up' });
    });

    it('should refuse schemes other than http and https', () => {
        for (const url of ['javascript:alert(1)', 'data:text/plain,hi', 'file:///etc/passwd', 'blob:https://app.example/x', 'ftp://app.example/x', 'JaVaScRiPt:alert(1)']) {
            resolve(url, ['javascript:', 'data:']).isValid.should.equal(false);
        }
    });

    it('should refuse addresses built to be read differently by a browser', () => {
        for (const url of ['/up\\@evil.example', '\\\\evil.example/up', '/up load', '/up\tload', '/up\nload', 'https://user:secret@app.example/up', 'https://user@app.example/up', ' /up']) {
            resolve(url).isValid.should.equal(false);
        }
    });

    it('should refuse an address that merely resolves against the placeholder host', () => {
        resolve('https://upload-target.invalid/up').isValid.should.equal(false);
    });

    it('should accept only the allowlist when there is no page, as when rendering on a server', () => {
        resolveUploadTarget('/uploads', undefined, []).isValid.should.equal(true);
        resolveUploadTarget('https://app.example/uploads', undefined, []).isValid.should.equal(false);
        resolveUploadTarget('https://files.example/up', undefined, ['https://files.example']).isValid.should.equal(true);
    });

    it('should say why an address was refused', () => {
        const target = resolve('https://evil.example/up');
        (target.isValid ? '' : target.message).should.contain('https://evil.example');
    });
});
