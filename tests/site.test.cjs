const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "src/index.html"), "utf8");
const animationSource = fs
  .readFileSync(path.join(root, "src/scripts/scrollReveal.js"), "utf8")
  .replace("export default function", "function");
const gallerySource = fs
  .readFileSync(path.join(root, "src/scripts/uiGallery.js"), "utf8")
  .replace("export default function", "function");

test("includes expected section order, four project slots, and UI works gallery", () => {
  const sections = [...html.matchAll(/<section id="([^"]+)"/g)].map(
    (match) => match[1]
  );
  assert.deepEqual(sections, [
    "hero",
    "about",
    "projects",
    "ui-works",
    "contact",
  ]);
  assert.equal(
    (html.match(/class="project-wrapper__text-title"/g) || []).length,
    4
  );
  assert.match(html, /<html lang="zh-CN"/);
  assert.match(html, /Zora/);
  assert.match(html, /119\s+个评分单元/);
  assert.match(html, /声笺/);
  assert.equal((html.match(/<article class="ui-card"/g) || []).length, 6);
  assert.doesNotMatch(html, /data-placeholder="true"/);
  assert.equal(
    (html.match(/src="assets\/media\/ui-[a-z0-9-]+\.jpg"/g) || []).length,
    6
  );
});

test("keeps recruiting claims scoped to supplied evidence", () => {
  const copy = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
  assert.match(copy, /电子信息硕士.*2028 年 6 月毕业/);
  // Availability details were removed from the page at the user's request.
  assert.doesNotMatch(copy, /每周 5 天|可实习 6 个月|城市不限|正在寻找/);
  assert.match(copy, /荣耀 解决方案实习/);
  assert.match(copy, /Codex、Claude、Cursor/);
  assert.match(copy, /《半拿铁》/);

  const projects = [
    ...html.matchAll(/<div class="project-body">([\s\S]*?)<\/dl>/g),
  ].map((match) =>
    match[1]
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  );
  assert.equal(projects.length, 4);
  const metas = [
    ...html.matchAll(/<p class="project-meta">([\s\S]*?)<\/p>/g),
  ].map((match) => match[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " "));
  // Order: shipped product, internship, competition demo, personal project.
  assert.match(metas[0], /已上线微信小程序 · 3 人团队 · 产品与 AI 应用开发/);
  assert.match(metas[1], /驻场产品实习/);
  assert.match(metas[2], /中国电子杯赛题 Demo · 产品负责人/);
  assert.match(metas[3], /基于开源项目二次迭代/);
  assert.match(projects[0], /规则生成清单，大模型负责问答与方案解释/);
  assert.match(projects[0], /队友分别负责前端 UI 与后端数据库/);
  assert.match(projects[1], /驻场江苏省人民医院/);
  assert.match(projects[1], /3 类核心告警/);
  assert.match(projects[2], /约 150 道问题构建含多轮会话的 119 个评分单元/);
  assert.match(projects[3], /90\+ 期播客.*35\+ 位身边朋友/);

  // Numbers carry their definitions, as in the approved copy.
  const copyAll = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
  assert.match(copyAll, /测评完成率＝完成测评\/打开/);
  assert.match(copyAll, /小程序已停止服务，以上为上线 6 周历史数据/);
  assert.match(copyAll, /后续未参与调优题目的正确率约为 80%–90%/);
  assert.match(copyAll, /从事件发生到运维人员收到告警/);
  // The Badcase walkthrough sits inside the "评测" point it illustrates.
  assert.match(
    html,
    /<dt>评测<\/dt>\s*<dd>[\s\S]*?<details class="case-details">[\s\S]*?<\/details>\s*<\/dd>/
  );
  // Text and visual columns are split half and half.
  assert.equal((html.match(/class="col-lg-6 col-sm-12"/g) || []).length, 8);
  assert.doesNotMatch(html, /col-lg-4 col-sm-12|col-lg-8 col-sm-12/);
  assert.doesNotMatch(copyAll, /累计用户|自建评测准确率/);

  // Highlights stay restrained: at most two per project.
  const rows = html.split('class="project-wrapper__text-title">').slice(1);
  for (const row of rows) {
    const body = row.split("<!-- /END Project -->")[0];
    assert.ok((body.match(/<mark class="hl">/g) || []).length <= 2);
  }
});

test("hero presents Zora's positioning, scoped stats and motto", () => {
  const hero = html.split('<section id="hero"')[1].split("</section>")[0];
  const copy = hero.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
  assert.match(copy, /Zora/);
  assert.doesNotMatch(hero, /hero-badge/);
  assert.match(copy, /You can be anyone you want to be\./);
  assert.equal((hero.match(/class="hero-stat"/g) || []).length, 4);
  assert.match(copy, /上线 6 周累计打开人数/);
  assert.match(copy, /原调优集准确率/);
  assert.match(copy, /南京邮电大学 · 电子信息硕士 · 2028 届/);
  assert.match(copy, /荣耀 解决方案实习/);
  assert.doesNotMatch(copy, /医院驻场产品实习|驻场江苏省人民医院产品实习/);
  assert.match(copy, /智家清单从需求到上线/);
  assert.doesNotMatch(copy, /4 段|小程序 · Agent · 知识库 · 机器人/);
  // The award stays in the project details, not in the hero stats row.
  assert.doesNotMatch(hero, /二等奖/);
  // The updated resume no longer lists the award, so the site must not either.
  assert.doesNotMatch(html, /二等奖/);
  // Static fallback values must already be the final, true numbers.
  assert.match(hero, /data-count-to="2300">2,300</);
  assert.match(hero, /data-count-to="97\.5"\s+data-decimals="1"\s*>97\.5</);
  // Right column mirrors the approved HTML: three fanned 智家清单 screens.
  assert.match(copy, /看我的项目/);
  assert.doesNotMatch(copy, /看我的产品/);
  assert.match(hero, /class="hero-product load-hidden"\s+href="#zhijia"/);
  assert.equal((hero.match(/class="hero-phone hero-phone--/g) || []).length, 3);
  assert.match(html, /<div class="row" id="zhijia">/);
});

test("loads fonts, icons and reveal library without overseas CDNs", () => {
  assert.doesNotMatch(
    html,
    /cdnjs\.cloudflare\.com|unpkg\.com|fonts\.googleapis/
  );
  const typography = fs.readFileSync(
    path.join(root, "src/sass/base/_typography.scss"),
    "utf8"
  );
  assert.doesNotMatch(typography, /fonts\.googleapis/);
  const entry = fs.readFileSync(path.join(root, "src/index.js"), "utf8");
  assert.match(entry, /@fontsource\/sora/);
  assert.match(entry, /font-awesome\/css\/font-awesome\.css/);
  assert.match(entry, /from "scrollreveal"/);
});

test("ships a Zora favicon, share card and subpath-safe build", () => {
  assert.match(html, /<title>AI作品集 \| Zora<\/title>/);
  assert.match(html, /property="og:title" content="AI作品集 \| Zora"/);
  assert.match(
    html,
    /property="og:image"\s+content="https:\/\/[^"]+\/og-card\.jpg"/
  );
  assert.match(html, /rel="apple-touch-icon"/);
  for (const file of ["favicon.png", "apple-touch-icon.png", "og-card.jpg"]) {
    assert.ok(fs.existsSync(path.join(root, "src/assets", file)), file);
  }
  const pkg = JSON.parse(
    fs.readFileSync(path.join(root, "package.json"), "utf8")
  );
  assert.match(pkg.scripts.build, /--public-url \.\//);
  const workflow = fs.readFileSync(
    path.join(root, ".github/workflows/deploy.yml"),
    "utf8"
  );
  assert.match(workflow, /branches: \[main\]/);
  assert.match(workflow, /actions\/deploy-pages@v4/);
});

test("uses the approved space poster in the rejected ticket slot", () => {
  const gallery = html
    .split('<section id="ui-works"')[1]
    .split("</section>")[0];
  const cards = [...gallery.matchAll(/<article\b[\s\S]*?<\/article>/g)].map(
    (match) => match[0]
  );
  const expectedImages = [
    "ui-smartcook-brochure",
    "ui-deji-facade",
    "ui-space-poster",
    "ui-stamp-logo",
    "ui-deji-poster",
    "ui-awakening-poster",
  ];
  assert.equal(cards.length, expectedImages.length);
  for (const [index, name] of expectedImages.entries()) {
    assert.ok(cards[index].includes(`src="assets/media/${name}.jpg"`));
  }
  assert.match(cards[2], /data-tag="PS 合成"/);
  assert.match(cards[2], /width="1351"\s+height="1800"/);
  assert.match(cards[2], /alt="太空探索主题 PS 合成海报"/);
  assert.doesNotMatch(gallery, /ui-njupt-ticket|十五周年票券/);
});

test("shows no unfinished placeholders or fake players", () => {
  assert.equal((html.match(/>视频待补充</g) || []).length, 0);
  assert.equal((html.match(/>源码待补充</g) || []).length, 0);
  assert.doesNotMatch(html, /<(?:video|iframe)\b/);
  assert.doesNotMatch(html, /(?:src|href)="(?:|#!)"/);
  assert.doesNotMatch(html, /href="assets\/resume\.pdf"/);
});

test("opens the approved resume PDF from the original about-section button", () => {
  const about = html.split('<section id="about">')[1].split("</section>")[0];
  const resume = about.match(
    /<a\b[^>]*href="assets\/resume-aipm\.pdf"[^>]*>查看简历<\/a/
  );
  assert.ok(resume, "Missing working resume button");
  assert.match(resume[0], /class="cta-btn cta-btn--resume"/);
  assert.match(resume[0], /target="_blank"/);
  assert.match(resume[0], /rel="noopener noreferrer"/);
  assert.doesNotMatch(resume[0], /aria-disabled|tabindex="-1"/);
  assert.doesNotMatch(html, /公开版简历待补充/);
  const pdf = fs.readFileSync(path.join(root, "src/assets/resume-aipm.pdf"));
  assert.equal(pdf.subarray(0, 5).toString(), "%PDF-");
  assert.match(pdf.subarray(-1024).toString(), /%%EOF/);
});

test("all local assets and in-page links exist", () => {
  for (const [, attribute, value] of html.matchAll(/\b(src|href)="([^"]+)"/g)) {
    if (/^https?:/.test(value)) continue;
    if (value.startsWith("#")) {
      assert.ok(
        html.includes(`id="${value.slice(1)}"`),
        `Missing anchor: ${value}`
      );
      continue;
    }
    assert.ok(
      fs.existsSync(path.join(root, "src", value)),
      `Missing ${attribute} asset: ${value}`
    );
  }
});

test("publishes no email address, email entry, private phone or paths", () => {
  assert.doesNotMatch(html, /\b1[3-9]\d{9}\b/);
  assert.doesNotMatch(html, /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  assert.doesNotMatch(html, /mailto:|fa-envelope/i);
  assert.doesNotMatch(html, /[EF]:[\\/]/);
  assert.doesNotMatch(html, /Your Name|Unknown Developer|Project Title/);
});

test("uses only the Zora pseudonym in public files and the resume PDF", () => {
  const realName = /\u5415\u4f73\u9633/; // the real Chinese name, kept out of source
  assert.doesNotMatch(html, realName);
  for (const file of ["README.md"]) {
    assert.doesNotMatch(
      fs.readFileSync(path.join(root, file), "utf8"),
      realName
    );
  }
  // Text in the PDF is compressed, so check the raw bytes for the old school
  // email. Its local part is base64-encoded to keep it out of the public repo.
  const pdf = fs.readFileSync(path.join(root, "src/assets/resume-aipm.pdf"));
  assert.ok(!pdf.includes("njupt"), "school email must not be in the resume");
  const oldLocalPart = Buffer.from("MTIyNTAxMzg0NA==", "base64").toString();
  assert.ok(
    !pdf.includes(oldLocalPart),
    "school email must not be in the resume"
  );
});

test("leaves no disabled placeholder buttons in the page", () => {
  const styles = fs.readFileSync(
    path.join(root, "src/sass/components/_buttons.scss"),
    "utf8"
  );
  const anchors = [...html.matchAll(/<a\b[^>]*>/g)]
    .map((match) => match[0])
    .filter(
      (tag) => /class="cta-btn\b/.test(tag) && /aria-disabled="true"/.test(tag)
    );
  assert.equal(anchors.length, 0);
  assert.doesNotMatch(styles, /\.cta-placeholder/);
  assert.doesNotMatch(
    html,
    /cta-placeholder|profile-placeholder|project-placeholder/
  );
});

test("connects projects to their respective demo and source links", () => {
  const projects = html.split('class="project-wrapper__text-title">').slice(1);
  for (const [index, name, repository] of [
    [0, "zhijia", "zhijia-list"],
    [2, "business-agent", "chinook-business-agent"],
  ]) {
    const project = projects[index];
    assert.equal(
      (
        project.match(
          new RegExp(`href="assets/media/${name}-demo\\.mp4"`, "g")
        ) || []
      ).length,
      2
    );
    assert.ok(
      project.includes(`href="https://github.com/jiajia0820/${repository}"`)
    );
    const links = [...project.matchAll(/<a\b[^>]*\bhref="([^"]+)"[^>]*>/g)].map(
      (match) => match[0]
    );
    assert.equal(links.length, 3);
    assert.ok(links.every((link) => /\btarget="_blank"/.test(link)));
    assert.ok(links.every((link) => /\brel="noopener noreferrer"/.test(link)));
    assert.ok(links.every((link) => !/aria-disabled|tabindex="-1"/.test(link)));
  }
  const shengjianProject = projects[3].split("<!-- /END Project -->")[0];
  assert.match(shengjianProject, /声笺/);
  assert.equal(
    (
      shengjianProject.match(
        /href="https:\/\/github\.com\/jiajia0820\/shengjian-xiaoyuzhou"/g
      ) || []
    ).length,
    2
  );
  assert.doesNotMatch(shengjianProject, /视频待补充/);

  const wardProject = projects[1].split("<!-- /END Project -->")[0];
  assert.match(wardProject, /智慧病区巡检/);
  assert.doesNotMatch(wardProject, /<a\b[^>]*\bhref=/);
  assert.doesNotMatch(wardProject, /视频待补充|源码待补充|class="cta-btn/);
});

test("uses approved real images without changing the original media proportions", () => {
  // The real photo was replaced by an illustrated avatar for privacy.
  assert.match(html, /viewBox="0 0 900 1200"/);
  assert.match(html, /href="assets\/media\/portrait-zora\.jpg"/);
  assert.doesNotMatch(html, /portrait-lifestyle|湖边生活照/);
  assert.ok(
    !fs.existsSync(path.join(root, "src/assets/media/portrait-lifestyle.jpg")),
    "real photo must not be published"
  );
  assert.equal((html.match(/viewBox="0 0 1600 900"/g) || []).length, 4);
  assert.match(html, /href="assets\/media\/business-agent\.png"/);
  assert.match(html, /href="assets\/media\/shengjian-cover\.jpg"/);
  assert.match(html, /href="assets\/media\/ward-robots\.jpg"/);
  assert.doesNotMatch(html, /(?:src|href)="assets\/(?:profile|project)\.jpg"/);
});

test("shows three complete smart-home screens in one landscape frame", () => {
  const projectStart = html.indexOf("智家清单实机截图");
  const projectEnd = html.indexOf("</svg>", projectStart);
  const composition = html.slice(projectStart, projectEnd);
  assert.equal((composition.match(/<image\b/g) || []).length, 3);
  for (const name of ["home", "assessment", "plan"]) {
    assert.match(
      composition,
      new RegExp(`href="assets/media/zhijia-${name}\\.jpg"`)
    );
  }
  assert.equal(
    (composition.match(/preserveAspectRatio="xMidYMid meet"/g) || []).length,
    3
  );
});

test("retains footer social slots without template star/fork badges", () => {
  assert.equal((html.match(/class="github-button"/g) || []).length, 0);
  assert.doesNotMatch(html, /buttons\.github\.io/);
  assert.match(html, /Template developed by/);
  const social = html.split('class="social-links">')[1].split("</div>")[0];
  assert.equal((social.match(/<a\b/g) || []).length, 3);
  assert.match(social, /Bonjour/);
  assert.match(social, /小红书/);
  assert.match(social, /src="assets\/media\/bonjour-logo\.png"/);
  assert.match(social, /src="assets\/media\/xiaohongshu-logo\.ico"/);
  assert.doesNotMatch(social, /social-links__label|>Bonjour<|>小红书</);
  assert.doesNotMatch(social, /fa-twitter|fa-linkedin|aria-disabled/);
  assert.match(html, /fa-github fa-inverse/);
});

test("keeps only WeChat in the contact section and connects the social icons", () => {
  const contact = html
    .split('<section id="contact">')[1]
    .split("</section>")[0];
  assert.equal((contact.match(/<a\b/g) || []).length, 1);
  assert.match(contact, /href="assets\/media\/wechat-contact\.jpg"/);
  assert.match(contact, /data-wechat-contact/);
  assert.match(contact, /fa-weixin/);
  assert.doesNotMatch(contact, />邮件联系<|>微信联系</);
  assert.doesNotMatch(contact, /github\.com/);
  assert.match(html, /href="https:\/\/xhslink\.cn\/o\/1y6ls6jVE2W"/);
  assert.match(
    html,
    /data-bonjour-code="#小程序:\/\/Bonjour\/9cmOIHhYkqsPNHI"/
  );
  assert.doesNotMatch(html, /href="#小程序:/);
  assert.equal(
    fs.readFileSync(path.join(root, "src/assets/bonjour.txt"), "utf8").trim(),
    "#小程序://Bonjour/9cmOIHhYkqsPNHI"
  );
  assert.match(html, /role="status" data-contact-status/);
});

function animationContext({ available = false, reducedMotion = false } = {}) {
  const removedClasses = [];
  const reveals = [];
  const scrollReveal = () => ({
    reveal: (...args) => reveals.push(args),
  });
  const context = {
    window: {
      matchMedia: () => ({ matches: reducedMotion }),
      ...(available ? { ScrollReveal: scrollReveal } : {}),
    },
    document: {
      documentElement: {
        classList: {
          remove: (name) => removedClasses.push(name),
        },
      },
    },
    ...(available ? { ScrollReveal: scrollReveal } : {}),
  };
  vm.createContext(context);
  vm.runInContext(animationSource, context);
  return { context, removedClasses, reveals };
}

test("shows static content if the optional animation CDN fails", () => {
  const { context, removedClasses } = animationContext();
  context.initScrollReveal([{ element: ".hero-title" }], {});
  assert.deepEqual(removedClasses, ["sr"]);
});

test("respects reduced-motion preferences", () => {
  const { context, removedClasses, reveals } = animationContext({
    available: true,
    reducedMotion: true,
  });
  context.initScrollReveal([{ element: ".hero-title" }], {});
  assert.deepEqual(removedClasses, ["sr"]);
  assert.equal(reveals.length, 0);
});

test("retains the original reveal behavior when animations are available", () => {
  const { context, removedClasses, reveals } = animationContext({
    available: true,
  });
  context.initScrollReveal(
    [{ element: ".hero-title", animation: { delay: 100 } }],
    { distance: "30px" }
  );
  assert.equal(removedClasses.length, 0);
  assert.equal(reveals.length, 1);
  assert.equal(reveals[0][0], ".hero-title");
  assert.equal(reveals[0][1].distance, "30px");
  assert.equal(reveals[0][1].delay, 100);
});

test("horizontal UI gallery updates controls, progress, and lightbox state", () => {
  const makeElement = (extra = {}) => {
    const listeners = {};
    const attrs = {};
    const classes = new Set();
    return {
      style: {},
      hidden: Boolean(extra.hidden),
      disabled: false,
      textContent: extra.textContent || "",
      alt: extra.alt || "",
      scrollLeft: 0,
      clientWidth: extra.clientWidth || 600,
      scrollWidth: extra.scrollWidth || 1800,
      addEventListener: (type, fn) => {
        listeners[type] = listeners[type] || [];
        listeners[type].push(fn);
      },
      emit: (type, event = {}) => {
        for (const fn of listeners[type] || []) {
          fn({ preventDefault() {}, ...event });
        }
      },
      setAttribute: (k, v) => {
        attrs[k] = String(v);
      },
      getAttribute: (k) => attrs[k] ?? extra[k] ?? null,
      removeAttribute: (k) => {
        delete attrs[k];
      },
      classList: {
        add: (c) => classes.add(c),
        remove: (c) => classes.delete(c),
        contains: (c) => classes.has(c),
      },
      focus: () => {},
      ...extra,
    };
  };

  const track = makeElement({ clientWidth: 500, scrollWidth: 1500 });
  const prevBtn = makeElement();
  const nextBtn = makeElement();
  const progressBar = makeElement();
  const statusEl = makeElement();
  const realImg = makeElement({
    src: "assets/media/ui-smartcook-brochure.jpg",
    alt: "产品画册",
  });
  const secondImg = makeElement({
    src: "assets/media/ui-deji-facade.jpg",
    alt: "幕墙视觉",
  });
  const cardWithImg = makeElement({
    "data-tag": "产品视觉",
    querySelector: (sel) => {
      if (sel === "img.ui-card__img") return realImg;
      if (sel === ".ui-card__title") return { textContent: "掌勺产品画册" };
      return null;
    },
  });
  const secondCard = makeElement({
    "data-tag": "空间导视",
    querySelector: (sel) => {
      if (sel === "img.ui-card__img") return secondImg;
      if (sel === ".ui-card__title") return { textContent: "德基幕墙视觉" };
      return null;
    },
  });
  const lightboxImg = makeElement();
  const lightboxCaption = makeElement();
  const lightboxClose = makeElement();
  const lightboxPrev = makeElement();
  const lightboxNext = makeElement();
  const lightbox = makeElement({
    hidden: true,
    querySelector: (sel) => {
      if (sel === "[data-lightbox-img]") return lightboxImg;
      if (sel === "[data-lightbox-caption]") return lightboxCaption;
      if (sel === "[data-lightbox-close]") return lightboxClose;
      if (sel === "[data-lightbox-prev]") return lightboxPrev;
      if (sel === "[data-lightbox-next]") return lightboxNext;
      return null;
    },
  });

  const section = {
    querySelector: (sel) => {
      if (sel === "[data-gallery-track]") return track;
      if (sel === "[data-gallery-prev]") return prevBtn;
      if (sel === "[data-gallery-next]") return nextBtn;
      if (sel === "[data-gallery-progress]") return progressBar;
      if (sel === "[data-gallery-status]") return statusEl;
      return null;
    },
    querySelectorAll: (sel) =>
      sel === ".ui-card" ? [cardWithImg, secondCard] : [],
  };

  const rootDoc = makeElement({
    querySelector: (sel) => {
      if (sel === "#ui-works") return section;
      if (sel === "[data-gallery-lightbox]") return lightbox;
      return null;
    },
  });

  const context = { window: makeElement(), document: rootDoc };
  vm.createContext(context);
  vm.runInContext(gallerySource, context);
  const api = context.initUiGallery(rootDoc);

  assert.ok(api);
  assert.equal(prevBtn.disabled, true);
  assert.equal(nextBtn.disabled, false);
  assert.equal(statusEl.textContent, "01 / 02");

  nextBtn.emit("click");
  assert.ok(track.scrollLeft > 0);
  assert.equal(prevBtn.disabled, false);

  track.emit("keydown", { key: "End" });
  assert.equal(track.scrollLeft, 1000);
  assert.equal(nextBtn.disabled, true);
  assert.equal(statusEl.textContent, "02 / 02");

  cardWithImg.emit("click");
  assert.equal(lightbox.hidden, false);
  assert.equal(
    lightboxImg.getAttribute("src"),
    "assets/media/ui-smartcook-brochure.jpg"
  );
  assert.equal(lightboxCaption.textContent, "产品视觉 · 掌勺产品画册");

  lightboxNext.emit("click");
  assert.equal(
    lightboxImg.getAttribute("src"),
    "assets/media/ui-deji-facade.jpg"
  );
  assert.equal(lightboxCaption.textContent, "空间导视 · 德基幕墙视觉");

  rootDoc.emit("keydown", { key: "Escape" });
  assert.equal(lightbox.hidden, true);
});
