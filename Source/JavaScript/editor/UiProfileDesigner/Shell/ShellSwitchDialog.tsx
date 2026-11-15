// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useMemo } from 'react';
import { Button } from '@cratis/components/Common';
import { Dialog, DialogInitialFocus } from '@cratis/components/Dialogs';
import { TemplateScope } from '@cratis/scene.model';
import type { SlotRemaps, ShellSlotMove } from '@cratis/scene.engine';
import type { BlueprintGalleryAssets } from '../../BlueprintGallery/BlueprintGalleryAssets';
import type { ApplicationTemplate } from '../../ScreenTemplates/ApplicationTemplate';
import { createScreenEditorRuntime } from '../../ScreenEditor/Runtime/screenEditorRuntime';
import { TemplateBrowserContent } from '../../TemplateBrowser/TemplateBrowserContent';
import { TemplateBrowserMode } from '../../TemplateBrowser/TemplateBrowserMode';
import type { TemplateBrowserStrings } from '../../TemplateBrowser/TemplateBrowserStrings';
import { templateBrowserSources } from '../../TemplateBrowser/templateBrowserSources';
import type { UiProfileSettings } from '../../UiProfile/UiProfileSettings';
import { resolveUiProfile } from '../../UiProfile/resolveUiProfile';
import type { UiProfileDesignerStrings } from '../UiProfileDesignerStrings';
import { ShellCandidate } from './ShellCandidate';
import { browserReferenceOf, sceneReferenceOf } from './shellReferences';
import { effectiveShellOf, type ShellSwitchContext } from './shellSwitch';
import type { ShellSwitchToApply } from './applyShellSwitchToDocuments';
import './ShellSwitchDialog.css';

/** What the template browser needs from the host to draw its cards: the thumbnails and sample data of the blueprints, and its own words. */
export interface ShellBrowserHost {
    assets: BlueprintGalleryAssets;
    strings: TemplateBrowserStrings;
}

export interface ShellSwitchDialogProps {
    visible: boolean;
    settings: UiProfileSettings;
    context: ShellSwitchContext;
    applicationTemplates: readonly ApplicationTemplate[];
    browser: ShellBrowserHost;

    // What the host takes for the whole switch: the settings it stores and the decisions about the slots, as one edit.
    onUse: (settings: UiProfileSettings, remaps: SlotRemaps, name: string, moves: readonly ShellSlotMove[], application: ShellSwitchToApply) => void;

    // Whether the host can move content out of a slot. Without it a switch that needs that is not offered.
    canRemap?: boolean;
    onClose: () => void;
    strings: UiProfileDesignerStrings;
}

// Choosing the application's shell: the template browser, listing what can be the shell at the application level - the application's own first, then each blueprint's,
// with the ones that need a blueprint the application does not have yet - and, in the pane where it shows a template, the application drawn in the selected one.
export const ShellSwitchDialog = ({ visible, settings, context, applicationTemplates, browser, onUse, canRemap = true, onClose, strings }: ShellSwitchDialogProps) => {
    const text = strings.shell.dialog;
    const resolved = useMemo(() => resolveUiProfile(settings, context.bundles), [settings, context.bundles]);
    const inPlace = useMemo(() => effectiveShellOf(settings, context), [settings, context]);
    const sources = useMemo(() => ({
        ...templateBrowserSources(TemplateBrowserMode.Pick, settings, resolved, context.bundles, applicationTemplates),
        target: { scope: TemplateScope.Application },
        current: browserReferenceOf(inPlace.reference),
    }), [settings, resolved, context.bundles, applicationTemplates, inPlace]);
    const runtime = useMemo(() => {
        const created = createScreenEditorRuntime(context.bundles, resolved.profile);
        return { bundles: created.bundles, profile: created.profile, registry: created.registry, iconAdapters: created.iconAdapters };
    }, [context.bundles, resolved]);

    return (
        <Dialog
            title={text.title}
            visible={visible}
            width='min(96rem, 100vw)'
            dismissable
            initialFocus={DialogInitialFocus.Content}
            className='studio-shell-switch-dialog studio-template-browser-dialog'
            onClose={onClose}
            buttons={<Button label={text.cancel} variant='outline' onClick={onClose} />}>
            <TemplateBrowserContent
                sources={sources}
                assets={browser.assets}
                runtime={runtime}
                actions={{}}
                strings={browser.strings}
                targetLabel={text.targetLabel}
                renderDetail={entry => (
                    <ShellCandidate settings={settings} context={context} candidate={entry === undefined ? undefined : sceneReferenceOf(entry)} strings={strings} canRemap={canRemap} onUse={onUse} />
                )}
            />
        </Dialog>
    );
};
