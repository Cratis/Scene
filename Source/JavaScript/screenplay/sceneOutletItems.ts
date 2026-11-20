// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { ToolbarButtonSyntax } from './Syntax/ScreenplaySyntax';
import type { JsonObject, JsonValue } from './json';
import { optional } from './sceneValues';

// The import half of SceneOutletItems, for the one item kind a screen's `toolbar` writes: a button.
export const toolbarButtonsToJson = (buttons: readonly ToolbarButtonSyntax[]): JsonValue[] => buttons.map(buttonToJson);

const buttonToJson = (button: ToolbarButtonSyntax): JsonObject => {
    const json: JsonObject = { kind: 'button', id: button.id, title: button.title };
    optional(json, 'slice', button.slice);
    optional(json, 'emphasis', lower(button.emphasis));
    writeIcon(json, button.icon);
    optional(json, 'confirm', button.confirm);
    if (button.opens !== null && button.opens !== undefined) {
        // 'runs' means the hook runs the slice without opening anything, which the document writes as 'none'.
        json.opens = button.opens === 'Runs' ? 'none' : button.opens.toLowerCase();
        if (button.opens === 'Slot') optional(json, 'opensIn', button.opensSlot);
    }

    return json;
};

// The mirror of SceneNavigationIcons.Write: an icon travels qualified against the Lucide library, and one written
// unqualified is remembered as it was written so an export writes it back the same.
const lucide = 'Cratis.Icons.Lucide';

const writeIcon = (json: JsonObject, icon: string | null | undefined): void => {
    if (icon === null || icon === undefined) return;
    json.icon = icon.includes('#') ? icon : `${lucide}#${icon}`;
    if (!icon.includes('#')) json.screenplayIcon = icon;
};

// Emphasis and the opening are written lower case, as the editor writes them; a slice reference keeps its spelling.
const lower = (value: string | null | undefined): string | undefined =>
    value === null || value === undefined ? undefined : value.toLowerCase();
