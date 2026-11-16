// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DiagnosticCode, DiagnosticSeverity, type SceneDiagnostic } from '@cratis/scene.model';
import { iconMessageOf, iconMessagesOfItems, withoutIconDiagnostics } from '../iconDiagnostics';

const diagnostic = (code: DiagnosticCode, extra: Partial<SceneDiagnostic> = {}): SceneDiagnostic =>
    ({ code, severity: DiagnosticSeverity.Warning, message: `${code}!`, path: 'icon', ...extra });

describe('when reading what Scene says about icons', () => {
    const diagnostics = [
        diagnostic(DiagnosticCode.MissingIconLibrary, { path: 'items', itemId: 'orders' }),
        diagnostic(DiagnosticCode.IconNotVerified, { path: 'items', itemId: 'tools' }),
        diagnostic(DiagnosticCode.MissingIcon),
        diagnostic(DiagnosticCode.InvalidValue, { path: 'icon' }),
    ];

    it('should give the message of the icon a property holds', () => (iconMessageOf(diagnostics, 'icon') ?? '').should.equal('missingIcon!'));
    it('should give the message of the icon an item holds', () => (iconMessageOf(diagnostics, 'items', 'orders') ?? '').should.equal('missingIconLibrary!'));
    it('should say nothing about an icon that merely has not been checked yet', () => (iconMessageOf(diagnostics, 'items', 'tools') === undefined).should.be.true);
    it('should say nothing about a property with no icon problem', () => (iconMessageOf(diagnostics, 'label') === undefined).should.be.true);
    it('should list the problem of each item that has one', () => Object.keys(iconMessagesOfItems(diagnostics, 'items')).should.deep.equal(['orders']));
    it('should leave the other diagnostics for the list at the top', () => withoutIconDiagnostics(diagnostics).map(entry => entry.code).should.deep.equal([DiagnosticCode.InvalidValue]));

    it('should put an error before a warning', () =>
        (iconMessageOf([diagnostic(DiagnosticCode.MissingIcon), diagnostic(DiagnosticCode.MissingIconLibrary, { severity: DiagnosticSeverity.Error })], 'icon') ?? '').should.equal('missingIconLibrary!'));
});
