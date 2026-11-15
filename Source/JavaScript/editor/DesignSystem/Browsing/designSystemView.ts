// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { DesignSystem } from '@cratis/scene.model';
import type { DesignSystemState, DesignSystemVersion } from '../DesignSystemHost';
import { completeDesignSystem, shownMode, shownTheme } from '../Resolving/designResolution';
import { sectionFrom, type DesignSystemSection, type SectionEntry } from './designSystemSections';

/** Which version the editor shows. */
export type ShownVersion = 'active' | 'draft';

/**
 * Where the editor is looking: what a person chose. Every member is optional and an unknown or unavailable choice falls back to
 * what there is. A host that keeps this in its address passes it back to the editor and a link then opens the same view.
 */
export interface DesignSystemView {
    /** The version shown. */
    version?: ShownVersion;

    /** The mode shown. */
    mode?: string;

    /** The theme shown. */
    theme?: string;

    /** The section shown. */
    section?: DesignSystemSection;

    /** The component chosen in the components section. */
    component?: string;

    /** The variant being edited in the components section. */
    variant?: string;
}

/** What a {@link DesignSystemView} comes to for a design system as it is. */
export interface ShownDesignSystem {
    /** The version shown. */
    shown: ShownVersion;

    /** The version shown, when there is one. */
    version?: DesignSystemVersion;

    /** The design system of the version shown, when the version declares one. */
    design?: DesignSystem;

    /** The mode shown. */
    mode: string;

    /** The theme shown. */
    theme: string;

    /** The section shown. */
    section: DesignSystemSection;

    /** The component chosen, if any. */
    component?: string;

    /** The variant chosen, if any. */
    variant?: string;

    /** Whether the theme shown is the default one. */
    isDefaultTheme: boolean;

    /** Whether the version shown is the draft, so it can be changed by hand. */
    editable: boolean;
}

/**
 * What the editor shows for a choice: the draft when it is asked for and there is one - or when there is no active version to show -
 * the theme and mode that exist, the section that is on offer.
 *
 * @param state The design system as the host last read it.
 * @param view What was chosen.
 * @param entries The sections on offer.
 * @returns What is shown.
 */
export const showDesignSystem = (state: DesignSystemState, view: DesignSystemView, entries: readonly SectionEntry[]): ShownDesignSystem => {
    const { active, draft } = state;
    const shown: ShownVersion = (view.version === 'draft' && draft !== undefined) || active === undefined ? 'draft' : 'active';
    const version = shown === 'draft' ? draft : active;
    const design = completeDesignSystem(version?.designSystem);
    const theme = design === undefined ? '' : shownTheme(design, view.theme);
    const mode = design === undefined ? 'light' : shownMode(design, view.mode);
    const defaultTheme = design?.themes.find(candidate => candidate.isDefault) ?? design?.themes[0];
    return {
        shown,
        version,
        design,
        mode,
        theme,
        section: sectionFrom(view.section, entries),
        component: view.component,
        variant: view.variant,
        isDefaultTheme: defaultTheme?.name === theme,
        editable: shown === 'draft' && draft !== undefined,
    };
};
