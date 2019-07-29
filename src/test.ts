import { PropsMixture, PropsMixtureDefaultOptions, PureDualContent } from "src";

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

type testtt_0 = PureDualContent<a1, a2>;
// type testtt_0 = PureDualContent<{ a: { a: "a1" } }, { a: { a: "a2" } }>;
// type testtt_0_0_1 = PureDualContent<{ a: { a: "" } }, { a: { a: "", b: "" } }>;
// type testtt_0_1 = ImpureFlankContent<testtt_0, ["ExcludeObject"]>;
// type testtt23 = PrimsMixture<testtt_0_1>;
// type testtt_0_2 = ImpureFlankContent<testtt_0, ["ExtractObject"]>;
// declare const testtt24: PropsMixture<testtt_0, { MixtureKind: "Intersection", MutualPropsMixtureOptions: { ContentMutations: undefined, MixtureKind: "Intersection" | "FlankUnion", Recursive: true } }>;
declare const testtt24: PropsMixture<testtt_0, {
    Options: {
        MixtureKind: "Intersection" | "FlanksExceptIntersection",
        ContentMutations: "ExtractObject",
        MutualPropsMixtureOptions: {
            Recursive: true,
        },
    },
    DefaultOptions: PropsMixtureDefaultOptions,
}>;

testtt24.a.e.e.e.