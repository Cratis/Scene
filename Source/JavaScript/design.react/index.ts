// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

// The host seams: everything the canvas needs from the application it is mounted in.
export * from './Host/DesignCanvasHost';
export * from './Host/DesignCanvasHostContext';
export * from './Host/defaultDesignStrings';
export * from './Host/randomDesignIds';
export * from './Host/catalogueInputFromRuntime';

// The state logic, pure and without React: events a design records, history, tweaks, pins, storylines and the template set.
export * from './State/recordDesignOperations';
export * from './State/chatTurns';
export * from './State/commentPins';
export * from './State/revisionHistory';
export * from './State/tweakControls';
export * from './State/storylines';
export * from './State/templateSet';
export * from './State/templateDrafts';
export * from './State/templateSchematic';
export * from './State/restrictEditorToTemplateSet';
export * from './State/useDesignModel';
export * from './State/useDesignChat';
export * from './State/useCandidateDocuments';

// The canvas and its parts.
export * from './Canvas/DesignCanvas';
export * from './Canvas/Artboard';
export * from './Canvas/TemplateSchematic';
export * from './Canvas/VariationStrip';
export * from './Canvas/StorylineBar';
export * from './Canvas/NewScreenForm';
export * from './Chat/ChatBar';
export * from './Chat/ChatTurnView';
export * from './Panels/HistoryPanel';
export * from './Panels/TweaksPanel';
export * from './Panels/CommentsPanel';
export * from './Panels/TemplatesPanel';
export * from './Panels/TemplateSetPicker';
export * from './Panels/ProposalList';
export * from './Panels/EditOverlay';

// The read-only screens overview, for a product-wide "Screens" tab.
export * from './Overview/screensOverview';
export * from './Overview/ScreensOverview';
