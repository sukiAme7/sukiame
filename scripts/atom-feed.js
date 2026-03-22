function stripHtml(input) {
  return String(input || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeXml(input) {
  return String(input || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function normalizeSiteUrl(rawUrl) {
  const value = String(rawUrl || "").trim();
  if (!value) return "";
  return value.endsWith("/") ? value : `${value}/`;
}

function toAbsoluteUrl(siteUrl, path) {
  if (!path) return siteUrl || "";
  if (/^(?:[a-z][a-z0-9+.-]*:)?\/\//i.test(path)) return path;
  if (!siteUrl) return path.startsWith("/") ? path : `/${path}`;
  return new URL(path.replace(/^\//, ""), siteUrl).toString();
}

hexo.extend.generator.register("atom_feed", function (locals) {
  const siteUrl = normalizeSiteUrl(this.config.url);
  const posts = locals.posts
    .sort("date", -1)
    .filter((post) => post.published !== false)
    .limit(20)
    .toArray();

  const updated = posts.length ? posts[0].updated || posts[0].date : new Date();
  const feedTitle = this.config.title || "Feed";
  const feedSubtitle = this.config.description || "";
  const feedId = toAbsoluteUrl(siteUrl, "/atom.xml");
  const feedLink = feedId;
  const homeLink = toAbsoluteUrl(siteUrl, "/");
  const authorName = this.config.author || this.config.title || "Author";

  const entries = posts
    .map((post) => {
      const postUrl = toAbsoluteUrl(siteUrl, post.path);
      const summary = escapeXml(stripHtml(post.excerpt || post.content).slice(0, 220));
      const content = post.content || "";
      const updatedAt = (post.updated || post.date || new Date()).toISOString();
      const publishedAt = (post.date || post.updated || new Date()).toISOString();
      return `
  <entry>
    <title>${escapeXml(post.title)}</title>
    <id>${escapeXml(postUrl)}</id>
    <link href="${escapeXml(postUrl)}"/>
    <updated>${updatedAt}</updated>
    <published>${publishedAt}</published>
    <author>
      <name>${escapeXml(authorName)}</name>
    </author>
    <summary>${summary}</summary>
    <content type="html"><![CDATA[${content}]]></content>
  </entry>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${escapeXml(feedTitle)}</title>
  <subtitle>${escapeXml(feedSubtitle)}</subtitle>
  <id>${escapeXml(feedId)}</id>
  <link href="${escapeXml(feedLink)}" rel="self"/>
  <link href="${escapeXml(homeLink)}"/>
  <updated>${new Date(updated).toISOString()}</updated>
  <author>
    <name>${escapeXml(authorName)}</name>
  </author>${entries}
</feed>
`;

  return {
    path: "atom.xml",
    data: xml,
  };
});
