# Candor.Box — 产品需求文档

## 一句话定位

**Debug Your Career. With Love (and a few laughs).**

给同事写反馈，像顶级工程师做 Code Review——零废话，高信噪比，带一点梗，每一句都让人变强。

---

## 核心功能列表

### 1. Landing / 首页 (`/`)

**作用**：解释「这是什么」，引导生成专属反馈链接。

**关键文案**

- Eyebrow：`Feedback is a gift.`
- H1：`Debug Your Career. With Love (and a few laughs).`
- Sub：`Write feedback for teammates the way top engineers do code review — zero fluff, high signal, with a touch of humor. Every line ships them a little better.`
- 主 CTA：`Open My Repo →`（生成中：`Spinning up…`）
- 次 CTA：`How it works ↓`
- 法律小字：`Anonymous by default. No names, no IPs, no fingerprints.`

**How it works（3 步）**

1. **Spin up your repo** — Generate a personal feedback link. Drop it in your bio, share it with your team, or hand it to that PM you have a crush on.
2. **Teammates open PRs** — They write structured feedback: core strengths, optimization suggestions, and the one thing they'd push you to fix.
3. **Merge what makes you better** — Read, decide, ship. V2.0 of yourself — and your team.

---

### 2. My Repo / 个人仓库 (`/inbox`)

**作用**：管理我自己的反馈链接 + 查看收到的反馈。一切围绕「单向收信」。

**包含**

- **Repo 链接栏**：显示当前主链接 + `Copy`（主操作，mint 色） + 分隔符 + `+ New`（远离主操作，避免误点）
- **未读 / 已读列表**：单一列表，未读项 mint 左描边 + `NEW` 标签 + 文字高亮；已读项灰化
- **顶部小计数**：`3 unread · 12 total`
- **空状态**：`Zero feedback yet. Either you're already a 10x engineer, or your teammates are still leveling up «things-I-shouldn't-say» 🌳`

**标题文案**

- H1：`Your Personal Repo`
- Sub：`Everyone is a beta build with bugs. Welcome your teammates to PR you 🧑‍💻`
- Footer：`Be honest. Be kind. Ship better.`

---

### 3. Submit Feedback / 提交反馈页 (`/r/:linkId`)

**作用**：队友打开链接后，用结构化模板写一条反馈。**不能编辑、不能撤回、不能回复**——单向送达。

**结构（3 个模块）**

#### 模块一 · Core Strengths（核心优势）

4 个 chips，可多选：

- 👁️ **Visionary (Altman Mode)** — Sees three steps ahead
- 🚀 **Execution Beast** — Ships so fast even AI feels slow
- 🧠 **First-Principles Master** — Breaks problems down to atoms
- 📢 **10x Communicator** — Even PMs get it on the first pass

#### 模块二 · Optimization Suggestions（优化建议）

4 个 chips，可多选：

- ⚡ **Default to Async** — If Slack works, don't open Zoom
- 🎯 **Break Analysis Paralysis** — Ship at 70%, iterate live
- 🛡️ **Say No Like a Pro** — Strategic refusal beats «sure I'll do it»
- ✂️ **Write Shorter** — Cut the email in half. Everyone wins.

#### 模块三 · The One Thing（最重要的一句话）

- 引导：`If you were their co-founder, what's the ONE thing you'd push them to fix?`
- Placeholder：`Be honest, be funny — just don't write «keep going». Real talk is what's worth the most here.`

**提交按钮**：`Ship it 🚀`
**法律小字**：`Delivered as written. Anonymous by default.`

---

### 4. Patch Submitted / 提交完成页

**作用**：告知 PR 已送达；引导安装插件 / 收好备用链接。

**文案**

- Eyebrow：`Patch submitted`
- H1：`✅ Your PR is in their inbox.`
- Sub：`Delivered as written. No one knows it was you — unless you signed it.`
- 安装引导 H：`Want to know how they merge it?`
- 安装说明：`Install the Candor Box browser extension and you'll get pinged when they respond. Don't want to install? Save the link below — open it any time to check.`
- CTA：`Install plugin` / `Submit another PR`

---

### 5. Privacy / 隐私页 (`/privacy`)

**作用**：建立信任。强硬、直白、有梗。

**文案**

- H1：`Privacy First. No Cap.`
- Lead：`We protect your privacy more obsessively than Apple. No traceable logs. No identity linking. We don't sell anything.`

**两张卡片**

- **No identity** — No email, no phone, no IP, no browser fingerprint. You're just an anonymous bubble that types.
- **No traceable logs** — We don't keep access logs that can point back to a person. The backend only knows «someone submitted feedback». Not who.

**彩蛋**

- 触发：`Still skeptical?`
- 内容：`Anonymous or I die. On god.`（中文版：`不匿名死全家。`）
- 副文：`We can't find it. Your boss can't find it. You can't find it.`

---

## 全局能力

### 多语言切换

- 默认英文，右上角 `EN / 中` 切换
- 偏好存 localStorage

### 匿名身份

- 浏览器本地 token 维持「我的 repo」归属
- 不绑定邮箱/账号

### 多链接管理

- 一个 token 下可生成多个独立反馈链接
- 场景：分人群投放

### 浏览器插件（v2.0 实现）

- 提交方装上后可被通知到 Repo 主人的回响
- 当前产品已收敛为单向，插件作用降级为「新反馈到达提醒」

---

## 已明确砍掉 / 不做的功能

- ❌ AI 漂白 / 改写反馈（保留原文，绝不糊弄）
- ❌ Merged Updates Tab / Merge 按钮
- ❌ Request Changes / 任何回复机制（产品为单向）
- ❌ 7 天自动删除（不再宣称）
- ❌ 注册 / 登录 / 邮箱（匿名优先）

---

## 技术实现

### 架构

- **前端**：单页应用，React + Vite
- **路由**：客户端路由，支持 `/`, `/inbox`, `/r/:linkId`, `/privacy`, `/submitted`
- **存储**：localStorage 存储 token 和数据
- **部署**：Vercel（静态部署）

### 数据隔离

- 每个用户基于 localStorage 生成的唯一 token
- 使用 SHA256 哈希验证用户身份
- 仅返回与当前用户哈希匹配的数据
- 插件模式下数据完全隔离在本地浏览器

### 链接格式

- 网页版：`https://yourdomain.com/r/:linkId`
- 可分享给任何人打开
- 无需安装插件即可提交反馈

---

## 验收标准

1. ✅ 首页文案与 PRD 完全一致
2. ✅ 生成可分享的反馈链接
3. ✅ 提交反馈流程完整（3个模块）
4. ✅ 提交完成页引导清晰
5. ✅ 隐私页展示完整
6. ✅ 中英双语切换正常
7. ✅ 数据隔离有效（各用户只能看到自己的反馈）
8. ✅ 链接可通过网页分享给任何人
9. ✅ Vercel 部署成功
