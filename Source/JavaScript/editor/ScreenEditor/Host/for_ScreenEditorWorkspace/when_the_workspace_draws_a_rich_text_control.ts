// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { blueprintPreviewBundles } from '../../../BlueprintPreview/blueprintPreviewCatalog';
import { defaultLayoutLabels } from '../../Defaults/defaultLayoutLabels';
import { defaultPaletteIcons } from '../../Defaults/defaultPaletteIcons';
import { defaultPaletteSources } from '../../Defaults/defaultPaletteSources';
import { defaultScreenEditorStrings } from '../../Defaults/defaultScreenEditorStrings';
import { createExternalComponent } from '../../Document/createExternalComponent';
import { createPanel } from '../../Document/createPanel';
import { createScreenDocument } from '../../Document/studioScreen';
import { LayoutItem } from '../../Layouts/LayoutItem';
import { createScreenEditorRuntime } from '../../Runtime/screenEditorRuntime';
import { createScreenEditorEnvironment } from '../createScreenEditorEnvironment';
import { ScreenEditorPrimeReactProvider } from '../ScreenEditorPrimeReactProvider';
import { ScreenEditorWorkspace } from '../ScreenEditorWorkspace';

const runtime = createScreenEditorRuntime(blueprintPreviewBundles, { name: 'host', packages: blueprintPreviewBundles.map(bundle => bundle.manifest.name) } as never);
const notAvailable = 'Rich-text editing is not available in this application';

// The workspace is what a screen template is authored in. It must give the controls the same host services the floating editor does.
const drawWorkspace = (options: Parameters<typeof createScreenEditorEnvironment>[0] extends infer T ? Partial<T> : never) => {
    const document = createScreenDocument(createPanel(LayoutItem.Stack, 'root', 'Root', [createExternalComponent('notes', 'Notes', 'editor', { value: '<p>Hello</p>' })]));
    const environment = createScreenEditorEnvironment({ runtime, ...options });
    return renderToStaticMarkup(createElement(ScreenEditorPrimeReactProvider, null, createElement(ScreenEditorWorkspace, {
        subject: { document },
        environment,
        strings: defaultScreenEditorStrings,
        layoutLabels: defaultLayoutLabels,
        icons: defaultPaletteIcons,
        paletteSources: defaultPaletteSources,
    })));
};

describe('when the workspace draws a screen holding a rich text control and the host lends the editor engine', () => {
    const markup = drawWorkspace({});

    it('should draw the control', () => markup.should.contain('data-scene-component="editor"'));
    it('should not say the control is read-only for want of a loader', () => markup.should.not.contain(notAvailable));
});

describe('when the workspace draws the same screen and the host declines rich text', () => {
    const markup = drawWorkspace({ richText: false });

    it('should draw the control', () => markup.should.contain('data-scene-component="editor"'));
    it('should say the control is not available, so the loader above is the provider and not an accident', () => markup.should.contain(notAvailable));
});
