// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useEffect, useMemo, useRef, useState } from 'react';
import { defaultCrashStrings, type CrashStrings } from './CrashStrings';
import { componentOfStack, crashReportRequest, crashReportUrl, describeCrash, redactSecrets, type CrashContext } from './crashReport';
import { useCrashReporter } from './CrashReporter';
import './CrashPanel.css';

export interface CrashPanelProps {
    /** The error that was caught. */
    error: unknown;

    /** What the boundary knows about what it guards. */
    context: CrashContext;

    /** React's component stack, when the error was caught by a boundary. */
    componentStack?: string | null | undefined;

    /** Rebuilds what failed without reloading the page. Without it there is no "Try again". */
    onRecover?: (() => void) | undefined;

    /** Leaves what failed (a preview, an editor). Without it there is no "Close". */
    onClose?: (() => void) | undefined;

    /**
     * `fixed` covers the page so the message cannot end up behind what failed (the default); `fill` fills the box it is drawn in, for a surface that is
     * itself an overlay or a pane.
     */
    layout?: 'fixed' | 'fill';

    strings?: CrashStrings;
}

const copyToClipboard = async (text: string): Promise<boolean> => {
    try {
        await globalThis.navigator.clipboard.writeText(text);
        return true;
    } catch {
        const area = document.createElement('textarea');
        area.value = text;
        area.style.position = 'fixed';
        area.style.opacity = '0';
        document.body.append(area);
        area.select();
        try {
            return document.execCommand('copy');
        } catch {
            return false;
        } finally {
            area.remove();
        }
    }
};

/**
 * What a crash looks like: never a blank page. It says what failed - the surface, the component, the template or screen and the error text - and offers
 * Reload, Try again, Close and "Report this error", which copies the technical detail (secrets redacted) and opens a prefilled issue. It is drawn with
 * plain elements and no provider, because it replaces something that failed and must not depend on it.
 */
export const CrashPanel = ({ error, context, componentStack, onRecover, onClose, layout = 'fixed', strings = defaultCrashStrings }: CrashPanelProps) => {
    const [reported, setReported] = useState<'none' | 'copied' | 'failed'>('none');
    const reporter = useCrashReporter();
    const reporterRef = useRef(reporter);
    reporterRef.current = reporter;
    const failure = error instanceof Error ? error : new Error(String(error));
    const component = context.component ?? componentOfStack(componentStack);
    const detail = useMemo(() => describeCrash(error, context, componentStack), [error, context, componentStack]);
    const rows: readonly [string, string | undefined][] = [
        [strings.surface, context.surface],
        [strings.component, component],
        [strings.template, context.template],
        [strings.screen, context.screen],
        ...Object.entries(context.details ?? {}),
        [strings.error, redactSecrets(failure.message || failure.name)],
    ];

    // What failed may be a modal surface that listened for Escape itself; with it gone, Escape still leaves.
    useEffect(() => {
        if (!onClose) return undefined;
        const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape' && !event.defaultPrevented) onClose(); };
        globalThis.addEventListener('keydown', onKeyDown);
        return () => globalThis.removeEventListener('keydown', onKeyDown);
    }, [onClose]);

    // With a host reporter the report dialog opens by itself, once per crash, so nobody has to find the way to report it.
    useEffect(() => {
        reporterRef.current?.(crashReportRequest(error, context, componentStack));
    }, [error]);

    const report = async () => {
        if (reporter) {
            reporter(crashReportRequest(error, context, componentStack));
            return;
        }

        const copied = await copyToClipboard(detail);
        setReported(copied ? 'copied' : 'failed');
        globalThis.open?.(crashReportUrl(error, context, componentStack), '_blank', 'noopener,noreferrer');
    };

    // A host that reports crashes itself keeps the page usable: the panel stays in the box it guards and is small.
    const shownLayout = reporter && layout === 'fixed' ? 'fill' : layout;
    const shownRows = reporter ? rows.filter(([label]) => label === strings.surface || label === strings.error) : rows;
    const lead = reporter ? strings.leadReporting ?? defaultCrashStrings.leadReporting : strings.lead;

    return (
        <div className={`studio-crash studio-crash--${shownLayout}${reporter ? ' studio-crash--compact' : ''}`} data-studio-crash='' role='alert'>
            <div className='studio-crash__card'>
                <h2 className='studio-crash__title'>{strings.title.replace('{surface}', context.surface)}</h2>
                <p className='studio-crash__lead'>{lead}</p>
                <dl className='studio-crash__facts'>
                    {shownRows.filter(([, value]) => value).map(([label, value]) => (
                        <div key={label} className='studio-crash__fact'>
                            <dt>{label}</dt>
                            <dd data-crash-fact={label}>{value}</dd>
                        </div>
                    ))}
                </dl>
                <div className='studio-crash__actions'>
                    <button type='button' data-crash-action='reload' className='studio-crash__primary' onClick={() => globalThis.location.reload()}>{strings.reload}</button>
                    {onRecover && <button type='button' data-crash-action='retry' onClick={onRecover}>{strings.tryAgain}</button>}
                    {onClose && <button type='button' data-crash-action='close' onClick={onClose}>{strings.close}</button>}
                    <button type='button' data-crash-action='report' onClick={() => { void report(); }}>{strings.report}</button>
                </div>
                {!reporter && reported !== 'none' && <p className='studio-crash__reported' role='status' data-crash-reported={reported}>{reported === 'copied' ? strings.copied : strings.copyFailed}</p>}
                {!reporter && <details className='studio-crash__detail' open={reported === 'failed'}>
                    <summary>{strings.technicalDetail}</summary>
                    <pre data-crash-detail=''>{detail}</pre>
                </details>}
            </div>
        </div>
    );
};
