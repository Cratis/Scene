// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import {
    ExtensionContext, ExtensionContextPart, ExtensionDisposer, ExtensionLocale, ExtensionSettings, ExtensionStrings,
    ExtensionTenant, ExtensionTheme, ExtensionUser, ExtensionValues
} from './ExtensionContext';

/** What a host hands {@link createExtensionContext}: the parts, and how the context reaches the host's services. */
export interface ExtensionContextInit {
    user?: ExtensionUser;
    tenant?: ExtensionTenant;
    locale?: ExtensionLocale;
    theme?: ExtensionTheme;
    settings?: ExtensionSettings;
    strings?: ExtensionStrings;

    /** Performs an invocation. Defaults to refusing, so a missing host service is loud. */
    invoke?: (ability: string, inputs: ExtensionValues) => Promise<ExtensionValues>;

    /** Delivers a raised signal to the screen. Defaults to doing nothing. */
    raise?: (signal: string, values: ExtensionValues) => void;

    /** Renders a named slot into a host element. Defaults to an empty element marked `data-extension-slot`. */
    renderSlot?: (host: HTMLElement, slotName: string) => ExtensionDisposer;
}

/** A context together with the means to change it and to deliver triggers to it. Hosts and previews hold this. */
export interface ExtensionContextController {
    /** The context components receive. */
    readonly context: ExtensionContext;

    /** Replaces parts of the context and notifies subscribers of each part that changed. */
    update(changes: Partial<Pick<ExtensionContextInit, 'user' | 'tenant' | 'locale' | 'theme' | 'settings' | 'strings'>>): void;

    /** Delivers a trigger occurrence to everything subscribed with `context.on`. */
    trigger(name: string, values?: ExtensionValues): void;

    /** How many context-change and trigger subscriptions are open; a component that unmounted cleanly leaves none. */
    readonly subscriberCount: number;
}

const signedOut: ExtensionUser = { id: '', name: '', roles: [], signedIn: false };
const defaultTenant: ExtensionTenant = { id: '' };
const defaultLocale: ExtensionLocale = { language: 'en', availableLanguages: ['en'], timeZone: 'UTC' };
const defaultTheme: ExtensionTheme = { colorScheme: 'light', tokens: {} };

/**
 * Creates an {@link ExtensionContext} whose parts can be replaced with change notification. Stage, Studio and
 * previews build their context with it; so do specs and the conformance kit.
 */
export function createExtensionContext(init: ExtensionContextInit = {}): ExtensionContextController {
    let user = init.user ?? signedOut;
    let tenant = init.tenant ?? defaultTenant;
    let locale = init.locale ?? defaultLocale;
    let theme = init.theme ?? defaultTheme;
    let settings = init.settings ?? {};
    let strings = init.strings ?? {};
    let version = 0;
    const listeners = new Set<(part: ExtensionContextPart) => void>();
    const triggerHandlers = new Map<string, Set<(values: ExtensionValues) => void>>();

    const context: ExtensionContext = {
        get user() { return user; },
        get tenant() { return tenant; },
        get locale() { return locale; },
        get theme() { return theme; },
        get settings() { return settings; },
        get strings() { return strings; },
        get version() { return version; },
        invoke: (ability, inputs = {}) => init.invoke
            ? init.invoke(ability, inputs)
            : Promise.reject(new Error(`The host provides no invoke; cannot invoke '${ability}'.`)),
        raise: (signal, values = {}) => init.raise?.(signal, values),
        on: (trigger, handler) => {
            const handlers = triggerHandlers.get(trigger) ?? new Set();
            handlers.add(handler);
            triggerHandlers.set(trigger, handlers);
            return () => {
                handlers.delete(handler);
                if (handlers.size === 0) {
                    triggerHandlers.delete(trigger);
                }
            };
        },
        subscribe: listener => {
            listeners.add(listener);
            return () => { listeners.delete(listener); };
        },
        renderSlot: (host, slotName) => {
            if (init.renderSlot) {
                return init.renderSlot(host, slotName);
            }
            const placeholder = host.ownerDocument.createElement('div');
            placeholder.setAttribute('data-extension-slot', slotName);
            host.appendChild(placeholder);
            return () => { placeholder.remove(); };
        }
    };

    const changed = (part: ExtensionContextPart) => {
        version++;
        for (const listener of [...listeners]) {
            listener(part);
        }
    };

    return {
        context,
        update: changes => {
            if (changes.user && changes.user !== user) { user = changes.user; changed('user'); }
            if (changes.tenant && changes.tenant !== tenant) { tenant = changes.tenant; changed('tenant'); }
            if (changes.locale && changes.locale !== locale) { locale = changes.locale; changed('locale'); }
            if (changes.theme && changes.theme !== theme) { theme = changes.theme; changed('theme'); }
            if (changes.settings && changes.settings !== settings) { settings = changes.settings; changed('settings'); }
            if (changes.strings && changes.strings !== strings) { strings = changes.strings; changed('strings'); }
        },
        trigger: (name, values = {}) => {
            for (const handler of [...(triggerHandlers.get(name) ?? [])]) {
                handler(values);
            }
        },
        get subscriberCount() {
            let count = listeners.size;
            for (const handlers of triggerHandlers.values()) {
                count += handlers.size;
            }
            return count;
        }
    };
}
