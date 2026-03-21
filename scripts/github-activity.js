const DAY_MS = 24 * 60 * 60 * 1000;
const GRAPHQL_ENDPOINT = "https://api.github.com/graphql";

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

  if (!username || !token || !Number.isFinite(days) || days <= 0) {
    return;
  }

  const to = new Date();
  const from = new Date(to.getTime() - (days - 1) * DAY_MS);

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
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-days);

    const counts = contributionDays.map((day) => Number(day.contributionCount) || 0);
    themeConfig.activity.resolved_cells = normalizeContributionLevels(counts);
    themeConfig.activity.using_live_data = true;
  } catch (error) {
    hexo.log.warn(`[sukiame] Failed to load GitHub activity: ${error.message}`);
  }
});
