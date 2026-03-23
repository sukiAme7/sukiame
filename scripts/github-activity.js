const DAY_MS = 24 * 60 * 60 * 1000;
const GRAPHQL_ENDPOINT = "https://api.github.com/graphql";

function resolveTimeZone(hexoInstance) {
  const configured =
    hexoInstance &&
    hexoInstance.config &&
    typeof hexoInstance.config.timezone === "string"
      ? hexoInstance.config.timezone.trim()
      : "";

  if (configured) {
    try {
      new Intl.DateTimeFormat("en-CA", { timeZone: configured }).format(new Date());
      return configured;
    } catch (error) {}
  }

  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
}

function getDateParts(date, timeZone) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  return formatter.formatToParts(date).reduce((parts, item) => {
    if (item.type !== "literal") {
      parts[item.type] = item.value;
    }
    return parts;
  }, {});
}

function formatUtcDateKey(date) {
  return [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, "0"),
    String(date.getUTCDate()).padStart(2, "0"),
  ].join("-");
}

function buildDisplayDateKeys(days, timeZone) {
  const todayParts = getDateParts(new Date(), timeZone);
  const todayUtc = Date.UTC(
    Number(todayParts.year),
    Number(todayParts.month) - 1,
    Number(todayParts.day)
  );
  const startUtc = todayUtc - (days - 1) * DAY_MS;

  return Array.from({ length: days }, (_, index) =>
    formatUtcDateKey(new Date(startUtc + index * DAY_MS))
  );
}

function normalizeContributionLevels(counts) {
  const max = Math.max(0, ...counts);

  return counts.map((count) => {
    if (!count) return 0;
    if (max <= 1) return 1;

    const ratio = count / max;
    if (ratio >= 0.66) return 3;
    if (ratio >= 0.33) return 2;
    return 1;
  });
}

hexo.extend.filter.register("before_generate", async function () {
  const themeConfig = hexo.theme && hexo.theme.config ? hexo.theme.config : {};
  const activityConfig = themeConfig.activity || {};
  const githubConfig = themeConfig.github || {};
  const fallbackCells = Array.isArray(activityConfig.cells) ? activityConfig.cells : [];

  themeConfig.activity = themeConfig.activity || {};
  themeConfig.activity.resolved_cells = fallbackCells;
  themeConfig.activity.using_live_data = false;

  const username = githubConfig.username;
  const token = process.env.GITHUB_TOKEN;
  const days = Number(githubConfig.days || activityConfig.days || 20);
  const timeZone = resolveTimeZone(hexo);

  if (!username || !token || !Number.isFinite(days) || days <= 0) {
    return;
  }

  const displayDateKeys = buildDisplayDateKeys(days, timeZone);
  const displayStart = new Date(`${displayDateKeys[0]}T00:00:00.000Z`);
  const displayEnd = new Date(`${displayDateKeys[displayDateKeys.length - 1]}T23:59:59.999Z`);

  // Query a slightly wider window so the latest local day is still included
  // when the build machine timezone differs from the site's timezone.
  const from = new Date(displayStart.getTime() - 2 * DAY_MS);
  const to = new Date(displayEnd.getTime() + 2 * DAY_MS);

  const query = `
    query($login: String!, $from: DateTime!, $to: DateTime!) {
      user(login: $login) {
        contributionsCollection(from: $from, to: $to) {
          contributionCalendar {
            weeks {
              contributionDays {
                date
                contributionCount
              }
            }
          }
        }
      }
    }
  `;

  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        variables: {
          login: username,
          from: from.toISOString(),
          to: to.toISOString(),
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`GitHub API responded with ${response.status}`);
    }

    const payload = await response.json();
    if (payload.errors && payload.errors.length) {
      throw new Error(payload.errors[0].message || "Unknown GitHub GraphQL error");
    }

    const weeks =
      payload &&
      payload.data &&
      payload.data.user &&
      payload.data.user.contributionsCollection &&
      payload.data.user.contributionsCollection.contributionCalendar &&
      payload.data.user.contributionsCollection.contributionCalendar.weeks;

    if (!Array.isArray(weeks)) {
      throw new Error("Missing contribution calendar data");
    }

    const contributionDays = weeks
      .flatMap((week) => week.contributionDays || [])
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    const contributionMap = new Map();
    contributionDays.forEach((day) => {
      if (!day || !day.date) return;
      contributionMap.set(day.date, Number(day.contributionCount) || 0);
    });

    const counts = displayDateKeys.map((dateKey) => contributionMap.get(dateKey) || 0);
    themeConfig.activity.resolved_cells = normalizeContributionLevels(counts);
    themeConfig.activity.resolved_dates = displayDateKeys;
    themeConfig.activity.using_live_data = true;
  } catch (error) {
    hexo.log.warn(`[sukiame] Failed to load GitHub activity: ${error.message}`);
  }
});
