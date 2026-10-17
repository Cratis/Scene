// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { LogoKind, UiProfile } from '@cratis/scene.model';

/** The closed set of icons an icon logo can use. A host draws them from its own icon set; the ids are Scene's. */
export const logoIcons = ['box', 'layers', 'home', 'users', 'receipt', 'package', 'database', 'palette'] as const;

/** The most characters an initials logo shows. */
export const maximumLogoInitials = 2;

/** The largest image a logo can carry, in bytes of image data (not of the encoded text). */
export const maximumLogoImageBytes = 400 * 1024;

/** What can be wrong with the identity of a profile. The codes are camelCase and engine-owned. */
export enum ProfileIdentityDiagnosticCode {
    /** The initials are longer than two characters; they are not truncated, the mark falls back to the name. */
    InitialsTooLong = 'initialsTooLong',

    /** The icon is not in the closed set; the mark falls back to initials. */
    IconUnknown = 'iconUnknown',

    /** The image is not a base64 `data:` URI of a PNG, JPG, SVG or WebP; the logo draws as missing. */
    ImageUnsupported = 'imageUnsupported',

    /** The image is larger than the limit; the logo draws as missing. */
    ImageTooLarge = 'imageTooLarge',
}

/** One thing wrong with the identity, with a message written for the person editing it. */
export interface ProfileIdentityDiagnostic {
    code: ProfileIdentityDiagnosticCode;
    message: string;
}

/** The identity a shell draws: every fallback applied, so a blueprint never decides one itself. */
export interface ResolvedProfileIdentity {
    /** The application name; empty when neither the profile nor the host gave one. */
    name: string;

    /** Whether the name is drawn beside the mark. */
    showName: boolean;

    /** The mark that is drawn. An icon or image that cannot be used resolves to initials, except a missing image, which stays an image so it is drawn as an empty box. */
    kind: LogoKind;

    /** The one or two characters of an initials mark; always set, so a fallback has something to draw. */
    initials: string;

    /** The icon of an icon mark. */
    icon?: string;

    /** The image of an image mark, as the data URI that was stored. */
    image?: string;

    /** Whether the logo is an image logo that has no (usable) image: valid to store, a profile problem, drawn as a dashed box. */
    imageMissing: boolean;

    diagnostics: ProfileIdentityDiagnostic[];
}

const imagePattern = /^data:image\/(?:png|jpeg|jpg|svg\+xml|webp);base64,([A-Za-z0-9+/]*={0,2})$/;

/** The number of bytes of image data in a base64 text, or -1 when it is not valid base64. */
function decodedSize(base64: string): number {
    if (base64.length % 4 !== 0) return -1;
    const padding = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0;
    return base64.length / 4 * 3 - padding;
}

/** The first letter of a name, upper-cased, or `A` when there is no name. */
export function initialsFromName(name: string): string {
    const first = Array.from(name.trim())[0];
    return first === undefined ? 'A' : first.toUpperCase();
}

/**
 * Resolves the identity of a profile: the name (the host's when the profile has none), the mark and its fallbacks. This is the one answer every
 * blueprint, Studio's preview, Stage and generated React draw from.
 *
 * @param profile The profile.
 * @param hostName The application name of the host, used when the profile gives none.
 * @returns The resolved identity with a diagnostic for everything that was refused.
 */
export function resolveProfileIdentity(profile: UiProfile, hostName = ''): ResolvedProfileIdentity {
    const identity = profile.identity ?? {};
    const logo = identity.logo ?? {};
    const diagnostics: ProfileIdentityDiagnostic[] = [];
    const name = (identity.name ?? '').trim() !== '' ? identity.name!.trim() : hostName.trim();

    let initials = (logo.initials ?? '').trim();
    if (Array.from(initials).length > maximumLogoInitials) {
        diagnostics.push({
            code: ProfileIdentityDiagnosticCode.InitialsTooLong,
            message: `The initials '${initials}' are longer than ${maximumLogoInitials} characters. Use at most ${maximumLogoInitials}.`,
        });
        initials = '';
    }

    initials = initials === '' ? initialsFromName(name) : initials;

    const requested = logo.kind ?? LogoKind.Initials;
    const resolved: ResolvedProfileIdentity = { name, showName: identity.showName ?? true, kind: LogoKind.Initials, initials, imageMissing: false, diagnostics };

    if (requested === LogoKind.Icon) {
        if (logo.icon === undefined || logo.icon === '') return resolved;
        if (!(logoIcons as readonly string[]).includes(logo.icon)) {
            diagnostics.push({
                code: ProfileIdentityDiagnosticCode.IconUnknown,
                message: `The icon '${logo.icon}' is not one of the logo icons: ${logoIcons.join(', ')}.`,
            });
            return resolved;
        }

        return { ...resolved, kind: LogoKind.Icon, icon: logo.icon };
    }

    if (requested === LogoKind.Image) {
        const image = logo.image ?? '';
        if (image === '') return { ...resolved, kind: LogoKind.Image, imageMissing: true };

        const match = imagePattern.exec(image);
        const size = match === null ? -1 : decodedSize(match[1]);
        if (size < 0) {
            diagnostics.push({
                code: ProfileIdentityDiagnosticCode.ImageUnsupported,
                message: 'The logo image must be a PNG, JPG, SVG or WebP, stored as a base64 data URI.',
            });
            return { ...resolved, kind: LogoKind.Image, imageMissing: true };
        }

        if (size > maximumLogoImageBytes) {
            diagnostics.push({
                code: ProfileIdentityDiagnosticCode.ImageTooLarge,
                message: `The logo image is ${Math.ceil(size / 1024)} KB. The limit is ${maximumLogoImageBytes / 1024} KB.`,
            });
            return { ...resolved, kind: LogoKind.Image, imageMissing: true };
        }

        return { ...resolved, kind: LogoKind.Image, image };
    }

    return resolved;
}
