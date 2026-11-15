// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { TemplateBrowserContent, type TemplateBrowserContentProps } from './TemplateBrowserContent';
import './TemplateBrowserPage.css';

/**
 * The template browser as the page of the Screen Templates node (spec 6): the application's own templates to manage and every blueprint's to browse,
 * copy and preview. Same body as the dialog, in manage mode.
 */
export function TemplateBrowserPage(props: TemplateBrowserContentProps) {
    return (
        <section className='studio-template-browser-page' aria-label={props.strings.title}>
            <header className='studio-template-browser-page__header'>
                <h1>{props.strings.title}</h1>
                <p>{props.strings.intro}</p>
            </header>
            <TemplateBrowserContent {...props} />
        </section>
    );
}
