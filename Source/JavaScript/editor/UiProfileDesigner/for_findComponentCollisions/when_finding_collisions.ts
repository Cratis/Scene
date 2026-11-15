// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { UiProfile } from '@cratis/scene.model';
import { ComponentResolution, PackageCatalog } from '@cratis/scene.engine';
import { findComponentCollisions } from '../findComponentCollisions';

describe('when finding collisions', () => {
    let result: ComponentResolution[];

    beforeEach(() => {
        const profile: UiProfile = { name: 'Admin', targetPlatform: 'web', packages: ['core', 'Internal.Widgets', 'PrimeReact'] };
        const catalog: PackageCatalog = {
            core: ['button', 'text'],
            'Internal.Widgets': ['button', 'trendChart'],
            PrimeReact: ['trendChart'],
        };

        result = findComponentCollisions(profile, catalog);
    });

    it('should find every bare name declared by more than one active package', () => {
        result.map(collision => collision.name).should.deep.equal(['button', 'trendChart']);
    });

    it('should report which package currently wins by priority', () => {
        result.find(collision => collision.name === 'button')!.package.should.equal('Internal.Widgets');
        result.find(collision => collision.name === 'trendChart')!.package.should.equal('PrimeReact');
    });

    it('should list the shadowed packages', () => {
        result.find(collision => collision.name === 'button')!.shadows.should.deep.equal(['core']);
    });

    it('should not report a name only one active package declares', () => {
        result.some(collision => collision.name === 'text').should.be.false;
    });
});
