// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * A platform an extension component can run on. React components are web-only; a `mount` component declares the
 * platforms its factory supports. Open-ended so a host can add a platform without a contract release.
 */
export type ExtensionPlatform = 'web' | 'desktop' | 'ios' | 'android' | (string & {});

/** The platform every React component runs on, and the default for a component that declares none. */
export const webPlatform: ExtensionPlatform = 'web';

/** The values a component is given, keyed by the contract's typed `property` names. */
export type ExtensionProperties = Readonly<Record<string, unknown>>;

/** The signed-in user, as the host knows them. */
export interface ExtensionUser {
    /** The user's identifier, empty when nobody is signed in. */
    readonly id: string;

    /** The user's display name, empty when nobody is signed in. */
    readonly name: string;

    /** The roles the user holds. */
    readonly roles: readonly string[];

    /** Whether somebody is signed in. */
    readonly signedIn: boolean;
}

/** The tenant the extension runs for. */
export interface ExtensionTenant {
    /** The tenant's identifier. */
    readonly id: string;

    /** The tenant's display name. */
    readonly name?: string;
}

/** The language and time zone the user works in. */
export interface ExtensionLocale {
    /** The active language tag, for example `nb-NO`. */
    readonly language: string;

    /** Every language the system offers. */
    readonly availableLanguages: readonly string[];

    /** The IANA time zone, for example `Europe/Oslo`. */
    readonly timeZone: string;
}

/** The active theme. Components style themselves from the tokens, never from hard-coded values. */
export interface ExtensionTheme {
    /** Whether the active theme is light or dark. */
    readonly colorScheme: 'light' | 'dark';

    /** The theme's design tokens by name, for example `--cratis-color-accent`. */
    readonly tokens: Readonly<Record<string, string>>;
}

/** The system's public settings by name. Secret settings never appear here. */
export type ExtensionSettings = Readonly<Record<string, unknown>>;

/** The system's strings by key, already resolved for the active language. */
export type ExtensionStrings = Readonly<Record<string, string>>;

/** The values passed to an ability, or carried by a signal, by name. */
export type ExtensionValues = Readonly<Record<string, unknown>>;

/** Undoes a subscription or a rendering. Safe to call more than once. */
export type ExtensionDisposer = () => void;

/** What changed in an {@link ExtensionContext}. */
export type ExtensionContextPart = 'user' | 'tenant' | 'locale' | 'theme' | 'settings' | 'strings';

/**
 * The agreed context every extension component receives, whatever it is built with. Reading a part always returns the
 * current value; {@link subscribe} says when one changed. A part keeps its identity until it changes.
 */
export interface ExtensionContext {
    /** The signed-in user. */
    readonly user: ExtensionUser;

    /** The tenant. */
    readonly tenant: ExtensionTenant;

    /** The language and time zone. */
    readonly locale: ExtensionLocale;

    /** The active theme. */
    readonly theme: ExtensionTheme;

    /** The system's public settings. */
    readonly settings: ExtensionSettings;

    /** The system's strings for the active language. */
    readonly strings: ExtensionStrings;

    /** Increases by one every time any part changes; lets a consumer detect change cheaply. */
    readonly version: number;

    /**
     * Invokes one of the extension's abilities through the host and answers with its returned values. Request and
     * response; the host applies the contract's allowlist and the screen's authorization.
     */
    invoke(ability: string, inputs?: ExtensionValues): Promise<ExtensionValues>;

    /** Raises a signal the contract declares, which the screen's `on <signal>` interaction handles. */
    raise(signal: string, values?: ExtensionValues): void;

    /** Subscribes to one of the extension's triggers. */
    on(trigger: string, handler: (values: ExtensionValues) => void): ExtensionDisposer;

    /** Subscribes to context changes. */
    subscribe(listener: (part: ExtensionContextPart) => void): ExtensionDisposer;

    /**
     * Renders the Scene content placed in a named slot into a host element, so a `mount` component can host Scene
     * components. The returned function removes the content.
     */
    renderSlot(host: HTMLElement, slotName: string): ExtensionDisposer;
}

/** What a mounted component answers with. */
export interface MountedInstance {
    /** Gives the component new property values; called whenever a bound property changes. */
    update(properties: ExtensionProperties): void;

    /** Removes everything the component put on the page and releases what it subscribed to. */
    unmount(): void;
}

/** The framework-neutral component kind: draws into a host element, whatever it is built with. */
export type MountFactory = (host: HTMLElement, properties: ExtensionProperties, context: ExtensionContext) => MountedInstance;
