import { PropsMixtureBase, PropsMixtureDefaultOptions, PureDualContent, MutateContent, ValueContent } from "src";
import { ContentMutationAsArray, PrimsMixtureBase, PrimsMixtureOptionsContainerBase, PrimsMixtureDefaultOptionsBase, DefaultDualContent, PrimsMixtureOptionsContainer, PrimsMixtureDefaultOptions, ImpureDualContent, ImpureFlankContent, PrimsMixture } from "./typeMixtures";
import { NoneTypeExtendsNotTypeIntersection } from "@teronis/ts-definitions";

//
// BEGIN TEST SUITE
//

type Content0 = string | [number] | {};

//
// MutateContent
//
declare var MutateContentExtractObject: MutateContent<Content0, "ExtractObject">;
declare var MutateContentExtractArray: MutateContent<Content0, "ExtractArray">;
declare var MutateContentExcludeObject: MutateContent<Content0, "ExcludeObject">;
declare var MutateContentExcludeArray: MutateContent<Content0, "ExcludeArray">;

//
// ValueContent
//

type ValueContentMutations = ["ExtractObject", "ExcludeArray"];
declare var MutationArray: ContentMutationAsArray<ValueContentMutations>
declare var ValueContent0: ValueContent<Content0, ValueContentMutations>;

//

interface a1 {
    a: {
        a: "a1",
        e: {
            a: "a1",
            e: {
                a: "a1",
                e: {
                    a: "a1",
                },
            },
        },
        // g: "g1";
    };
    // b: "b1";
    // c: "c1";
}

interface a2 {
    a: {
        a: "a2",
        e: {
            a: "a1",
            e: {
                a: "a1",
                e: {
                    a: "a2",
                },
            },
            // e: "e",
        },
        // f: "f1",
        // g: "g2";
    };
    e: "e2";
}

type PureDualContent0 = PureDualContent<a1, a2>;
declare var PureDualContent0: PureDualContent0;
// PureDualContent0.LeftContent

//
// PrimsMixture
//

declare var DoesConcreteOptionsExtendsOptions: PrimsMixtureOptionsContainer extends PrimsMixtureOptionsContainerBase ? true : false;

type PrimsMixtureOptionsBase = {
    MixtureKind: "All",
    MutualPropsMixtureOptions: {
        Recursive: true,
    },
};

// declare var PrimsMixtureOptions: PrimsMixtureOptions;

type PureDualContent1 = PureDualContent<a1 | number, a2>;
declare var ImpurePureDualContent0: ImpureFlankContent<PureDualContent1, "ExcludeObject">;
ImpurePureDualContent0.LeftContent;

declare var PrimsMixture0: PrimsMixture<PureDualContent1, PrimsMixtureOptionsBase>;
PrimsMixture0;

// type PrimsMixtureDummy<
// DualContent extends DefaultDualContent,
// Options extends DefaultedPrimsMixtureOptions
// > = Options["Options"] extends Pick<OwnedPrimsMixtureOptions, "ContentMutations"> ? Options["Options"]["ContentMutations"] : Options["DefaultOptions"]["ContentMutations"];

// declare var Options0 : PrimsMixtureDummy<PureDualContent0, PrimsMixtureOptions>;
// PrimsMixture0.DefaultOptions.

//
// END TEST SUITE
//

// type testtt_0 = PureDualContent<{ a: { a: "a1" } }, { a: { a: "a2" } }>;
// type testtt_0_0_1 = PureDualContent<{ a: { a: "" } }, { a: { a: "", b: "" } }>;
// type testtt_0_1 = ImpureFlankContent<testtt_0, ["ExcludeObject"]>;
// type testtt23 = PrimsMixture<testtt_0_1>;
// type testtt_0_2 = ImpureFlankContent<testtt_0, ["ExtractObject"]>;
// declare const testtt24: PropsMixture<testtt_0, { MixtureKind: "Intersection", MutualPropsMixtureOptions: { ContentMutations: undefined, MixtureKind: "Intersection" | "FlankUnion", Recursive: true } }>;
declare const testtt24: PropsMixtureBase<PureDualContent0, {
    Options: {
        MixtureKind: "Intersection" | "FlanksExceptIntersection",
        ContentMutations: "ExtractObject",
        MutualPropsMixtureOptions: {
            Recursive: true,
        },
    },
    DefaultOptions: PropsMixtureDefaultOptions,
}>;
// testtt24.__DualRemnantKeychain.LeftRemnant.
testtt24.RecursiveMutualPropsMixture.MutualOptionalProps.;
// testtt24.

// type test = typeof testtt24;

declare var CheckNoneTypeExtendsTypes : NoneTypeExtendsNotTypeIntersection<number, never, never, { WrapInTuple: true }>;

// testtt24.a.e.e.e.
// type test<> =

declare var TestUnknownNever : Pick<{}, never>;
type test = typeof TestUnknownNever;
