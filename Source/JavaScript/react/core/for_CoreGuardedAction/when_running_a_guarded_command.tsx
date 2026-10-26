// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ActionDispatcher, CommandOutcome } from '@cratis/scene.engine';
import { ExternalComponent, GuardOperator, GuardedActionFallbackOutcome } from '@cratis/scene.model';
import { CoreGuardedAction } from '../CoreGuardedAction';
import { CoreAction } from '../ScreenplayCoreComponents';
import { InteractionScope } from '../../interactions';
import { RenderBindingScopeProvider } from '../../renderer/RenderBindingScopeContext';

const guard = { kind: 'comparison', left: { subject: 'item.status' }, operator: GuardOperator.Equal, right: 'Pending' };
const alternatives = [{ command: 'Approve', condition: guard, arguments: { orderId: { subject: 'item.id' } } }];
const item = { id: 42, status: 'Pending', internalValue: 'not-an-argument' };
const dispatcher = {
    executeCommand: vi.fn<ActionDispatcher['executeCommand']>(), navigate: vi.fn(), navigateBack: vi.fn(),
    openDialog: vi.fn(), closeDialog: vi.fn(), refreshQuery: vi.fn(), setState: vi.fn(), notify: vi.fn(), confirm: vi.fn(), raise: vi.fn(),
} satisfies ActionDispatcher;

function draw(properties: Record<string, unknown> = {}, subject: unknown = item, stage = false, scoped = true) {
    const element = { id: 'approve', componentName: stage ? 'core:action' : 'core:guarded-action', properties: { label: 'Approve', alternatives, ...properties }, slots: {} } as unknown as ExternalComponent;
    const Component = stage ? CoreAction : CoreGuardedAction;
    const content = (dataContext: unknown) => {
        const button = <RenderBindingScopeProvider dataContext={dataContext}><Component element={element} slots={{}} /></RenderBindingScopeProvider>;
        return scoped ? <InteractionScope dispatcher={dispatcher} attachments={[]}>{button}</InteractionScope> : button;
    };
    const rendered = render(content(subject));
    return { ...rendered, changeSubject: (next: unknown) => rendered.rerender(content(next)) };
}

beforeEach(() => {
    vi.clearAllMocks();
    dispatcher.executeCommand.mockResolvedValue({ isSuccess: true });
});

describe('when running a guarded command', () => {
    it('should re-evaluate when the live subject changes', () => {
        const view = draw({}, { ...item, status: 'Approved' });
        expect(screen.queryByRole('button')).toBeNull();
        view.changeSubject(item);
        expect(screen.getByRole('button')).toBeTruthy();
        view.changeSubject(null);
        expect(screen.queryByRole('button')).toBeNull();
    });
    it('should run only the first matching alternative', async () => {
        draw({ alternatives: [...alternatives, { command: 'Never', condition: guard }] });
        fireEvent.click(screen.getByRole('button'));
        await waitFor(() => expect(dispatcher.executeCommand).toHaveBeenCalledExactlyOnceWith('Approve', { item, orderId: 42 }));
    });
    it('should submit explicit arguments with the item and navigate only after success', async () => {
        draw({ navigateToScreen: 'details', navigateByParameter: 'id' });
        fireEvent.click(screen.getByRole('button'));
        await waitFor(() => expect(dispatcher.navigate).toHaveBeenCalledWith('details', { id: 42 }));
        expect(dispatcher.executeCommand).toHaveBeenCalledExactlyOnceWith('Approve', { item, orderId: 42 });
    });
    it('should map the Stage core:action shape to guarded execution', async () => {
        draw({}, item, true);
        fireEvent.click(screen.getByRole('button'));
        await waitFor(() => expect(dispatcher.executeCommand).toHaveBeenCalledExactlyOnceWith('Approve', { item, orderId: 42 }));
    });
    it('should hide an unmatched action without an executable fallback', () => {
        draw({}, { ...item, status: 'Approved' });
        expect(screen.queryByRole('button')).toBeNull();
    });
    it('should hide the action without a subject even when otherwise executes', () => {
        draw({ otherwise: { outcome: GuardedActionFallbackOutcome.Execute, command: 'Fallback' } }, null);
        expect(screen.queryByRole('button')).toBeNull();
        expect(dispatcher.executeCommand).not.toHaveBeenCalled();
    });
    it('should execute an explicit fallback', async () => {
        draw({ otherwise: { outcome: GuardedActionFallbackOutcome.Execute, command: 'Fallback', arguments: { id: { subject: 'item.id' } } } }, { ...item, status: 'Approved' });
        fireEvent.click(screen.getByRole('button'));
        await waitFor(() => expect(dispatcher.executeCommand).toHaveBeenCalledExactlyOnceWith('Fallback', { item: { ...item, status: 'Approved' }, id: 42 }));
    });
    it('should refuse legacy string guards and not execute otherwise', () => {
        draw({ alternatives: [{ command: 'Never', guard: 'item.status == Pending' }], otherwise: { outcome: GuardedActionFallbackOutcome.Execute, command: 'Fallback' } });
        const button = screen.getByRole('button') as HTMLButtonElement;
        expect(button.disabled).toBe(true);
        expect(screen.getByRole('alert').textContent).toContain('SCENE-GUARD-001');
        fireEvent.click(button);
        expect(dispatcher.executeCommand).not.toHaveBeenCalled();
    });
    it('should prevent repeated clicks while a command is pending', async () => {
        let complete!: (outcome: CommandOutcome) => void;
        dispatcher.executeCommand.mockReturnValue(new Promise(resolve => { complete = resolve; }));
        draw();
        const button = screen.getByRole('button') as HTMLButtonElement;
        fireEvent.click(button);
        fireEvent.click(button);
        expect(button.disabled).toBe(true);
        expect(dispatcher.executeCommand).toHaveBeenCalledTimes(1);
        complete({ isSuccess: true });
        await waitFor(() => expect(button.disabled).toBe(false));
    });
    it('should show failure and never navigate or fall through', async () => {
        dispatcher.executeCommand.mockResolvedValue({ isSuccess: false });
        draw({ navigateToScreen: 'details', otherwise: { outcome: GuardedActionFallbackOutcome.Execute, command: 'Fallback' } });
        fireEvent.click(screen.getByRole('button'));
        await screen.findByRole('alert');
        expect(dispatcher.navigate).not.toHaveBeenCalled();
        expect(dispatcher.executeCommand).toHaveBeenCalledTimes(1);
    });
    it('should dispatch the host-neutral event when no interaction scope is present', () => {
        const listener = vi.fn();
        window.addEventListener('cratis.scene.command', listener, { once: true });
        draw({ navigateToScreen: 'details', navigateByParameter: 'id' }, item, false, false);
        fireEvent.click(screen.getByRole('button'));
        expect(listener).toHaveBeenCalledTimes(1);
        const detail = (listener.mock.calls[0][0] as CustomEvent).detail;
        expect(detail).toMatchObject({ command: 'Approve', arguments: { orderId: 42 }, item, navigateToScreen: 'details', navigateByParameter: 'id' });
        expect(dispatcher.navigate).not.toHaveBeenCalled();
    });
    it('should re-select at click time and not execute a stale choice', () => {
        const mutable = { ...item };
        draw({}, mutable);
        mutable.status = 'Approved';
        fireEvent.click(screen.getByRole('button'));
        expect(dispatcher.executeCommand).not.toHaveBeenCalled();
        expect(screen.queryByRole('button')).toBeNull();
    });
    it('should accept an item already resolved by the renderer', async () => {
        draw({ item });
        fireEvent.click(screen.getByRole('button'));
        await waitFor(() => expect(dispatcher.executeCommand).toHaveBeenCalledExactlyOnceWith('Approve', { item, orderId: 42 }));
    });
    it('should end the wait and display thrown command failures', async () => {
        dispatcher.executeCommand.mockRejectedValue(new Error('Unavailable'));
        draw();
        fireEvent.click(screen.getByRole('button'));
        expect((await screen.findByRole('alert')).textContent).toBe('Unavailable');
        expect((screen.getByRole('button') as HTMLButtonElement).disabled).toBe(false);
    });
    it('should refuse unresolved explicit arguments', async () => {
        draw({ alternatives: [{ command: 'Never', condition: guard, arguments: { id: { subject: 'item.missing' } } }] });
        fireEvent.click(screen.getByRole('button'));
        await screen.findByRole('alert');
        expect(dispatcher.executeCommand).not.toHaveBeenCalled();
    });
});
