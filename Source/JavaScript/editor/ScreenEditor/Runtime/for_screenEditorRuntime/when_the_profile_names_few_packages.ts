// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { corePackage } from '@cratis/scene.react';
import { cratisComponentsPackage } from '@cratis/scene.components';
import { createScreenEditorRuntime } from '../screenEditorRuntime';

// An imported application's profile names only the packages it was written for (`packages core, Cratis.Components`). The shell it selects is a component of the
// default blueprint, which Stage admits for every application, so the editor, the preview and Play must resolve names with that profile too - otherwise the screen
// of such an application is drawn as "not available in this UI profile" and the preview as an unresolved `appShell` (spec 13.1).
const profile = { name: 'Desktop', targetPlatform: 'web', packages: ['core', 'Cratis.Components'] } as never;
const runtime = createScreenEditorRuntime([corePackage, cratisComponentsPackage], profile);

describe('when the profile names few packages', () => {
    it('should admit the default blueprint for composition', () => runtime.compositionProfile.packages.should.include('Cratis.Blueprint.Default'));
    it('should not admit optional PrimeReact widgets', () => runtime.compositionProfile.packages.should.not.include('PrimeReact'));
    it('should keep the packages the application named', () => runtime.compositionProfile.packages.should.include.members(['core', 'Cratis.Components']));
    it('should leave the profile the author edits as it was', () => runtime.profile.packages.should.deep.equal(['core', 'Cratis.Components']));
});
