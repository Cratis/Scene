// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { humanizeBindingName } from '@cratis/scene.blueprint.components';
import type { Screen } from '@cratis/scene.model';

// What a dialog is titled: what its form does, in words - `DescribeProduct` is "Describe product". The screen editor's frame and the preview both say it, so
// neither shows the template's name ("Quick create") nor the slice's ("DescribeProduct"). A dialog with no form has no title of its own.
export function dialogTitleOf(screen: Pick<Screen, 'forms'> | undefined): string | undefined {
    const command = (screen?.forms ?? []).find(form => typeof form?.forCommand === 'string' && form.forCommand !== '')?.forCommand;
    return command === undefined ? undefined : humanizeBindingName(command);
}
