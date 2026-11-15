// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { isShellDocumentRead } from '../isShellDocumentRead';
import type { ApplicationTemplate } from '../../../ScreenTemplates/ApplicationTemplate';

const templates = [
    { id: 'unread' },
    { id: 'with-template', template: {} },
    { id: 'with-slots', slots: {} },
] as unknown as readonly ApplicationTemplate[];

describe('when asking whether the document of a made shell has been read', () => {
    it('should not be read when the template is not listed', () => isShellDocumentRead(templates, 'missing').should.be.false);
    it('should not be read when it is listed without a document', () => isShellDocumentRead(templates, 'unread').should.be.false);
    it('should be read when it has a template', () => isShellDocumentRead(templates, 'with-template').should.be.true);
    it('should be read when it has slots', () => isShellDocumentRead(templates, 'with-slots').should.be.true);
});
