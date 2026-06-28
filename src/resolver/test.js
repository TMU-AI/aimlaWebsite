/**
 * Standalone resolver prototype smoke test.
 * Exercises the experimental ML resolver against a small query set.
 */
import { resolve } from "./resolver.js";

const testCases = [
    { query: "what events are coming up?", expected: "events" },
    { query: "how do I join the club?", expected: "join" },
    { query: "what is AIMLA?", expected: "about" },
    { query: "who are the members?", expected: "members" },
    { query: "what projects have you built?", expected: "projects" },
    { query: "how do I contact you?", expected: "contact" },
    { query: "evnts", expected: "events" },
    { query: "memebers", expected: "members" },
    { query: "what is the weather", expected: null },
];

console.log("AIMLA Resolver — Test Results\n");
let passed = 0;

for (const { query, expected } of testCases) {
    const result = await resolve(query);
    const status = result.match === expected ? "yes" : "no";
    if (result.match === expected) passed++;
    console.log(`${status} "${query}" → ${result.match} (expected: ${expected})`);
}

console.log(`\nAccuracy: ${passed}/${testCases.length}`);
