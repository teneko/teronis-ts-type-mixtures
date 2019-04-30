import { Length, OptionalKeys, DeepPartial, NoneIntersectionOfNever, PickDeepPartial, NoneIntersectionOfEmptyKeys, Extends, NoneEmptyPick } from "@teronis/ts-definitions";
import { And, If, Not } from "typescript-logic";

export type ExtractOrUnknown<T, U, Extraction = Extract<T, U>> = [Extraction] extends [never] ? unknown : Extraction;


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
    __RightKeychain extends ContentKeychain<RightContent> = ContentKeychain<RightContent>
    > {
    LeftValueKeychain: __LeftKeychain;
    RightValueKeychain: __RightKeychain;
    OptionalKeys: __LeftKeychain["OptionalKeys"] | __RightKeychain["OptionalKeys"];
    RequiredKeys: __LeftKeychain["RequiredKeys"] | __RightKeychain["RequiredKeys"];
    Keys: __LeftKeychain["Keys"] | __RightKeychain["Keys"];
    MutualOptionalKeys: __LeftKeychain["OptionalKeys"] & __RightKeychain["OptionalKeys"];
    MutualRequiredKeys: __LeftKeychain["RequiredKeys"] & __RightKeychain["RequiredKeys"];
    MutualKeys: __LeftKeychain["Keys"] & __RightKeychain["Keys"];
}

type DefaultDualKeychain = DualContentKeychain<any, any, any, any>;

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

export interface DualRemnantKeychain<
    DualContentKeychain extends DefaultDualKeychain
    > {
    LeftRemnant: SingleRemnantKeychain<DualContentKeychain, DualContentKeychain["LeftValueKeychain"]>;
    RightRemnant: SingleRemnantKeychain<DualContentKeychain, DualContentKeychain["RightValueKeychain"]>;
}


export interface MixtureKinds {
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
        [MixtureKinds["Intersection"]] extends [MixtureKinds[__MixtureKind]]
        ? __Intersection
        : never
    )
    | (
        [MixtureKinds["LeftExceptRight"]] extends [MixtureKinds[__MixtureKind]]
        ? Exclude<__DualContent["LeftContent"], __Intersection>
        : never
    ) | (
        [MixtureKinds["RightExceptLeft"]] extends [MixtureKinds[__MixtureKind]]
        ? Exclude<__DualContent["RightContent"], __Intersection>
        : never
    );

interface BaseArrayMixtureOptions {
    ContentMutations: ContentMutationOrArray;
}

interface DefaultBaseArrayMixtureOptions extends BaseArrayMixtureOptions {
    ContentMutations: "ExtractArray";
}

export interface ArrayMixtureOptions extends BaseArrayMixtureOptions, PrimsPropsMixtureOptions { }

export interface DefaultArrayMixtureOptions extends DefaultBaseArrayMixtureOptions, DefaultPrimsPropsMixtureOptions { }

// FEATURE: ARRAY MIXTURE
export type InnerArrayMixture<
    DualContent extends DefaultDualContent,
    Options extends DeepPartial<ArrayMixtureOptions> = {},
    __ContentMutations extends ContentMutationOrArray = Options extends Pick<PrimsMixtureOptions, "ContentMutations"> ? Options["ContentMutations"] : DefaultPropsMixtureOptions["ContentMutations"],
    __DualContent extends ImpureFlankContent<DualContent, __ContentMutations> = ImpureFlankContent<DualContent, __ContentMutations>
    > = (
        __DualContent["LeftContent"] extends Array<infer LeftTypes>
        ? (__DualContent["RightContent"] extends Array<infer RightTypes>
            ? (Array<PrimsPropsMixture<PureDualContent<LeftTypes, RightTypes>, Options>>)
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

export interface ArrayPrimsMixtureOptions {
    ArrayMixtureOptions: ArrayMixtureOptions;
    PrimsMixtureOptions: PrimsMixtureOptions;
}

export interface DefaultArrayPrimsMixtureOptions extends ArrayPrimsMixtureOptions {
    ArrayMixtureOptions: DefaultArrayMixtureOptions;
    PrimsMixtureOptions: DefaultPrimsMixtureOptions;
}

// FEATURE: PRIM PROPS MIXTURE
export type ArrayPrimsMixture<
    DualContent extends DefaultDualContent,
    Options extends DeepPartial<ArrayPrimsMixtureOptions> = {},
    > = (
        OuterArrayMixture<DualContent, Options extends PickDeepPartial<ArrayPrimsMixtureOptions, "ArrayMixtureOptions"> ? Options["ArrayMixtureOptions"] : DefaultArrayPrimsMixtureOptions["ArrayMixtureOptions"]>
        | PrimsMixture<DualContent, Options extends PickDeepPartial<ArrayPrimsMixtureOptions, "PrimsMixtureOptions"> ? Options["PrimsMixtureOptions"] : DefaultArrayPrimsMixtureOptions["PrimsMixtureOptions"]>
    );


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
    MixtureKind: "Intersection" | "FlanksExceptIntersection";
}

export interface DefaultMutualPropsMixtureRecursionOptions extends MutualPropsMixtureRecursionOptions {
    PrimsMixtureOptions: DefaultRecursionPrimsMixtureOptions;
    BaseArrayMixtureOptions: DefaultBaseArrayMixtureOptions;
}

export interface DefaultMutualPropsMixtureOptions extends MutualPropsMixtureOptions {
    ContentMutations: ["ExtractObject", "ExcludeArray"];
    MixtureKind: "Intersection" | "FlanksExceptIntersection";
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

/** A subtype of `MutualPropsMixture`. Not intended to be called directly. */
type RecursionMutualPropsMixture<
    DualContent extends DefaultDualContent,
    Options extends DeepPartial<PropsMixtureOptions>,
    __DualContentKeychain extends FlankValuesKeychain<DualContent> = FlankValuesKeychain<DualContent>,
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
        // __DualContentKeychain["MutualOptionalKeys"] extends never
        // ? (__DualContentKeychain["RightValueKeychain"] extends never
        //     ? { [K in __DualContentKeychain["MutualOptionalKeys"]]?: ArrayPrimsPropsMixture<PureDualContent<DualContent["LeftContent"][K], DualContent["RightContent"][K]>, __Options>; }
        //     : never
        // )
        // : never

        // If<
        //     And<Not<Extends<__DualContentKeychain["MutualOptionalKeys"], never>>, Not<Extends<__DualContentKeychain["MutualRequiredKeys"], never>>>,
        //     { [K in __DualContentKeychain["MutualOptionalKeys"]]?: ArrayPrimsPropsMixture<PureDualContent<DualContent["LeftContent"][K], DualContent["RightContent"][K]>, __Options>; }
        //     & { [K in __DualContentKeychain["MutualRequiredKeys"]]: ArrayPrimsPropsMixture<PureDualContent<DualContent["LeftContent"][K], DualContent["RightContent"][K]>, __Options>; },
        //     If<Extends<__DualContentKeychain["MutualOptionalKeys"], never>,
        //         { [K in __DualContentKeychain["MutualRequiredKeys"]]: ArrayPrimsPropsMixture<PureDualContent<DualContent["LeftContent"][K], DualContent["RightContent"][K]>, __Options>; },
        //         { [K in __DualContentKeychain["MutualOptionalKeys"]]?: ArrayPrimsPropsMixture<PureDualContent<DualContent["LeftContent"][K], DualContent["RightContent"][K]>, __Options>; }>
        // >


        // NoneIntersectionOfEmptyKeys<
        //     { [K in __DualContentKeychain["MutualOptionalKeys"]]?: ArrayPrimsPropsMixture<PureDualContent<DualContent["LeftContent"][K], DualContent["RightContent"][K]>, __Options>; },
        //     { [K in __DualContentKeychain["MutualRequiredKeys"]]: ArrayPrimsPropsMixture<PureDualContent<DualContent["LeftContent"][K], DualContent["RightContent"][K]>, __Options>; }
        // >

        { [K in __DualContentKeychain["MutualOptionalKeys"]]?: ArrayPrimsPropsMixture<PureDualContent<DualContent["LeftContent"][K], DualContent["RightContent"][K]>, __Options>; }
        & { [K in __DualContentKeychain["MutualRequiredKeys"]]: ArrayPrimsPropsMixture<PureDualContent<DualContent["LeftContent"][K], DualContent["RightContent"][K]>, __Options>; }
    );
// > = bigint;

/**
 * TODO: `IntersectProps<PureDualContent<{ a: { a: "" } }, { a: { a: "", b: "" } }>>` results in `const testtt24: { a: { a: ""; } | { a: ""; b: ""; }; }`
 * => Deep intersection and side union is required
 */
/** A subtype of `PropsMixture`. Not intended to be called directly. */
type PreRecursionMutualPropsMixture<
    DualContent extends DefaultDualContent,
    Options extends DeepPartial<PropsMixtureOptions>,
    DualContentKeychain extends FlankValuesKeychain<DualContent> = FlankValuesKeychain<DualContent>,
    __Recursive extends boolean = Options extends { MutualPropsMixtureOptions: Pick<MutualPropsMixtureOptions, "Recursive"> } ? Options["MutualPropsMixtureOptions"]["Recursive"] : MutualPropsMixtureOptions["Recursive"],
    > = (
        // {
        //     _: {
        //         mutual_props:
        //         {
        //             options: Options,
        //             mutual_keys: DualContentKeychain["MutualKeys"]
        //         }
        //     }
        // } &
        true extends __Recursive ? (
            RecursionMutualPropsMixture<DualContent, Options, DualContentKeychain>
        ) : (
            NoneIntersectionOfNever<
                // Optional props
                { [K in DualContentKeychain["MutualOptionalKeys"]]?: DualContent["LeftContent"][K] | DualContent["RightContent"][K]; },
                // Required props
                { [K in DualContentKeychain["MutualRequiredKeys"]]: DualContent["LeftContent"][K] | DualContent["RightContent"][K]; }
            >
        )
    );

type FlaredPropsMixture<
    DualContent extends DefaultDualContent,
    LeftMutualPick,
    RightMutualPick,
    __LeftMutualPick = LeftMutualPick extends DualContent["LeftContent"] ? DualContent["LeftContent"] : LeftMutualPick,
    __RightMutualPick = RightMutualPick extends DualContent["RightContent"] ? DualContent["RightContent"] : RightMutualPick
    > = (
        true
        // If<
        //     /* Overall we want check if smaller fits into bigger */
        //     And<Extends<LeftMutualPick, RightMutualPick>, Extends<RightMutualPick, LeftMutualPick>>,
        //     __LeftMutualPick & __RightMutualPick,
        //     If<
        //         Extends<LeftMutualPick, RightMutualPick>,
        //         __LeftMutualPick,
        //         __RightMutualPick
        //     >
        // >
    );

type PreMutualPropsMixture<
    DualContent extends DefaultDualContent,
    Options extends DeepPartial<PropsMixtureOptions>,
    DualContentKeychain extends FlankValuesKeychain<DualContent> = FlankValuesKeychain<DualContent>,
    __LeftMutualPick = NoneEmptyPick<DualContent["LeftContent"], DualContentKeychain["MutualKeys"]>,
    __RightMutualPick = NoneEmptyPick<DualContent["RightContent"], DualContentKeychain["MutualKeys"]>,
    > = ( // If L extends R ..
        // __LeftMutualPick extends __RightMutualPick ? FlaredPropsMixture<DualContent, __LeftMutualPick, __RightMutualPick>
        // // .. or if R extends L ..
        // : __RightMutualPick extends __LeftMutualPick ? FlaredPropsMixture<DualContent, __LeftMutualPick, __RightMutualPick>
        // // .. otherwise mix L and R
        // : PreRecursionMutualPropsMixture<DualContent, Options, DualContentKeychain>)
        PreRecursionMutualPropsMixture<DualContent, Options, DualContentKeychain>
    );

// type FlaredPropsMixture2<
//     DualContent extends DefaultDualContent
// >

/** A Property-Mixture */
export type InnerPropsMixture<
    DualContent extends DefaultDualContent,
    Options extends DeepPartial<PropsMixtureOptions> = {},
    __ContentMutations extends ContentMutationOrArray = Options extends Pick<PrimsMixtureOptions, "ContentMutations"> ? Options["ContentMutations"] : DefaultPropsMixtureOptions["ContentMutations"],
    __DualContent extends ImpureFlankContent<DualContent, __ContentMutations> = ImpureFlankContent<DualContent, __ContentMutations>,
    __DualContentKeychain extends FlankValuesKeychain<__DualContent> = FlankValuesKeychain<__DualContent>,
    __DualRemnantKeychain extends DualRemnantKeychain<__DualContentKeychain> = DualRemnantKeychain<__DualContentKeychain>,
    __MixtureKind extends MixtureKindKeys = Options extends Pick<PrimsMixtureOptions, "MixtureKind"> ? Options["MixtureKind"] : DefaultPropsMixtureOptions["MixtureKind"],
    > = (
        // We want to intersect (&) a possible left picked object, a possible right picked object and a possible shared properties picked object.
        NoneIntersectionOfNever<
            NoneIntersectionOfNever<
                (
                    [MixtureKinds["Intersection"]] extends [MixtureKinds[__MixtureKind]]
                    ? (
                        [__DualContentKeychain["MutualKeys"]] extends [never]
                        // When there is no shared property, then we know the picking object remains empty
                        ? never
                        : PreMutualPropsMixture<__DualContent, Options, __DualContentKeychain>
                    )
                    : never
                ), (
                    [MixtureKinds["LeftExceptRight"]] extends [MixtureKinds[__MixtureKind]]
                    ? NoneEmptyPick<__DualContent["LeftContent"], __DualRemnantKeychain["LeftRemnant"]["Keys"]>
                    : never
                )
            >, (
                [MixtureKinds["RightExceptLeft"]] extends [MixtureKinds[__MixtureKind]]
                ? NoneEmptyPick<__DualContent["RightContent"], __DualRemnantKeychain["RightRemnant"]["Keys"]>
                : never
            )
        >
    );

export type ExpandablePropsMixture<
    DualContent extends DefaultDualContent,
    Options extends DeepPartial<PropsMixtureOptions> = {},
    __ContentMutations extends ContentMutationOrArray = Options extends Pick<PrimsMixtureOptions, "ContentMutations"> ? Options["ContentMutations"] : DefaultPropsMixtureOptions["ContentMutations"],
    __DualContent extends ImpureFlankContent<DualContent, __ContentMutations> = ImpureFlankContent<DualContent, __ContentMutations>,
    __DualContentKeychain extends FlankValuesKeychain<__DualContent> = FlankValuesKeychain<__DualContent>,
    __DualRemnantKeychain extends DualRemnantKeychain<__DualContentKeychain> = DualRemnantKeychain<__DualContentKeychain>,
    __MixtureKind extends MixtureKindKeys = Options extends Pick<PrimsMixtureOptions, "MixtureKind"> ? Options["MixtureKind"] : DefaultPropsMixtureOptions["MixtureKind"],
    > = (
        true
    );

export type PreExpandablePropsMixture<
    DualContent extends DefaultDualContent,
    Options extends DeepPartial<PropsMixtureOptions> = {},
    __ContentMutations extends ContentMutationOrArray = Options extends Pick<PrimsMixtureOptions, "ContentMutations"> ? Options["ContentMutations"] : DefaultPropsMixtureOptions["ContentMutations"],
    __DualContent extends ImpureFlankContent<DualContent, __ContentMutations> = ImpureFlankContent<DualContent, __ContentMutations>,
    __DualContentKeychain extends FlankValuesKeychain<__DualContent> = FlankValuesKeychain<__DualContent>,
    __DualRemnantKeychain extends DualRemnantKeychain<__DualContentKeychain> = DualRemnantKeychain<__DualContentKeychain>,
    __MixtureKind extends MixtureKindKeys = Options extends Pick<PrimsMixtureOptions, "MixtureKind"> ? Options["MixtureKind"] : DefaultPropsMixtureOptions["MixtureKind"],
    > = (
        [MixtureKinds["All"]] extends [MixtureKinds[__MixtureKind]]
        ? true
        : (
            [MixtureKinds["LeftIncludingIntersection"]] extends [MixtureKinds[__MixtureKind]]
            ? true
            : (false)
        )
    );

// export type SinglePropsMixture<
//     DualContent extends DefaultDualContent,
//     Side extends "Left" | "Right",
//     Options extends DeepPartial<PropsMixtureOptions> = {},
//     __MixtureKind extends MixtureKindKeys = Options extends Pick<PrimsMixtureOptions, "MixtureKind"> ? Options["MixtureKind"] : DefaultPropsMixtureOptions["MixtureKind"],
//     // __SidedMixtureKind extends MixtureKinds["FlankUnion
//     > = (
//         ExtractOrUnknown<__MixtureKind, MixtureKinds["Intersection"]> extends MixtureKinds["Intersection"]
//     );

export type OuterDualPropsMixture<
    DualContent extends DefaultDualContent,
    Options extends DeepPartial<PropsMixtureOptions> = {},
    __ContentMutations extends ContentMutationOrArray = Options extends Pick<PrimsMixtureOptions, "ContentMutations"> ? Options["ContentMutations"] : DefaultPropsMixtureOptions["ContentMutations"],
    __DualContent extends ImpureFlankContent<DualContent, __ContentMutations> = ImpureFlankContent<DualContent, __ContentMutations>
    > = (
        [__DualContent["LeftContent"]] extends [never]
        ? ([__DualContent["RightContent"]] extends [never]
            ? never
            : InnerPropsMixture<PureDualContent<{}, DualContent["RightContent"]>, Options, [], PureDualContent<{}, __DualContent["RightContent"]>>)
        : ([__DualContent["RightContent"]] extends [never]
            ? InnerPropsMixture<PureDualContent<DualContent["LeftContent"], {}>, Options, [], PureDualContent<__DualContent["LeftContent"], {}>>
            : InnerPropsMixture<PureDualContent<DualContent["LeftContent"], DualContent["RightContent"]>, Options, [], PureDualContent<__DualContent["LeftContent"], __DualContent["RightContent"]>>)
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
    > = (
        // PrimsMixture<DualContent, Options extends PickDeepPartial<PrimsPropsMixtureOptions, "PrimsMixtureOptions"> ? Options["PrimsMixtureOptions"] : DefaultPrimsPropsMixtureOptions["PrimsMixtureOptions"]>
        | OuterDualPropsMixture<DualContent, Options extends PickDeepPartial<PrimsPropsMixtureOptions, "PropsMixtureOptions"> ? Options["PropsMixtureOptions"] : DefaultPrimsPropsMixtureOptions["PropsMixtureOptions"]>
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
