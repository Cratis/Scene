---
title: The Bookings blueprint
description: Bookings for shared rooms, equipment and vehicles - a booking calendar, a booking list, a booking page, the resources and a wizard that books one in four steps.
---

`@cratis/scene.blueprint.bookings` is a **domain blueprint** built on the [foundation set](foundation-templates.md) the way [the Orders blueprint](orders-blueprint.md) is: it brings no shell, component or theme of its own and adds what is particular to bookings - five screen templates, one dialog template, a screen set wired into navigation, and a sample-data pack. It is held to the same [definition of done](ship-your-own-blueprint.md#the-definition-of-done): `verifyBlueprintPackage` is green, every template passes the per-template check, and every screen and dialog is audited in Chromium at desktop, tablet and phone widths in the light and dark themes, colour contrast included.

## The screens

| Screen | Template | Foundation template | What it shows |
| --- | --- | --- | --- |
| `bookings.calendar` | `BookingsCalendar` | the foundation `calendarGrid` | Every booking on a calendar: who has what, and when. |
| `bookings.list` | `BookingsList` | ListScreen | Every booking with its resource, time and status. |
| `bookings.record` | `BookingPage` | RecordPage | One booking: key facts, its attendees, its extras and its activity. |
| `bookings.resources` | `ResourcesList` | ListScreen | The rooms, equipment and vehicles that can be booked. |
| `bookings.new` | `NewBookingWizard` | WizardScreen | Book a room, equipment or a vehicle in four short steps. |
| (dialog) | `BookingsQuickCreateBooking` | QuickCreateDialog | The few fields to start a booking. |

The category is `Business / Bookings`. Templates carry their `scopes` (Part A 4.2): the lists, boards, calendars, timelines, dashboards, inboxes and profiles apply at module and feature level, the record pages and wizards at feature and sub-feature level, and the dialogs at slice level.

## Navigation

The topbar names the module, `bookings`; the module's sidebar overrides the application's and lists **Calendar**, **Bookings**, **Resources** and **New booking**. A screen is a feature of the `bookings` module: `bookings.calendar` is the `calendar` feature. The screen set (`bookingsScreenDefinitions`) is the one list the manifest's `blueprint.screenSet`, the `Screen` instances, the application structure and the navigation are all derived from, and a specification holds them to it.

## Behaviors

- choosing a row of **Bookings** opens its page, handing it the chosen row's id;
- **Quick booking** opens the `BookingsQuickCreateBooking` dialog, whose button closes it;
- **Book a resource** goes to `bookings.new`;
- the calendar on **Calendar** keeps the day and the view in the address, so a link shares it as it is;
- the wizard on **New booking** keeps the step reached across a refresh and blocks Next on an invalid step, saying why;
- the toolbar search narrows a list as it is typed and the search is part of the address.

## Sample data

`bookings-en` (British English, pounds) holds booking data: twelve bookings of eight rooms, equipment and vehicles from requested to completed, one booking's attendees and extras, and the wizard steps. Nothing in it is a real person or company.

## Adopting it

Install the package, add `Cratis.Blueprint.Bookings` to the application's blueprints and reference a template by name from Screenplay:

```
screen Bookings
  template blueprint Cratis.Blueprint.Bookings BookingsList version "^1.0"
```

A complete application built from it is [`Samples/Bookings`](https://github.com/Cratis/Screenplay/tree/main/Samples/Bookings) in Screenplay.
