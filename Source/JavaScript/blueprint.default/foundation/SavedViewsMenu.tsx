// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { KeyboardEvent, useEffect, useId, useMemo, useRef, useState } from 'react';
import { RegisteredComponentProps, useValueOutput } from '@cratis/scene.react';
import { ComponentState, readComponentState } from './ComponentState';
import { FoundationIcon } from './FoundationIcon';
import { readFoundationStrings } from './foundationStrings';
import { PermissionRule, readPermissionRule } from './PermissionRule';
import { FoundationFrame } from './StateFrame';
import { readOptionalString } from '../shell/elementProperties';
import { readViews } from './viewModel';

/** The output a menu action is published under: `save` or `manage`, which the host acts on. */
export const savedViewActionOutput = 'action';

/**
 * The `savedViewsMenu` component: a list's saved views as a menu button, with the current view as its label.
 *
 * `views` are the choices (id, label, description) and `activeView` the one in force. Choosing a view publishes its id as the `value`
 * output and runs the behaviors attached to the element, so a screen binds its query to the view. The menu follows the ARIA menu
 * pattern: arrows, Home and End move, Enter chooses, Escape closes and returns focus to the button. "Save current view" and
 * "Manage views" publish `save` or `manage` on the `action` output, and each honours its own permission rule (`savePermission`,
 * `managePermission`): hidden, or disabled with the reason.
 */
export function SavedViewsMenu({ element, interactions, bindingOutputs }: RegisteredComponentProps) {
    const views = useMemo(() => readViews(element.properties.views), [element.properties.views]);
    const suppliedActive = readOptionalString(element, 'activeView') ?? views[0]?.id;
    const [active, setActive] = useState<string | undefined>(suppliedActive);
    const [open, setOpen] = useState(false);
    const strings = readFoundationStrings(element);
    const state = readComponentState(element, views.length > 0);
    const menuId = useId();
    const button = useRef<HTMLButtonElement>(null);
    const menu = useRef<HTMLDivElement>(null);
    const rules = { save: readPermissionRule(element, 'savePermission'), manage: readPermissionRule(element, 'managePermission') };

    useEffect(() => setActive(suppliedActive), [suppliedActive]);
    useValueOutput(bindingOutputs, active);
    useEffect(() => { if (open) menu.current?.querySelector<HTMLElement>('[role^="menuitem"]:not([aria-disabled="true"])')?.focus(); }, [open]);

    const items = () => Array.from(menu.current?.querySelectorAll<HTMLElement>('[role^="menuitem"]:not([aria-disabled="true"])') ?? []);
    const move = (event: KeyboardEvent) => {
        const entries = items();
        const index = entries.indexOf(document.activeElement as HTMLElement);
        const target = event.key === 'ArrowDown' ? (index + 1) % entries.length : event.key === 'ArrowUp' ? (index - 1 + entries.length) % entries.length
            : event.key === 'Home' ? 0 : event.key === 'End' ? entries.length - 1 : -1;

        if (target >= 0) { event.preventDefault(); entries[target]?.focus(); }
        if (event.key === 'Escape') { setOpen(false); button.current?.focus(); }
        if (event.key === 'Tab') setOpen(false);
    };
    const choose = (id: string) => { setActive(id); setOpen(false); button.current?.focus(); interactions?.onSelect?.(); };
    const run = (action: 'save' | 'manage') => { bindingOutputs?.setOutput(savedViewActionOutput, action); setOpen(false); button.current?.focus(); interactions?.onClick?.({ stopPropagation: () => undefined }); };
    const label = views.find(view => view.id === active)?.label ?? strings.viewsDefault;

    return (
        <FoundationFrame element={element} interactions={interactions} name='saved-views' state={state} skeleton={[45]}>
            {state !== ComponentState.Loading && (
                <div className='foundation-popover-host'>
                    <button ref={button} type='button' className='foundation-button' data-emphasis='secondary' aria-haspopup='menu' aria-expanded={open} aria-controls={menuId}
                        onClick={() => setOpen(!open)} onKeyDown={event => { if (event.key === 'ArrowDown' && !open) { event.preventDefault(); setOpen(true); } }}>
                        <span className='foundation-visually-hidden'>{`${strings.viewsLabel}: `}</span>
                        <span>{label}</span>
                        <FoundationIcon name='chevron-down' />
                    </button>
                    <div id={menuId} ref={menu} className='foundation-popover' role='menu' aria-label={strings.viewsLabel} hidden={!open} onKeyDown={move}>
                        {views.length === 0 && <span className='foundation-count'>{strings.viewsNone}</span>}
                        {views.map(view => (
                            <button key={view.id} type='button' role='menuitemradio' aria-checked={view.id === active} className='foundation-menu-item' tabIndex={-1} onClick={() => choose(view.id)}>
                                <span className='foundation-menu-check'>{view.id === active && <FoundationIcon name='check' />}</span>
                                <span>{view.label}</span>
                                {view.description && <span className='foundation-count'>{view.description}</span>}
                            </button>
                        ))}
                        {(rules.save !== PermissionRule.Hidden || rules.manage !== PermissionRule.Hidden) && <hr className='foundation-separator' />}
                        {rules.save !== PermissionRule.Hidden && (
                            <button type='button' role='menuitem' className='foundation-menu-item' tabIndex={-1} aria-disabled={rules.save === PermissionRule.Disabled || undefined}
                                title={rules.save === PermissionRule.Disabled ? strings.disabledNoPermission : undefined} onClick={rules.save === PermissionRule.Enabled ? () => run('save') : undefined}>
                                <span className='foundation-menu-check' /><span>{strings.viewsSave}</span>
                            </button>
                        )}
                        {rules.manage !== PermissionRule.Hidden && (
                            <button type='button' role='menuitem' className='foundation-menu-item' tabIndex={-1} aria-disabled={rules.manage === PermissionRule.Disabled || undefined}
                                title={rules.manage === PermissionRule.Disabled ? strings.disabledNoPermission : undefined} onClick={rules.manage === PermissionRule.Enabled ? () => run('manage') : undefined}>
                                <span className='foundation-menu-check' /><span>{strings.viewsManage}</span>
                            </button>
                        )}
                    </div>
                </div>
            )}
        </FoundationFrame>
    );
}
