// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ActionDispatcher } from '@cratis/scene.engine';
import { ExternalComponent, GuardOperator, GuardedActionFallbackOutcome } from '@cratis/scene.model';
import { CoreGuardedAction } from '../CoreGuardedAction';
import { InteractionScope } from '../../interactions';
import { RenderBindingScopeProvider } from '../../renderer/RenderBindingScopeContext';

const dispatcher = {
    executeCommand: vi.fn<ActionDispatcher['executeCommand']>(), navigate: vi.fn(), navigateBack: vi.fn(),
    openDialog: vi.fn(), closeDialog: vi.fn(), refreshQuery: vi.fn(), setState: vi.fn(), notify: vi.fn(), confirm: vi.fn(), raise: vi.fn(),
} satisfies ActionDispatcher;

function draw(tags: unknown, strict = true, nested = false) {
    const element = { id: 'approve', componentName: 'core:guarded-action', properties: {
        label: 'Approve', alternatives: [{ command: 'Approve', condition: {
            kind: 'comparison', left: { subject: 'item.tags' }, operator: GuardOperator.Contains, right: 'approved',
        } }], otherwise: { outcome: GuardedActionFallbackOutcome.Execute, command: 'Review' },
    }, slots: {} } as unknown as ExternalComponent;
    const item = { tags };
    const button = <RenderBindingScopeProvider dataContext={item}><CoreGuardedAction element={element} slots={{}} /></RenderBindingScopeProvider>;
    render(<InteractionScope dispatcher={dispatcher} attachments={[]} context={{ resolve: () => undefined, guards: strict ? { strictOperands: true } : undefined }}>
        {nested ? <InteractionScope dispatcher={dispatcher} attachments={[]}>{button}</InteractionScope> : button}
    </InteractionScope>);
    return item;
}

beforeEach(() => {
    vi.clearAllMocks();
    dispatcher.executeCommand.mockResolvedValue({ isSuccess: true });
});

describe('when enforcing string-only contains in guarded actions', () => {
    for (const nested of [false, true]) {
        it(`should disable array operands without running otherwise with nested scope ${nested}`, () => {
            draw(['approved'], true, nested);
            expect((screen.getByRole('button') as HTMLButtonElement).disabled).toBe(true);
            expect(screen.getByRole('alert').textContent).toContain('SCENE-GUARD-001');
            fireEvent.click(screen.getByRole('button'));
            expect(dispatcher.executeCommand).not.toHaveBeenCalled();
        });
    }
    for (const entry of [{ tags: 'approved', strict: true }, { tags: ['approved'], strict: false }]) {
        it(`should execute a matching operand with strict mode ${entry.strict}`, async () => {
            draw(entry.tags, entry.strict);
            fireEvent.click(screen.getByRole('button'));
            await waitFor(() => expect(dispatcher.executeCommand).toHaveBeenCalledExactlyOnceWith('Approve', { item: { tags: entry.tags } }));
        });
    }
    for (const tags of [null, undefined]) {
        it(`should execute the fallback for the null or missing field ${tags}`, async () => {
            draw(tags);
            const button = screen.getByRole('button') as HTMLButtonElement;
            expect(button.disabled).toBe(false);
            expect(screen.queryByRole('alert')).toBeNull();
            fireEvent.click(button);
            await waitFor(() => expect(dispatcher.executeCommand).toHaveBeenCalledExactlyOnceWith('Review', { item: { tags } }));
        });
    }
    it('should re-check operand types at click time', () => {
        const item = draw('approved');
        const button = screen.getByRole('button') as HTMLButtonElement;
        expect(button.disabled).toBe(false);
        item.tags = ['approved'];
        fireEvent.click(button);
        expect(dispatcher.executeCommand).not.toHaveBeenCalled();
        expect(button.disabled).toBe(true);
        expect(screen.getByRole('alert').textContent).toContain('SCENE-GUARD-001');
    });
});
