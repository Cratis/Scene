// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

// The review stays open as far as its owner is concerned, but is not drawn while the application preview is up: the modal
// review would otherwise sit above the preview. Its proposal and instruction live in the owner, so nothing is lost.
export const sceneScreenDraftReviewVisible = (open: boolean, previewing: boolean) => open && !previewing;
