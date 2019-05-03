import { Length, OptionalKeys, DeepPartial, PickDeepPartial, NoneEmptyPick, NoneTypeEqualsNotTypeIntersection, NoneNotTypeExtendsTypeIntersection, NoneTypeExtendsNotTypeIntersection } from "@teronis/ts-definitions";

export type ExtractOrUnknown<T, U, Extraction = Extract<T, U>> = [Extraction] extends [never] ? unknown : Extraction;

export type ExpansionOverPick<Expansion, Keys extends keyof Expansion, __Pick = Pick<Expansion, Keys>> = __Pick extends Expansion ? Expansion : __Pick;

export type IsNever<T> = [T] extends [never] ? true : false;

type UnionKeys<T> = T extends any ? keyof T : never;
type Pick2<T extends any, K extends UnionKeys<T>> = true;

export type NoneEmptyPartedPick<T, RequiredKeys extends keyof T, OptionalKeys extends keyof T> = (
    { [K in RequiredKeys]: T[K] }
    & { [K in OptionalKeys]: T[K] }
);


export interface ContentMutations {
    ExtractObject: "ExtractObject";
    ExtractArray: "ExtractArray";
    ExcludeArray: "ExcludeArray";
    ExcludeObject: "ExcludeObject";
}

export type ContentMutationKeys = keyof ContentMutations;
export type ContentMutationArray = ContentMutationKeys[];

export type DefaultContentMutation = [];
export type ContentMutationOrArray = ContentMutationKeys | ContentMutationArray;
export type ContentMutationAsArray<Options extends ContentMutationOrArray> = Options extends ContentMutationKeys[] ? Options : [Options];


export type MutateContent<Content, Mutation extends ContentMutationKeys> = (
    Mutation extends ContentMutations["ExtractObject"] ? Extract<Content, object>
    : Mutation extends ContentMutations["ExtractArray"] ? Extract<Content, any[]>
    : Mutation extends ContentMutations["ExcludeArray"] ? Exclude<Content, any[]>
    : Mutation extends ContentMutations["ExcludeObject"] ? Exclude<Content, object>
    : "Mutation not implemented"
);

export type ValueContent<
    Content,
    Mutations extends ContentMutationOrArray,
    __Mutations extends ContentMutationAsArray<Mutations> = ContentMutationAsArray<Mutations>,
    __MutationsLength extends number = Length<__Mutations>,
    > = (
        __MutationsLength extends 0 ? Content
        : __MutationsLength extends 1 ? MutateContent<Content, __Mutations[0]>
        : __MutationsLength extends 2 ? MutateContent<MutateContent<Content, __Mutations[0]>, __Mutations[1]>
        : __MutationsLength extends 3 ? MutateContent<MutateContent<MutateContent<Content, __Mutations[0]>, __Mutations[1]>, __Mutations[2]>
        : __MutationsLength extends 4 ? MutateContent<MutateContent<MutateContent<MutateContent<Content, __Mutations[0]>, __Mutations[1]>, __Mutations[2]>, __Mutations[3]>
        : {
            message: "The amount of mutations have been exceeded",
            mutations: __Mutations,
            mutations_length: __MutationsLength,
        }
    );

export type Value<
    Content,
    ContentMutations extends ContentMutationOrArray = DefaultContentMutation,
    > = {
        Content: ValueContent<Content, ContentMutations>;
    };

export interface PureDualContent<
    LeftContent,
    RightContent
    > {
    LeftContent: LeftContent;
    RightContent: RightContent;
}

type DefaultDualContent = PureDualContent<any, any>;

export interface ImpureDualContent<
    LeftContent,
    RightContent,
    ContentMutations extends ContentMutationOrArray,
    > extends PureDualContent<
    Value<LeftContent, ContentMutations>["Content"],
    Value<RightContent, ContentMutations>["Content"]
    > { }

export interface PureFlankContent<
    DualContent extends DefaultDualContent
    > extends PureDualContent<DualContent["LeftContent"], DualContent["RightContent"]> { }

export interface ImpureFlankContent<
    DualContent extends DefaultDualContent,
    ContentMutations extends ContentMutationOrArray,
    > extends ImpureDualContent<DualContent["LeftContent"], DualContent["RightContent"], ContentMutations> { }


export interface ContentKeychain<
    Content,
    __OptionalKeys extends OptionalKeys<Content> = OptionalKeys<Content>,
    __RequiredKeys extends Exclude<keyof Content, __OptionalKeys> = Exclude<keyof Content, __OptionalKeys>
    > {
    OptionalKeys: __OptionalKeys;
    RequiredKeys: __RequiredKeys;
    Keys: __OptionalKeys | __RequiredKeys;
}

export interface DualContentKeychain<
    LeftContent,
    RightContent,
    __LeftKeychain extends ContentKeychain<LeftContent> = ContentKeychain<LeftContent>,
    __RightKeychain extends ContentKeychain<RightContent> = ContentKeychain<RightContent>,
    __RequiredKeys = __LeftKeychain["RequiredKeys"] | __RightKeychain["RequiredKeys"],
    __OptionalKeys = __LeftKeychain["OptionalKeys"] | __RightKeychain["OptionalKeys"],
    __Keys = __LeftKeychain["Keys"] | __RightKeychain["Keys"],
    __MutualRequiredKeys = __LeftKeychain["RequiredKeys"] & __RightKeychain["RequiredKeys"],
    __MutualOptionalKeys = __LeftKeychain["OptionalKeys"] & __RightKeychain["OptionalKeys"],
    __MutualKeys = __LeftKeychain["Keys"] & __RightKeychain["Keys"]
    > {
    LeftValueKeychain: __LeftKeychain;
    RightValueKeychain: __RightKeychain;
    RequiredKeys: __RequiredKeys;
    OptionalKeys: __OptionalKeys;
    Keys: __Keys;
    MutualRequiredKeys: __MutualRequiredKeys;
    MutualOptionalKeys: __MutualOptionalKeys;
    MutualKeys: __MutualKeys;
}

type DefaultDualKeychain = DualContentKeychain<any, any, any, any, any, any, any>;

export type FlankValuesKeychain<
    DualContent extends DefaultDualContent,
    __LeftKeychain extends ContentKeychain<DualContent["LeftContent"]> = ContentKeychain<DualContent["LeftContent"]>,
    __RightKeychain extends ContentKeychain<DualContent["RightContent"]> = ContentKeychain<DualContent["RightContent"]>
    > = DualContentKeychain<DualContent["LeftContent"], DualContent["RightContent"]>;

/** Represents an interface that calculates the left keys without the right keys. */
export interface SingleRemnantKeychain<
    DualKeychain extends DefaultDualKeychain,
    SingleKeychain extends DualKeychain["LeftValueKeychain"] | DualKeychain["RightValueKeychain"]
    > {
    OptionalKeys: Exclude<DualKeychain["OptionalKeys"], SingleKeychain["OptionalKeys"]>;
    RequiredKeys: Exclude<DualKeychain["RequiredKeys"], SingleKeychain["RequiredKeys"]>;
    Keys: Exclude<SingleKeychain["Keys"], DualKeychain["MutualKeys"]>;
}

export interface FlankRemnantsKeychain<
    DualContentKeychain extends DefaultDualKeychain
    > {
    LeftRemnant: SingleRemnantKeychain<DualContentKeychain, DualContentKeychain["LeftValueKeychain"]>;
    RightRemnant: SingleRemnantKeychain<DualContentKeychain, DualContentKeychain["RightValueKeychain"]>;
}


export interface MixtureKinds {
    None: "None";
    Intersection: "Intersection";
    LeftExceptRight: "LeftExceptRight";
    LeftIncludingIntersection: MixtureKinds["Intersection"] | MixtureKinds["LeftExceptRight"]
    RightExceptLeft: "RightExceptLeft";
    RightIncludingIntersection: MixtureKinds["Intersection"] | MixtureKinds["RightExceptLeft"]
    FlanksExceptIntersection: MixtureKinds["LeftExceptRight"] | MixtureKinds["RightExceptLeft"];
    All: MixtureKinds["Intersection"] | MixtureKinds["FlanksExceptIntersection"];
}

export type MixtureKindKeys = keyof MixtureKinds;


export interface PrimsMixtureOptions {
    ContentMutations: ContentMutationOrArray;
    MixtureKind: MixtureKindKeys;
}

interface DefaultPrimsMixtureOptions extends PrimsMixtureOptions {
    ContentMutations: "ExcludeObject";
    MixtureKind: "Intersection";
}

/** A Primitives-Mixture. */
export type PrimsMixture<
    DualContent extends DefaultDualContent,
    Options extends DeepPartial<PrimsMixtureOptions> = {},
    __ContentMutations extends ContentMutationOrArray = Options extends Pick<PrimsMixtureOptions, "ContentMutations"> ? Options["ContentMutations"] : DefaultPrimsMixtureOptions["ContentMutations"],
    __MixtureKind extends MixtureKindKeys = Options extends Pick<PrimsMixtureOptions, "MixtureKind"> ? Options["MixtureKind"] : DefaultPrimsMixtureOptions["MixtureKind"],
    __DualContent extends ImpureFlankContent<DualContent, __ContentMutations> = ImpureFlankContent<DualContent, __ContentMutations>,
    __Intersection = __DualContent["LeftContent"] & __DualContent["RightContent"]
    > = (
        [MixtureKinds["None"]] extends [MixtureKinds[__MixtureKind]] ? never : (
            (
                [MixtureKinds["Intersection"]] extends [MixtureKinds[__MixtureKind]]
                ? __Intersection
                : never
            ) | (
                [MixtureKinds["LeftExceptRight"]] extends [MixtureKinds[__MixtureKind]]
                ? Exclude<__DualContent["LeftContent"], __Intersection>
                : never
            ) | (
                [MixtureKinds["RightExceptLeft"]] extends [MixtureKinds[__MixtureKind]]
                ? Exclude<__DualContent["RightContent"], __Intersection>
                : never
            )
        )
    );

interface BaseArrayMixtureOptions {
    ContentMutations: ContentMutationOrArray;
}

interface DefaultBaseArrayMixtureOptions extends BaseArrayMixtureOptions {
    ContentMutations: "ExtractArray";
}

export interface ArrayMixtureOptions extends BaseArrayMixtureOptions, PrimsPropsMixtureOptions { }
// export interface ArrayMixtureOptions extends BaseArrayMixtureOptions { }

export interface DefaultArrayMixtureOptions extends DefaultBaseArrayMixtureOptions, DefaultPrimsPropsMixtureOptions { }

// FEATURE: ARRAY MIXTURE
export type InnerArrayMixture<
    DualContent extends DefaultDualContent,
    Options extends DeepPartial<ArrayMixtureOptions>,
    // Options extends DeepPartial<{}>,
    __ContentMutations extends ContentMutationOrArray = Options extends Pick<PrimsMixtureOptions, "ContentMutations"> ? Options["ContentMutations"] : DefaultPropsMixtureOptions["ContentMutations"],
    __DualContent extends ImpureFlankContent<DualContent, __ContentMutations> = ImpureFlankContent<DualContent, __ContentMutations>
    > = (
        __DualContent["LeftContent"] extends Array<infer LeftTypes>
        ? (__DualContent["RightContent"] extends Array<infer RightTypes>
            ? (Array<PrimsPropsMixture<PureDualContent<LeftTypes, RightTypes>, Options>>)
            // ? never
            : never)
        : never
    );

export type OuterArrayMixture<
    DualContent extends DefaultDualContent,
    Options extends DeepPartial<ArrayMixtureOptions>,
    > = (
        [DualContent["LeftContent"]] extends [never] ? never : (
            [DualContent["RightContent"]] extends [never] ? never : (
                DualContent["LeftContent"] extends any[] ? (
                    DualContent["RightContent"] extends any[]
                    ? InnerArrayMixture<DualContent, Options>
                    : never
                ) : never
            )
        )
    );

// export interface ArrayPrimsMixtureOptions {
//     ArrayMixtureOptions: ArrayMixtureOptions;
//     PrimsMixtureOptions: PrimsMixtureOptions;
// }

// export interface DefaultArrayPrimsMixtureOptions extends ArrayPrimsMixtureOptions {
//     ArrayMixtureOptions: DefaultArrayMixtureOptions;
//     PrimsMixtureOptions: DefaultPrimsMixtureOptions;
// }

// // FEATURE: PRIM PROPS MIXTURE
// export type ArrayPrimsMixture<
//     DualContent extends DefaultDualContent,
//     Options extends DeepPartial<ArrayPrimsMixtureOptions> = {},
//     > = (
//         OuterArrayMixture<DualContent, Options extends PickDeepPartial<ArrayPrimsMixtureOptions, "ArrayMixtureOptions"> ? Options["ArrayMixtureOptions"] : DefaultArrayPrimsMixtureOptions["ArrayMixtureOptions"]>
//         | PrimsMixture<DualContent, Options extends PickDeepPartial<ArrayPrimsMixtureOptions, "PrimsMixtureOptions"> ? Options["PrimsMixtureOptions"] : DefaultArrayPrimsMixtureOptions["PrimsMixtureOptions"]>
//     );


interface BasePropsMixtureOptions {
    ContentMutations: ContentMutationOrArray;
    MixtureKind: MixtureKindKeys;
}

export interface MutualPropsMixtureRecursionOptions {
    PrimsMixtureOptions: PrimsMixtureOptions;
    BaseArrayMixtureOptions: BaseArrayMixtureOptions;
}

export interface MutualPropsMixtureOptions extends BasePropsMixtureOptions {
    RecursionOptions: MutualPropsMixtureRecursionOptions;
    Recursive: boolean;
}

interface DefaultRecursionPrimsMixtureOptions extends PrimsMixtureOptions {
    ContentMutations: "ExcludeObject";
    MixtureKind: "All";
}

export interface DefaultMutualPropsMixtureRecursionOptions extends MutualPropsMixtureRecursionOptions {
    PrimsMixtureOptions: DefaultRecursionPrimsMixtureOptions;
    BaseArrayMixtureOptions: DefaultBaseArrayMixtureOptions;
}

export interface DefaultMutualPropsMixtureOptions extends MutualPropsMixtureOptions {
    ContentMutations: ["ExtractObject", "ExcludeArray"];
    MixtureKind: "All";
    RecursionOptions: DefaultMutualPropsMixtureRecursionOptions;
    Recursive: false;
}

export interface PropsMixtureOptions extends BasePropsMixtureOptions {
    MutualPropsMixtureOptions: MutualPropsMixtureOptions;
}

export interface DefaultPropsMixtureOptions extends PropsMixtureOptions {
    ContentMutations: ["ExtractObject", "ExcludeArray"];
    MixtureKind: "Intersection";
    MutualPropsMixtureOptions: DefaultMutualPropsMixtureOptions;
}

export type OptionalRecursiveMutualPropsMixture<
    DualContent extends DefaultDualContent,
    Options extends DeepPartial<ArrayPrimsPropsMixtureOptions>,
    DualContentKeychain extends FlankValuesKeychain<DualContent>,
    > = { [K in DualContentKeychain["MutualOptionalKeys"]]?: ArrayPrimsPropsMixture<PureDualContent<DualContent["LeftContent"][K], DualContent["RightContent"][K]>, Options>; };

export type RequiredRecursiveMutualPropsMixture<
    DualContent extends DefaultDualContent,
    Options extends DeepPartial<ArrayPrimsPropsMixtureOptions>,
    DualContentKeychain extends FlankValuesKeychain<DualContent>,
    > = { [K in DualContentKeychain["MutualRequiredKeys"]]: ArrayPrimsPropsMixture<PureDualContent<DualContent["LeftContent"][K], DualContent["RightContent"][K]>, Options>; };

interface test2<
DualContent extends DefaultDualContent,
    DualContentKeychain extends FlankValuesKeychain<DualContent>,
    Options extends DeepPartial<PropsMixtureOptions>,
    __MutualPropsMixtureOptions extends DeepPartial<MutualPropsMixtureOptions> = Options extends PickDeepPartial<PropsMixtureOptions, "MutualPropsMixtureOptions"> ? Options["MutualPropsMixtureOptions"] : DefaultMutualPropsMixtureOptions,
    __PropsMixtureOptions extends DeepPartial<PropsMixtureOptions> = __MutualPropsMixtureOptions & { MutualPropsMixtureOptions: __MutualPropsMixtureOptions },
    __PrimsMixtureOptions extends DeepPartial<PrimsMixtureOptions> = __MutualPropsMixtureOptions extends { RecursionOptions: PickDeepPartial<MutualPropsMixtureRecursionOptions, "PrimsMixtureOptions"> } ? __MutualPropsMixtureOptions["RecursionOptions"]["PrimsMixtureOptions"] : DefaultMutualPropsMixtureRecursionOptions["PrimsMixtureOptions"],
    __BaseArrayMixtureOptions extends BaseArrayMixtureOptions = __MutualPropsMixtureOptions extends { RecursionOptions: PickDeepPartial<MutualPropsMixtureRecursionOptions, "BaseArrayMixtureOptions"> } ? __MutualPropsMixtureOptions["RecursionOptions"]["BaseArrayMixtureOptions"] : DefaultMutualPropsMixtureRecursionOptions["BaseArrayMixtureOptions"],
    __Options extends DeepPartial<ArrayPrimsPropsMixtureOptions> = {
        PropsMixtureOptions: __PropsMixtureOptions,
        PrimsMixtureOptions: __PrimsMixtureOptions,
        ArrayMixtureOptions: __BaseArrayMixtureOptions & {
            PropsMixtureOptions: __PropsMixtureOptions,
            PrimsMixtureOptions: __PrimsMixtureOptions,
        },
    },
> { [K in DualContentKeychain["MutualOptionalKeys"]]?: ArrayPrimsPropsMixture<PureDualContent<DualContent["LeftContent"][K], DualContent["RightContent"][K]>, __Options>; }

/** A subtype of `MutualPropsMixture`. Not intended to be called directly. */
export type RecursiveMutualPropsMixture<
    DualContent extends DefaultDualContent,
    DualContentKeychain extends FlankValuesKeychain<DualContent>,
    Options extends DeepPartial<PropsMixtureOptions>,
    __MutualPropsMixtureOptions extends DeepPartial<MutualPropsMixtureOptions> = Options extends PickDeepPartial<PropsMixtureOptions, "MutualPropsMixtureOptions"> ? Options["MutualPropsMixtureOptions"] : DefaultMutualPropsMixtureOptions,
    __PropsMixtureOptions extends DeepPartial<PropsMixtureOptions> = __MutualPropsMixtureOptions & { MutualPropsMixtureOptions: __MutualPropsMixtureOptions },
    __PrimsMixtureOptions extends DeepPartial<PrimsMixtureOptions> = __MutualPropsMixtureOptions extends { RecursionOptions: PickDeepPartial<MutualPropsMixtureRecursionOptions, "PrimsMixtureOptions"> } ? __MutualPropsMixtureOptions["RecursionOptions"]["PrimsMixtureOptions"] : DefaultMutualPropsMixtureRecursionOptions["PrimsMixtureOptions"],
    __BaseArrayMixtureOptions extends BaseArrayMixtureOptions = __MutualPropsMixtureOptions extends { RecursionOptions: PickDeepPartial<MutualPropsMixtureRecursionOptions, "BaseArrayMixtureOptions"> } ? __MutualPropsMixtureOptions["RecursionOptions"]["BaseArrayMixtureOptions"] : DefaultMutualPropsMixtureRecursionOptions["BaseArrayMixtureOptions"],
    __Options extends DeepPartial<ArrayPrimsPropsMixtureOptions> = {
        PropsMixtureOptions: __PropsMixtureOptions,
        PrimsMixtureOptions: __PrimsMixtureOptions,
        ArrayMixtureOptions: __BaseArrayMixtureOptions & {
            PropsMixtureOptions: __PropsMixtureOptions,
            PrimsMixtureOptions: __PrimsMixtureOptions,
        },
    },
    > = (
        // DualContentKeychain["MutualOptionalKeys"] extends never
        // ? (DualContentKeychain["MutualRequiredKeys"] extends never
        //     ? never
        //     : { [K in DualContentKeychain["MutualRequiredKeys"]]: ArrayPrimsPropsMixture<PureDualContent<DualContent["LeftContent"][K], DualContent["RightContent"][K]>, __Options>; })
        // : (DualContentKeychain["MutualRequiredKeys"] extends never
        //     ? true
        //     : false)

        // true

        { [K in DualContentKeychain["MutualOptionalKeys"]]?: ArrayPrimsPropsMixture<PureDualContent<DualContent["LeftContent"][K], DualContent["RightContent"][K]>, __Options>; }
        & { [K in DualContentKeychain["MutualRequiredKeys"]]: ArrayPrimsPropsMixture<PureDualContent<DualContent["LeftContent"][K], DualContent["RightContent"][K]>, __Options>; }

        // NoneTypeEqualsNotTypeIntersection<
        //     { [K in DualContentKeychain["MutualOptionalKeys"]]?: ArrayPrimsPropsMixture<PureDualContent<DualContent["LeftContent"][K], DualContent["RightContent"][K]>, __Options>; },
        //     { [K in DualContentKeychain["MutualRequiredKeys"]]: ArrayPrimsPropsMixture<PureDualContent<DualContent["LeftContent"][K], DualContent["RightContent"][K]>, {}>; },
        //     never,
        //     { UseKeyOf_AB: true, WrapInTuple: true }
        // >
    );

/** A subtype of `MutualPropsMixture`. Not intended to be called directly. */
export type NonRecursiveMutualPropsMixture<
    DualContent extends DefaultDualContent,
    DualContentKeychain extends FlankValuesKeychain<DualContent>,
    Options extends DeepPartial<PropsMixtureOptions>,
    __MutualPropsMixtureOptions extends DeepPartial<MutualPropsMixtureOptions> = Options extends PickDeepPartial<PropsMixtureOptions, "MutualPropsMixtureOptions"> ? Options["MutualPropsMixtureOptions"] : DefaultMutualPropsMixtureOptions,
    __PropsMixtureOptions extends DeepPartial<PropsMixtureOptions> = __MutualPropsMixtureOptions & { MutualPropsMixtureOptions: __MutualPropsMixtureOptions },
    __PrimsMixtureOptions extends DeepPartial<PrimsMixtureOptions> = Options extends { MutualPropsMixtureOptions: { RecursionOptions: PickDeepPartial<MutualPropsMixtureRecursionOptions, "PrimsMixtureOptions"> } } ? Options["MutualPropsMixtureOptions"]["RecursionOptions"]["PrimsMixtureOptions"] : DefaultMutualPropsMixtureRecursionOptions["PrimsMixtureOptions"],
    __BaseArrayMixtureOptions extends BaseArrayMixtureOptions = Options extends { MutualPropsMixtureOptions: { RecursionOptions: PickDeepPartial<MutualPropsMixtureRecursionOptions, "BaseArrayMixtureOptions"> } } ? Options["MutualPropsMixtureOptions"]["RecursionOptions"]["BaseArrayMixtureOptions"] : DefaultMutualPropsMixtureRecursionOptions["BaseArrayMixtureOptions"],
    __Options extends DeepPartial<ArrayPrimsPropsMixtureOptions> = {
        PropsMixtureOptions: __PropsMixtureOptions,
        PrimsMixtureOptions: __PrimsMixtureOptions,
        ArrayMixtureOptions: __BaseArrayMixtureOptions & {
            PropsMixtureOptions: __PropsMixtureOptions,
            PrimsMixtureOptions: __PrimsMixtureOptions,
        },
    },
    > = (
        { [K in DualContentKeychain["MutualOptionalKeys"]]?: ArrayPrimsPropsMixture<PureDualContent<DualContent["LeftContent"][K], DualContent["RightContent"][K]>, __Options>; }
        & { [K in DualContentKeychain["MutualRequiredKeys"]]: ArrayPrimsPropsMixture<PureDualContent<DualContent["LeftContent"][K], DualContent["RightContent"][K]>, __Options>; }
    );

/**
 * TODO: `IntersectProps<PureDualContent<{ a: { a: "" } }, { a: { a: "", b: "" } }>>` results in `const testtt24: { a: { a: ""; } | { a: ""; b: ""; }; }`
 * => Deep intersection and side union is required
 */
/** A subtype of `PropsMixture`. Not intended to be called directly. */
type ValidatingRecursionInMutualPropsMixture<
    DualContent extends DefaultDualContent,
    DualContentKeychain extends FlankValuesKeychain<DualContent>,
    Options extends DeepPartial<PropsMixtureOptions>,
    __Recursive extends boolean = Options extends { MutualPropsMixtureOptions: Pick<MutualPropsMixtureOptions, "Recursive"> } ? Options["MutualPropsMixtureOptions"]["Recursive"] : MutualPropsMixtureOptions["Recursive"],
    > = (
        true extends __Recursive ? RecursiveMutualPropsMixture<DualContent, DualContentKeychain, Options> : (
            // {
            //     _: {
            //         Optional: {} extends { [K in DualContentKeychain["MutualOptionalKeys"]]?: DualContent["LeftContent"][K] | DualContent["RightContent"][K]; } ? true : false
            //     }
            // } &
            NoneTypeExtendsNotTypeIntersection<
                // Optional props
                { [K in DualContentKeychain["MutualOptionalKeys"]]?: DualContent["LeftContent"][K] | DualContent["RightContent"][K]; },
                // Required props
                { [K in DualContentKeychain["MutualRequiredKeys"]]: DualContent["LeftContent"][K] | DualContent["RightContent"][K]; },
                never,
                { UseKeyOf_AB: true, WrapInTuple: true }
            >
        )
    );

type ExpandingPropsMixture<
    DualContent extends DefaultDualContent,
    LeftPick,
    RightPick,
    __LeftExpansionPick = (
        LeftPick extends DualContent["LeftContent"]
        ? DualContent["LeftContent"]
        : LeftPick),
    __RightExpansionPick = (
        RightPick extends DualContent["RightContent"]
        ? DualContent["RightContent"]
        : RightPick)
    > = (
        __LeftExpansionPick extends __RightExpansionPick
        ? (__RightExpansionPick extends __LeftExpansionPick
            ? __LeftExpansionPick & __RightExpansionPick
            : __LeftExpansionPick)
        : (__RightExpansionPick extends __LeftExpansionPick
            ? __RightExpansionPick
            : "You should check before this type if left or right extends the other")
    );

type ValidateExpandableMutualPropsMixture<
    DualContent extends DefaultDualContent,
    Options extends DeepPartial<PropsMixtureOptions>,
    DualContentKeychain extends FlankValuesKeychain<DualContent> = FlankValuesKeychain<DualContent>,
    __LeftPick = NoneEmptyPick<DualContent["LeftContent"], DualContentKeychain["MutualKeys"]>,
    __RightPick = NoneEmptyPick<DualContent["RightContent"], DualContentKeychain["MutualKeys"]>,
    > = ( // If L extends R ..
        __LeftPick extends __RightPick ? ExpandingPropsMixture<DualContent, __LeftPick, __RightPick>
        // .. or if R extends L ..
        : __RightPick extends __LeftPick ? ExpandingPropsMixture<DualContent, __LeftPick, __RightPick>
        // .. otherwise mix L and R
        : ValidatingRecursionInMutualPropsMixture<DualContent, DualContentKeychain, Options>
    );

/** A Property-Mixture */
export type PartedPropsMixture<
    DualContent extends DefaultDualContent,
    Options extends DeepPartial<PropsMixtureOptions> = {},
    __ContentMutations extends ContentMutationOrArray = Options extends Pick<PrimsMixtureOptions, "ContentMutations"> ? Options["ContentMutations"] : DefaultPropsMixtureOptions["ContentMutations"],
    __DualContent extends ImpureFlankContent<DualContent, __ContentMutations> = ImpureFlankContent<DualContent, __ContentMutations>,
    __DualContentKeychain extends FlankValuesKeychain<__DualContent> = FlankValuesKeychain<__DualContent>,
    __DualRemnantKeychain extends FlankRemnantsKeychain<__DualContentKeychain> = FlankRemnantsKeychain<__DualContentKeychain>,
    __MixtureKind extends MixtureKindKeys = Options extends Pick<PrimsMixtureOptions, "MixtureKind"> ? Options["MixtureKind"] : DefaultPropsMixtureOptions["MixtureKind"],
    > = (
        // {
        //     _: {
        //         DualContentKeychain: __DualContentKeychain
        //     }
        // } &
        // We want to intersect (&) a possible left picked object, a possible right picked object and a possible shared properties picked object.
        NoneTypeExtendsNotTypeIntersection<
            NoneTypeExtendsNotTypeIntersection<
                (
                    [MixtureKinds["Intersection"]] extends [MixtureKinds[__MixtureKind]]
                    ? ([__DualContentKeychain["MutualKeys"]] extends [never]
                        ? never
                        : ValidateExpandableMutualPropsMixture<__DualContent, Options, __DualContentKeychain>)
                    : never
                ), (
                    [MixtureKinds["LeftExceptRight"]] extends [MixtureKinds[__MixtureKind]]
                    ? ([__DualRemnantKeychain["LeftRemnant"]["Keys"]] extends [never]
                        ? never
                        : ExpansionOverPick<__DualContent["LeftContent"], __DualRemnantKeychain["LeftRemnant"]["Keys"]>
                    )
                    : never
                ),
                never,
                { WrapInTuple: true }
            >, (
                [MixtureKinds["RightExceptLeft"]] extends [MixtureKinds[__MixtureKind]]
                ? ([__DualRemnantKeychain["RightRemnant"]["Keys"]] extends [never]
                    ? never
                    : ExpansionOverPick<__DualContent["RightContent"], __DualRemnantKeychain["RightRemnant"]["Keys"]>)
                : never
            ),
            never,
            { WrapInTuple: true }
        >
    );

export type ValidateExpandablePropsMixture<
    DualContent extends DefaultDualContent,
    DualContentKeychain extends FlankValuesKeychain<DualContent> = FlankValuesKeychain<DualContent>,
    DualRemnantKeychain extends FlankRemnantsKeychain<DualContentKeychain> = FlankRemnantsKeychain<DualContentKeychain>,
    Options extends DeepPartial<PropsMixtureOptions> = {},
    > = (
        DualContent["LeftContent"] extends DualContent["RightContent"]
        ? ExpandingPropsMixture<DualContent, DualContent["LeftContent"], DualContent["RightContent"], DualContent["LeftContent"], DualContent["RightContent"]>
        : DualContent["RightContent"] extends DualContent["LeftContent"]
        ? ExpandingPropsMixture<DualContent, DualContent["LeftContent"], DualContent["RightContent"], DualContent["LeftContent"], DualContent["RightContent"]>
        // They have to be mixtured in parts, because LeftContent or RightContent dos not exptend the other
        : PartedPropsMixture<DualContent, Options, [], DualContent, DualContentKeychain, DualRemnantKeychain>
    );

export type MixtureKindSelectedPropsMixture<
    DualContent extends DefaultDualContent,
    Options extends DeepPartial<PropsMixtureOptions> = {},
    __ContentMutations extends ContentMutationOrArray = Options extends Pick<PrimsMixtureOptions, "ContentMutations"> ? Options["ContentMutations"] : DefaultPropsMixtureOptions["ContentMutations"],
    __DualContent extends ImpureFlankContent<DualContent, __ContentMutations> = ImpureFlankContent<DualContent, __ContentMutations>,
    __DualContentKeychain extends FlankValuesKeychain<__DualContent> = FlankValuesKeychain<__DualContent>,
    __DualRemnantKeychain extends FlankRemnantsKeychain<__DualContentKeychain> = FlankRemnantsKeychain<__DualContentKeychain>,
    __MixtureKind extends MixtureKindKeys = Options extends Pick<PrimsMixtureOptions, "MixtureKind"> ? Options["MixtureKind"] : DefaultPropsMixtureOptions["MixtureKind"],
    > = (
        [MixtureKinds["None"]] extends [MixtureKinds[__MixtureKind]]
        ? never
        : ([MixtureKinds["All"]] extends [MixtureKinds[__MixtureKind]]
            ? ValidateExpandablePropsMixture<__DualContent, __DualContentKeychain, __DualRemnantKeychain, Options>
            : (
                [MixtureKinds["LeftIncludingIntersection"]] extends [MixtureKinds[__MixtureKind]]
                // ? ValidateExpandablePropsMixture<PureDualContent<ExpansionOverPick<__DualContent["LeftContent"], __DualContentKeychain["MutualKeys"] | __DualRemnantKeychain["LeftRemnant"]["Keys"]>, ExpansionOverPick<__DualContent["RightContent"], __DualContentKeychain["MutualKeys"]>>>
                // TODO: Proof it
                ? ValidateExpandablePropsMixture<__DualContent, __DualContentKeychain, __DualRemnantKeychain, Options>
                : ([MixtureKinds["RightIncludingIntersection"]] extends [MixtureKinds[__MixtureKind]]
                    // TODO: Proof it
                    ? ValidateExpandablePropsMixture<__DualContent, __DualContentKeychain, __DualRemnantKeychain, Options>
                    : ([MixtureKinds["LeftExceptRight"]] extends [MixtureKinds[__MixtureKind]]
                        ? ExpansionOverPick<__DualContent["LeftContent"], __DualRemnantKeychain["LeftRemnant"]["Keys"]>
                        : ([MixtureKinds["RightExceptLeft"]] extends [MixtureKinds[__MixtureKind]]
                            ? ExpansionOverPick<__DualContent["RightContent"], __DualRemnantKeychain["RightRemnant"]["Keys"]>
                            : ValidateExpandableMutualPropsMixture<__DualContent, Options, __DualContentKeychain>)))))
    );

export type PropsMixture<
    DualContent extends DefaultDualContent,
    Options extends DeepPartial<PropsMixtureOptions> = {},
    __ContentMutations extends ContentMutationOrArray = Options extends Pick<PrimsMixtureOptions, "ContentMutations"> ? Options["ContentMutations"] : DefaultPropsMixtureOptions["ContentMutations"],
    __DualContent extends ImpureFlankContent<DualContent, __ContentMutations> = ImpureFlankContent<DualContent, __ContentMutations>
    > = (
        [__DualContent["LeftContent"]] extends [never]
        ? ([__DualContent["RightContent"]] extends [never]
            ? never
            : MixtureKindSelectedPropsMixture<PureDualContent<{}, DualContent["RightContent"]>, Options, [], PureDualContent<{}, __DualContent["RightContent"]>>)
        : ([__DualContent["RightContent"]] extends [never]
            ? MixtureKindSelectedPropsMixture<PureDualContent<DualContent["LeftContent"], {}>, Options, [], PureDualContent<__DualContent["LeftContent"], {}>>
            : MixtureKindSelectedPropsMixture<PureDualContent<DualContent["LeftContent"], DualContent["RightContent"]>, Options, [], PureDualContent<__DualContent["LeftContent"], __DualContent["RightContent"]>>)
    );


export interface PrimsPropsMixtureOptions {
    PrimsMixtureOptions: PrimsMixtureOptions;
    PropsMixtureOptions: PropsMixtureOptions;
}

export interface DefaultPrimsPropsMixtureOptions extends PrimsPropsMixtureOptions {
    PrimsMixtureOptions: DefaultPrimsMixtureOptions;
    PropsMixtureOptions: DefaultPropsMixtureOptions;
}


// FEATURE: PRIM PROPS MIXTURE
export type PrimsPropsMixture<
    DualContent extends DefaultDualContent,
    Options extends DeepPartial<PrimsPropsMixtureOptions> = {},
    // Options extends any = {},
    > = (
        PrimsMixture<DualContent, Options extends PickDeepPartial<PrimsPropsMixtureOptions, "PrimsMixtureOptions"> ? Options["PrimsMixtureOptions"] : DefaultPrimsPropsMixtureOptions["PrimsMixtureOptions"]>
        | PropsMixture<DualContent, Options extends PickDeepPartial<PrimsPropsMixtureOptions, "PropsMixtureOptions"> ? Options["PropsMixtureOptions"] : DefaultPrimsPropsMixtureOptions["PropsMixtureOptions"]>
    );

export interface ArrayPrimsPropsMixtureOptions extends PrimsPropsMixtureOptions {
    ArrayMixtureOptions: ArrayMixtureOptions;
}

export interface DefaultArrayPrimsPropsMixtureOptions extends ArrayPrimsPropsMixtureOptions {
    PrimsMixtureOptions: DefaultPrimsMixtureOptions;
    PropsMixtureOptions: DefaultPropsMixtureOptions;
    ArrayMixtureOptions: DefaultArrayMixtureOptions;
}

// FEATURE: PRIM PROPS MIXTURE
export type ArrayPrimsPropsMixture<
    DualContent extends DefaultDualContent,
    Options extends DeepPartial<ArrayPrimsPropsMixtureOptions> = {},
    > = (
        PrimsPropsMixture<DualContent, Options>
        | OuterArrayMixture<DualContent, Options extends PickDeepPartial<ArrayPrimsPropsMixtureOptions, "ArrayMixtureOptions"> ? Options["ArrayMixtureOptions"] : DefaultArrayPrimsPropsMixtureOptions["ArrayMixtureOptions"]>
    );
