// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { toolbarDiagnostics } from '../toolbarDiagnostics';
import { application, button, toolbarOf } from './given_a_toolbar_and_an_application';

const kind = { kind: 'Action' };
const findings = toolbarDiagnostics(application, toolbarOf(
    button('Placed', { ...kind, slice: 'sales.orders.PlaceOrder' }),
    button('Empty', { ...kind }),
    button('Gone', { ...kind, slice: 'sales.orders.Vanished' }),
    button('View', { ...kind, slice: 'sales.orders.OrderSummary' }),
    button('Auto', { ...kind, slice: 'sales.orders.SendReminder' }),
    button('Legacy', { ...kind, target: 'PlaceOrderCommand' }),
    { ...button('NotAButton', {}), kind: 'separator' },
));
const of = (button: string) => findings.filter(finding => finding.button === button);

describe('when checking the buttons of a toolbar', () => {
    it('should find nothing wrong with a button that invokes a state change', () => of('Placed').should.be.empty);
    it('should warn about a button with no slice, which is allowed while designing (TB5)', () => { of('Empty')[0].code.should.equal('toolbarButtonSliceEmpty'); of('Empty')[0].severity.should.equal('warning'); });
    it('should report an error for a slice the application does not have', () => { of('Gone')[0].code.should.equal('toolbarButtonSliceNotFound'); of('Gone')[0].severity.should.equal('error'); });
    it('should report an error for a state view, which never takes user input (TB3)', () => { of('View')[0].code.should.equal('toolbarButtonSliceNotStateChange'); of('View')[0].severity.should.equal('error'); });
    it('should report an error for an automation', () => of('Auto')[0].code.should.equal('toolbarButtonSliceNotStateChange'));
    it('should say the state view is a state view and the automation an automation', () => { of('View')[0].message.should.contain('a state view'); of('Auto')[0].message.should.contain('an automation'); });
    it('should not flag a button that names a command exactly one slice accepts: it already runs that slice', () => of('Legacy').should.be.empty);
    it('should name the button by its title, not its identity', () => of('Empty')[0].message.should.contain("'Empty'"));
    it('should ignore an element that is not a button', () => of('NotAButton').should.be.empty);
    it('should find nothing in a toolbar with no buttons', () => toolbarDiagnostics(application, toolbarOf()).should.be.empty);
});
