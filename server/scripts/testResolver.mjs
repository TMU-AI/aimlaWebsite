const BASE_URL = process.env.RESOLVER_URL || "http://localhost:3001";

const ALL_MEMBER_IDS = [
  "members_antonio", "members_areej", "members_jarin", "members_seif", "members_maryam",
  "members_joel", "members_shriya", "members_lana", "members_oliver", "members_gab",
  "members_derrick", "members_jeyden", "members_skye", "members_walker", "members_jenison",
  "members_ronald", "members_christina", "members_zulaikha", "members_belal", "members_nousha",
  "members_malaika",
];

const INFRASTRUCTURE_IDS = ["members_oliver", "members_gab", "members_derrick", "members_jeyden", "members_skye", "members_walker"];
const MARKETING_IDS = ["members_maryam", "members_joel", "members_shriya", "members_lana"];
const EVENTS_IDS = ["members_areej", "members_jarin"];
const OUTREACH_IDS = ["members_jenison", "members_ronald"];
const SOCIAL_MEDIA_IDS = ["members_christina", "members_zulaikha"];
const EDUCATION_IDS = ["members_belal", "members_nousha"];

const cases = [
  // --- Individual lookups: each should return exactly that one person. ---
  { query: "who is gab", expect: { type: "single", ids: ["members_gab"] } },
  { query: "who is derrick", expect: { type: "single", ids: ["members_derrick"] } },
  { query: "who is jeyden", expect: { type: "single", ids: ["members_jeyden"] } },
  { query: "who is oliver manuel", expect: { type: "single", ids: ["members_oliver"] } },
  { query: "who is antonio souza", expect: { type: "single", ids: ["members_antonio"] } },
  { query: "who is maryam mehdi", expect: { type: "single", ids: ["members_maryam"] } },
  { query: "who is skye", expect: { type: "single", ids: ["members_skye"] } },

  // --- Team queries: each should return every current member of that team. ---
  { query: "who are the infrastructure members", expect: { type: "multi", ids: INFRASTRUCTURE_IDS } },
  { query: "who is on the marketing team", expect: { type: "multi", ids: MARKETING_IDS } },
  { query: "who are the events people", expect: { type: "multi", ids: EVENTS_IDS } },
  { query: "who handles outreach", expect: { type: "multi", ids: OUTREACH_IDS } },
  { query: "who is on social media", expect: { type: "multi", ids: SOCIAL_MEDIA_IDS } },
  { query: "who runs the education department", expect: { type: "multi", ids: EDUCATION_IDS } },

  // --- Broad roster queries: should return every current member. ---
  { query: "who are the members", expect: { type: "multi", ids: ALL_MEMBER_IDS } },
  { query: "who are the members of AIMLA", expect: { type: "multi", ids: ALL_MEMBER_IDS } },
  { query: "list all members", expect: { type: "multi", ids: ALL_MEMBER_IDS } },
  { query: "show me everyone in the club", expect: { type: "multi", ids: ALL_MEMBER_IDS } },

  // --- Other destinations: sanity check these still resolve normally. ---
  { query: "what events do you have", expect: { type: "destination", match: "events" } },
  { query: "how do I join the club", expect: { type: "destination", match: "join" } },
  { query: "what is AIMLA", expect: { type: "destination", match: "about" } },
  { query: "how do I contact you", expect: { type: "destination", match: "contact" } },
  { query: "what projects have you built", expect: { type: "destination", match: "projects" } },

  // --- Clearly unrelated: should NOT match anything. ---
  { query: "what is the weather tomorrow", expect: { type: "none" } },
  { query: "how do I bake a chocolate cake", expect: { type: "none" } },
  { query: "what time is it right now", expect: { type: "none" } },
];

function idsFromMatches(matches) {
  return (matches || []).map((m) => m.sourceId).sort();
}

function setsEqual(a, b) {
  if (a.length !== b.length) return false;
  const sa = [...a].sort();
  const sb = [...b].sort();
  return sa.every((v, i) => v === sb[i]);
}

async function runCase({ query, expect }) {
  const res = await fetch(`${BASE_URL}/api/resolve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ input: query }),
  });
  const body = await res.json();
  const actualIds = idsFromMatches(body.matches);

  let pass = false;
  let detail = "";

  if (expect.type === "none") {
    pass = body.match === null;
    detail = pass
      ? "correctly unmatched"
      : `expected no match, got "${body.match}" (${actualIds.join(", ") || body.sourceId || "?"})`;
  } else if (expect.type === "destination") {
    pass = body.match != null && (!expect.match || body.match === expect.match);
    detail = pass ? `matched "${body.match}"` : `expected "${expect.match}", got "${body.match}"`;
  } else if (expect.type === "single") {
    pass = actualIds.length === 1 && setsEqual(actualIds, expect.ids);
    detail = pass
      ? `matched ${actualIds.join(", ")}`
      : `expected [${expect.ids.join(", ")}], got [${actualIds.join(", ") || "nothing"}]`;
  } else if (expect.type === "multi") {
    pass = setsEqual(actualIds, expect.ids);
    if (!pass) {
      const missing = expect.ids.filter((id) => !actualIds.includes(id));
      const extra = actualIds.filter((id) => !expect.ids.includes(id));
      detail = `missing: [${missing.join(", ") || "none"}] | extra: [${extra.join(", ") || "none"}]`;
    } else {
      detail = `all ${actualIds.length} matched correctly`;
    }
  }

  return { query, pass, detail, reason: body.reason };
}

async function main() {
  console.log(`Testing resolver at ${BASE_URL}/api/resolve\n`);
  let passed = 0;
  const failures = [];

  for (const testCase of cases) {
    let result;
    try {
      result = await runCase(testCase);
    } catch (error) {
      result = { query: testCase.query, pass: false, detail: `request failed: ${error.message}` };
    }

    const icon = result.pass ? "PASS" : "FAIL";
    console.log(`[${icon}] "${result.query}"`);
    console.log(`       ${result.detail}${result.reason ? ` (${result.reason})` : ""}`);

    if (result.pass) {
      passed += 1;
    } else {
      failures.push(result.query);
    }
  }

  console.log(`\n${passed}/${cases.length} passed`);
  if (failures.length > 0) {
    console.log(`Failed: ${failures.join(" | ")}`);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error("Test run failed to start:", error);
  process.exit(1);
});