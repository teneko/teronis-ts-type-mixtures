import { DeepPartial, Length, NoneEmptyPick, NoneTypeExtendsNotTypeIntersection, OptionalKeys, PickAs, PickAsDeepAs } from "@teronis/ts-definitions";

export type ExtractOrUnknown<T, U, Extraction = Extract<T, U>> = [Extraction] extends [never] ? unknown : Extraction;

export type ExpansionOverPick<Expansion, Keys extends keyof Expansion, __Pick = Pick<Expansion, Keys>> = __Pick extends Expansion ? Expansion : __Pick;

export type IsNever<T> = [T] extends [never] ? true : false;

type UnionKeys<T> = T extends any ? keyof T : never;
type Pick2<T extends any, K extends UnionKeys<T>> = true;

export type NoneEmptyPartedPick<T, RequiredKeys extends keyof T, OptionalKeys extends keyof T> = (
    { [K in RequiredKeys]: T[K] }
    & { [K in OptionalKeys]: T[K] }
);

export type AttachDefaultOptions<Options, DefaultOptions> = (
    Options extends { DefaultOptions: unknown }
    ? Options
    : Options & DefaultOptions
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

export type DefaultDualContent = PureDualContent<any, any>;

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
    __RequiredKeys extends Exclude<keyof Content, __OptionalKeys> = Exclude<keyof Content, __OptionalKeys>,
    > {
    OptionalKeys: Exclude<keyof Content, __RequiredKeys>; // Exclude is required due to "not assignable to type symbol"-error
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
    RequiredKeys: __LeftKeychain["RequiredKeys"] | __RightKeychain["RequiredKeys"];
    OptionalKeys: __LeftKeychain["OptionalKeys"] | __RightKeychain["OptionalKeys"];
    Keys: __LeftKeychain["Keys"] | __RightKeychain["Keys"];
    MutualRequiredKeys: __LeftKeychain["RequiredKeys"] & __RightKeychain["RequiredKeys"];
    MutualOptionalKeys: __LeftKeychain["OptionalKeys"] & __RightKeychain["OptionalKeys"];
    MutualKeys: __LeftKeychain["Keys"] & __RightKeychain["Keys"];
}

type DefaultDualKeychain = DualContentKeychain<any, any, any, any>;

export type FlankContentKeychain<
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

export interface FlankRemnantKeychain<
    DualContentKeychain extends DefaultDualKeychain
    > {
    LeftRemnant: SingleRemnantKeychain<DualContentKeychain, DualContentKeychain["LeftValueKeychain"]>;
    RightRemnant: SingleRemnantKeychain<DualContentKeychain, DualContentKeychain["RightValueKeychain"]>;
}


export interface MixtureKinds {
    None: "None";
    Intersection: "Intersection";
    LeftExceptRight: "LeftExceptRight";
    LeftIncludingIntersection: MixtureKinds["Intersection"] | MixtureKinds["LeftExceptRight"];
    RightExceptLeft: "RightExceptLeft";
    RightIncludingIntersection: MixtureKinds["Intersection"] | MixtureKinds["RightExceptLeft"];
    FlanksExceptIntersection: MixtureKinds["LeftExceptRight"] | MixtureKinds["RightExceptLeft"];
    All: MixtureKinds["Intersection"] | MixtureKinds["FlanksExceptIntersection"];
}

export type MixtureKindKeys = keyof MixtureKinds;


export interface PrimsMixtureOptions {
    ContentMutations: ContentMutationOrArray;
    MixtureKind: MixtureKindKeys;
}

export interface PrimsMixtureOptionsConcrete extends PrimsMixtureOptions {
    ContentMutations: "ExcludeObject";
    MixtureKind: "Intersection";
}

export interface PrimsMixtureDefaultOptions extends PrimsMixtureOptions { }

export interface PrimsMixtureConcreteDefaultOptions extends PrimsMixtureOptionsConcrete { }

export interface PrimsMixtureOptionsContainer {
    Options: DeepPartial<PrimsMixtureOptions>;
    DefaultOptions: PrimsMixtureDefaultOptions;
}

export interface PrimsMixtureOptionsContainerConcrete extends PrimsMixtureOptionsContainer {
    Options: DeepPartial<PrimsMixtureOptionsConcrete>;
    DefaultOptions: PrimsMixtureConcreteDefaultOptions;
}

/** A Primitives-Mixture. */
export type PrimsMixtureBase<
    DualContent extends DefaultDualContent,
    Options extends PrimsMixtureOptionsContainer,
    __ContentMutations extends ContentMutationOrArray = Options["Options"] extends Pick<PrimsMixtureOptions, "ContentMutations"> ? Options["Options"]["ContentMutations"] : Options["DefaultOptions"]["ContentMutations"],
    __MixtureKind extends MixtureKindKeys = Options["Options"] extends Pick<PrimsMixtureOptions, "MixtureKind"> ? Options["Options"]["MixtureKind"] : Options["DefaultOptions"]["MixtureKind"],
    __DualContent extends ImpureFlankContent<DualContent, __ContentMutations> = ImpureFlankContent<DualContent, __ContentMutations>,
    __Intersection = __DualContent["LeftContent"] & __DualContent["RightContent"]
    > = (
        MixtureKinds["None"] extends MixtureKinds[__MixtureKind] ? never : (
            (
                MixtureKinds["Intersection"] extends MixtureKinds[__MixtureKind]
                ? __Intersection
                : never
            ) | (
                MixtureKinds["LeftExceptRight"] extends MixtureKinds[__MixtureKind]
                ? Exclude<__DualContent["LeftContent"], __Intersection>
                : never
            ) | (
                MixtureKinds["RightExceptLeft"] extends MixtureKinds[__MixtureKind]
                ? Exclude<__DualContent["RightContent"], __Intersection>
                : never
            )
        )
    );

export type PrimsMixture<
    DualContent extends DefaultDualContent,
    Options extends DeepPartial<PrimsMixtureOptions>,
    __Options extends PrimsMixtureOptionsContainer = { Options: Options, DefaultOptions: PrimsMixtureConcreteDefaultOptions }
    > = PrimsMixtureBase<DualContent, __Options>;

export interface ArrayMixtureArrayOptions {
    ContentMutations: ContentMutationOrArray;
}

export interface ArrayMixtureArrayOptionsConcrete extends ArrayMixtureArrayOptions {
    ContentMutations: "ExtractArray";
}

export interface ArrayMixtureArrayOptionsContainer {
    ArrayOptions: ArrayMixtureArrayOptions;
}

export interface ArrayMixtureArrayOptionsContainerConcrete extends ArrayMixtureArrayOptionsContainer {
    ArrayOptions: ArrayMixtureArrayOptionsConcrete;
}

// export interface TEST123 extends PrimsPropsMixtureOptions {
//     PrimsMixtureOptions: ConcreteOwnedPrimsMixtureOptions;
//     PropsMixtureOptions: ConcretePropsMixtureOptions;
// }

export interface ArrayMixtureOptions extends ArrayMixtureArrayOptionsContainer, PrimsPropsMixtureOptions { }

export interface ArrayMixtureOptionsConcrete extends ArrayMixtureArrayOptionsContainerConcrete, ConcretePrimsPropsMixtureOptions { }

export interface ArrayMixtureDefaultOptions extends ArrayMixtureOptions { }

export interface ArrayMixtureDefaultOptionsConcrete extends ArrayMixtureOptionsConcrete { }

export interface ArrayMixtureOptionsContainer {
    Options: DeepPartial<ArrayMixtureOptions>;
    DefaultOptions: ArrayMixtureDefaultOptions;
}

export interface ArrayMixtureOptionsContainerConcrete {
    Options: DeepPartial<ArrayMixtureOptionsConcrete>;
    DefaultOptions: ArrayMixtureDefaultOptionsConcrete;
}

// FEATURE: ARRAY MIXTURE
export type ArrayMixtureBaseUnchecked<
    DualContent extends DefaultDualContent,
    Options extends ArrayMixtureOptionsContainer,
    __ContentMutations extends ContentMutationOrArray = (
        Options["Options"] extends { ArrayOptions: Pick<ArrayMixtureArrayOptions, "ContentMutations"> }
        ? Options["Options"]["ArrayOptions"]["ContentMutations"]
        : Options["DefaultOptions"]["ArrayOptions"]["ContentMutations"]
    ),
    __DualContent extends ImpureFlankContent<DualContent, __ContentMutations> = ImpureFlankContent<DualContent, __ContentMutations>
    > = (
        __DualContent["LeftContent"] extends Array<infer LeftTypes>
        ? (__DualContent["RightContent"] extends Array<infer RightTypes>
            ? (Array<PrimsPropsMixture<PureDualContent<LeftTypes, RightTypes>, Options>>)
            : never)
        : never
    );

export type ArrayMixtureBase<
    DualContent extends DefaultDualContent,
    Options extends ArrayMixtureOptionsContainer,
    > = (
        [DualContent["LeftContent"]] extends [never] ? never : (
            [DualContent["RightContent"]] extends [never] ? never : (
                DualContent["LeftContent"] extends any[] ? (
                    DualContent["RightContent"] extends any[]
                    ? ArrayMixtureBaseUnchecked<DualContent, Options>
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
//         OuterArrayMixture<DualContent, Options extends PickAny<ArrayPrimsMixtureOptions, "ArrayMixtureOptions"> ? Options["ArrayMixtureOptions"] : DefaultArrayPrimsMixtureOptions["ArrayMixtureOptions"]>
//         | PrimsMixture<DualContent, Options extends PickAny<ArrayPrimsMixtureOptions, "PrimsMixtureOptions"> ? Options["PrimsMixtureOptions"] : DefaultArrayPrimsMixtureOptions["PrimsMixtureOptions"]>
//     );

/** Base Options */
export interface PropsMixturePropsOptions {
    ContentMutations: ContentMutationOrArray;
    MixtureKind: MixtureKindKeys;
}

export interface PropsMixturePropsOptionsConcrete extends PropsMixturePropsOptions {
    ContentMutations: ["ExtractObject", "ExcludeArray"];
    MixtureKind: "Intersection";
}

export interface NestedArrayInPropsMixtureOptions extends ArrayMixtureArrayOptionsContainer {
    PrimsMixtureOptions: PrimsMixtureOptions;
    PropsMixtureOptions: PropsMixturePropsOptions & {
        MutualPropsMixtureOptions: OwnedMutualPropsMixtureOptions & {
            RecursionOptions: {
                ArrayMixtureOptions: ArrayMixtureArrayOptionsContainer;
                PrimsMixtureOptions: PrimsMixtureOptions;
            },
        },
    };
}

export interface ConcreteNestedArrayInPropsMixtureOptions extends NestedArrayInPropsMixtureOptions {
    PrimsMixtureOptions: PrimsMixtureOptionsConcrete;
    PropsMixtureOptions: PropsMixturePropsOptionsConcrete & {
        MutualPropsMixtureOptions: ConcreteOwnedMutualPropsMixtureOptions & {
            RecursionOptions: {
                ArrayMixtureOptions: ArrayMixtureArrayOptionsContainerConcrete;
                PrimsMixtureOptions: PrimsMixtureOptionsConcrete;
            },
        },
    };
}

/** Base Options */
export interface MutualPropsMixtureRecursionOptions {
    ArrayMixtureOptions: NestedArrayInPropsMixtureOptions; // replace by one deep level
    PrimsMixtureOptions: PrimsMixtureOptions;
}

export interface OwnedMutualPropsMixtureOptions extends PropsMixturePropsOptions {
    Recursive: boolean;
}

export interface ConcreteOwnedMutualPropsMixtureOptions extends OwnedMutualPropsMixtureOptions {
    ContentMutations: ["ExtractObject", "ExcludeArray"];
    MixtureKind: "All";
    Recursive: false;
}

/** Concrete Options */
export interface ConcreteNestedPrimsInPropsMixtureOptions extends PrimsMixtureOptions {
    ContentMutations: "ExcludeObject";
    MixtureKind: "All";
}

// TODO: Implement non recursive version of PropsMixtureOptions
/** Concrete Options */
export interface ConcreteMutualPropsMixtureOwnedArrayMixtureOptions extends ArrayMixtureArrayOptionsContainer {
    ContentMutations: "ExtractArray";
}

export interface RecursionOptionsMutualPropsMixtureOptions {
    RecursionOptions: MutualPropsMixtureRecursionOptions;
}

/** Base Options */
export interface ConcreteRecursionOptionsMutualPropsMixtureOptions extends RecursionOptionsMutualPropsMixtureOptions {
    RecursionOptions: ConcreteMutualPropsMixtureRecursionOptions;
}

/** Concrete Options */
export interface ConcreteMutualPropsMixtureRecursionOptions extends MutualPropsMixtureRecursionOptions {
    ArrayMixtureOptions: ConcreteNestedArrayInPropsMixtureOptions;
    PrimsMixtureOptions: ConcreteNestedPrimsInPropsMixtureOptions;
}

export interface MutualPropsMixtureOptions extends OwnedMutualPropsMixtureOptions, RecursionOptionsMutualPropsMixtureOptions { }

/** Concrete Options */
export interface ConcreteMutualPropsMixtureOptions extends ConcreteOwnedMutualPropsMixtureOptions, ConcreteRecursionOptionsMutualPropsMixtureOptions { }

/** Base Options */
export interface MutualPropsMixtureOptionsPropsMixtureOptions {
    MutualPropsMixtureOptions: MutualPropsMixtureOptions;
}

/** Base Options */
export interface ConcreteMutualPropsMixtureOptionsPropsMixtureOptions {
    MutualPropsMixtureOptions: ConcreteMutualPropsMixtureOptions;
}

export interface PropsMixtureOptions extends PropsMixturePropsOptions, MutualPropsMixtureOptionsPropsMixtureOptions { }

/** Concrete Options */
export interface ConcretePropsMixtureOptions extends PropsMixturePropsOptionsConcrete, ConcreteMutualPropsMixtureOptionsPropsMixtureOptions { }

/** Concrete Options */
export interface PropsMixtureDefaultOptions extends PropsMixtureOptions { }

export interface ConcretePropsMixtureDefaultOptions extends ConcretePropsMixtureOptions { }

export interface DefaultedPropsMixtureOptions {
    Options: DeepPartial<PropsMixtureOptions>;
    DefaultOptions: PropsMixtureDefaultOptions;
}

export interface ConcreteDefaultedPropsMixtureOptions extends DefaultedPropsMixtureOptions {
    Options: DeepPartial<PropsMixtureOptions>;
    DefaultOptions: ConcretePropsMixtureDefaultOptions;
}

// /** Base Options */
// export interface DefaultedPropsMixtureOptions  {
//     DefaultOptions?: BasePropsMixtureOptions;
// }

/** A subtype of `MutualPropsMixture`. Not intended to be called directly. */
export type RecursiveMutualPropsMixture<
    DualContent extends DefaultDualContent,
    DualContentKeychain extends FlankContentKeychain<DualContent>,
    Options extends DefaultedPropsMixtureOptions,
    __BaseArrayMixtureOptions extends ArrayMixtureArrayOptionsContainer = (
        Options extends { MutualPropsMixtureOptions: { RecursionOptions: PickAsDeepAs<MutualPropsMixtureRecursionOptions, "ArrayMixtureOptions", unknown> } }
        ? Options["MutualPropsMixtureOptions"]["RecursionOptions"]["ArrayMixtureOptions"]
        : Options["DefaultOptions"]["MutualPropsMixtureOptions"]["RecursionOptions"]["ArrayMixtureOptions"]
    ),
    __PrimsMixtureOptions extends PrimsMixtureOptionsContainer = (
        {
            Options: (
                Options["Options"] extends { MutualPropsMixtureOptions: { RecursionOptions: PickAsDeepAs<MutualPropsMixtureRecursionOptions, "PrimsMixtureOptions", unknown> } }
                ? Options["Options"]["MutualPropsMixtureOptions"]["RecursionOptions"]["PrimsMixtureOptions"]
                : Options["DefaultOptions"]["MutualPropsMixtureOptions"]["RecursionOptions"]["PrimsMixtureOptions"]
            ),
        } & { DefaultOptions: Options["DefaultOptions"]["MutualPropsMixtureOptions"]["RecursionOptions"]["PrimsMixtureOptions"] }
    ),
    __MutualPropsMixtureOptions extends MutualPropsMixtureOptions = (
        Options["Options"] extends PickAs<PropsMixtureOptions, "MutualPropsMixtureOptions", any>
        ? Options["Options"]["MutualPropsMixtureOptions"]
        : Options["DefaultOptions"]["MutualPropsMixtureOptions"]
    ),
    __PropsMixtureOptions extends DefaultedPropsMixtureOptions = (
        { Options: __MutualPropsMixtureOptions & { MutualPropsMixtureOptions: __MutualPropsMixtureOptions } }
        & Pick<Options, "DefaultOptions">
    ),
    __ArrayMixtureDefaultOptions extends ArrayMixtureOptionsContainer["DefaultOptions"] = (
        Options["DefaultOptions"]["MutualPropsMixtureOptions"]["RecursionOptions"]["ArrayMixtureOptions"] & {
            PropsMixtureOptions: {
                MutualPropsMixtureOptions: {
                    RecursionOptions: {
                        ArrayMixtureOptions: Options["DefaultOptions"]["MutualPropsMixtureOptions"]["RecursionOptions"]["ArrayMixtureOptions"],
                    },
                },
            },
        }
    ),
    __ArrayMixtureOptions extends ArrayMixtureOptionsContainer["Options"] = (
        Options["Options"] extends { MutualPropsMixtureOptions: { RecursionOptions: PickAsDeepAs<MutualPropsMixtureRecursionOptions, "ArrayMixtureOptions", unknown> } }
        ? Options["Options"]["MutualPropsMixtureOptions"]["RecursionOptions"]["ArrayMixtureOptions"]
        : __ArrayMixtureDefaultOptions
    ),
    __ArrayPrimsPropsOptions extends DefaultedArrayPrimsPropsMixtureOptions = {
        Options: {
            PrimsMixtureOptions: __PrimsMixtureOptions["Options"],
            PropsMixtureOptions: __PropsMixtureOptions["Options"],
            ArrayMixtureOptions: __ArrayMixtureOptions,
        },
        DefaultOptions: {
            PrimsMixtureOptions: __PrimsMixtureOptions["DefaultOptions"],
            PropsMixtureOptions: __PropsMixtureOptions["DefaultOptions"],
            ArrayMixtureOptions: __ArrayMixtureDefaultOptions,
        },
    },
    > = (
        // {
        //     _: {
        //         Options: __PropsMixtureOptions
        //     }
        // } &

        // DualContentKeychain["MutualOptionalKeys"] extends never
        // ? (DualContentKeychain["MutualRequiredKeys"] extends never
        //     ? never
        //     : { [K in DualContentKeychain["MutualRequiredKeys"]]: ArrayPrimsPropsMixture<PureDualContent<DualContent["LeftContent"][K], DualContent["RightContent"][K]>, __Options>; })
        // : (DualContentKeychain["MutualRequiredKeys"] extends never
        //     ? true
        //     : false)

        // true

        { [K in DualContentKeychain["MutualOptionalKeys"]]?: ArrayPrimsPropsMixture<PureDualContent<DualContent["LeftContent"][K], DualContent["RightContent"][K]>, __ArrayPrimsPropsOptions>; }
        & { [K in DualContentKeychain["MutualRequiredKeys"]]: ArrayPrimsPropsMixture<PureDualContent<DualContent["LeftContent"][K], DualContent["RightContent"][K]>, __ArrayPrimsPropsOptions>; }

        // NoneTypeEqualsNotTypeIntersection<
        //     { [K in DualContentKeychain["MutualOptionalKeys"]]?: ArrayPrimsPropsMixture<PureDualContent<DualContent["LeftContent"][K], DualContent["RightContent"][K]>, __Options>; },
        //     { [K in DualContentKeychain["MutualRequiredKeys"]]: ArrayPrimsPropsMixture<PureDualContent<DualContent["LeftContent"][K], DualContent["RightContent"][K]>, {}>; },
        //     never,
        //     { UseKeyOf_AB: true, WrapInTuple: true }
        // >
    );

// /** A subtype of `MutualPropsMixture`. Not intended to be called directly. */
// export type NonRecursiveMutualPropsMixture<
//     DualContent extends DefaultDualContent,
//     DualContentKeychain extends FlankValuesKeychain<DualContent>,
//     Options extends DeepPartial<PropsMixtureOptions>,
//     __MutualPropsMixtureOptions extends DeepPartial<MutualPropsMixtureOptions> = Options extends PickDeepPartial<PropsMixtureOptions, "MutualPropsMixtureOptions"> ? Options["MutualPropsMixtureOptions"] : DefaultMutualPropsMixtureOptions,
//     __PropsMixtureOptions extends DeepPartial<PropsMixtureOptions> = __MutualPropsMixtureOptions & { MutualPropsMixtureOptions: __MutualPropsMixtureOptions },
//     __PrimsMixtureOptions extends DeepPartial<PrimsMixtureOptions> = Options extends { MutualPropsMixtureOptions: { RecursionOptions: PickDeepPartial<MutualPropsMixtureRecursionOptions, "PrimsMixtureOptions"> } } ? Options["MutualPropsMixtureOptions"]["RecursionOptions"]["PrimsMixtureOptions"] : DefaultMutualPropsMixtureRecursionOptions["PrimsMixtureOptions"],
//     __BaseArrayMixtureOptions extends BaseArrayMixtureOptions = Options extends { MutualPropsMixtureOptions: { RecursionOptions: PickDeepPartial<MutualPropsMixtureRecursionOptions, "BaseArrayMixtureOptions"> } } ? Options["MutualPropsMixtureOptions"]["RecursionOptions"]["BaseArrayMixtureOptions"] : DefaultMutualPropsMixtureRecursionOptions["BaseArrayMixtureOptions"],
//     __Options extends DeepPartial<ArrayPrimsPropsMixtureOptions> = {
//         PropsMixtureOptions: __PropsMixtureOptions,
//         PrimsMixtureOptions: __PrimsMixtureOptions,
//         ArrayMixtureOptions: __BaseArrayMixtureOptions & {
//             PropsMixtureOptions: __PropsMixtureOptions,
//             PrimsMixtureOptions: __PrimsMixtureOptions,
//         },
//     },
//     > = (
//         { [K in DualContentKeychain["MutualOptionalKeys"]]?: ArrayPrimsPropsMixture<PureDualContent<DualContent["LeftContent"][K], DualContent["RightContent"][K]>, __Options>; }
//         & { [K in DualContentKeychain["MutualRequiredKeys"]]: ArrayPrimsPropsMixture<PureDualContent<DualContent["LeftContent"][K], DualContent["RightContent"][K]>, __Options>; }
//     );

/**
 * TODO: `IntersectProps<PureDualContent<{ a: { a: "" } }, { a: { a: "", b: "" } }>>` results in `const testtt24: { a: { a: ""; } | { a: ""; b: ""; }; }`
 * => Deep intersection and side union is required
 */
/** A subtype of `PropsMixture`. Not intended to be called directly. */
type ValidatingRecursionInMutualPropsMixture<
    DualContent extends DefaultDualContent,
    DualContentKeychain extends FlankContentKeychain<DualContent>,
    Options extends DefaultedPropsMixtureOptions,
    __Recursive extends boolean = (
        Options["Options"] extends { MutualPropsMixtureOptions: Pick<MutualPropsMixtureOptions, "Recursive"> }
        ? Options["Options"]["MutualPropsMixtureOptions"]["Recursive"]
        : Options["DefaultOptions"]["MutualPropsMixtureOptions"]["Recursive"]
    ),
    > = (
        // { _: { IsRecursive: __Recursive } }
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
            : "You should check before this type, if left or right extends the other")
    );

type ValidateExpandableMutualPropsMixture<
    DualContent extends DefaultDualContent,
    Options extends DefaultedPropsMixtureOptions,
    DualContentKeychain extends FlankContentKeychain<DualContent> = FlankContentKeychain<DualContent>,
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
    Options extends DefaultedPropsMixtureOptions,
    __ContentMutations extends ContentMutationOrArray = Options["Options"] extends Pick<PropsMixturePropsOptions, "ContentMutations"> ? Options["Options"]["ContentMutations"] : Options["DefaultOptions"]["ContentMutations"],
    __DualContent extends ImpureFlankContent<DualContent, __ContentMutations> = ImpureFlankContent<DualContent, __ContentMutations>,
    __DualContentKeychain extends FlankContentKeychain<__DualContent> = FlankContentKeychain<__DualContent>,
    __DualRemnantKeychain extends FlankRemnantKeychain<__DualContentKeychain> = FlankRemnantKeychain<__DualContentKeychain>,
    __MixtureKind extends MixtureKindKeys = Options["Options"] extends Pick<PropsMixturePropsOptions, "MixtureKind"> ? Options["Options"]["MixtureKind"] : Options["DefaultOptions"]["MixtureKind"],
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
                    MixtureKinds["Intersection"] extends MixtureKinds[__MixtureKind]
                    ? ([__DualContentKeychain["MutualKeys"]] extends [never]
                        ? never
                        : ValidateExpandableMutualPropsMixture<__DualContent, Options, __DualContentKeychain>)
                    : never
                ), (
                    MixtureKinds["LeftExceptRight"] extends MixtureKinds[__MixtureKind]
                    ? ([__DualRemnantKeychain["LeftRemnant"]["Keys"]] extends [never]
                        ? never
                        : ExpansionOverPick<__DualContent["LeftContent"], __DualRemnantKeychain["LeftRemnant"]["Keys"]>
                    )
                    : never
                ),
                never,
                { WrapInTuple: true }
            >, (
                MixtureKinds["RightExceptLeft"] extends MixtureKinds[__MixtureKind]
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
    Options extends DefaultedPropsMixtureOptions,
    DualContentKeychain extends FlankContentKeychain<DualContent> = FlankContentKeychain<DualContent>,
    DualRemnantKeychain extends FlankRemnantKeychain<DualContentKeychain> = FlankRemnantKeychain<DualContentKeychain>,
    > = (
        DualContent["LeftContent"] extends DualContent["RightContent"]
        ? ExpandingPropsMixture<DualContent, DualContent["LeftContent"], DualContent["RightContent"], DualContent["LeftContent"], DualContent["RightContent"]>
        : DualContent["RightContent"] extends DualContent["LeftContent"]
        ? ExpandingPropsMixture<DualContent, DualContent["LeftContent"], DualContent["RightContent"], DualContent["LeftContent"], DualContent["RightContent"]>
        // They have to be mixtured in parts, because LeftContent or RightContent does not extend the other
        : PartedPropsMixture<DualContent, Options, [], DualContent, DualContentKeychain, DualRemnantKeychain>
    );

export type MixtureKindSelectedPropsMixture<
    DualContent extends DefaultDualContent,
    Options extends DefaultedPropsMixtureOptions,
    __ContentMutations extends ContentMutationOrArray = Options["Options"] extends Pick<PropsMixturePropsOptions, "ContentMutations"> ? Options["Options"]["ContentMutations"] : Options["DefaultOptions"]["ContentMutations"],
    __DualContent extends ImpureFlankContent<DualContent, __ContentMutations> = ImpureFlankContent<DualContent, __ContentMutations>,
    __DualContentKeychain extends FlankContentKeychain<__DualContent> = FlankContentKeychain<__DualContent>,
    __DualRemnantKeychain extends FlankRemnantKeychain<__DualContentKeychain> = FlankRemnantKeychain<__DualContentKeychain>,
    __MixtureKind extends MixtureKindKeys = Options["Options"] extends Pick<PropsMixturePropsOptions, "MixtureKind"> ? Options["Options"]["MixtureKind"] : Options["DefaultOptions"]["MixtureKind"],
    > = (
        MixtureKinds["None"] extends MixtureKinds[__MixtureKind]
        ? never
        : (MixtureKinds["All"] extends MixtureKinds[__MixtureKind]
            ? ValidateExpandablePropsMixture<__DualContent, Options, __DualContentKeychain, __DualRemnantKeychain>
            : (
                MixtureKinds["LeftIncludingIntersection"] extends MixtureKinds[__MixtureKind]
                // ? ValidateExpandablePropsMixture<PureDualContent<ExpansionOverPick<__DualContent["LeftContent"], __DualContentKeychain["MutualKeys"] | __DualRemnantKeychain["LeftRemnant"]["Keys"]>, ExpansionOverPick<__DualContent["RightContent"], __DualContentKeychain["MutualKeys"]>>>
                // TODO: Proof it
                ? ValidateExpandablePropsMixture<__DualContent, Options, __DualContentKeychain, __DualRemnantKeychain>
                : (MixtureKinds["RightIncludingIntersection"] extends MixtureKinds[__MixtureKind]
                    // TODO: Proof it
                    ? ValidateExpandablePropsMixture<__DualContent, Options, __DualContentKeychain, __DualRemnantKeychain>
                    : (MixtureKinds["LeftExceptRight"] extends MixtureKinds[__MixtureKind]
                        ? ExpansionOverPick<__DualContent["LeftContent"], __DualRemnantKeychain["LeftRemnant"]["Keys"]>
                        : (MixtureKinds["RightExceptLeft"] extends MixtureKinds[__MixtureKind]
                            ? ExpansionOverPick<__DualContent["RightContent"], __DualRemnantKeychain["RightRemnant"]["Keys"]>
                            : ValidateExpandableMutualPropsMixture<__DualContent, Options, __DualContentKeychain>)))))
    );

export type PropsMixture<
    DualContent extends DefaultDualContent,
    Options extends DefaultedPropsMixtureOptions,
    __ContentMutations extends ContentMutationOrArray = Options["Options"] extends Pick<PropsMixturePropsOptions, "ContentMutations"> ? Options["Options"]["ContentMutations"] : Options["DefaultOptions"]["ContentMutations"],
    __DualContent extends ImpureFlankContent<DualContent, __ContentMutations> = ImpureFlankContent<DualContent, __ContentMutations>
    > = 2;
// &
// (
//     [__DualContent["LeftContent"]] extends [never]
//     ? ([__DualContent["RightContent"]] extends [never]
//         ? never
//         : MixtureKindSelectedPropsMixture<PureDualContent<{}, DualContent["RightContent"]>, Options, [], PureDualContent<{}, __DualContent["RightContent"]>>)
//     : ([__DualContent["RightContent"]] extends [never]
//         ? MixtureKindSelectedPropsMixture<PureDualContent<DualContent["LeftContent"], {}>, Options, [], PureDualContent<__DualContent["LeftContent"], {}>>
//         : MixtureKindSelectedPropsMixture<PureDualContent<DualContent["LeftContent"], DualContent["RightContent"]>, Options, [], PureDualContent<__DualContent["LeftContent"], __DualContent["RightContent"]>>)
// );


// export type PropsMixtureEntry<
//     DualContent extends DefaultDualContent,
//     Options extends DeepPartial<PropsMixtureOptions> = {},
//     __Options extends DefaultedPropsMixtureOptions = { Options: Options } & { DefaultOptions: ConcretePropsMixtureDefaultOptions }
//     > = PropsMixture<DualContent, __Options>;


export interface PrimsPropsMixtureOptions {
    PrimsMixtureOptions: PrimsMixtureOptions;
    PropsMixtureOptions: PropsMixtureOptions;
}

export interface ConcretePrimsPropsMixtureOptions extends PrimsPropsMixtureOptions {
    PrimsMixtureOptions: PrimsMixtureOptionsConcrete;
    PropsMixtureOptions: ConcretePropsMixtureOptions;
}

export interface PrimsPropsMixtureDefaultOptions extends PrimsPropsMixtureOptions { }

export interface ConcretePrimsPropsMixtureDefaultOptions extends ConcretePrimsPropsMixtureOptions { }

export interface DefaultedPrimsPropsMixtureOptions {
    Options: DeepPartial<PrimsPropsMixtureOptions>;
    DefaultOptions: PrimsPropsMixtureDefaultOptions;
}

export interface ConcreteDefaultedPrimsPropsMixtureOptions {
    Options: DeepPartial<ConcretePrimsPropsMixtureOptions>;
    DefaultOptions: ConcretePrimsPropsMixtureDefaultOptions;
}

// FEATURE: PRIM PROPS MIXTURE
export type PrimsPropsMixture<
    DualContent extends DefaultDualContent,
    Options extends DefaultedPrimsPropsMixtureOptions
    > = (
        PrimsMixtureBase<DualContent, {
            Options: Options["Options"]["PrimsMixtureOptions"] & {},
            DefaultOptions: Options["DefaultOptions"]["PrimsMixtureOptions"],
        }>
        | PropsMixture<DualContent, {
            Options: Options["Options"]["PropsMixtureOptions"] & {},
            DefaultOptions: Options["DefaultOptions"]["PropsMixtureOptions"],
        }>
    );

export interface ArrayPrimsPropsMixtureOptions extends PrimsPropsMixtureOptions {
    ArrayMixtureOptions: ArrayMixtureOptions;
}

export interface ConcreteArrayPrimsPropsMixtureOptions extends ArrayPrimsPropsMixtureOptions {
    PrimsMixtureOptions: PrimsMixtureOptionsConcrete;
    PropsMixtureOptions: ConcretePropsMixtureOptions;
    ArrayMixtureOptions: ArrayMixtureOptionsConcrete;
}

export interface ArrayPrimsPropsMixtureDefaultOptions extends ArrayPrimsPropsMixtureOptions { }

export interface ConcreteArrayPrimsPropsMixtureDefaultOptions extends ConcreteArrayPrimsPropsMixtureOptions { }

export interface DefaultedArrayPrimsPropsMixtureOptions {
    Options: DeepPartial<ArrayPrimsPropsMixtureOptions>;
    DefaultOptions: ArrayPrimsPropsMixtureDefaultOptions;
}

export interface ConcreteDefaultedArrayPrimsPropsMixtureOptions {
    Options: DeepPartial<ConcreteArrayPrimsPropsMixtureOptions>;
    DefaultOptions: ConcreteArrayPrimsPropsMixtureDefaultOptions;
}

// FEATURE: PRIM PROPS MIXTURE
export type ArrayPrimsPropsMixture<
    DualContent extends DefaultDualContent,
    Options extends DefaultedArrayPrimsPropsMixtureOptions,
    > = (
        PrimsPropsMixture<DualContent, {
            Options: {
                PrimsMixtureOptions: Options["Options"]["PrimsMixtureOptions"],
                PropsMixtureOptions: Options["Options"]["PropsMixtureOptions"],
            },
            DefaultOptions: {
                PrimsMixtureOptions: Options["DefaultOptions"]["PrimsMixtureOptions"]
                PropsMixtureOptions: Options["DefaultOptions"]["PropsMixtureOptions"],
            },
        }>
        | ArrayMixtureBase<DualContent, {
            Options: Options["Options"]["ArrayMixtureOptions"] & {},
            DefaultOptions: Options["DefaultOptions"]["ArrayMixtureOptions"],
        }>
    );
