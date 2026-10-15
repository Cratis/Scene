// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ReactNode } from 'react';
import { ExternalComponent } from '@cratis/scene.model';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { readOptionalString, readStrings } from '../shell/elementProperties';
import { ActionButton } from './ActionButton';
import { ComponentState } from './ComponentState';
import { FoundationIcon, FoundationIconName } from './FoundationIcon';
import { FoundationStrings, formatText, readFoundationStrings } from './foundationStrings';
import { readPermissionRule } from './PermissionRule';
import { readLocale } from './formatting';

export interface FoundationFrameProps extends Pick<RegisteredComponentProps, 'element' | 'interactions'> {
    /** The component's own class, added after `foundation`. */
    name: string;

    /** The state the component is in; compute it with `readComponentState`. */
    state: ComponentState;

    /** The shape of the skeleton, as the width of each block in percent; the skeleton keeps the footprint of the content. */
    skeleton?: number[];

    /** What the component draws when it is ready or partial. */
    children?: ReactNode;
}

/** The accessible name of a region, from the element's `label` property. */
function regionLabel(element: ExternalComponent): string | undefined {
    return readOptionalString(element, 'label') ?? readOptionalString(element, 'title');
}

/**
 * The root every foundation component renders, and the five standard states of spec Part B 1.4 in one place:
 * a skeleton while loading (never a spinner alone), an explanation with the primary action when empty, a message with a
 * retry on error, what is missing - and nothing of the data - when the user is not allowed, and the loaded part with a
 * note naming what failed when only some regions did.
 *
 * The region carries an ARIA landmark role when it has a label, a `dir` is left to the document so right-to-left is
 * inherited, and every piece of text comes from the strings table.
 */
export function FoundationFrame({ element, interactions, name, state, skeleton = [60, 100, 80], children }: FoundationFrameProps) {
    const strings = readFoundationStrings(element);
    const label = regionLabel(element);
    const density = element.properties.density === 'compact' ? 'compact' : 'comfortable';

    return (
        <section className={`foundation foundation-${name}`} data-scene-id={element.id} data-state={state} data-density={density}
            lang={readLocale(element)} role={label ? 'region' : undefined} aria-label={label} aria-busy={state === ComponentState.Loading || undefined}>
            {renderState(element, interactions, strings, state, skeleton, children)}
        </section>
    );
}

function renderState(element: ExternalComponent, interactions: RegisteredComponentProps['interactions'], strings: FoundationStrings, state: ComponentState, skeleton: number[], children: ReactNode) {
    switch (state) {
        case ComponentState.Loading:
            return (
                <div className='foundation-skeleton' role='status'>
                    <span className='foundation-visually-hidden'>{strings.loading}</span>
                    {skeleton.map((width, index) => <span key={index} className='foundation-skeleton-block' style={{ width: `${width}%` }} aria-hidden='true' />)}
                </div>
            );
        case ComponentState.Empty:
            return <EmptyStateView element={element} interactions={interactions} strings={strings} />;
        case ComponentState.Error:
            return (
                <div className='foundation-message' data-tone='danger' role='alert'>
                    <FoundationIcon name='alert' />
                    <div className='foundation-message-text'>
                        <strong>{strings.errorHeadline}</strong>
                        <span>{typeof element.properties.error === 'string' && element.properties.error.length > 0 ? element.properties.error : strings.errorHint}</span>
                    </div>
                    <ActionButton emphasis='secondary' disabledReason={strings.disabledNoPermission} onClick={interactions?.onClick}>{strings.retry}</ActionButton>
                </div>
            );
        case ComponentState.NoPermission: {
            const subject = readOptionalString(element, 'permissionSubject') ?? strings.noPermissionSubject;
            return (
                <div className='foundation-message' data-tone='neutral' role='status'>
                    <FoundationIcon name='lock' />
                    <div className='foundation-message-text'>
                        <strong>{strings.noPermissionHeadline}</strong>
                        <span>{formatText(strings.noPermissionHint, { subject })}</span>
                    </div>
                </div>
            );
        }

        case ComponentState.Partial:
            return (
                <>
                    <div className='foundation-message' data-tone='warning' role='status'>
                        <FoundationIcon name='alert' />
                        <div className='foundation-message-text'>
                            <strong>{strings.partialHeadline}</strong>
                            {readStrings(element, 'failedRegions').length > 0 && <span>{formatText(strings.partialHint, { regions: readStrings(element, 'failedRegions').join(', ') })}</span>}
                        </div>
                        <ActionButton emphasis='secondary' disabledReason={strings.disabledNoPermission} onClick={interactions?.onClick}>{strings.retry}</ActionButton>
                    </div>
                    {children}
                </>
            );
        default:
            return <>{children}</>;
    }
}

/** What an empty region says: an icon, a headline, a hint and the primary action, with the action's permission rule applied. */
export function EmptyStateView({ element, interactions, strings }: Pick<FoundationFrameProps, 'element' | 'interactions'> & { strings: FoundationStrings }) {
    const icon = (readOptionalString(element, 'emptyIcon') ?? readOptionalString(element, 'icon')) as FoundationIconName | undefined;
    const actionLabel = readOptionalString(element, 'emptyActionLabel') ?? readOptionalString(element, 'actionLabel');

    return (
        <div className='foundation-empty' role='status'>
            <span className='foundation-empty-icon'><FoundationIcon name={icon ?? 'inbox'} /></span>
            <strong className='foundation-empty-headline'>{readOptionalString(element, 'emptyHeadline') ?? readOptionalString(element, 'headline') ?? strings.emptyHeadline}</strong>
            <span className='foundation-empty-hint'>{readOptionalString(element, 'emptyHint') ?? readOptionalString(element, 'hint') ?? strings.emptyHint}</span>
            {actionLabel && (
                <ActionButton rule={readPermissionRule(element, 'actionPermission')} disabledReason={strings.disabledNoPermission} onClick={interactions?.onClick}>{actionLabel}</ActionButton>
            )}
        </div>
    );
}

