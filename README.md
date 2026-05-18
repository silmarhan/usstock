# 读懂美股 · 中文美股完全指南

从"股票是什么"到"我能不能卖个铁鹰"——面向中文母语读者的美股完整教程，10 个章节，8 个互动工具，35 张 AI 插图。

## 本地预览

直接用浏览器打开，无需任何服务器或构建步骤：

```bash
open index.html
# 或在 Windows:
start index.html
```

所有页面均可通过 `file://` 协议访问，无外部依赖（字体通过 Google Fonts CDN 加载，离线时回退到系统字体）。

## 内容结构

```
usstock/
├── index.html                     # 首页：Hero + 10 章卡片 + 学习路径
├── about.html                     # 关于本教程
├── glossary.html                  # 术语速查（中英对照）
├── chapters/
│   ├── 01-getting-started.html    # 开户与市场入门
│   ├── 02-market-structure.html   # 主要指数与市场结构
│   ├── 03-valuation.html          # 估值指标 PE/PB/PS/EV
│   ├── 04-financials.html         # 财报三表与拆解
│   ├── 05-technical.html          # K线/MA/MACD/量价
│   ├── 06-sectors-macro.html      # 板块轮动 + 宏观指标
│   ├── 07-options-basics.html     # 期权原理 + 希腊字母
│   ├── 08-options-strategies.html # 期权策略：价差/铁鹰/跨式
│   ├── 09-risk-psychology.html    # 仓位/止损/心理偏差
│   └── 10-case-studies.html       # 真实案例复盘
├── assets/
│   ├── css/                       # reset → tokens → typography → layout → components → tools → animations
│   ├── js/
│   │   ├── nav.js                 # 进度条 + TOC高亮 + 移动侧边栏
│   │   ├── theme.js               # 暗/亮色主题 + localStorage
│   │   ├── progress.js            # 已读进度 + 测验得分持久化
│   │   ├── quiz.js                # 通用测验引擎
│   │   ├── tooltip.js             # 术语悬浮解释
│   │   └── tools/                 # 8 个交互小工具
│   ├── data/
│   │   ├── chapters.json          # 章节元数据
│   │   ├── glossary.json          # ~80 个术语
│   │   └── quizzes.json           # 题库（已迁移到各章 HTML 内联）
│   └── images/                    # 40 张 AI 生成插图（gpt-image-2）
└── scripts/
    └── generate-images.sh         # 批量生成插图脚本
```

## 8 个交互工具

| 工具 | 章节 | 说明 |
|------|------|------|
| 复利计算器 | 01 | 本金/年化/年限/月供 → 终值折线图 |
| PE/PB 对比器 | 03 | AAPL/MSFT/JPM/TSLA 估值雷达图 |
| 三表资金流向动画 | 04 | SVG 动画展示利润表→现金流 |
| K线形态图鉴 | 05 | 12 种经典形态悬浮放大 |
| 板块轮动时钟 | 06 | 4 阶段 × 11 板块强弱高亮 |
| 期权 Payoff 图 | 07/08 | Canvas 实时损益曲线，支持 6 种策略 |
| 希腊字母模拟器 | 07 | Black-Scholes 实时 Delta/Gamma/Theta/Vega |
| 仓位/Kelly 计算器 | 09 | 胜率/盈亏比 → 单笔仓位建议 |

## 重新生成插图

插图由 gpt-image-2 通过 Codex CLI 生成。如需重新生成：

```bash
# 确保已登录 Codex（或设置 OPENAI_API_KEY）
# 先生成 10 张 Hero 图（约 10 分钟）
bash scripts/generate-images.sh hero-only

# 再生成所有内联插图
bash scripts/generate-images.sh
```

脚本会自动重试失败项（最多 2 次），生成后从 `~/.codex/generated_images/` 复制到 `assets/images/`。

## 技术栈

- **纯原生 HTML + CSS + JS**，无框架，无构建工具
- CSS 自定义属性设计 token（`assets/css/tokens.css` 是视觉系统的"宪法"）
- 字体：DM Serif Display（标题）、Lora（正文）、JetBrains Mono（数据）、Noto Serif SC（中文衬线）
- 主题：深色（默认）/ 纸色 亮色，`localStorage` 持久化
- 动画：IntersectionObserver 滚动入场 + `prefers-reduced-motion` 守卫
- 所有工具纯前端，公式硬编码，无后端调用

## 设计风格

Bloomberg / Financial Times 编辑部高级感：

- 底色 `#0B0B0D` 暖炭黑 + `#FFB300` 琥珀强调色
- 衬线大标题 + 等宽 kicker + 19px 正文 / 行高 1.75
- 首段首字母 drop cap（3 行高，琥珀色）
- Pull quote 双 amber 竖线 + 数据卡 1px amber 边框
