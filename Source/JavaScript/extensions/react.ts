// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { createContext, createElement, ReactElement, ReactNode, useContext, useEffect, useRef, useSyncExternalStore } from 'react';
import {
    ExtensionContext, ExtensionLocale, ExtensionProperties, ExtensionSettings, ExtensionTenant, ExtensionTheme, ExtensionUser,
    ExtensionValues, MountFactory
} from './ExtensionContext';

const ReactExtensionContext = createContext<ExtensionContext | undefined>(undefined);

/** Properties of {@link ExtensionContextProvider}. */
export interface ExtensionContextProviderProps {
    /** The context to give every component below. */
    context: ExtensionContext;
    children?: ReactNode;
}

/** Gives the components below it the extension context. The host renders one around each extension component. */
export function ExtensionContextProvider({ context, children }: ExtensionContextProviderProps): ReactElement {
    return createElement(ReactExtensionContext.Provider, { value: context }, children);
}

function useContextPart<TPart>(read: (context: ExtensionContext) => TPart): TPart {
    const context = useExtensionContextUnsubscribed();
    return useSyncExternalStore(listener => context.subscribe(() => listener()), () => read(context), () => read(context));
}

function useExtensionContextUnsubscribed(): ExtensionContext {
    const context = useContext(ReactExtensionContext);
    if (!context) {
        throw new Error('No extension context. Render the component inside an ExtensionContextProvider, or let the host mount it.');
    }
    return context;
}

/** The whole context. Re-renders when any part changes; prefer a focused hook when you need one part. */
export function useExtensionContext(): ExtensionContext {
    const context = useExtensionContextUnsubscribed();
    useSyncExternalStore(listener => context.subscribe(() => listener()), () => context.version, () => context.version);
    return context;
}

/** The signed-in user. */
export function useUser(): ExtensionUser { return useContextPart(context => context.user); }

/** The tenant. */
export function useTenant(): ExtensionTenant { return useContextPart(context => context.tenant); }

/** The language and time zone. */
export function useLocale(): ExtensionLocale { return useContextPart(context => context.locale); }

/** The active theme. */
export function useTheme(): ExtensionTheme { return useContextPart(context => context.theme); }

/** The system's public settings. */
export function useSettings(): ExtensionSettings { return useContextPart(context => context.settings); }

/** A function that answers the system's string for a key, or the key itself when there is none. */
export function useStrings(): (key: string) => string {
    const strings = useContextPart(context => context.strings);
    return key => strings[key] ?? key;
}

/** The function that invokes an ability through the host. Stable for the life of the context. */
export function useInvoke(): ExtensionContext['invoke'] {
    const context = useExtensionContextUnsubscribed();
    return context.invoke;
}

/** The function that raises a signal. Stable for the life of the context. */
export function useRaise(): ExtensionContext['raise'] {
    const context = useExtensionContextUnsubscribed();
    return context.raise;
}

/** Subscribes to one of the extension's triggers while the component is mounted. */
export function useTrigger(trigger: string, handler: (values: ExtensionValues) => void): void {
    const context = useExtensionContextUnsubscribed();
    const latest = useRef(handler);
    latest.current = handler;
    useEffect(() => context.on(trigger, values => latest.current(values)), [context, trigger]);
}

const noProperties: ExtensionProperties = {};

/** Properties of {@link MountedComponent}. */
export interface MountedComponentProps {
    /** The mount component to host. */
    mount: MountFactory;

    /** The properties to give it; changing them calls its `update`. */
    properties?: ExtensionProperties;

    /** The attributes of the host element, for sizing and layout. */
    className?: string;
}

/** Hosts a mount component inside a React tree. The component receives the ambient extension context. */
export function MountedComponent({ mount, properties = noProperties, className }: MountedComponentProps): ReactElement {
    const context = useExtensionContextUnsubscribed();
    const hostRef = useRef<HTMLDivElement>(null);
    const instanceRef = useRef<ReturnType<MountFactory>>(undefined);
    const appliedRef = useRef<ExtensionProperties>(undefined);
    const propertiesRef = useRef(properties);
    propertiesRef.current = properties;

    useEffect(() => {
        const instance = mount(hostRef.current!, propertiesRef.current, context);
        instanceRef.current = instance;
        appliedRef.current = propertiesRef.current;
        return () => {
            instance.unmount();
            instanceRef.current = undefined;
        };
    }, [mount, context]);

    useEffect(() => {
        if (instanceRef.current && appliedRef.current !== properties) {
            appliedRef.current = properties;
            instanceRef.current.update(properties);
        }
    }, [properties]);

    return createElement('div', { ref: hostRef, className, 'data-extension-mount': '' });
}

/** Properties of {@link ExtensionSlot}. */
export interface ExtensionSlotProps {
    /** The slot to render. */
    name: string;
    className?: string;
}

/** Renders Scene content placed in a named slot, from a React component. */
export function ExtensionSlot({ name, className }: ExtensionSlotProps): ReactElement {
    const context = useExtensionContextUnsubscribed();
    const hostRef = useRef<HTMLDivElement>(null);
    useEffect(() => context.renderSlot(hostRef.current!, name), [context, name]);
    return createElement('div', { ref: hostRef, className, 'data-extension-slot-host': name });
}
