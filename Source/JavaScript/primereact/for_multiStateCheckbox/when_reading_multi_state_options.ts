// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { multiStateOptions } from '../form/multiStateOptions';
import { sceneComponent } from '../storyElements';

function read(properties: Record<string, unknown>) {
    return multiStateOptions(sceneComponent('review', 'multiStateCheckbox', properties), 'No selection');
}

describe('when reading multi-state options', () => {
    it('should use a record option\'s label and value fields', () => {
        read({ options: [{ label: 'Approved', value: 'approved' }] }).should.deep.equal([{ label: 'Approved', value: 'approved' }]);
    });

    it('should use the configured label and value fields, including nested paths', () => {
        read({ optionLabel: 'text.short', optionValue: 'meta.code', options: [{ text: { short: 'OK' }, meta: { code: 7 } }] })
            .should.deep.equal([{ label: 'OK', value: 7 }]);
    });

    it('should use the whole option as its value when it has no value field, as the original control did', () => {
        const option = { label: 'Approved', rank: 1 };
        read({ options: [option] }).should.deep.equal([{ label: 'Approved', value: option }]);
    });

    it('should keep an object value exactly, without reshaping it', () => {
        read({ options: [{ label: 'Approved', value: { approved: true, by: ['a', 'b'] } }] })[0].value!.should.deep.equal({ approved: true, by: ['a', 'b'] });
    });

    it('should keep a record option whose value is a number or a boolean instead of dropping it', () => {
        read({ options: [{ value: 1 }, { value: true }, { value: 0, label: 'Zero' }] })
            .should.deep.equal([{ label: '1', value: 1 }, { label: 'true', value: true }, { label: 'Zero', value: 0 }]);
    });

    it('should show a numeric or boolean label as text', () => {
        read({ options: [{ label: 3, value: 'three' }, { label: false, value: 'no' }] }).map(option => option.label).should.deep.equal(['3', 'false']);
    });

    it('should keep a null value and label it with the empty state label', () => {
        read({ options: [{ value: null }, null, { label: 'Nothing', value: null }] })
            .should.deep.equal([{ label: 'No selection', value: null }, { label: 'No selection', value: null }, { label: 'Nothing', value: null }]);
    });

    it('should keep primitive options as their own values', () => {
        read({ options: ['A', 2, false] }).should.deep.equal([{ label: 'A', value: 'A' }, { label: '2', value: 2 }, { label: 'false', value: false }]);
    });

    it('should keep an array option as a value shown as JSON', () => {
        read({ options: [[1, 2]] }).should.deep.equal([{ label: '[1,2]', value: [1, 2] }]);
    });

    it('should never drop an option', () => {
        read({ options: [{}, [], 'x', 4, null, { label: 'y' }] }).length.should.equal(6);
    });

    it('should keep the authored order', () => {
        read({ options: ['c', 'a', 'b'] }).map(option => option.value).should.deep.equal(['c', 'a', 'b']);
    });

    describe('and reading icons', () => {
        const reference = { library: '@fortawesome/free-solid', key: 'check', variant: 'solid' };

        it('should take an option\'s own icon, as a class or a qualified reference', () => {
            read({ options: [{ label: 'A', value: 'a', icon: 'pi pi-check' }, { label: 'B', value: 'b', icon: reference }] })
                .map(option => option.icon).should.deep.equal(['pi pi-check', reference]);
        });

        it('should take icons aligned with the options', () => {
            read({ options: ['A', 'B'], icons: ['pi pi-a', reference] }).map(option => option.icon).should.deep.equal(['pi pi-a', reference]);
        });

        it('should take icons keyed by value, including numbers and booleans', () => {
            read({ options: ['A', 2, false], icons: { A: 'pi pi-a', 2: 'pi pi-two', false: reference } }).map(option => option.icon)
                .should.deep.equal(['pi pi-a', 'pi pi-two', reference]);
        });

        it('should prefer an option\'s own icon over the icons collection', () => {
            read({ options: [{ label: 'A', value: 'a', icon: 'pi pi-own' }], icons: ['pi pi-aligned'] })[0].icon!.should.equal('pi pi-own');
        });

        it('should ignore an icon that is neither a class name nor a valid reference', () => {
            read({ options: [{ label: 'A', value: 'a', icon: { library: 'x' } }, { label: 'B', value: 'b', icon: 3 }] }).map(option => option.icon)
                .should.deep.equal([undefined, undefined]);
        });
    });
});
