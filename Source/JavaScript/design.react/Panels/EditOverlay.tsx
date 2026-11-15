// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useMemo, useState } from 'react';
import type { SceneDocument } from '@cratis/scene.model';
import type { DesignMode } from '@cratis/scene.design';
import {
    ScreenEditorPrimeReactProvider, ScreenEditorWorkspace, createScreenEditorEnvironment, defaultLayoutLabels, defaultPaletteIcons, defaultPaletteSources, defaultScreenEditorStrings,
    type PaletteIcons, type PaletteSource, type ScreenEditorEnvironment, type ScreenEditorResult, type ScreenEditorStrings, type LayoutLabels,
} from '@cratis/scene.editor';
import type { DesignCatalogueSource, DesignStringKey } from '../Host/DesignCanvasHost';
import { restrictEnvironmentToTemplateSet } from '../State/restrictEditorToTemplateSet';
import './Panels.css';

/** What the screen editor is dressed in. Scene's defaults when the host does not bring its own words, layouts, icons and palette. */
export interface EditorKit {
    strings: ScreenEditorStrings;
    layoutLabels: LayoutLabels;
    icons: PaletteIcons;
    paletteSources: readonly PaletteSource[];
}

export const defaultEditorKit: EditorKit = {
    strings: defaultScreenEditorStrings,
    layoutLabels: defaultLayoutLabels,
    icons: defaultPaletteIcons,
    paletteSources: defaultPaletteSources,
};

export interface EditOverlayProps {
    screen: string;
    mode: DesignMode;
    document: SceneDocument;
    catalogue: DesignCatalogueSource;
    strings: Record<DesignStringKey, string>;
    kit?: EditorKit;
    /** The templates the session may use; the editor's template picker offers no others. Absent: no limit. */
    templateSet?: readonly string[];
    onSave(document: SceneDocument): Promise<void>;
    onClose(): void;
}

/**
 * Direct manipulation: the Scene editor - its surface, structure tree, palette and inspector - opened on one screen, or on the template being authored
 * in template mode. The editor never writes anything itself: what it would save waits here, and saving it records a revision of the screen.
 */
export const EditOverlay = ({ screen, mode, document, catalogue, strings, kit = defaultEditorKit, templateSet, onSave, onClose }: EditOverlayProps) => {
    const [draft, setDraft] = useState<ScreenEditorResult | undefined>();
    const [saving, setSaving] = useState(false);
    const environment: ScreenEditorEnvironment = useMemo(() => {
        const inUse = mode === 'screens' ? document.screens.flatMap(candidate => candidate.screenTemplate === undefined ? [] : [candidate.screenTemplate]) : [];
        return restrictEnvironmentToTemplateSet(
            catalogue.editorEnvironment ?? createScreenEditorEnvironment({ runtime: catalogue.runtime, richText: false }), templateSet, inUse);
    }, [catalogue, templateSet, mode, document]);
    const subject = useMemo(() => mode === 'templates' ? { document, authoringTemplate: screen } : { document, screen }, [document, mode, screen]);

    const save = async () => {
        if (draft === undefined || !draft.changed) return;
        setSaving(true);
        try {
            await onSave(draft.document);
            setDraft(undefined);
        } finally {
            setSaving(false);
        }
    };

    return (
        <section className='design-edit' aria-label={`${strings.edit}: ${screen}`}>
            <header className='design-edit__bar'>
                <strong>{strings.edit}: {screen}</strong>
                <span className='design-edit__actions'>
                    <button type='button' className='design-edit__save' disabled={draft === undefined || !draft.changed || saving} onClick={() => { void save(); }}>{strings.saveRevision}</button>
                    <button type='button' onClick={() => { setDraft(undefined); onClose(); }}>{draft?.changed === true ? strings.discard : 'Close'}</button>
                </span>
            </header>
            <div className='design-edit__editor'>
                <ScreenEditorPrimeReactProvider>
                    <ScreenEditorWorkspace
                        subject={subject}
                        environment={environment}
                        strings={kit.strings}
                        layoutLabels={kit.layoutLabels}
                        icons={kit.icons}
                        paletteSources={kit.paletteSources}
                        title={screen}
                        onChange={setDraft} />
                </ScreenEditorPrimeReactProvider>
            </div>
        </section>
    );
};
