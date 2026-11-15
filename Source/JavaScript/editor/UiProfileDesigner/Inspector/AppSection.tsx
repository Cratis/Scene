// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useRef } from 'react';
import { LogoKind } from '@cratis/scene.model';
import { logoIcons, maximumLogoImageBytes, resolveProfileIdentity } from '@cratis/scene.engine';
import { formatMessage } from '../../UiProfile/formatMessage';
import type { DesignedProfile } from '../Session/DesignedProfile';
import type { UiProfileDesignerStrings } from '../UiProfileDesignerStrings';
import { sceneProfileOf } from './sceneProfileOf';
import type { ScenePackageBundle } from '@cratis/scene.react';
import { Field, Segmented } from './Field';
import { ProfileTemplateEditor, ProfileTemplatesContext, type ProfileTemplates } from '../Properties/ProfileTemplateEditor';
import { newScreenTemplateDescriptor } from '../Properties/profileDescriptors';
import type { EditorContext } from '../../ScreenEditor/PropertyEditors/Registry/PropertyEditorProps';

export interface AppSectionProps {
    settings: DesignedProfile;
    bundles: ScenePackageBundle[];
    templates: ProfileTemplates;

    /** What a registry editor needs to draw itself; the window builds it once from the editor strings. */
    editorContext: EditorContext;
    strings: UiProfileDesignerStrings;
    onEdit: (next: DesignedProfile, label: string) => void;

    /** Called with the problem when the chosen image cannot be used; the section shows it under the control. */
    onImageProblem?: (message: string | undefined) => void;
}

const readAsDataUri = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
});

/** The App section: the name, the target platform, the template new screens start from and the logo. Every rule about the logo is Scene's. */
export const AppSection = ({ settings, bundles, templates, editorContext, strings, onEdit, onImageProblem }: AppSectionProps) => {
    const text = strings.editor.app;
    const identity = settings.identity ?? {};
    const logo = identity.logo ?? {};
    const kind = logo.kind ?? LogoKind.Initials;
    const resolved = resolveProfileIdentity(sceneProfileOf(settings, bundles), settings.applicationName);
    const file = useRef<HTMLInputElement>(null);
    const diagnostic = resolved.diagnostics[0]?.message;

    const setIdentity = (next: NonNullable<DesignedProfile['identity']>, label: string) => onEdit({ ...settings, identity: next }, label);
    const setLogo = (change: NonNullable<typeof identity.logo>, label: string) => setIdentity({ ...identity, logo: { ...logo, ...change } }, label);

    const choose = async (chosen: File | undefined) => {
        if (chosen === undefined) return;
        const supported = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'].includes(chosen.type);
        if (!supported) { onImageProblem?.(text.imageUnsupported); return; }
        if (chosen.size > maximumLogoImageBytes) { onImageProblem?.(formatMessage(text.imageTooLarge, { size: String(Math.ceil(chosen.size / 1024)) })); return; }
        onImageProblem?.(undefined);
        setLogo({ kind: LogoKind.Image, image: await readAsDataUri(chosen) }, strings.edits.logo);
    };

    return (
        <>
            <Field label={text.name} htmlFor='studio-app-name' hint={text.nameHint}>
                <input id='studio-app-name' type='text' value={settings.applicationName} onChange={event => onEdit({ ...settings, applicationName: event.target.value }, strings.edits.name)} />
            </Field>
            <Field label={text.platform} htmlFor='studio-app-platform' hint={text.platformHint}>
                <select id='studio-app-platform' value='web' disabled><option value='web'>{text.web}</option></select>
            </Field>
            <Field label={text.newScreens} htmlFor='studio-app-new-screens' hint={text.newScreensHint}>
                <ProfileTemplatesContext.Provider value={templates}>
                    <ProfileTemplateEditor id='studio-app-new-screens' descriptor={newScreenTemplateDescriptor(strings)} context={editorContext} value={settings.defaultScreenTemplate}
                        onChange={next => onEdit({ ...settings, defaultScreenTemplate: next ?? '' }, strings.edits.newScreenTemplate)} />
                </ProfileTemplatesContext.Provider>
            </Field>
            <Field label={strings.properties.sizeClass} htmlFor='studio-app-size-class' hint={strings.properties.sizeClassDescription}>
                <select id='studio-app-size-class' value={settings.sizeClass ?? ''} onChange={event => onEdit({ ...settings, sizeClass: event.target.value === '' ? undefined : event.target.value as typeof settings.sizeClass }, strings.edits.sizeClass)}>
                    <option value=''>{strings.editor.look.cornerDefault}</option>
                    <option value='compact'>{strings.properties.compact}</option>
                    <option value='regular'>{strings.properties.regular}</option>
                    <option value='expanded'>{strings.properties.expanded}</option>
                </select>
            </Field>
            <Field label={text.logo} hint={text.logoHint}>
                <Segmented
                    label={text.logo}
                    value={kind}
                    options={[{ value: LogoKind.Initials, label: text.kinds.initials }, { value: LogoKind.Icon, label: text.kinds.icon }, { value: LogoKind.Image, label: text.kinds.image }]}
                    onChange={next => setLogo({ kind: next }, strings.edits.logo)} />
            </Field>
            {kind === LogoKind.Initials && (
                <Field label={text.initials} htmlFor='studio-app-initials' hint={diagnostic ?? text.initialsHint}>
                    <input id='studio-app-initials' type='text' value={logo.initials ?? ''} placeholder={resolved.initials} aria-invalid={diagnostic !== undefined}
                        onChange={event => setLogo({ initials: event.target.value }, strings.edits.logo)} />
                </Field>
            )}
            {kind === LogoKind.Icon && (
                <Field label={text.icon}>
                    <div className='studio-inspector-icons' role='radiogroup' aria-label={text.icon}>
                        {logoIcons.map(icon => (
                            <button key={icon} type='button' role='radio' aria-checked={logo.icon === icon} aria-label={text.icons[icon]} title={text.icons[icon]} data-selected={logo.icon === icon}
                                onClick={() => setLogo({ icon }, strings.edits.logo)}><i className={`pi pi-${iconClass[icon]}`} aria-hidden='true' /></button>
                        ))}
                    </div>
                </Field>
            )}
            {kind === LogoKind.Image && (
                <Field label={text.image} hint={`${logo.image ? text.imageSet : text.imageNone} ${text.imageHint}`}>
                    <div className='studio-inspector-image'>
                        <button type='button' onClick={() => file.current?.click()}>{logo.image ? text.imageReplace : text.imageChoose}</button>
                        {logo.image && <button type='button' onClick={() => setLogo({ image: undefined }, strings.edits.logo)}>{text.imageRemove}</button>}
                        <input ref={file} type='file' hidden accept='image/png,image/jpeg,image/svg+xml,image/webp' aria-label={text.image} onChange={event => { void choose(event.target.files?.[0]); event.target.value = ''; }} />
                    </div>
                </Field>
            )}
            <label className='studio-inspector-check'>
                <input type='checkbox' checked={identity.showName ?? true} onChange={event => setIdentity({ ...identity, showName: event.target.checked }, strings.edits.logo)} />
                <span>{text.showName}</span>
            </label>
        </>
    );
};

const iconClass: Record<(typeof logoIcons)[number], string> = { box: 'box', layers: 'clone', home: 'home', users: 'users', receipt: 'receipt', package: 'gift', database: 'database', palette: 'palette' };
