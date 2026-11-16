// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { DialogTemplate, SceneDocument } from '@cratis/scene.model';
import { dialogFrameOf } from '../Templates/dialogPresentation';

// What is being edited, as far as the shell is concerned.
export enum ShellSubject {
    // A screen: drawn in the application's shell.
    Screen = 'screen',

    // A screen that opens as a dialog or a drawer: it is drawn as that popup - never in the application's shell, which a popup opens over.
    DialogScreen = 'dialogScreen',

    // A screen template: drawn in the shell too, because it fills the shell's primary outlet.
    ScreenTemplate = 'screenTemplate',

    // A dialog template: opened over the application, not drawn in its shell.
    DialogTemplate = 'dialogTemplate',

    // The template that is the shell itself: drawing the shell around it would draw it twice.
    TheShell = 'theShell',
}

export function shellSubjectOf(document: SceneDocument, authoringTemplate: string | undefined, shellName: string, knownDialogTemplates: readonly DialogTemplate[] = [], pageTemplateNames: readonly string[] = [], opensOverPage = false): ShellSubject {
    if (authoringTemplate === undefined) return dialogFrameOf(document, knownDialogTemplates, pageTemplateNames, opensOverPage) ? ShellSubject.DialogScreen : ShellSubject.Screen;
    if ((document.dialogTemplates ?? []).some(template => template.name === authoringTemplate)) return ShellSubject.DialogTemplate;
    return authoringTemplate === shellName ? ShellSubject.TheShell : ShellSubject.ScreenTemplate;
}

// Whether the shell is drawn when the author has not said: around a screen template, which is the application's page and is authored in it. Never around
// a screen - a slice's prototype shows the slice's own content and nothing but - nor a dialog template (it is shown over the application) nor the shell itself.
export const shellShownByDefault = (subject: ShellSubject): boolean => subject === ShellSubject.ScreenTemplate;

// Whether the template a screen is built from is drawn around the screen's own content when the author has not said: it is not. A slice's prototype is the
// slice's content; the template (and the shell) are there to see in context when the author asks.
export const templateShownByDefault = (_subject: ShellSubject): boolean => false; // eslint-disable-line @typescript-eslint/no-unused-vars

// Whether there is a template around the subject to show or hide: only a screen has one around it. A template being authored is the content.
export const templateCanFrame = (subject: ShellSubject): boolean => subject === ShellSubject.Screen || subject === ShellSubject.DialogScreen;

// Whether there is a shell around the subject at all, which the toggle needs to be offered for. Not for the shell itself, and not for a dialog screen: the
// popup opens over the application, and a remembered "show the shell" for pages must not put it in one.
export const shellCanFrame = (subject: ShellSubject): boolean => subject !== ShellSubject.TheShell && subject !== ShellSubject.DialogScreen;

export interface ShellPreferenceStorage {
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
}

// What the author chose for *Show application shell* and *Show template*, per user. A screen, a screen template and a dialog template are remembered
// apart, because the sensible answer differs (a person who always works with the shell on does not want it round a dialog, nor round a slice's content).
// Nothing stored means the default applies.
export interface ShellPreference {
    read(subject: ShellSubject): boolean | undefined;
    write(subject: ShellSubject, shown: boolean): void;
    readTemplate(subject: ShellSubject): boolean | undefined;
    writeTemplate(subject: ShellSubject, shown: boolean): void;
}

const prefix = 'studio.screenEditor.showApplicationShell.v1';
const templatePrefix = 'studio.screenEditor.showTemplate.v1';

const attempt = <T>(action: () => T): T | undefined => {
    try {
        return action();
    } catch {
        return undefined;
    }
};

export const browserShellPreferenceStorage = (): ShellPreferenceStorage | undefined => attempt(() => (typeof window !== 'undefined' ? window.localStorage : undefined));

const kindOf = (subject: ShellSubject) => subject === ShellSubject.DialogTemplate ? 'dialog' : subject === ShellSubject.Screen ? 'screen' : subject === ShellSubject.DialogScreen ? 'dialogScreen' : 'template';
const keyOf = (subject: ShellSubject) => `${prefix}:${kindOf(subject)}`;
const templateKeyOf = (subject: ShellSubject) => `${templatePrefix}:${kindOf(subject)}`;

export function createShellPreference(storage: ShellPreferenceStorage | undefined = browserShellPreferenceStorage()): ShellPreference {
    const readKey = (key: string) => {
        const stored = storage ? attempt(() => storage.getItem(key)) : undefined;
        return stored === 'true' ? true : stored === 'false' ? false : undefined;
    };
    const writeKey = (key: string, shown: boolean) => { if (storage) attempt(() => storage.setItem(key, String(shown))); };
    return {
        read: subject => readKey(keyOf(subject)),
        write: (subject, shown) => writeKey(keyOf(subject), shown),
        readTemplate: subject => readKey(templateKeyOf(subject)),
        writeTemplate: (subject, shown) => writeKey(templateKeyOf(subject), shown),
    };
}
