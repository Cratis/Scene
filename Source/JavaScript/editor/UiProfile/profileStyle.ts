// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { CornerStyle, LogoKind, type ProfileIdentity } from '@cratis/scene.model';
import type { StoredUiProfileIdentity, StoredUiProfileStyle } from './StoredUiProfileShape';
import type { UiProfileSettings } from './UiProfileSettings';

const kindOf: Record<string, LogoKind> = { initials: LogoKind.Initials, icon: LogoKind.Icon, image: LogoKind.Image };
const cornersOf: Record<string, CornerStyle> = { sharp: CornerStyle.Sharp, default: CornerStyle.Default, round: CornerStyle.Round };

/**
 * Turns the identity, corners and font a draft holds into what the application stores. Anything the author left out is stored empty, which reads
 * back as Scene's default: no member is invented here.
 *
 * @param settings The settings to store.
 * @returns The stored style.
 */
export function styleOf(settings: UiProfileSettings): StoredUiProfileStyle {
    const identity = settings.identity;
    const logo = identity?.logo;
    return {
        identity: {
            name: identity?.name ?? '',
            logoKind: logo?.kind === undefined ? '' : logo.kind.toLowerCase(),
            initials: logo?.initials ?? '',
            icon: logo?.icon ?? '',
            image: logo?.image ?? '',
            showName: identity?.showName ?? true,
        },
        corners: settings.corners === undefined ? '' : settings.corners.toLowerCase(),
        font: settings.font ?? '',
    };
}

function identityOf(stored: StoredUiProfileIdentity): ProfileIdentity | undefined {
    const kind = kindOf[stored.logoKind];
    const hasLogo = kind !== undefined || stored.initials !== '' || stored.icon !== '' || stored.image !== '';
    if (stored.name === '' && !hasLogo && stored.showName) return undefined;
    return {
        ...(stored.name === '' ? {} : { name: stored.name }),
        ...(hasLogo
            ? {
                logo: {
                    ...(kind === undefined ? {} : { kind }),
                    ...(stored.initials === '' ? {} : { initials: stored.initials }),
                    ...(stored.icon === '' ? {} : { icon: stored.icon }),
                    ...(stored.image === '' ? {} : { image: stored.image }),
                },
            }
            : {}),
        ...(stored.showName ? {} : { showName: false }),
    };
}

/**
 * Reads a stored style back into the choices a draft edits. A profile stored before the style existed has none and keeps Scene's defaults; a corner
 * style this build does not know is dropped rather than thrown, so the page still opens.
 *
 * @param settings The settings read so far.
 * @param style What was stored beside the profile, if anything.
 * @returns The settings with the identity, corners and font.
 */
export function withStoredStyle(settings: UiProfileSettings, style: StoredUiProfileStyle | undefined | null): UiProfileSettings {
    if (style === undefined || style === null) return settings;
    const identity = style.identity === undefined ? undefined : identityOf(style.identity);
    const corners = cornersOf[style.corners];
    return {
        ...settings,
        ...(identity === undefined ? {} : { identity }),
        ...(corners === undefined ? {} : { corners }),
        ...(style.font === '' || style.font === undefined ? {} : { font: style.font }),
    };
}
