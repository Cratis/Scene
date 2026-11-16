// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

// The kinds of node the profile's structure tree has. The tree is the profile itself, not a document of elements:
// Application at the root, and under it the shell, the theme, the packages and the sample data.
export enum ProfileNodeKind {
    Application = 'application',
    Shell = 'shell',
    Theme = 'theme',
    Packages = 'packages',
    SampleData = 'sampleData',
}
