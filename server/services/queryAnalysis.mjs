/**
 * Known AIMLA leadership roles.
 *
 * Each canonical value must exactly match the role stored
 * in members.json metadata.
 */
const ROLE_ALIASES = [
  {
    canonical: "President",
    patterns: [
      /\bpresident\b/i,
      /\bclub president\b/i,
      /\baimla president\b/i,
      /\bwho leads (?:the )?club\b/i,
      /\bwho runs (?:the )?club\b/i,
    ],
  },
  {
    canonical: "VP of Events",
    patterns: [
      /\bvp (?:of )?events\b/i,
      /\bvice[ -]?president (?:of )?events\b/i,
      /\bevents vp\b/i,
      /\bhead of events\b/i,
      /\bwho leads (?:the )?events\b/i,
    ],
  },
  {
    canonical: "VP of Finance",
    patterns: [
      /\bvp (?:of )?finance\b/i,
      /\bvice[ -]?president (?:of )?finance\b/i,
      /\bfinance vp\b/i,
      /\bhead of finance\b/i,
      /\bwho leads (?:the )?finances?\b/i,
    ],
  },
  {
    canonical: "VP of Marketing",
    patterns: [
      /\bvp (?:of )?marketing\b/i,
      /\bvice[ -]?president (?:of )?marketing\b/i,
      /\bmarketing vp\b/i,
      /\bhead of marketing\b/i,
      /\bwho leads (?:the )?marketing\b/i,
      /\bwho handles (?:the )?marketing\b/i,
      /\bwho manages (?:the )?marketing\b/i,
      /\bwho is responsible for (?:the )?marketing\b/i,
    ],
  },
  {
    canonical: "VP of Infrastructure",
    patterns: [
      /\bvp (?:of )?infrastructure\b/i,
      /\bvice[ -]?president (?:of )?infrastructure\b/i,
      /\binfrastructure vp\b/i,
      /\bhead of infrastructure\b/i,
      /\bwho leads (?:the )?infrastructure\b/i,
    ],
  },
  {
    canonical: "VP of Outreach",
    patterns: [
      /\bvp (?:of )?outreach\b/i,
      /\bvice[ -]?president (?:of )?outreach\b/i,
      /\boutreach vp\b/i,
      /\bhead of outreach\b/i,
      /\bwho leads (?:the )?outreach\b/i,
    ],
  },
  {
    canonical: "VP of Social Media",
    patterns: [
      /\bvp (?:of )?social media\b/i,
      /\bvice[ -]?president (?:of )?social media\b/i,
      /\bsocial media vp\b/i,
      /\bhead of social media\b/i,
      /\bwho leads (?:the )?social media\b/i,
    ],
  },
  {
    canonical: "VP of Education",
    patterns: [
      /\bvp (?:of )?education\b/i,
      /\bvice[ -]?president (?:of )?education\b/i,
      /\beducation vp\b/i,
      /\bhead of education\b/i,
      /\bwho leads (?:the )?education\b/i,
    ],
  },
];

/**
 * Cleans the user's question before retrieval.
 */
export function normalizeQuery(query) {
  return String(query ?? "")
    .normalize("NFKC")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Detects the category of AIMLA information being requested.
 *
 * Contact and social-platform checks happen before the
 * general "join" check. This ensures a question such as:
 *
 * "How can I join the AIMLA Discord?"
 *
 * is classified as contact rather than club registration.
 */
function detectContentType(query) {
  const normalized = query.toLowerCase();

  /**
   * Social platforms and contact information.
   */
  if (
    /\b(contact|email|e-mail|discord|instagram|linkedin|social media|socials|social links?|reach|message)\b/.test(
      normalized
    )
  ) {
    return "contact";
  }

  /**
   * Joining the club or applying to the team.
   */
  if (
    /\b(join|joining|membership|become a member|sign up|signup|register|registration|apply|application|roster|openings)\b/.test(
      normalized
    )
  ) {
    return "join";
  }

  /**
   * Club events.
   */
  if (
    /\b(event|events|workshop|workshops|meeting|meetings|conference|hackathon|competition|networking|schedule|upcoming|previous event|past event)\b/.test(
      normalized
    )
  ) {
    return "event";
  }

  /**
   * Projects and technical work.
   */
  if (
    /\b(project|projects|research|build|built|portfolio|demo|demos|model|models)\b/.test(
      normalized
    )
  ) {
    return "project";
  }

  /**
   * Team members and leadership.
   */
  if (
    /\b(who|member|members|president|vice president|vp|director|lead|leader|executive|team)\b/.test(
      normalized
    )
  ) {
    return "member";
  }

  /**
   * General questions about the organization.
   */
  if (
    /\b(about|what is aimla|what does aimla|club overview|purpose|mission|community|organization)\b/.test(
      normalized
    )
  ) {
    return "about";
  }

  return null;
}

/**
 * Detects a known leadership role.
 */
function detectExactRole(query) {
  for (const role of ROLE_ALIASES) {
    const matched = role.patterns.some((pattern) =>
      pattern.test(query)
    );

    if (matched) {
      return role.canonical;
    }
  }

  return null;
}

/**
 * Detects a username such as @maryammehdi24.
 */
function detectUsername(query) {
  const usernameMatch = query.match(
    /@[a-z0-9_.-]+/i
  );

  return usernameMatch?.[0] ?? null;
}

/**
 * Detects a team or department mentioned in the question.
 */
function detectTeam(query) {
  const normalized = query.toLowerCase();

  const teams = [
    {
      canonical: "Events",
      patterns: [
        /\bevents?\b/,
        /\blogistics\b/,
        /\bexperience\b/,
        /\bpartnerships?\b/,
      ],
    },
    {
      canonical: "Finances",
      patterns: [
        /\bfinance\b/,
        /\bfinances\b/,
        /\bbudgeting\b/,
        /\bfunding\b/,
      ],
    },
    {
      canonical: "Marketing",
      patterns: [
        /\bmarketing\b/,
        /\bbrand\b/,
        /\bbranding\b/,
        /\bcampaigns?\b/,
        /\bpromotion\b/,
        /\badvertising\b/,
      ],
    },
    {
      canonical: "Infrastructure",
      patterns: [
        /\binfrastructure\b/,
        /\bdevops\b/,
        /\bhardware\b/,
        /\bai models?\b/,
        /\bdevelopment\b/,
      ],
    },
    {
      canonical: "Outreach",
      patterns: [
        /\boutreach\b/,
        /\bcommunity\b/,
        /\bpartners?\b/,
      ],
    },
    {
      canonical: "Social Media",
      patterns: [
        /\bsocial media\b/,
        /\binstagram\b/,
        /\blinkedin\b/,
        /\bcontent\b/,
      ],
    },
    {
      canonical: "Education",
      patterns: [
        /\beducation\b/,
        /\bteaching\b/,
        /\bworkshops?\b/,
        /\blearning\b/,
      ],
    },
    {
      canonical: "Executive",
      patterns: [
        /\bexecutive\b/,
        /\bexec\b/,
        /\bpresident\b/,
        /\bleadership\b/,
      ],
    },
  ];

  for (const team of teams) {
    const matched = team.patterns.some((pattern) =>
      pattern.test(normalized)
    );

    if (matched) {
      return team.canonical;
    }
  }

  return null;
}

/**
 * Detects whether the visitor wants several results.
 */
function detectListRequest(query) {
  return /\b(list|all|everyone|every member|members of|who are|show me)\b/i.test(
    query
  );
}

/**
 * Detects when "members" means regular department members,
 * excluding the department VP and President.
 *
 * Example:
 * "Show me all Infrastructure members"
 *
 * This returns true.
 *
 * Example:
 * "Show me the entire Infrastructure team"
 *
 * This returns false, allowing the VP to be included.
 */
function detectMembersOnlyRequest(query) {
  const normalized = query.toLowerCase();

  const mentionsMembers =
    /\bmembers?\b/.test(normalized);

  const explicitlyRequestsLeadership =
    /\b(vp|vice president|president|leader|leaders|leadership|executive|executives)\b/.test(
      normalized
    );

  const requestsEntireTeam =
    /\b(whole team|entire team|everyone|all people|full team|department)\b/.test(
      normalized
    );

  return (
    mentionsMembers &&
    !explicitlyRequestsLeadership &&
    !requestsEntireTeam
  );
}

/**
 * Detects the requested social platform.
 *
 * This can later be used for exact metadata filtering.
 */
function detectPlatform(query) {
  const normalized = query.toLowerCase();

  if (/\bdiscord\b/.test(normalized)) {
    return "discord";
  }

  if (/\binstagram\b/.test(normalized)) {
    return "instagram";
  }

  if (/\blinkedin\b/.test(normalized)) {
    return "linkedin";
  }

  if (/\be-?mail\b/.test(normalized)) {
    return "email";
  }

  return null;
}

/**
 * Produces structured query information for retrieval.
 */
export function analyzeQuery(query) {
  const normalizedQuery =
    normalizeQuery(query);

  return {
    normalizedQuery,

    contentType:
      detectContentType(normalizedQuery),

    status: "current",

    exactRole:
      detectExactRole(normalizedQuery),

    exactUsername:
      detectUsername(normalizedQuery),

    team:
      detectTeam(normalizedQuery),

    platform:
      detectPlatform(normalizedQuery),

    isListRequest:
      detectListRequest(normalizedQuery),

    membersOnly:
      detectMembersOnlyRequest(normalizedQuery),
  };
}