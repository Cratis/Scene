// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { IconEntry } from '@cratis/scene.model';
import { lucideCatalog } from '../lucideCatalog';
import { lucideLibraryName, lucideManifest } from '../lucideManifest';

describe('when reading the Lucide catalog', () => {
    let entries: IconEntry[];

    beforeEach(async () => {
        entries = await lucideCatalog.loadEntries();
    });

    it('should hold as many icons as the manifest says', () => {
        entries.length.should.equal(lucideManifest.iconLibrary!.iconCount);
    });

    it('should list every key once', () => {
        new Set(entries.map(entry => entry.key)).size.should.equal(entries.length);
    });

    it('should know the house icon, with its alias and categories', () => {
        const house = entries.find(entry => entry.key === 'house')!;
        house.aliases!.should.contain('home');
        house.categories.should.not.be.empty;
    });

    it('should be the catalog of the Lucide library', () => {
        lucideCatalog.library.should.equal(lucideLibraryName);
    });
});
