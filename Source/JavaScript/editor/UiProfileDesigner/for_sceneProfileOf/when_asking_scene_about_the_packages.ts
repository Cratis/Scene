// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { MoveDirection, PackageEditOutcome, addPackage, describePackageList, movePackage, removePackage } from '@cratis/scene.engine';
import { PackageKind } from '@cratis/scene.model';
import { blueprintPreviewBundles } from '../../BlueprintPreview/blueprintPreviewCatalog';
import { defaultUiProfileSettings } from '../../UiProfile/defaultUiProfileSettings';
import { sceneProfileOf, withPackageEdit } from '../Inspector/sceneProfileOf';

const standalone = (name: string, components: string[]) => ({ manifest: { name, version: '1.0.0', kind: PackageKind.ComponentLibrary, dependencies: [{ name: 'core' }], components, layouts: [], screenTemplates: [], dialogTemplates: [], themes: [] }, components: {} });
const bundles = [...blueprintPreviewBundles, standalone('Acme.Charts', ['acmeShared']), standalone('Acme.Forms', ['acmeShared'])] as typeof blueprintPreviewBundles;
const manifests = bundles.map(bundle => bundle.manifest);
const base = defaultUiProfileSettings(bundles);
const settings = { ...base, packages: [...base.packages, 'Acme.Charts', 'Acme.Forms'] };
const profile = sceneProfileOf(settings, bundles);
const order = (names: string[]) => [...names].reverse().filter(name => name !== 'core');

describe('when giving Scene the profile being designed', () => {
    it('should put what is needed before what needs it, the dependencies that came in included', () => {
        const names = profile.packages;
        [names.indexOf('Tailwind') < names.indexOf('PrimeReact'), names[0]].should.deep.equal([true, 'core']);
    });

    it('should list the packages the author added, so the list can say they are chosen', () => profile.packages.should.include.members(['Acme.Charts', 'Acme.Forms']));

    it('should let two libraries that only need core be moved past each other', () => {
        const rows = describePackageList(profile, manifests).rows;
        const forms = rows.find(row => row.name === 'Acme.Forms')!;
        [forms.canMoveUp, forms.canMoveDown].should.deep.equal([true, true]);
    });
});

describe('when a move is written back into the settings', () => {
    const moved = movePackage(profile, manifests, 'Acme.Forms', MoveDirection.Down);
    const after = withPackageEdit(settings, moved);

    it('should be a move', () => moved.outcome.should.equal(PackageEditOutcome.Moved));
    it('should put the two libraries the other way round', () => after.packages.indexOf('Acme.Forms').should.be.lessThan(after.packages.indexOf('Acme.Charts')));
    it('should not turn a package that came in as a dependency into one the author chose', () => after.packages.should.not.include.members(['Cratis.Components']));
    it('should keep the shell as the shell', () => after.shell.should.equal(settings.shell));
});

describe('when a package is added', () => {
    const added = addPackage(profile, manifests, 'Cratis.Icons.Lucide');
    const after = withPackageEdit(settings, added);

    it('should be added', () => added.outcome.should.equal(PackageEditOutcome.Added));
    it('should be one the author now chose', () => after.packages.should.include('Cratis.Icons.Lucide'));
    it('should leave the rest of the list as it was', () => [...settings.packages].every(name => after.packages.includes(name)).should.be.true);
});

describe('when a package that is needed is removed', () => {
    const refused = removePackage(profile, manifests, 'Tailwind');

    it('should be refused by Scene', () => [PackageEditOutcome.Refused, PackageEditOutcome.Unchanged].should.include(refused.outcome));
    it('should say why with a sentence', () => (refused.message.length > 0).should.be.true);
    it('should leave the order as it was', () => order(refused.profile.packages).should.deep.equal(order(profile.packages)));
});

describe('when a package nobody needs is removed', () => {
    const removed = removePackage(profile, manifests, 'Acme.Forms');
    const after = withPackageEdit(settings, removed);

    it('should be removed', () => removed.outcome.should.equal(PackageEditOutcome.Removed));
    it('should be gone from what the author chose', () => after.packages.should.not.include('Acme.Forms'));
    it('should leave the other library', () => after.packages.should.include('Acme.Charts'));
});
