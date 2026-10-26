// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

export interface SubjectReference {
    subject: string;
}

export const SubjectReferencePropertyNames: (keyof SubjectReference)[] = ['subject'];
