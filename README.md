# KarryStar.github.io · 考研学习站导航主页

江西农业大学 27 考研专业课学习站的引导主页，托管于 GitHub Pages 根域名 **https://karrystar.github.io/**，导航到各科目子站：

| 站点 | 地址 | 仓库 |
|---|---|---|
| 815 农业推广学 | https://karrystar.github.io/815-agri-extension/ | [815-agri-extension](https://github.com/KarryStar/815-agri-extension) |
| 341 农业知识综合三 | https://karrystar.github.io/341-agri-comprehensive/ | [341-agri-comprehensive](https://github.com/KarryStar/341-agri-comprehensive) |
| （预留第三个站点） | — | — |

## 新增子站步骤

1. 新建仓库 `<name>`，push 静态站点，开启 Pages（Deploy from branch → main / root）
2. 在 `index.html` 的 `.grid` 里复制一张 `site-card` 卡片，改名称、描述与 `href="/<name>/"`
3. push 后主页自动更新

纯静态单页，无构建、无依赖。
