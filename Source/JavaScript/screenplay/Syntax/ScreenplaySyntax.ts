// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

// What this package reads of a Screenplay syntax tree.
//
// These are structural declarations of the nodes the screen bridge touches, not a second parser: a host hands in
// the tree its own Screenplay compiler produced - `@cratis/screenplay-compiler`'s `ScreenSyntax` and `FormSyntax`
// assign to these, member for member - and TypeScript checks the shape at the call site. Declaring them here
// rather than depending on the compiler keeps the direction of dependency the same as the C# side
// (`Cratis.Scene.Screenplay` reads `Cratis.Screenplay`'s syntax, never the reverse) without this package having to
// carry a parser it never runs.
//
// Every member is optional where the Screenplay compiler may leave it out, so a host whose tree models less than
// the C# one still type-checks; what the conversion cannot see it reports as a finding rather than guessing.

export interface ScreenplayNode {
    readonly kind: string;
}

export interface FileReferenceSyntax {
    readonly path: string;
}

export interface CodeBlockSyntax {
    readonly language: string;
    readonly code: string;
}

export interface FormFieldSyntax {
    readonly kind: 'FormFieldSyntax';
    readonly property: string;
    readonly label: string | null;
    readonly from?: string | null;
    readonly composeUsing?: string | null;
}

export interface FormSyntax {
    readonly kind: 'FormSyntax';
    readonly name: string;
    readonly for: string;
    readonly fields: readonly FormFieldSyntax[];
}

export interface TypeRefSyntax {
    readonly name: string;
    readonly isCollection: boolean;
    readonly isOptional?: boolean;
}

export interface ScreenTitleSyntax extends ScreenplayNode {
    readonly kind: 'ScreenTitleSyntax';
    readonly text: string;
}

export interface ScreenDataSyntax extends ScreenplayNode {
    readonly kind: 'ScreenDataSyntax';
    readonly type: TypeRefSyntax;
    readonly query: string;
    readonly by: string | null;
}

export interface ScreenNeedSyntax extends ScreenplayNode {
    readonly kind: 'ScreenNeedSyntax';
    readonly type: TypeRefSyntax;
    readonly alias: string | null;
}

export interface ScreenColumnSyntax {
    readonly property: string;
    readonly label: string | null;
}

export interface ScreenNavigateSyntax extends ScreenplayNode {
    readonly kind: 'ScreenNavigateSyntax';
    readonly screen: string;
    readonly by: string | null;
}

export interface ScreenTableSyntax extends ScreenplayNode {
    readonly kind: 'ScreenTableSyntax';
    readonly target: string;
    readonly columns: readonly ScreenColumnSyntax[];
    readonly rowClick: ScreenNavigateSyntax | null;
    // A table that reacts - 'on double click navigate to ...' - says more than a Scene table element can hold, so it
    // is not one. Screenplay's TypeScript compiler recognizes such a block but does not model it, so a host built on
    // that compiler cannot tell this bridge the table has one: the table is then drawn without its reaction, where
    // the C# bridge would have kept the whole directive as residue. A host whose tree does carry them - the shared
    // corpus does - gets the C# bridge's own answer.
    readonly behaviors?: readonly unknown[];
    readonly usedBehaviors?: readonly unknown[];
}

export interface ScreenFieldSyntax {
    readonly property: string;
    readonly label: string;
}

export interface ScreenSummarySyntax extends ScreenplayNode {
    readonly kind: 'ScreenSummarySyntax';
    readonly target: string;
    readonly fields: readonly ScreenFieldSyntax[];
}

export interface ScreenActionSyntax extends ScreenplayNode {
    readonly kind: 'ScreenActionSyntax';
    readonly command: string;
    readonly label: string | null;
}

export interface ScreenCodeSyntax extends ScreenplayNode {
    readonly kind: 'ScreenCodeSyntax';
    readonly code: CodeBlockSyntax;
}

export interface ScreenSectionSyntax extends ScreenplayNode {
    readonly kind: 'ScreenSectionSyntax';
    readonly name: string;
    readonly directives: readonly ScreenDirectiveSyntax[];
}

export interface ScreenSlotSyntax {
    readonly name: string;
    readonly directives: readonly ScreenDirectiveSyntax[];
}

export interface ScreenTemplateReferenceSyntax extends ScreenplayNode {
    readonly kind: 'ScreenTemplateReferenceSyntax';
    readonly name: string;
    readonly blueprint?: string;
    readonly version?: string;
    readonly slots: readonly ScreenSlotSyntax[];
}

export interface UiBindingSyntax {
    readonly bindingKind?: string;
    readonly path: string;
    readonly query?: string | null;
    readonly componentId?: string | null;
    readonly componentPropertyPath?: string | null;
    readonly mode?: string | null;
    readonly nullBehavior?: string | null;
    readonly expectedValueType?: string | null;
    readonly literal?: ExpressionSyntax | null;
    readonly rawText?: string | null;
}

// A Screenplay expression as far as a Scene property value needs it. Only a literal, a list and an object are a
// value a document can hold; every other expression - a path, a clock offset, an environment value - is a value
// the screen computes, which a Scene property has no place for and the C# bridge writes as null too.
export interface LiteralExpressionSyntax extends ScreenplayNode {
    readonly kind: 'LiteralExpressionSyntax';
    readonly value: string | number | boolean | null | { readonly canonical?: string };
}

export interface ListExpressionSyntax extends ScreenplayNode {
    readonly kind: 'ListExpressionSyntax';
    readonly items: readonly ExpressionSyntax[];
}

export interface ObjectMemberSyntax {
    readonly name: string;
    readonly value: ExpressionSyntax;
}

export interface ObjectExpressionSyntax extends ScreenplayNode {
    readonly kind: 'ObjectExpressionSyntax';
    readonly members: readonly ObjectMemberSyntax[];
}

export type ExpressionSyntax = LiteralExpressionSyntax | ListExpressionSyntax | ObjectExpressionSyntax | ScreenplayNode;

export interface ComponentPropertySyntax {
    readonly property: string;
    readonly binding: UiBindingSyntax | null;
    readonly value: ExpressionSyntax | null;
}

export interface ComponentExposedValueSyntax {
    readonly name: string;
    readonly binding: UiBindingSyntax;
}

export interface PresentationValueSyntax {
    readonly name: string;
    readonly value: string;
}

export interface ComponentSlotSyntax {
    readonly name: string;
    readonly directives: readonly ScreenDirectiveSyntax[];
}

export interface ScreenComponentSyntax extends ScreenplayNode {
    readonly kind: 'ScreenComponentSyntax';
    readonly component: string;
    readonly name: string;
    readonly stableId: string | null;
    readonly context: UiBindingSyntax | null;
    readonly properties: readonly ComponentPropertySyntax[];
    readonly exposes: readonly ComponentExposedValueSyntax[];
    readonly presentation: readonly PresentationValueSyntax[];
    readonly icon: string | null;
    readonly slots: readonly ComponentSlotSyntax[];
}

export interface ToolbarButtonSyntax {
    readonly id: string;
    readonly title: string;
    readonly slice?: string | null;
    readonly emphasis?: string | null;
    readonly icon?: string | null;
    readonly confirm?: string | null;
    readonly runs?: string | null;
    readonly opens?: string | null;
    readonly opensSlot?: string | null;
    readonly isDefault?: boolean;
}

export interface ToolbarItemSyntax {
    readonly name: string;
}

export interface ScreenToolbarSyntax extends ScreenplayNode {
    readonly kind: 'ScreenToolbarSyntax';
    readonly name: string;
    readonly items: readonly ToolbarItemSyntax[];
    readonly buttons?: readonly ToolbarButtonSyntax[];
}

// Every other screen directive. The bridge recognizes it by kind and reports it rather than guessing at it.
export interface UnmodeledScreenDirectiveSyntax extends ScreenplayNode {
    readonly kind: string;
}

export type ScreenDirectiveSyntax =
    | ScreenTitleSyntax
    | ScreenDataSyntax
    | ScreenNeedSyntax
    | ScreenTableSyntax
    | ScreenSummarySyntax
    | ScreenActionSyntax
    | ScreenCodeSyntax
    | ScreenSectionSyntax
    | ScreenTemplateReferenceSyntax
    | ScreenComponentSyntax
    | ScreenToolbarSyntax
    | UnmodeledScreenDirectiveSyntax;

export interface ScreenSyntax {
    readonly kind?: string;
    readonly name: string;
    readonly directives: readonly ScreenDirectiveSyntax[];
    // A screen written as `screen <Name> file "<path>"`. Screenplay's TypeScript compiler does not model the
    // reference, so a host built on it leaves it out and a document preserved on a file reference is reported
    // rather than read.
    readonly file?: FileReferenceSyntax | null;
}
