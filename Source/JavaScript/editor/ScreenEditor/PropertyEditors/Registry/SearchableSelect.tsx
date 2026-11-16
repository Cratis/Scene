// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Fragment, useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';

export interface SelectOption {
    value: string;
    label: string;

    // The heading the option is listed under (Module > Feature); options without one come first.
    group?: string;

    // An option that is listed but cannot be chosen, with the reason shown beside it.
    disabled?: boolean;
    reason?: string;

    // The heading of the section the option is listed in, ahead of its group: a list can have the choosable options first and, below another heading, those that
    // cannot be chosen (the slice picker). Sections keep the order they first appear in.
    section?: string;

    // What the row says at its right edge - the module of a slice, the kind of one that cannot be chosen - when it is not the reason.
    trailing?: string;
}

// The options a filter text leaves: those whose label or group contains it, case-insensitively; all of them for an empty filter.
export function filterOptions(options: readonly SelectOption[], query: string): SelectOption[] {
    const needle = query.trim().toLowerCase();
    return options.filter(option => needle === '' || option.label.toLowerCase().includes(needle) || (option.group ?? '').toLowerCase().includes(needle));
}

export interface SearchableSelectProps {
    id: string;
    options: readonly SelectOption[];
    value: string | undefined;
    onChange: (value: string | undefined) => void;
    disabled?: boolean;
    invalid?: boolean;
    placeholder: string;
    searchLabel: string;
    emptyLabel: string;
    clearLabel: string;
    // Drawn open in place, always: no control to open first, and no search box unless the list is long. For a choice that is the whole of a popover.
    inline?: boolean;

    // Whether the value can be put back to nothing.
    clearable?: boolean;

    // What the closed control shows for the chosen option; the label by default.
    renderClosed?: (option: SelectOption | undefined) => ReactNode;
    'aria-labelledby'?: string;
    'aria-describedby'?: string;
}

// A dropdown with a filter: the one control every "choose one of these" editor draws, so choosing a target, a slice, a field or a
// reference looks and works alike. Up and Down move through what can be chosen, Enter chooses, Escape closes.
export const SearchableSelect = ({ id, options, value, onChange, disabled, invalid, placeholder, searchLabel, emptyLabel, clearLabel, clearable, renderClosed, inline, ...aria }: SearchableSelectProps) => {
    const [openState, setOpen] = useState(false);
    const open = inline === true || openState;
    const [query, setQuery] = useState('');
    const [active, setActive] = useState(0);
    const listId = useId();
    const root = useRef<HTMLDivElement>(null);

    const chosen = options.find(option => option.value === value);
    const shown = useMemo(() => filterOptions(options, query), [options, query]);
    const selectable = shown.filter(option => option.disabled !== true);

    const close = () => { if (inline !== true) setOpen(false); setQuery(''); };
    const choose = (option: SelectOption) => {
        if (option.disabled) return;
        onChange(option.value);
        close();
    };

    const onKeyDown = (event: KeyboardEvent) => {
        // Drawn open in place there is nothing to close, so Escape is left to the popover or dialog the list is the whole of.
        if (event.key === 'Escape') { if (inline === true) return; event.stopPropagation(); close(); return; }
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            if (selectable.length === 0) return;
            setActive(index => (index + (event.key === 'ArrowDown' ? 1 : -1) + selectable.length) % selectable.length);
        } else if (event.key === 'Enter') {
            event.preventDefault();
            const option = selectable[Math.min(active, selectable.length - 1)];
            if (option) choose(option);
        }
    };

    // Options are listed under their section's heading and then their group's, ungrouped ones first, in the order they were given. With sections, the group is not a
    // heading of its own but a sub-heading inside the section - the module and feature the options sit in (TB3) - and what the search matches.
    const sectioned = shown.some(option => option.section !== undefined);
    const headingOf = (option: SelectOption) => sectioned ? option.section ?? '' : option.group ?? '';
    const groups = [...new Set(shown.map(headingOf))].sort((a, b) => sectioned ? 0 : (a === '' ? -1 : b === '' ? 1 : 0));
    const activeValue = selectable[Math.min(active, Math.max(selectable.length - 1, 0))]?.value;

    return (
        <div ref={root} className='studio-editor-select' onKeyDown={open ? onKeyDown : undefined} onBlur={event => { if (!root.current?.contains(event.relatedTarget)) close(); }}>
            {inline !== true && <button
                type='button' id={id} role='combobox' aria-haspopup='listbox' aria-expanded={open} aria-controls={open ? listId : undefined} aria-invalid={invalid || undefined}
                className='studio-editor-select__trigger' disabled={disabled} {...aria}
                onClick={() => { setOpen(!open); setActive(0); }}>
                {renderClosed ? renderClosed(chosen) : <span className={chosen ? undefined : 'studio-editor-select__placeholder'}>{chosen?.label ?? placeholder}</span>}
            </button>}
            {clearable === true && value !== undefined && !disabled && (
                <button type='button' className='studio-editor-select__clear' aria-label={clearLabel} onClick={() => onChange(undefined)}>×</button>
            )}
            {open && (
                <div className={`studio-editor-select__panel${inline === true ? ' studio-editor-select__panel--inline' : ''}`}>
                    {(inline !== true || options.length > 10) && <input type='search' autoFocus className='studio-editor-select__search' aria-label={searchLabel} placeholder={searchLabel} value={query} onChange={event => { setQuery(event.target.value); setActive(0); }} />}
                    <ul id={listId} role='listbox' aria-labelledby={aria['aria-labelledby']} className='studio-editor-select__options'>
                        {shown.length === 0 && <li className='studio-editor-select__empty'>{emptyLabel}</li>}
                        {groups.map(group => (
                            <li key={group} role='presentation'>
                                {group !== '' && <div className='studio-editor-select__group'>{group}</div>}
                                <ul role='presentation'>
                                    {shown.filter(option => headingOf(option) === group).map((option, position, inSection) => (
                                        <Fragment key={option.value}>
                                        {sectioned && option.group && (position === 0 || inSection[position - 1].group !== option.group) && (
                                            <li role='presentation' className='studio-editor-select__subgroup'>{option.group}</li>
                                        )}
                                        <li
                                            role='option' aria-selected={option.value === value} aria-disabled={option.disabled || undefined}
                                            className={['studio-editor-select__option', option.value === activeValue ? 'studio-editor-select__option--active' : '', option.value === value ? 'studio-editor-select__option--chosen' : ''].join(' ').trim()}
                                            title={option.reason ?? (option.group ? option.group : undefined)}
                                            onMouseDown={event => event.preventDefault()}
                                            onClick={() => choose(option)}>
                                            <span>{option.label}</span>
                                            {option.trailing !== undefined ? <small>{option.trailing}</small> : option.disabled && option.reason && <small>{option.reason}</small>}
                                        </li>
                                        </Fragment>
                                    ))}
                                </ul>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};
