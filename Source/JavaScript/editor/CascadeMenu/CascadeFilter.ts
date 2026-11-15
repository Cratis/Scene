// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/** The filter field at the top of a cascading menu. */
export interface CascadeFilter {
    /** What has been typed. */
    value: string;

    /** The field's placeholder, which is also its accessible name. */
    placeholder: string;

    /** Called as the text changes. */
    onChange: (value: string) => void;
}
