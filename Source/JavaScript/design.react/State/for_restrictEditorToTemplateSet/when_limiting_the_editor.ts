// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { createScreenEditorEnvironment, screenEditorRuntimeForProfile } from '@cratis/scene.editor';
import { restrictEnvironmentToTemplateSet, restrictRuntimeToTemplateSet } from '../restrictEditorToTemplateSet';

const runtime = screenEditorRuntimeForProfile(undefined);
const all = runtime.bundles.flatMap(bundle => bundle.screenTemplates ?? []).map(template => template.name);
const namesIn = (limited: typeof runtime) => limited.bundles.flatMap(bundle => bundle.screenTemplates ?? []).map(template => template.name);

describe('when limiting the editor to the templates of a session', () => {
    describe('and there is no set', () => {
        it('should leave the runtime as it is', () => (restrictRuntimeToTemplateSet(runtime, undefined) === runtime).should.equal(true));
    });

    describe('and there is a set', () => {
        const allowed = all.slice(0, 2);

        it('should offer only the templates in it', () => namesIn(restrictRuntimeToTemplateSet(runtime, allowed)).should.deep.equal(allowed));
        it('should keep a template a screen is already built on', () => namesIn(restrictRuntimeToTemplateSet(runtime, allowed, [all[5]!])).should.have.members([...allowed, all[5]!]));
        it('should leave the packages\' other contents alone', () => restrictRuntimeToTemplateSet(runtime, allowed).bundles.map(bundle => bundle.manifest).should.deep.equal(runtime.bundles.map(bundle => bundle.manifest)));
        it('should not change the runtime it was given', () => namesIn(runtime).length.should.equal(all.length));

        describe('and the environment lends templates of its own', () => {
            const environment = createScreenEditorEnvironment({ runtime, richText: false, ownTemplates: [{ name: all[0]!, slots: [] } as never, { name: 'Mine', slots: [] } as never] });
            const limited = restrictEnvironmentToTemplateSet(environment, allowed);

            it('should narrow them too', () => limited.ownTemplates!.map(template => template.name).should.deep.equal([all[0]!]));
            it('should narrow the runtime', () => namesIn(limited.runtime).should.deep.equal(allowed));
        });
    });
});
