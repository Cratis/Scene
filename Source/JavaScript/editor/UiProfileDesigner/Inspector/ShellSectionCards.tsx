// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useEffect, useMemo, useState } from 'react';
import { TemplateReferenceSource, type TemplateReference } from '@cratis/scene.model';
import { describeOwnShellValue, type EffectiveShell, describeVersionRule, menuModeAfterShellSwitch, navigationModes, type ShellCard } from '@cratis/scene.engine';
import type { ScenePackageBundle } from '@cratis/scene.react';
import { layoutModes, type LayoutMode } from '@cratis/scene.blueprint.default';
import { formatMessage } from '../../UiProfile/formatMessage';
import type { ApplicationTemplate } from '../../ScreenTemplates/ApplicationTemplate';
import type { DesignedProfile } from '../Session/DesignedProfile';
import { ShellSwitchDialog } from '../Shell/ShellSwitchDialog';
import type { ShellHost } from '../Shell/ShellHost';
import type { ShellSwitchToApply } from '../Shell/applyShellSwitchToDocuments';
import { shellLibraryOf } from '../Shell/shellLibraryOf';
import { shellDisplayName } from '../Shell/shellDisplayName';
import { effectiveShellOf, planSwitchTo, withRootTemplate, type ShellSwitchContext } from '../Shell/shellSwitch';
import { ownTemplateSource } from '../../ScreenTemplates/ownTemplateSource';
import type { UiProfileDesignerStrings } from '../UiProfileDesignerStrings';
import { Field } from './Field';
import { isShellDocumentRead } from './isShellDocumentRead';
import { NewShellChoices } from './NewShellChoices';
import { ShellActions } from './ShellActions';
import { ShellCardButton } from './ShellCardButton';
import { ShellVersionField } from './ShellVersionField';
import type { SceneAnswers } from './sceneAnswers';

export interface ShellSectionCardsProps {
    settings: DesignedProfile;
    bundles: ScenePackageBundle[];
    answers: SceneAnswers;
    host?: ShellHost;
    applicationTemplates: readonly ApplicationTemplate[];
    strings: UiProfileDesignerStrings;
    onEdit: (next: DesignedProfile, label: string) => void;

    /** Called with the status-bar line the switch earned ("Menu mode set to Slim by Minimal"). */
    onNote?: (message: string) => void;
}

const legacyOf = (mode: string): LayoutMode | undefined => layoutModes.find(candidate => candidate === navigationModes.find(info => info.id === mode)?.legacy);

const isCardSelected = (card: ShellCard, shell: EffectiveShell, isOwn: boolean) => shell.name === card.id && (isOwn ? card.blueprint === '' : shell.package === card.blueprint);

/** The Shell section: the shells as cards, the version rule with its status and the value of "my own shell". */
export const ShellSectionCards = ({ settings, bundles, answers, host, applicationTemplates, strings, onEdit, onNote }: ShellSectionCardsProps) => {
    const text = strings.editor.shell;
    const [choosing, setChoosing] = useState<TemplateReference | undefined>();
    const [opening, setOpening] = useState<TemplateReference | undefined>();
    const [creating, setCreating] = useState(false);
    // The shell the author has just made, until it shows among the application's templates and can be chosen.
    const [made, setMade] = useState<string>();
    const [own, setOwn] = useState(settings.root?.template.source === TemplateReferenceSource.Own ? settings.root.template.id : '');
    const context = useMemo<ShellSwitchContext>(() => ({ bundles, library: shellLibraryOf(bundles, ownTemplateSource(applicationTemplates)), screens: host?.screens ?? [] }), [bundles, applicationTemplates, host?.screens]);
    const shell = useMemo(() => effectiveShellOf(settings, context), [settings, context]);
    const isOwn = settings.root?.template.source === TemplateReferenceSource.Own;
    const installed = shell.package === undefined ? undefined : bundles.find(bundle => bundle.manifest.name === shell.package)?.manifest;

    const apply = (next: DesignedProfile, shellName: string, card: ShellCard | undefined, label: string) => {
        const change = menuModeAfterShellSwitch(settings.navigationMode, card?.defaultMenuMode, shellName);
        const legacy = legacyOf(change.mode);
        onEdit({ ...next, ...(legacy === undefined ? {} : { navigationMode: legacy }) }, label);
        if (change.message !== undefined) onNote?.(formatMessage(strings.editor.status.menuSetBy, { mode: navigationModes.find(info => info.id === change.mode)!.label, shell: shellName }));
    };

    const choose = (card: ShellCard) => {
        const template: TemplateReference = card.blueprint === ''
            ? { source: TemplateReferenceSource.Own, id: card.id }
            : { source: TemplateReferenceSource.Blueprint, blueprint: card.blueprint, id: card.id };
        const switched = planSwitchTo(settings, template, context);
        const needsRemap = switched.plan.moves.some(move => move.screens.length > 0);
        if (switched.plan.isNoOp) return;
        if (!switched.plan.canSwitch || needsRemap) { setChoosing(template); return; }
        apply({ ...switched.settings, applicationName: settings.applicationName } as DesignedProfile, card.title, card, strings.edits.shell);
    };

    const useOwn = (value: string) => {
        setOwn(value);
        const reference: TemplateReference = { source: TemplateReferenceSource.Own, id: value };
        onEdit({ ...withRootTemplate(settings, reference, bundles), applicationName: settings.applicationName } as DesignedProfile, strings.edits.shell);
    };

    // The blueprint's own AppShell, which a new shell can start from whatever the application uses now.
    const appShell = useMemo(() => {
        const bundle = bundles.find(candidate => candidate.layouts?.some(layout => layout.name === 'AppShell'));
        return bundle === undefined ? undefined : effectiveShellOf(withRootTemplate(settings, { source: TemplateReferenceSource.Blueprint, blueprint: bundle.manifest.name, id: 'AppShell' }, bundles), context);
    }, [bundles, settings, context]);

    // Creating a shell ends in its editor with the shell chosen (spec 5.2): once the new template is among the application's own, the application takes it as its
    // shell - when that moves no content, which is the plan *Use this shell* shows; otherwise the choice is left to *Change shell...*, which asks - and its editor opens.
    useEffect(() => {
        // The template is listed when it is added, before its document is read; the shell cannot be planned (or drawn) until the document is known, and choosing it
        // earlier would silently find no such shell and choose nothing.
        if (made === undefined || !isShellDocumentRead(applicationTemplates, made)) return;
        setMade(undefined);
        const reference: TemplateReference = { source: TemplateReferenceSource.Own, id: made };
        const switched = planSwitchTo(settings, reference, context);
        if (switched.plan.canSwitch && switched.plan.moves.every(move => move.screens.length === 0)) {
            onEdit({ ...switched.settings, applicationName: settings.applicationName } as DesignedProfile, formatMessage(strings.shell.switched, { name: shellDisplayName(switched.candidate) }));
        }

        setOpening(reference);
    }, [made, applicationTemplates, settings, context, onEdit, strings.shell.switched]);

    // The editor opens one render after the choice of the shell is drawn: the designer stores an edit from the render that shows it, so opening the editor in the
    // same render would leave the page before the profile that chose the shell was stored.
    useEffect(() => {
        if (opening === undefined) return;
        setOpening(undefined);
        host?.onEditShell?.(opening, true);
    }, [opening, host]);

    // A profile that has not stored a root yet still runs a shell, whose reference carries the version rule it would be stored with.
    const root = settings.root ?? (shell.reference === undefined ? undefined : { template: shell.reference, options: {} });
    const rule = installed === undefined || root?.template.source !== TemplateReferenceSource.Blueprint ? undefined : describeVersionRule(root.template.version, installed.version);
    const ownValue = describeOwnShellValue(own);

    return (
        <>
            <Field label={text.blueprints}>
                <div className='studio-inspector-cards' role='radiogroup' aria-label={text.blueprints}>
                    {answers.shellCards.map(card => (
                        <ShellCardButton key={`${card.blueprint}|${card.id}`} card={card} startsText={text.cardStarts} onChoose={choose} selected={isCardSelected(card, shell, isOwn)} />
                    ))}
                </div>
            </Field>
            {rule !== undefined && installed !== undefined && (
                <ShellVersionField rule={rule} installedVersion={installed.version} storedVersion={settings.root?.template.version} label={text.version} hint={text.versionHint}
                    onPin={pin => onEdit({ ...settings, root: { ...root!, template: { ...root!.template, version: pin } } }, strings.edits.shellVersion)} />
            )}
            <Field label={text.own} htmlFor='studio-shell-own' hint={isOwn && !ownValue.valid ? ownValue.message : text.ownHint}>
                <input id='studio-shell-own' type='text' value={own} placeholder={text.ownPlaceholder} aria-invalid={isOwn && !ownValue.valid} spellCheck={false}
                    onChange={event => useOwn(event.target.value)} />
            </Field>
            <ShellActions host={host} shellReference={shell.reference} isOwn={isOwn} creating={creating} strings={strings}
                onChange={() => setChoosing({ source: TemplateReferenceSource.Own, id: '' })} onToggleCreate={() => setCreating(value => !value)} />
            {creating && host?.onCreateShell && (
                <NewShellChoices strings={strings} shell={shell} appShell={appShell} onCreateShell={host.onCreateShell} onMade={id => { setCreating(false); setMade(id); }} />
            )}
            {choosing !== undefined && host?.browser && (
                <ShellSwitchDialog visible settings={settings} context={context} applicationTemplates={applicationTemplates} browser={host.browser} strings={strings} canRemap={host.onRemapSlots !== undefined}
                    onUse={(next, _remaps, name, moves, application: ShellSwitchToApply) => {
                        void (async () => {
                            if (moves.length > 0 && host.onRemapSlots && !(await host.onRemapSlots(moves, application))) return;
                            setChoosing(undefined);
                            apply({ ...next, applicationName: settings.applicationName } as DesignedProfile, name, answers.shellCards.find(card => card.id === next.root?.template.id), formatMessage(strings.shell.switched, { name }));
                        })();
                    }}
                    onClose={() => setChoosing(undefined)} />
            )}
        </>
    );
};
