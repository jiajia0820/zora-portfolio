const fs = require("node:fs");
const path = require("node:path");

const src = (file) => path.resolve(__dirname, "../src", file);
const dist = (file) => path.resolve(__dirname, "../dist", file);

// Keep the contact QR out of Parcel's lossy JPEG optimization.
fs.copyFileSync(
  src("assets/media/wechat-contact.jpg"),
  dist("assets/media/wechat-contact.jpg")
);

// Link previews need a stable, unhashed URL for the share card.
fs.copyFileSync(src("assets/og-card.jpg"), dist("og-card.jpg"));

// GitHub Pages: skip Jekyll so files are served exactly as built.
fs.writeFileSync(dist(".nojekyll"), "");
