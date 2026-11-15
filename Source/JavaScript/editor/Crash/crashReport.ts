// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/** What a boundary knows about the thing it guards - shown to the user and written into the report. */
export interface CrashContext {
    /** What stopped, in the user's words: `The preview`, `The screen editor`, `Play`. */
    surface: string;

    /** The component that threw, when the boundary knows it. Otherwise it is read from React's component stack. */
    component?: string | undefined;

    /** The template being drawn or edited. */
    template?: string | undefined;

    /** The screen being drawn or edited. */
    screen?: string | undefined;

    /** Anything else worth reading in the report (ids, node names). Never secrets: values are redacted anyway. */
    details?: Readonly<Record<string, string | undefined>>;
}

/** Where the report is filed. */
export const crashReportIssuesUrl = 'https://github.com/Cratis/StudioIssues/issues/new';

const redactions: readonly [RegExp, string][] = [
    [/\bBearer\s+[A-Za-z0-9._~+/=-]{8,}/gi, 'Bearer [redacted]'],
    [/\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]*/g, '[redacted-jwt]'],
    [/\b(authorization|cookie|set-cookie|x-api-key|x-principal[\w-]*)\s*[:=]\s*[^\s,;]+(\s+[^\s,;]+)?/gi, '$1: [redacted]'],
    [/([?&;\s"'](?:access_?token|id_?token|refresh_?token|token|api_?key|apikey|key|secret|client_?secret|password|passwd|pwd|sig|signature|code)=)[^&\s"'#]+/gi, '$1[redacted]'],
    [/("(?:access_?token|id_?token|refresh_?token|token|api_?key|secret|client_?secret|password|authorization)"\s*:\s*")[^"]*(")/gi, '$1[redacted]$2'],
    [/\b(?:gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|sk-[A-Za-z0-9_-]{20,}|xox[abprs]-[A-Za-z0-9-]{10,}|AKIA[0-9A-Z]{16})\b/g, '[redacted-key]'],
];

/**
 * Removes what must never leave the browser in a report: bearer tokens, JWTs, cookies, credentials in query strings or JSON, and well-known key shapes.
 *
 * @param text Any text.
 * @returns The text with the secrets replaced.
 */
export function redactSecrets(text: string): string {
    return redactions.reduce((current, [pattern, replacement]) => current.replace(pattern, replacement), text);
}

/**
 * Reads the nearest component out of React's component stack - the first line is the component that threw.
 *
 * @param componentStack The stack React passes to `componentDidCatch`.
 * @returns The component's name, or `undefined` when the stack names none.
 */
export function componentOfStack(componentStack: string | null | undefined): string | undefined {
    const match = /^\s*at\s+([A-Za-z_$][\w$.]*)/m.exec(componentStack ?? '');
    return match?.[1];
}

/**
 * The location without its query string and fragment values: a path says where the user was, and the query may carry a token.
 *
 * @param href A page address.
 * @returns The address with the query and fragment removed.
 */
export function locationWithoutSecrets(href: string): string {
    const end = href.search(/[?#]/);
    return end < 0 ? href : href.slice(0, end);
}

/** What the page knows about its environment - only what helps to reproduce a crash. */
export interface CrashEnvironment {
    href: string;
    userAgent: string;
    time: Date;
    version?: string;
}

const environmentNow = (): CrashEnvironment => ({
    href: globalThis.location?.href ?? '',
    userAgent: globalThis.navigator?.userAgent ?? '',
    time: new Date(),
});

/**
 * The technical detail of a crash, as plain text for a report: where, what, the error and the component stack - redacted.
 *
 * @param error The error that was caught.
 * @param context What the boundary knows about what it guards.
 * @param componentStack React's component stack, when there is one.
 * @param environment The page; the current one when omitted.
 * @returns The text that is copied by "Report this error".
 */
export function describeCrash(error: unknown, context: CrashContext, componentStack?: string | null, environment: CrashEnvironment = environmentNow()): string {
    const failure = error instanceof Error ? error : new Error(String(error));
    const component = context.component ?? componentOfStack(componentStack);
    const lines = [
        `Studio crash report`,
        `Time: ${environment.time.toISOString()}`,
        `Surface: ${context.surface}`,
        ...(component ? [`Component: ${component}`] : []),
        ...(context.template ? [`Template: ${context.template}`] : []),
        ...(context.screen ? [`Screen: ${context.screen}`] : []),
        ...Object.entries(context.details ?? {}).filter(([, value]) => value).map(([key, value]) => `${key}: ${value}`),
        `Page: ${locationWithoutSecrets(environment.href)}`,
        ...(environment.version ? [`Studio: ${environment.version}`] : []),
        `Browser: ${environment.userAgent}`,
        '',
        `Error: ${failure.name}: ${failure.message}`,
        ...(failure.stack ? ['', 'Stack:', failure.stack] : []),
        ...(componentStack ? ['', 'Component stack:', componentStack.trim()] : []),
    ];
    return redactSecrets(lines.join('\n'));
}

/** What a report says before the host turns it into an address. */
export interface CrashReportRequest {
    /** The issue title. */
    title: string;

    /** The short summary: what stopped and the error text. */
    summary: string;

    /** The full technical detail, redacted. */
    details: string;
}

/** Turns a report into the address that opens it for filing. */
export type CrashReportLinkBuilder = (request: CrashReportRequest) => string;

const issueFormLink = (request: CrashReportRequest): string => {
    const body = `${request.summary}\n\nThe full technical detail was copied to the clipboard by "Report this error": paste it below.`;
    return `${crashReportIssuesUrl}?title=${encodeURIComponent(request.title)}&body=${encodeURIComponent(body)}&labels=${encodeURIComponent('bug')}`;
};

let linkBuilder: CrashReportLinkBuilder = issueFormLink;

/**
 * Lets the host decide where a report is filed. Studio hands over the address of its own report dialog, which files into the right tracker with the page
 * context attached; without a host the report opens a prefilled issue form.
 *
 * @param builder Makes the address of a report.
 */
export function configureCrashReportLinks(builder: CrashReportLinkBuilder): void {
    linkBuilder = builder;
}

// What a report says - title, short summary and the full redacted technical detail.
export function crashReportRequest(error: unknown, context: CrashContext, componentStack?: string | null): CrashReportRequest {
    const failure = error instanceof Error ? error : new Error(String(error));
    const component = context.component ?? componentOfStack(componentStack);
    const title = redactSecrets(`${context.surface} crashed: ${failure.message}`.replace(/\s+/g, ' ').slice(0, 120));
    const summary = redactSecrets([
        `${context.surface} stopped with an error.`,
        ...(component ? [`Component: ${component}`] : []),
        ...(context.template ? [`Template: ${context.template}`] : []),
        ...(context.screen ? [`Screen: ${context.screen}`] : []),
        `Error: ${failure.message}`,
    ].join('\n'));
    return { title, summary, details: describeCrash(error, context, componentStack) };
}

/**
 * The address a report opens. The summary is always in it; the full detail is copied to the clipboard as well, because an address has to stay short.
 *
 * @param error The error that was caught.
 * @param context What the boundary knows about what it guards.
 * @param componentStack React's component stack.
 * @returns The address that opens the report.
 */
export function crashReportUrl(error: unknown, context: CrashContext, componentStack?: string | null): string {
    return linkBuilder(crashReportRequest(error, context, componentStack));
}
