// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { redactSecrets } from '../crashReport';

describe('when redacting secrets', () => {
    const jwt = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dBjftJeZ4CVPmB92K27uhbUJU1p1r_wW1gFWFOEjXk';
    const redacted = redactSecrets([
        `Authorization: Bearer ${jwt}`,
        `GET /api/x?access_token=secretvalue1&name=ok&api_key=secretvalue2`,
        `{"password":"hunter2","name":"ada"}`,
        'token ghp_abcdefghijklmnopqrstuvwxyz0123456789',
        'cookie: session=abc; other=def',
        'id 480f336c-0827-410e-a956-b13140e1d2ab stays',
    ].join('\n'));

    it('should remove the bearer token and the JWT', () => { redacted.should.not.contain('eyJhbGci'); redacted.should.not.contain('dBjftJeZ4'); });
    it('should remove credentials in a query string and keep the rest', () => { redacted.should.not.contain('secretvalue1'); redacted.should.not.contain('secretvalue2'); redacted.should.contain('name=ok'); });
    it('should remove credentials in JSON and keep the rest', () => { redacted.should.not.contain('hunter2'); redacted.should.contain('"name":"ada"'); });
    it('should remove well-known key shapes', () => redacted.should.not.contain('ghp_abcdefghijklmnopqrstuvwxyz'));
    it('should remove cookies', () => redacted.should.not.contain('session=abc'));
    it('should keep identifiers', () => redacted.should.contain('480f336c-0827-410e-a956-b13140e1d2ab'));
});
