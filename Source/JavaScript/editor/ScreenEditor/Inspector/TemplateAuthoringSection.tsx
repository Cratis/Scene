// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useMemo, useState } from 'react';
import { applicableTemplates, TemplateCatalogKind, type ApplicableTemplate, type ApplicableTemplateSet } from '@cratis/scene.engine';
import { TemplateScope, type TemplateMetadata } from '@cratis/scene.model';
import { TemplatePicker } from '../../TemplatePicker';
import { screenTemplateTarget } from '../Templates/screenTemplateTarget';
import { TemplateReferenceKind } from '../../ScreenTemplates/TemplateReferenceKind';
import { ownTemplateSourceOf } from '../../ScreenTemplates/ownTemplateSource';
import { toTemplateSources } from '../../ScreenTemplates/toTemplateSources';
import { contentSlot, screenName } from '../Document/studioScreen';
import type { ScreenEditorController } from '../Host/ScreenEditorController';
import type { ScreenEditorEnvironment } from '../Host/ScreenEditorHost';
import type { ScreenEditorStrings } from './ScreenEditorStrings';
import { SlotListEditor } from './SlotListEditor';
import { OutletListEditor } from './OutletListEditor';
import { defaultDesignModeStrings } from '../DesignMode/DesignModeStrings';
import { withTemplateOutlets } from '../Outlets/outletDocument';
import { nextElementId } from '../Host/nextElementId';
import { TemplatePreviewPane } from './TemplatePreviewPane';

export interface TemplateAuthoringSectionProps {
    controller: ScreenEditorController;
    environment: ScreenEditorEnvironment;
    strings: ScreenEditorStrings;
    disabled: boolean;
    authoringTemplate?: string;
}

export const TemplateAuthoringSection = ({ controller, environment, strings, disabled, authoringTemplate }: TemplateAuthoringSectionProps) => {
    const text = strings.properties.templates;
    const outletStrings = (strings.designMode ?? defaultDesignModeStrings).outlets;

    if (authoringTemplate) {
        const template = controller.document.screenTemplates.find(candidate => candidate.name === authoringTemplate);
        if (!template) return null;
        const metadata = template.metadata ?? {};
        return (
            <section className='studio-editor-properties__templates'>
                <strong>{text.label}</strong>
                <label>
                    <span>{text.category}</span>
                    <input value={metadata.category ?? ''} disabled={disabled} onChange={event => controller.setScreenTemplateMetadata(authoringTemplate, cleanMetadata({ ...metadata, category: event.target.value || undefined }), text.category)} />
                </label>
                <label>
                    <span>{text.scope}</span>
                    <select value={metadata.scopes?.[0] ?? ''} disabled={disabled} onChange={event => controller.setScreenTemplateMetadata(authoringTemplate, cleanMetadata({ ...metadata, scopes: event.target.value ? [event.target.value as TemplateScope] : undefined }), text.scope)}>
                        <option value=''>{text.anyScope}</option>
                        {Object.values(TemplateScope).map(scope => <option key={scope} value={scope}>{scope}</option>)}
                    </select>
                </label>
                {metadata.sliceKinds && metadata.sliceKinds.length > 0 && (
                    <p className='studio-editor-properties__template-slice-kinds'>
                        <span>{text.sliceKinds}</span>{' '}{metadata.sliceKinds.join(', ')}
                    </p>
                )}
                <SlotListEditor
                    slots={template.slots}
                    primarySlot={contentSlot}
                    hint={text.slotsHint}
                    disabled={disabled}
                    strings={strings.properties.slots}
                    onChange={slots => controller.setScreenTemplateSlots(authoringTemplate, slots, strings.properties.slots.label)}
                />
                <OutletListEditor
                    outlets={template.outlets ?? []}
                    slots={template.slots}
                    disabled={disabled}
                    strings={outletStrings}
                    newId={nextElementId}
                    onChange={outlets => controller.changeDocument(document => withTemplateOutlets(document, authoringTemplate, outlets), outletStrings.template.outlets)}
                />
            </section>
        );
    }

    return <ScreenTemplateChoice controller={controller} environment={environment} strings={strings} disabled={disabled} />;
};

interface ScreenTemplateChoiceProps {
    controller: ScreenEditorController;
    environment: ScreenEditorEnvironment;
    strings: ScreenEditorStrings;
    disabled: boolean;
}

// The screen's template: chosen straight from the browser, or opened in a preview first and applied from there. A preview
// is a draft held here; only applying it writes to the screen, as one undo step.
const ScreenTemplateChoice = ({ controller, environment, strings, disabled }: ScreenTemplateChoiceProps) => {
    const text = strings.properties.templates;
    const [draft, setDraft] = useState<string>();
    const screen = controller.document.screens.find(candidate => candidate.name === screenName);
    if (!screen) return null;

    const ownTemplates = environment.ownTemplates ?? [];
    const choose = (template: string | undefined) => controller.setScreenTemplate(
        [...ownTemplates, ...environment.runtime.bundles.flatMap(bundle => bundle.screenTemplates ?? [])].find(candidate => candidate.name === template), text.choose);

    // What applies is Scene's to say (spec TPL5); a screen sits at a slice unless the host says otherwise. The application's own templates are offered
    // beside the packages', as the template browser does (StudioIssues#998).
    const applicable = useMemo(
        () => screenTemplatesOnly(applicableTemplates(
            { ...(ownTemplates.length > 0 ? { own: ownTemplateSourceOf(ownTemplates) } : {}), blueprints: toTemplateSources(environment.runtime.bundles) },
            screenTemplateTarget({ bundles: environment.runtime.bundles, profile: environment.runtime.profile, scope: environment.templateScope }))),
        [environment.runtime.bundles, environment.runtime.profile, environment.templateScope, ownTemplates]);
    const selected = screen.screenTemplate;
    // A template the document itself carries is known too: a screen that composes from it needs nothing else to draw (the stored document is the truth).
    const known = [...ownTemplates, ...environment.runtime.bundles.flatMap(bundle => bundle.screenTemplates ?? []), ...controller.document.screenTemplates].find(template => template.name === selected);
    const isOwn = selected !== undefined && ownTemplates.some(template => template.name === selected);
    const current = selected ? { kind: isOwn ? TemplateReferenceKind.Application : TemplateReferenceKind.Blueprint, id: selected } : undefined;
    const handlers = {
        onChoose: (template: ApplicableTemplate) => choose(template.name),
        onPreview: (template: ApplicableTemplate) => setDraft(template.name),
        onClear: selected ? () => choose(undefined) : undefined,
    };

    return (
        <section className='studio-editor-properties__templates'>
            <strong>{text.label}</strong>
            {draft && (
                <TemplatePreviewPane
                    templateName={draft}
                    environment={environment}
                    strings={text}
                    disabled={disabled}
                    onApply={() => { choose(draft); setDraft(undefined); }}
                    onDiscard={() => setDraft(undefined)}
                />
            )}
            <TemplatePicker
                ariaLabel={text.choose}
                applicable={applicable}
                current={current}
                currentLabel={selected ? known?.displayName ?? selected : undefined}
                labels={text.picker}
                handlers={handlers}
                disabled={disabled}
            />
            {selected && !known && <p className='studio-editor-binding__missing'>{text.missing(selected)}</p>}
        </section>
    );
};

// A screen's `screenTemplate` names a screen template, so the layouts and dialog templates Scene may also offer at the target are left out. What
// applies is still Scene's to say; this only narrows to the kind of thing the property holds.
function screenTemplatesOnly(set: ApplicableTemplateSet): ApplicableTemplateSet {
    const narrow = (groups: ApplicableTemplateSet['own']) => groups
        .map(group => ({ ...group, templates: group.templates.filter(template => template.kind === TemplateCatalogKind.ScreenTemplate) }))
        .filter(group => group.templates.length > 0);
    return {
        own: narrow(set.own),
        blueprints: set.blueprints.map(blueprint => ({ ...blueprint, categories: narrow(blueprint.categories) })).filter(blueprint => blueprint.categories.length > 0),
    };
}

// Metadata keeps only what was set, and a template with none has none, so a cleared field leaves nothing behind.
function cleanMetadata(metadata: TemplateMetadata): TemplateMetadata | undefined {
    const cleaned = Object.fromEntries(Object.entries(metadata).filter(([, value]) => value !== undefined && value !== '')) as TemplateMetadata;
    return Object.keys(cleaned).length > 0 ? cleaned : undefined;
}
