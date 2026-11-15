// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { blueprintPreviewBundles } from '../../BlueprintPreview/blueprintPreviewCatalog';
import { defaultUiProfileSettings } from '../defaultUiProfileSettings';
import { areUiProfileSettingsEqual } from '../areUiProfileSettingsEqual';
import { sizeClassOf } from '../ProfileSizeClass';
import { withSizeClass } from '../withSizeClass';

const settings = defaultUiProfileSettings(blueprintPreviewBundles);

describe('when choosing the size class', () => {
    const chosen = withSizeClass(settings, 'expanded');

    it('should hold the size class', () => chosen.sizeClass!.should.equal('expanded'));
    it('should leave the other choices alone', () => ({ ...chosen, sizeClass: undefined }).should.deep.equal({ ...settings, sizeClass: undefined }));
    it('should not be the same profile as before', () => areUiProfileSettingsEqual(settings, chosen).should.be.false);
    it('should be undone by choosing nothing', () => areUiProfileSettingsEqual(settings, withSizeClass(chosen, '')).should.be.true);
    it('should drop the member when nothing is chosen', () => ('sizeClass' in withSizeClass(chosen, undefined)).should.be.false);
    it('should ignore a size class it does not know', () => (withSizeClass(settings, 'huge').sizeClass === undefined).should.be.true);
});

describe('when reading a stored size class', () => {
    it('should know the three classes', () => ['compact', 'regular', 'expanded'].map(value => sizeClassOf(value)).should.deep.equal(['compact', 'regular', 'expanded']));
    it('should read nothing for empty', () => (sizeClassOf('') === undefined).should.be.true);
    it('should read nothing for one written by a newer build', () => (sizeClassOf('giant') === undefined).should.be.true);
});
