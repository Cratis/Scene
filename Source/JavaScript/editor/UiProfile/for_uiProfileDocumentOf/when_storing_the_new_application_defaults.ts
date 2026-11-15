// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { readFileSync } from 'node:fs';
import { blueprintPreviewBundles } from '../../BlueprintPreview/blueprintPreviewCatalog';
import { defaultUiProfileSettings } from '../defaultUiProfileSettings';
import { uiProfileDocumentOf } from '../uiProfileDocumentOf';

// A host's creation-time document for a new application must match these resolved Scene choices, not every catalog package.
// The fixture is that document; a host that writes one checks its own against this file.
describe('when storing the new application defaults without optional widgets', () => {
    const settings = { ...defaultUiProfileSettings(blueprintPreviewBundles), packages: ['Tailwind'] };
    const document = uiProfileDocumentOf(settings, blueprintPreviewBundles);

    const fixture = JSON.parse(readFileSync(new URL('./given/default-profile.json', import.meta.url), 'utf8'));

    it('should match the creation-time document', () => document.should.deep.equal(fixture));
    it('should not select PrimeReact', () => document.resolvedPackages.should.not.include('PrimeReact'));
});
