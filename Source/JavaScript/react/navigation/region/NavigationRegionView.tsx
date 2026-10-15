// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { KeyboardEvent, MouseEvent, ReactNode, useContext, useMemo, useRef, useState } from 'react';
import { DestinationReference, NavigationRegionKind, parseIconReference } from '@cratis/scene.model';
import { ApplicationStructureIndex, EffectiveNavItem, EffectiveNavigationRegion, effectiveNavigation } from '@cratis/scene.engine';
import { SceneIcon } from '../../icons/SceneIcon';
import { useIconAdapters } from '../../icons/IconAdapterContext';
import { resolveDestination } from '../resolveDestination';
import { SceneNavigationContextInternal } from '../SceneNavigationContext';
import { NavigationRegionClassNames, defaultNavigationRegionClassNames } from './NavigationRegionClassNames';
import { SceneNavigationModel } from './SceneNavigationModel';
import { useSceneNavigationModel } from './SceneNavigationModelContext';
import { currentModuleOf } from './currentModuleOf';
import { navigationItemActive } from './navigationItemActive';
import { defaultScreenFor, navigationItemDestination } from './navigationItemDestination';

export interface NavigationRegionViewProps {
    /** Which region to show. */
    region: NavigationRegionKind;

    /**
     * The module to show the region of. When absent the region follows the module of the screen on the page, so
     * navigating to another module recomputes the effective items in place; outside every module it is the application's.
     */
    module?: string;

    /** Pins the region to the application level, whatever screen is on the page. */
    application?: boolean;

    /** What to resolve against; the {@link SceneNavigationModelProvider}'s when absent. */
    model?: SceneNavigationModel;

    /**
     * Which sub-items of a sidebar show: only those of the parents of the active item and of items the user expanded
     * (`active`, the default), or all of them (`all`) - a design layer wants the whole hierarchy.
     */
    expand?: 'active' | 'all';

    /** The accessible name of the `nav` landmark. */
    label?: string;

    /** The class names to put on the nodes. */
    classNames?: Partial<NavigationRegionClassNames>;

    /**
     * Draws an item's icon from its qualified reference. By default the icon is drawn through the adapters of the
     * enclosing `IconAdapterProvider`, or not at all without one.
     */
    renderIcon?(icon: string): ReactNode;

    /**
     * Content a host adds to an item after its title - Studio design mode draws the lock of an inherited item here; Stage
     * ignores it. The item carries `origin` and `readOnly`.
     */
    renderAdornment?(item: EffectiveNavItem): ReactNode;

    /** The href of an item's link, for opening it in a new tab; the hash route of the destination by default. */
    hrefFor?(destination: DestinationReference, url: string | undefined): string | undefined;

    /** Called after an item has been activated and the host has navigated. */
    onActivate?(item: EffectiveNavItem, destination: DestinationReference): void;
}

function itemKey(path: string[]): string {
    return path.join('/');
}

function containsActive(item: EffectiveNavItem, isActive: (item: EffectiveNavItem) => boolean): boolean {
    return isActive(item) || (item.children ?? []).some(child => containsActive(child, isActive));
}

/**
 * Renders the effective navigation of one region - a topbar or a sidebar - for the application or a module.
 *
 * - **Items** come from `effectiveNavigation`, so inherit/extend/override is already applied; nothing here re-implements
 *   it. A topbar is flat; a sidebar nests, collapses, and expands the parents of the active item.
 * - **Active state** follows what the navigation host shows: an item is active (`aria-current`, `data-active`) when the
 *   screen it opens is the one in its slot, so items rendering into different slots are active at once.
 * - **Activation** goes through the enclosing navigation host (`navigate`), which renders the target in the item's slot -
 *   the `outlet` of the destination; outside a host it announces `cratis.scene.navigate`.
 * - **Authorization**: `isVisible` of the model hides items, it does not disable them.
 * - **Keyboard**: arrows (left/right in a topbar, up/down in a sidebar), Home and End move between items; in a sidebar
 *   right expands and left collapses (or goes to the parent).
 *
 * Nothing here draws design chrome: items carry `data-read-only` and `data-origin` for a design layer to style.
 */
export function NavigationRegionView({ region, module, application = false, model: modelProp, label, expand = 'active', classNames, renderIcon, renderAdornment, hrefFor, onActivate }: NavigationRegionViewProps) {
    const contextModel = useSceneNavigationModel();
    const model = modelProp ?? contextModel;
    if (!model) throw new Error('NavigationRegionView needs a navigation model: pass `model` or render it inside a SceneNavigationModelProvider.');

    const navigation = useContext(SceneNavigationContextInternal);
    const adapters = useIconAdapters();
    const names = { ...defaultNavigationRegionClassNames, ...classNames };
    const index = useMemo(() => model.structure instanceof ApplicationStructureIndex ? model.structure : new ApplicationStructureIndex(model.structure), [model.structure]);
    const screenFor = model.screenFor ?? defaultScreenFor;

    const sidebar = region === NavigationRegionKind.Sidebar;
    const placement = useMemo(() => ({ primaryScreen: navigation?.primaryScreen, outlets: navigation?.outlets ?? {} }), [navigation?.outlets, navigation?.primaryScreen]);
    const scope = application ? undefined : module ?? currentModuleOf(index, placement.primaryScreen);
    const resolved: EffectiveNavigationRegion = useMemo(() => effectiveNavigation(index, model.navigation, scope, region), [index, model.navigation, scope, region]);

    const isActive = (item: EffectiveNavItem) => placement.primaryScreen !== undefined && navigationItemActive(item, { primaryScreen: placement.primaryScreen, outlets: placement.outlets }, screenFor, !sidebar);
    const isVisible = model.isVisible ?? (() => true);
    const visible = useMemo(() => {
        const keep = (items: EffectiveNavItem[]): EffectiveNavItem[] => items.filter(isVisible).map(item => item.children ? { ...item, children: keep(item.children) } : item);
        return keep(resolved.items);
    }, [resolved, model.isVisible]);

    const activeKey = JSON.stringify([placement.primaryScreen, placement.outlets, scope]);
    const [toggled, setToggled] = useState<{ key: string; state: Record<string, boolean> }>({ key: activeKey, state: {} });
    const overrides = toggled.key === activeKey ? toggled.state : {};
    const [focused, setFocused] = useState<string>();
    const root = useRef<HTMLElement>(null);

    const isExpanded = (item: EffectiveNavItem, key: string) => overrides[key] ?? (expand === 'all' || containsActive(item, isActive));
    const toggle = (key: string, expanded: boolean) => setToggled({ key: activeKey, state: { ...overrides, [key]: expanded } });

    const activate = (item: EffectiveNavItem) => {
        const destination = navigationItemDestination(item, screenFor);
        if (destination === undefined) return;
        if (navigation) {
            navigation.navigate(destination);
        } else {
            globalThis.dispatchEvent(new CustomEvent('cratis.scene.navigate', { detail: { targetScreen: destination.screen ?? '', destination, item } }));
        }

        onActivate?.(item, destination);
    };

    const links = () => Array.from(root.current?.querySelectorAll<HTMLElement>('[data-scene-nav-link]') ?? []);
    const focusLink = (element: HTMLElement | undefined) => {
        if (!element) return;
        setFocused(element.getAttribute('data-scene-nav-link') ?? undefined);
        element.focus();
    };

    const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
        const all = links();
        const position = all.findIndex(link => link === document.activeElement);
        if (position < 0) return;
        const next = sidebar ? 'ArrowDown' : 'ArrowRight';
        const previous = sidebar ? 'ArrowUp' : 'ArrowLeft';
        const current = all[position];
        const key = current.getAttribute('data-scene-nav-link')!;
        const owner = current.closest('[data-scene-nav-item]') as HTMLElement | null;
        const hasChildren = owner?.getAttribute('data-scene-nav-parent') === 'true';
        const expanded = owner?.getAttribute('data-expanded') === 'true';

        let target: HTMLElement | undefined;
        if (event.key === next) target = all[Math.min(position + 1, all.length - 1)];
        else if (event.key === previous) target = all[Math.max(position - 1, 0)];
        else if (event.key === 'Home') target = all[0];
        else if (event.key === 'End') target = all[all.length - 1];
        else if (sidebar && event.key === 'ArrowRight' && hasChildren) {
            if (!expanded) toggle(key, true);
            else target = all[position + 1];
        } else if (sidebar && event.key === 'ArrowLeft') {
            if (hasChildren && expanded) toggle(key, false);
            else {
                const parent = owner?.parentElement?.closest('[data-scene-nav-item]')?.querySelector<HTMLElement>(':scope > [data-scene-nav-link]');
                if (parent) target = parent;
            }
        } else return;

        event.preventDefault();
        focusLink(target);
    };

    const tabStop = focused ?? undefined;
    const firstActive = (items: EffectiveNavItem[], path: string[]): string | undefined => {
        for (const item of items) {
            const key = itemKey([...path, item.id]);
            if (isActive(item)) return key;
            const inner = firstActive(item.children ?? [], [...path, item.id]);
            if (inner !== undefined && isExpanded(item, key)) return inner;
        }

        return undefined;
    };
    const firstKey = visible.length > 0 ? itemKey([visible[0].id]) : undefined;
    const stop = tabStop ?? firstActive(visible, []) ?? firstKey;

    const icon = (item: EffectiveNavItem) => {
        if (item.icon === undefined) return null;
        const drawn = renderIcon ? renderIcon(item.icon) : adapters ? (() => {
            const reference = parseIconReference(item.icon!);
            return reference ? <SceneIcon reference={reference} adapters={adapters} /> : null;
        })() : null;
        return drawn === null ? null : <span className={names.icon} aria-hidden='true' data-scene-icon={item.icon}>{drawn}</span>;
    };

    const renderItems = (items: EffectiveNavItem[], path: string[], level: number): ReactNode => items.map(item => {
        const key = itemKey([...path, item.id]);
        const destination = navigationItemDestination(item, screenFor);
        const active = isActive(item);
        const children = item.children ?? [];
        const parent = sidebar && children.length > 0;
        const expanded = parent && isExpanded(item, key);
        const url = destination ? resolveDestination(destination).url : undefined;
        const href = destination ? (hrefFor ? hrefFor(destination, url) : url ? `#/${url}` : undefined) : undefined;
        const onClick = (event: MouseEvent) => {
            if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
            event.preventDefault();
            if (destination) activate(item);
            else if (parent) toggle(key, !expanded);
        };
        const content = <>
            {icon(item)}
            <span className={names.label}>{item.title}</span>
            {renderAdornment?.(item)}
        </>;

        return <li key={item.id} className={names.item} data-scene-nav-item={item.id} data-scene-nav-parent={parent ? 'true' : undefined}
            data-active={active} data-active-descendant={!active && parent && children.some(child => containsActive(child, isActive)) ? true : undefined} data-expanded={parent ? expanded : undefined} data-origin={item.origin} data-read-only={item.readOnly}
            data-slot={item.slot} data-level={level}>
            {destination || parent
                ? <a className={names.link} href={href ?? '#'} data-scene-nav-link={key} aria-current={active ? 'page' : undefined}
                    aria-expanded={parent && !destination ? expanded : undefined} tabIndex={key === stop ? 0 : -1}
                    onClick={onClick} onFocus={() => setFocused(key)}>{content}</a>
                : <span className={names.link} aria-disabled='true' data-scene-nav-link={key} tabIndex={-1}>{content}</span>}
            {parent && <button type='button' className={names.toggle} tabIndex={-1} aria-expanded={expanded} aria-controls={`${key}-items`}
                aria-label={`${expanded ? 'Collapse' : 'Expand'} ${item.title}`} onClick={() => toggle(key, !expanded)} />}
            {parent && expanded && <ul id={`${key}-items`} className={`${names.list} ${names.submenu}`}>{renderItems(children, [...path, item.id], level + 1)}</ul>}
        </li>;
    });

    return <nav ref={root} className={names.root} aria-label={label ?? (sidebar ? 'Sidebar' : 'Topbar')} data-scene-nav-region={region}
        data-scene-nav-sources={resolved.sources.kind} data-scene-nav-sources-label={resolved.sources.label} data-scene-nav-module={scope}
        data-scene-nav-mode={resolved.mode} onKeyDown={onKeyDown}>
        <ul className={names.list}>{renderItems(visible, [], 0)}</ul>
    </nav>;
}
