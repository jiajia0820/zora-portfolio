const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const source = fs
  .readFileSync(path.join(__dirname, "../src/scripts/contactLinks.js"), "utf8")
  .replace("export default function", "function");
const code = "#小程序://Bonjour/9cmOIHhYkqsPNHI";

function setupContact({
  available = true,
  denied = false,
  present = true,
} = {}) {
  const copied = [];
  const prompts = [];
  const icon = { hidden: false };
  const copiedIcon = { hidden: true };
  const status = { textContent: "" };
  let click;
  const link = {
    getAttribute: () => code,
    querySelector: (selector) =>
      selector === "[data-bonjour-icon]" ? icon : copiedIcon,
    addEventListener: (event, callback) => {
      assert.equal(event, "click");
      click = callback;
    },
  };
  const context = {
    document: {
      querySelector: (selector) => {
        if (selector === "[data-contact-status]") return status;
        return present ? link : null;
      },
    },
    navigator: available
      ? {
          clipboard: {
            writeText: async (text) => {
              if (denied) throw new Error("Clipboard unavailable");
              copied.push(text);
            },
          },
        }
      : {},
    window: { prompt: (...args) => prompts.push(args) },
  };
  vm.createContext(context);
  vm.runInContext(source + "\ninitContactLinks();", context);
  return { copied, prompts, icon, copiedIcon, status, getClick: () => click };
}

test("Bonjour copies the exact supplied token and confirms success", async () => {
  const state = setupContact();
  let prevented = false;
  await state.getClick()({
    preventDefault: () => {
      prevented = true;
    },
  });
  assert.equal(prevented, true);
  assert.deepEqual(state.copied, [code]);
  assert.equal(state.icon.hidden, true);
  assert.equal(state.copiedIcon.hidden, false);
  assert.match(state.status.textContent, /请在微信中粘贴打开/);
  assert.equal(state.prompts.length, 0);
});

test("Bonjour falls back to a manual copy prompt on clipboard rejection", async () => {
  const state = setupContact({ denied: true });
  await state.getClick()({ preventDefault() {} });
  assert.equal(state.copied.length, 0);
  assert.equal(state.prompts.length, 1);
  assert.equal(state.prompts[0][1], code);
  assert.equal(state.icon.hidden, false);
  assert.equal(state.copiedIcon.hidden, true);
  assert.equal(state.status.textContent, "");
});

test("Bonjour keeps the text-file fallback when Clipboard API is absent", async () => {
  const state = setupContact({ available: false });
  await state.getClick()({
    preventDefault: () => assert.fail("Must allow navigation"),
  });
  assert.equal(state.copied.length, 0);
  assert.equal(state.prompts.length, 0);
});

test("Bonjour preserves modified link clicks", async () => {
  const state = setupContact();
  for (const modified of [
    { ctrlKey: true },
    { metaKey: true },
    { shiftKey: true },
    { altKey: true },
    { button: 1 },
  ]) {
    await state.getClick()({
      ...modified,
      preventDefault: () => assert.fail("Must allow modified navigation"),
    });
  }
  assert.equal(state.copied.length, 0);
});

test("contact initialization is safe without a Bonjour link", () => {
  const state = setupContact({ present: false });
  assert.equal(state.getClick(), undefined);
});
