const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const output = path.resolve(__dirname, "../dist");
const html = fs.readFileSync(path.join(output, "index.html"), "utf8");

// GitHub Pages serves this site from a subpath, so no asset may be root-absolute.
assert.doesNotMatch(
  html,
  /\b(?:src|href)="\/(?!\/)/,
  "Asset paths must be relative for subpath hosting"
);
assert.ok(
  fs.existsSync(path.join(output, "og-card.jpg")),
  "Missing share card"
);
assert.ok(fs.existsSync(path.join(output, ".nojekyll")), "Missing .nojekyll");
assert.doesNotMatch(html, /\u5415\u4f73\u9633|portrait-lifestyle/);

// The HTML optimizer must preserve SVG coordinates for responsive image framing.
const viewBoxes = [...html.matchAll(/<svg\b[^>]*\bviewbox="([^"]+)"/gi)].map(
  (match) => match[1].split(/\s+/).map(Number)
);
assert.deepEqual(viewBoxes, [
  [0, 0, 900, 1200],
  [0, 0, 1600, 900],
  [0, 0, 1600, 900],
  [0, 0, 1600, 900],
  [0, 0, 1600, 900],
]);

const images = [...html.matchAll(/<image\b[^>]*\bhref="([^"]+)"/gi)].map(
  (match) => match[1]
);
assert.equal(images.length, 7);
for (const [index, name] of [
  "portrait-zora",
  "zhijia-home",
  "zhijia-assessment",
  "zhijia-plan",
  "ward-robots",
  "business-agent",
  "shengjian-cover",
].entries()) {
  assert.match(
    images[index],
    new RegExp(`^(?:\\./)?${name}\\.[a-f0-9]+\\.(jpg|png)$`)
  );
  assert.ok(
    fs.existsSync(path.join(output, images[index].replace(/^\.?\//, ""))),
    `Missing production image: ${images[index]}`
  );
}
assert.doesNotMatch(html, /(?:src|href)="[^"]*\b(?:profile|project)\.jpg"/i);

const videoLinks = [...html.matchAll(/<a\b[^>]*\bhref="([^"]+\.mp4)"/gi)].map(
  (match) => match[1]
);
// 智家清单: button + screenshot; 问数 Agent: button only (screenshot opens the live demo).
assert.equal(videoLinks.length, 3);
assert.match(html, /href="?https:\/\/demo\.zorarise\.ccwu\.cc"?/);
const videos = [...new Set(videoLinks)];
assert.equal(videos.length, 2);
for (const [index, name] of ["zhijia", "business-agent"].entries()) {
  assert.equal(videos[index], `assets/media/${name}-demo.mp4`);
  assert.equal(
    fs.statSync(path.join(output, videos[index].replace(/^\.?\//, ""))).size,
    fs.statSync(path.resolve(__dirname, `../src/assets/media/${name}-demo.mp4`))
      .size,
    `Incomplete production video: ${videos[index]}`
  );
}

assert.match(html, /id="?ui-works"?/i);
assert.match(html, /data-gallery-track/i);
assert.equal(
  (html.match(/<article\b[^>]*\bclass="?ui-card"?/gi) || []).length,
  6
);

const galleryImages = [...html.matchAll(/<img\b[^>]*>/gi)]
  .map((match) => match[0])
  .filter((tag) => /\bclass="?ui-card__img\b/i.test(tag))
  .map((tag) => tag.match(/\bsrc="?([^"\s>]+)"?/i)[1]);
assert.equal(galleryImages.length, 6);
for (const [index, name] of [
  "ui-smartcook-brochure",
  "ui-deji-facade",
  "ui-space-poster",
  "ui-stamp-logo",
  "ui-deji-poster",
  "ui-awakening-poster",
].entries()) {
  assert.match(
    galleryImages[index],
    new RegExp(`^(?:\\./)?${name}\\.[a-f0-9]+\\.jpg$`)
  );
  assert.ok(
    fs.existsSync(
      path.join(output, galleryImages[index].replace(/^\.?\//, ""))
    ),
    `Missing production UI work image: ${galleryImages[index]}`
  );
}

for (const [name, extension] of [
  ["bonjour-logo", "png"],
  ["xiaohongshu-logo", "ico"],
]) {
  const logoTag = [...html.matchAll(/<img\b[^>]*>/gi)]
    .map((match) => match[0])
    .find((tag) => tag.includes(name));
  assert.ok(logoTag, `Missing social logo: ${name}`);
  const src = logoTag.match(/\bsrc="([^"]+)"/)[1];
  assert.match(
    src,
    new RegExp(`^(?:\\./)?${name}\\.[a-f0-9]+\\.${extension}$`)
  );
  assert.ok(
    fs.existsSync(path.join(output, src.replace(/^\.?\//, ""))),
    `Missing built logo: ${src}`
  );
}

const resumeTag = html.match(/<a\b[^>]*\bhref="([^"]+\.pdf)"[^>]*>/i);
assert.ok(resumeTag, "Missing approved resume PDF link");
assert.match(resumeTag[0], /target="_blank"/);
assert.match(resumeTag[0], /rel="noopener noreferrer"/);
const resumeHref = resumeTag[1];
assert.equal(resumeHref, "assets/resume-aipm.pdf");
assert.ok(
  fs
    .readFileSync(path.join(output, resumeHref.replace(/^\.?\//, "")))
    .equals(
      fs.readFileSync(path.resolve(__dirname, "../src/assets/resume-aipm.pdf"))
    ),
  "Resume PDF must remain the original unmodified attachment"
);
assert.doesNotMatch(html, /公开版简历待补充/);

const wechatTag = html.match(/<a\b[^>]*\bdata-wechat-contact\b[^>]*>/i);
assert.ok(wechatTag, "Missing approved WeChat contact link");
const wechatHref = wechatTag[0].match(/\bhref="([^"]+)"/)[1];
assert.equal(wechatHref, "assets/media/wechat-contact.jpg");
assert.ok(
  fs
    .readFileSync(path.join(output, wechatHref.replace(/^\.?\//, "")))
    .equals(
      fs.readFileSync(
        path.resolve(__dirname, "../src/assets/media/wechat-contact.jpg")
      )
    ),
  "WeChat QR must remain the original unmodified image"
);
const bonjourTag = html.match(/<a\b[^>]*\bdata-bonjour-code=[^>]*>/i);
assert.ok(bonjourTag, "Missing Bonjour contact link");
const bonjourHref = bonjourTag[0].match(/\bhref="([^"]+)"/)[1];
assert.equal(bonjourHref, "assets/bonjour.txt");
assert.equal(
  fs
    .readFileSync(path.join(output, bonjourHref.replace(/^\.?\//, "")), "utf8")
    .trim(),
  "#小程序://Bonjour/9cmOIHhYkqsPNHI"
);
assert.doesNotMatch(html, /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
assert.doesNotMatch(html, /mailto:|fa-envelope/i);
assert.match(html, /href="https:\/\/xhslink\.cn\/o\/1y6ls6jVE2W"/);

console.log(
  "Production media verified: 5 SVG viewBoxes, 7 project/portrait images, 2 complete videos, 6 UI gallery images, original resume PDF, original WeChat QR, and Bonjour fallback."
);
