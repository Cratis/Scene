// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { messageSeverityProperty } from '../properties';

const message = (severity?: unknown) => messageSeverityProperty({ id: 'message', properties: severity === undefined ? {} : { severity } }, 'severity');

describe('when reading a message severity', () => {
    it('should take success', () => message('success').should.equal('success'));
    it('should take info', () => message('info').should.equal('info'));
    it('should take warn', () => message('warn').should.equal('warn'));
    it('should take error', () => message('error').should.equal('error'));
    it('should take the design system\'s name for error, which is danger', () => message('danger').should.equal('error'));
    it('should translate the v10 warning severity', () => message('warning').should.equal('warn'));
    it('should fall back to info when none is given', () => message().should.equal('info'));
    it('should fall back to info for one PrimeReact does not know', () => message('fuchsia').should.equal('info'));
    it('should fall back to info when it is not text', () => message(7).should.equal('info'));
});
