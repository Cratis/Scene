// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/** The value pools and formats generated data draws from for one locale. */
export interface SampleLocale {
    firstNames: string[];
    lastNames: string[];
    companies: string[];
    cities: string[];
    domains: string[];
    /** `#` is replaced by a random digit. */
    phoneTemplate: string;
    words: string[];
}

const englishWords = ['review', 'quarterly', 'update', 'invoice', 'customer', 'delivery', 'schedule', 'renewal', 'report', 'follow', 'up', 'meeting'];

const locales = new Map<string, SampleLocale>(Object.entries({
    'en-GB': {
        firstNames: ['Oliver', 'Amelia', 'George', 'Isla', 'Harry', 'Ava', 'Jack', 'Freya', 'Arthur', 'Poppy'],
        lastNames: ['Smith', 'Jones', 'Taylor', 'Brown', 'Wilson', 'Evans', 'Thomas', 'Roberts', 'Walker', 'Wright'],
        companies: ['Northgate Ltd', 'Albion Supplies Ltd', 'Thames Logistics Ltd', 'Pennine Foods Ltd', 'Harbour Digital Ltd', 'Cotswold Tools Ltd'],
        cities: ['London', 'Manchester', 'Leeds', 'Bristol', 'Glasgow', 'Cardiff', 'Sheffield', 'Newcastle'],
        domains: ['example.co.uk', 'example.org.uk', 'sample.co.uk'],
        phoneTemplate: '+44 7### ######',
        words: englishWords,
    },
    'en-US': {
        firstNames: ['James', 'Emma', 'Michael', 'Olivia', 'William', 'Sophia', 'Benjamin', 'Mia', 'Henry', 'Grace'],
        lastNames: ['Johnson', 'Miller', 'Davis', 'Garcia', 'Anderson', 'Martin', 'Clark', 'Lewis', 'Young', 'Hall'],
        companies: ['Summit Supply Inc', 'Bluebird Software Inc', 'Redwood Freight Inc', 'Lakeside Foods Inc', 'Cardinal Tools Inc', 'Pioneer Digital Inc'],
        cities: ['New York', 'Chicago', 'Austin', 'Seattle', 'Denver', 'Boston', 'Atlanta', 'Portland'],
        domains: ['example.com', 'example.net', 'sample.com'],
        phoneTemplate: '+1 (555) ###-####',
        words: englishWords,
    },
    'nb-NO': {
        firstNames: ['Lars', 'Ingrid', 'Ola', 'Kari', 'Henrik', 'Sigrid', 'Magnus', 'Åse', 'Bjørn', 'Mari'],
        lastNames: ['Hansen', 'Johansen', 'Olsen', 'Larsen', 'Andersen', 'Pedersen', 'Nilsen', 'Kristiansen', 'Berg', 'Haugen'],
        companies: ['Fjordline AS', 'Nordlys Handel AS', 'Fjellvik Maskin AS', 'Bergen Logistikk AS', 'Havbruk Partner AS', 'Skagerrak Digital AS'],
        cities: ['Oslo', 'Bergen', 'Trondheim', 'Stavanger', 'Tromsø', 'Drammen', 'Kristiansand', 'Ålesund'],
        domains: ['eksempel.no', 'prove.no', 'demo.no'],
        phoneTemplate: '+47 9## ## ###',
        words: ['gjennomgang', 'kvartal', 'oppdatering', 'faktura', 'kunde', 'levering', 'avtale', 'fornyelse', 'rapport', 'oppfølging', 'møte', 'bestilling'],
    },
    'sv-SE': {
        firstNames: ['Erik', 'Astrid', 'Lars', 'Maja', 'Anders', 'Elsa', 'Johan', 'Linnéa', 'Gustav', 'Åsa'],
        lastNames: ['Andersson', 'Johansson', 'Karlsson', 'Nilsson', 'Eriksson', 'Larsson', 'Olsson', 'Persson', 'Svensson', 'Gustafsson'],
        companies: ['Norrlands Handel AB', 'Östersund Teknik AB', 'Göta Logistik AB', 'Skärgården Livs AB', 'Malmö Digital AB', 'Vättern Verktyg AB'],
        cities: ['Stockholm', 'Göteborg', 'Malmö', 'Uppsala', 'Västerås', 'Örebro', 'Linköping', 'Umeå'],
        domains: ['exempel.se', 'prov.se', 'demo.se'],
        phoneTemplate: '+46 70 ### ## ##',
        words: ['granskning', 'kvartal', 'uppdatering', 'faktura', 'kund', 'leverans', 'avtal', 'förnyelse', 'rapport', 'uppföljning', 'möte', 'beställning'],
    },
    'de-DE': {
        firstNames: ['Lukas', 'Anna', 'Felix', 'Marie', 'Jonas', 'Sophie', 'Maximilian', 'Lena', 'Paul', 'Jördis'],
        lastNames: ['Müller', 'Schmidt', 'Schneider', 'Fischer', 'Weber', 'Meyer', 'Wagner', 'Becker', 'Schulz', 'Hoffmann'],
        companies: ['Rheinwerk GmbH', 'Nordsee Handel GmbH', 'Isar Logistik GmbH', 'Schwarzwald Technik GmbH', 'Elbe Digital GmbH', 'Bayern Werkzeug GmbH'],
        cities: ['Berlin', 'Hamburg', 'München', 'Köln', 'Frankfurt', 'Stuttgart', 'Düsseldorf', 'Leipzig'],
        domains: ['beispiel.de', 'muster.de', 'demo.de'],
        phoneTemplate: '+49 151 ########',
        words: ['prüfung', 'quartal', 'aktualisierung', 'rechnung', 'kunde', 'lieferung', 'vertrag', 'verlängerung', 'bericht', 'nachfassen', 'termin', 'bestellung'],
    },
} as Record<string, SampleLocale>));

const languageDefaults = new Map<string, string>([
    ['en', 'en-GB'],
    ['nb', 'nb-NO'],
    ['nn', 'nb-NO'],
    ['no', 'nb-NO'],
    ['sv', 'sv-SE'],
    ['de', 'de-DE'],
]);

/** The locale used when a tag matches no pool. */
export const defaultSampleLocale = 'en-GB';

/** The locale tags with their own pools. */
export const sampleLocaleTags: string[] = [...locales.keys()];

/**
 * Resolves a BCP 47 tag to a pool: the exact tag (language lower case, region upper case), else the
 * language's default pool, else {@link defaultSampleLocale}.
 */
export function sampleLocaleFor(tag: string | undefined): SampleLocale {
    const parts = (tag ?? '').trim().split('-');
    const language = parts[0].toLowerCase();
    const region = parts.length > 1 ? parts[1].toUpperCase() : '';
    const exact = region === '' ? undefined : locales.get(`${language}-${region}`);
    return exact ?? locales.get(languageDefaults.get(language) ?? defaultSampleLocale)!;
}
