// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

// The screen editor as a host outside Studio uses it - the entry published as `@cratis/event-models/screen-editor`.
//
// The editor never reaches for the application it runs in. A host lends it four things - the runtime (which components
// Scene can draw), the queries a screen may bind, the state changes it can submit and the screens it can lead to - and
// gets back the edited document when the window closes. Nothing here imports Studio Core, Arc, a router or a provider.

export * from './Drafting/SceneScreenDraft';
export * from './Host/ScreenEditorOverlay';
export * from './Host/ScreenEditorPrimeReactProvider';
export * from './Host/screenEditorPrimeReactDefaults';
export * from './Host/ScreenEditorWorkspace';
export * from './Host/ScreenEditorWindow';
export * from './Host/ScreenEditorController';
export * from './Host/ScreenEditorHost';
export * from './Host/ScreenEditorFileUpload';
export * from './Host/ScreenEditorControlProviders';
export * from './Host/createScreenEditorEnvironment';
export * from './Runtime/screenEditorRuntime';
export * from './Runtime/screenEditorRuntimeForProfile';
export * from './Runtime/ScreenEditorAppearance';
export * from './Play/PlayScreen';
export * from './Thumbnail/ScreenThumbnail';
export * from './Thumbnail/readThumbnailDocument';
export * from './Thumbnail/thumbnailGeometry';
export * from './Viewport/windowSizeMemory';
export * from './Viewport/windowSizing';
export * from './Inspector/ScreenEditorStrings';
export * from './Defaults/defaultScreenEditorStrings';
export * from './PropertyEditors/Structured';
export * from './Defaults/defaultLayoutLabels';
export * from './Defaults/defaultLayoutIcons';
export * from './Defaults/defaultPaletteIcons';
export * from './Defaults/defaultPaletteSources';
export * from './Layouts/LayoutItem';
export * from './Layouts/LayoutArrangement';
export * from './Layouts/LayoutContainerDescriptor';
export * from './Layouts/toLayoutContainerDescriptors';
export * from './Palette/buildPalette';
export * from './Actions/StateChangeSlice';
export * from './Binding/toSceneCandidates';
export * from './Integration';
export * from './Document/readSceneDocument';
export * from './Document/screenSelection';
export * from './Structure/Ownership';
export * from './Structure/StructureEditRejection';
export type { PersistedUiProfile } from '../UiProfile/PersistedUiProfile';
