// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { cleanup, fireEvent, screen } from '@testing-library/react';
import { afterEach } from 'vitest';
import sinon from 'sinon';
import { BindingMode, PropertyValueType } from '@cratis/scene.model';
import { foundationDescriptors } from '../foundation/foundationDescriptors';
import { aBoardWithBindingOutputs, cards } from './given/a_board_with_binding_outputs';

describe('when selecting a card', () => {
    afterEach(cleanup);

    it('should publish the original row and announce its title with an accessible pressed state', () => {
        const { published, container, onSelect } = aBoardWithBindingOutputs();
        [published.selectedItem].should.deep.equal([null]);
        const button = screen.getByRole('button', { name: 'Select First task' });
        fireEvent.click(button);
        published.selectedItem!.should.equal(cards[0]);
        button.getAttribute('aria-pressed')!.should.equal('true');
        container.querySelectorAll('.foundation-board-card[data-selected="true"]').length.should.equal(1);
        screen.getByRole('status').textContent!.should.equal('First task selected');
        onSelect.callCount.should.equal(0);
    });

    it('should clear the output when the title is pressed again', () => {
        const { published } = aBoardWithBindingOutputs();
        const button = screen.getByRole('button', { name: 'Select First task' });
        fireEvent.click(button);
        fireEvent.click(button);
        [published.selectedItem, button.getAttribute('aria-pressed')].should.deep.equal([null, 'false']);
        screen.getByRole('status').textContent!.should.equal('Selection cleared');
    });

    it('should clear the output and announce it when Escape is pressed on the title', () => {
        const { published, container } = aBoardWithBindingOutputs();
        const button = screen.getByRole('button', { name: 'Select First task' });
        fireEvent.click(button);
        fireEvent.keyDown(button, { key: 'Escape' });
        [published.selectedItem, button.getAttribute('aria-pressed')].should.deep.equal([null, 'false']);
        container.querySelectorAll('[data-selected="true"]').length.should.equal(0);
        screen.getByRole('status').textContent!.should.equal('Selection cleared');
    });

    it('should stop propagation only when Escape clears a selection', () => {
        const { container } = aBoardWithBindingOutputs();
        const reached = sinon.spy();
        document.body.addEventListener('keydown', reached);
        try {
            const button = screen.getByRole('button', { name: 'Select First task' });
            fireEvent.keyDown(button, { key: 'Escape' });
            reached.callCount.should.equal(1);
            fireEvent.click(button);
            fireEvent.keyDown(button, { key: 'Escape' });
            reached.callCount.should.equal(1);
        } finally {
            document.body.removeEventListener('keydown', reached);
        }
        container.querySelectorAll('[data-selected="true"]').length.should.equal(0);
    });

    it('should make no announcement when Escape is pressed with nothing selected', () => {
        aBoardWithBindingOutputs();
        fireEvent.keyDown(screen.getByRole('button', { name: 'Select First task' }), { key: 'Escape' });
        screen.getByRole('status').textContent!.should.equal('');
    });

    it('should leave selection alone when Escape is pressed in the move menu', () => {
        const { published } = aBoardWithBindingOutputs();
        const button = screen.getByRole('button', { name: 'Select First task' });
        fireEvent.click(button);
        fireEvent.keyDown(screen.getByRole('combobox', { name: 'Move First task' }), { key: 'Escape' });
        published.selectedItem!.should.equal(cards[0]);
        button.getAttribute('aria-pressed')!.should.equal('true');
        screen.getByRole('status').textContent!.should.equal('First task selected');
    });

    it('should publish the drawn row rather than an earlier untitled duplicate', () => {
        const row = { id: 'a', title: 'T', column: 'todo' };
        const { published } = aBoardWithBindingOutputs({ cards: [{ id: 'a' }, row] });
        fireEvent.click(screen.getByRole('button', { name: 'Select T' }));
        published.selectedItem!.should.equal(row);
    });

    it('should publish the unmapped query row for a mapped board', () => {
        const row = { productId: 42, name: 'Mug', status: 'todo', sku: 'ACM-1000' };
        const { published } = aBoardWithBindingOutputs({ cards: [row], cardId: 'productId', cardTitle: 'name', cardColumn: 'status' });
        fireEvent.click(screen.getByRole('button', { name: 'Select Mug' }));
        published.selectedItem!.should.equal(row);
    });

    it('should keep the selected original row after moving and still publish the move value', () => {
        const { published, onChange } = aBoardWithBindingOutputs();
        fireEvent.click(screen.getByRole('button', { name: 'Select First task' }));
        fireEvent.change(screen.getByRole('combobox', { name: 'Move First task' }), { target: { value: 'done' } });
        published.selectedItem!.should.equal(cards[0]);
        published.value!.should.deep.equal([{ id: 'two', column: 'done' }, { id: 'one', column: 'done' }]);
        screen.getByRole('button', { name: 'Select First task' }).getAttribute('aria-pressed')!.should.equal('true');
        onChange.callCount.should.equal(1);
    });

    it('should publish selection by value rather than republishing an unchanged row', () => {
        const { setOutput, update, published } = aBoardWithBindingOutputs();
        fireEvent.click(screen.getByRole('button', { name: 'Select First task' }));
        const count = () => setOutput.getCalls().filter(call => call.args[0] === 'selectedItem').length;
        count().should.equal(2);
        update({ cards: cards.map(card => ({ ...card })) });
        count().should.equal(2);
        update({ cards: [{ ...cards[0], ownerId: 'charlie' }, cards[1]] });
        count().should.equal(3);
        published.selectedItem!.should.deep.equal({ ...cards[0], ownerId: 'charlie' });
    });

    it('should allow selection even when moving is disabled', () => {
        const { published } = aBoardWithBindingOutputs({ editPermission: 'disabled' });
        fireEvent.click(screen.getByRole('button', { name: 'Select First task' }));
        published.selectedItem!.should.equal(cards[0]);
        screen.queryAllByRole('combobox').length.should.equal(0);
    });

    it('should describe the same selected item output contract as tables and default selection to none', () => {
        const descriptor = foundationDescriptors.find(item => item.displayName === 'Kanban board')!;
        const output = descriptor.properties!.find(property => property.path === 'selectedItem')!;
        [output.valueType, output.readOnly, output.output, output.bindingMode, output.description].should.deep.equal([
            PropertyValueType.Object, true, true, BindingMode.OneWay, 'The currently selected row, or null after selection is cleared.',
        ]);
        descriptor.properties!.find(property => property.path === 'selectionMode')!.default!.should.equal('none');
    });
});
