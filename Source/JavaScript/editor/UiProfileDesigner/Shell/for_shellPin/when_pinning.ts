// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { BlueprintPinStatus } from '@cratis/scene.engine';
import { TemplateReferenceSource } from '@cratis/scene.model';
import { ShellPinKind, evaluatePinOf, pinKindOf, pinsFor, withPin } from '../shellPin';
import { defaultBlueprint, settings } from '../given/aShellContext';

const rooted = { ...settings, root: { template: { source: TemplateReferenceSource.Blueprint, blueprint: defaultBlueprint, id: 'AppShell', version: '^4.5.0' }, options: { navigationMode: 'static' } } };

describe('when pinning the version of a blueprint shell', () => {
    const exact = withPin(rooted, ShellPinKind.Exact, '4.7.2');
    const latest = withPin(rooted, ShellPinKind.Latest, '4.7.2');

    it('should name the version installed for an exact pin', () => exact.root!.template.version!.should.equal('4.7.2'));
    it('should follow the compatible versions with a caret range', () => pinsFor('4.7.2')[ShellPinKind.Follow].should.equal('^4.7.2'));
    it('should accept any version for the latest', () => latest.root!.template.version!.should.equal('*'));
    it('should keep the options of the shell', () => exact.root!.options!.should.deep.equal({ navigationMode: 'static' }));
    it('should recognise the way a pin holds the version', () => pinKindOf('4.7.2', '4.7.2')!.should.equal(ShellPinKind.Exact));
    it('should read a pin written by hand as none of them', () => (pinKindOf('>=4.5 <5', '4.7.2') === undefined).should.be.true);
    it('should read the absence of a pin as following', () => pinKindOf(undefined, '4.7.2')!.should.equal(ShellPinKind.Follow));
    it('should leave a profile without a root alone', () => withPin(settings, ShellPinKind.Exact, '4.7.2').should.equal(settings));
});

describe('when saying where a pin stands', () => {
    it('should say the installed version satisfies it', () => evaluatePinOf(rooted.root, '4.7.2')!.status.should.equal(BlueprintPinStatus.Current));
    it('should say a version the pin does not allow is not satisfied', () => evaluatePinOf(rooted.root, '5.0.0')!.status.should.equal(BlueprintPinStatus.NotSatisfied));
    it('should say nothing of an own shell', () => (evaluatePinOf({ template: { source: TemplateReferenceSource.Own, id: 'x' } }, '4.7.2') === undefined).should.be.true);
    it('should accept a range of any version', () => evaluatePinOf(latest(), '9.9.9')!.status.should.equal(BlueprintPinStatus.Current));
});

const latest = () => withPin(rooted, ShellPinKind.Latest, '4.7.2').root;
