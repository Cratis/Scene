---
title: The Contracts blueprint
description: Contracts for a legal or procurement team - a contract list, a contract page with its parties, obligations and amendments, a timeline of terms and an inbox for what needs review or signature.
---

`@cratis/scene.blueprint.contracts` is a **domain blueprint** built on the [foundation set](foundation-templates.md) the way [the Orders blueprint](orders-blueprint.md) is: it brings no shell, component or theme of its own and adds what is particular to contracts - four screen templates, one dialog template, a screen set wired into navigation, and a sample-data pack. It is held to the same [definition of done](ship-your-own-blueprint.md#the-definition-of-done): `verifyBlueprintPackage` is green, every template passes the per-template check, and every screen and dialog is audited in Chromium at desktop, tablet and phone widths in the light and dark themes, colour contrast included.

## The screens

| Screen | Template | Foundation template | What it shows |
| --- | --- | --- | --- |
| `contracts.list` | `ContractsList` | ListScreen | Every contract with who it is with, when it ends and what it is worth. |
| `contracts.record` | `ContractPage` | RecordPage | One contract: key facts, parties, obligations, amendments and activity. |
| `contracts.timeline` | `ContractsTimeline` | TimelineScreen | Every live contract on a schedule, in a lane for each counterparty, with its notice dates. |
| `contracts.review` | `ContractsReview` | InboxScreen | What needs your review, your signature or a renewal decision. |
| (dialog) | `ContractsQuickCreateContract` | QuickCreateDialog | The few fields to start a contract. |

The category is `Business / Contracts`. Templates carry their `scopes` (Part A 4.2): the lists, boards, calendars, timelines, dashboards, inboxes and profiles apply at module and feature level, the record pages and wizards at feature and sub-feature level, and the dialogs at slice level.

## Navigation

The topbar names the module, `contracts`; the module's sidebar overrides the application's and lists **Contracts**, **Timeline** and **Needs attention**. A screen is a feature of the `contracts` module: `contracts.list` is the `list` feature. The screen set (`contractsScreenDefinitions`) is the one list the manifest's `blueprint.screenSet`, the `Screen` instances, the application structure and the navigation are all derived from, and a specification holds them to it.

## Behaviors

- choosing a row of **Contracts** opens its page, handing it the chosen row's id;
- **New contract** opens the `ContractsQuickCreateContract` dialog, whose button closes it;
- the timeline on **Timeline** keeps its scale in the address and tells a conflict in words;
- the queue on **Needs attention** is grouped by day, tells unread in words and moves by keyboard; the open message is kept in the address;
- the toolbar search narrows a list as it is typed and the search is part of the address.

## Sample data

`contracts-en` (British English, pounds) holds contract data: twelve contracts from draft to expired, one contract's parties, obligations and amendments, the terms on a timeline and the review queue. Nothing in it is a real person or company.

## Adopting it

Install the package, add `Cratis.Blueprint.Contracts` to the application's blueprints and reference a template by name from Screenplay:

```
screen Contracts
  template blueprint Cratis.Blueprint.Contracts ContractsList version "^1.0"
```

A complete application built from it is [`Samples/Contracts`](https://github.com/Cratis/Screenplay/tree/main/Samples/Contracts) in Screenplay.
