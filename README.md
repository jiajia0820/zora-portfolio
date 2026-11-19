# Zora · AI 产品经理作品集

线上地址：<https://jiajia0820.github.io/zora-portfolio/>

把问题拆透，用 AI 把好产品做出来。这里收录了四个产品实践：已上线的智家清单小程序、智慧病区巡检、经营分析问数 Agent 与声笺播客知识库。

## 本地运行

需要 Node.js 24（见 `.nvmrc`）。

```bash
npm ci
npm start      # 本地预览，默认 http://localhost:1234
npm test       # 内容与隐私检查
npm run build  # 生产构建，输出到 dist/
```

推送到 `main` 分支后，GitHub Actions 会自动测试、构建并发布到 GitHub Pages。

## 致谢

页面框架基于 Jacobo Martínez 的开源模板 [Simplefolio](https://github.com/cobiwave/simplefolio)，按 MIT 许可证使用，见 `LICENSE.md`。
