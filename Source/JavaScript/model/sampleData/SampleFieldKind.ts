// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * What kind of value a field holds, as far as generated sample data is concerned. The deterministic
 * generator picks a value pool and a value range from the kind; the member values are the strings used in
 * documents.
 */
export enum SampleFieldKind {
    /** A stable unique identifier (a UUID). */
    Id = 'id',

    /** A person's full name. */
    Name = 'name',

    /** A company or organization name. */
    Company = 'company',

    /** An email address. */
    Email = 'email',

    /** A phone number in the pack locale's style. */
    Phone = 'phone',

    /** A city name from the pack locale. */
    City = 'city',

    /** A short free-text phrase. */
    Text = 'text',

    /** A whole number. */
    WholeNumber = 'wholeNumber',

    /** A monetary or other two-decimal amount. */
    Amount = 'amount',

    /** A true/false value. */
    Boolean = 'boolean',

    /** A calendar date, `yyyy-MM-dd`. */
    Date = 'date',

    /** A UTC date and time, `yyyy-MM-ddTHH:mm:ssZ`. */
    DateTime = 'dateTime',

    /** One of a fixed set of named values, given by the field's `enumValues`. */
    Enum = 'enum',
}
