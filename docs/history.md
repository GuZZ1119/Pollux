# Pollux — 项目进度记录

> 本文件记录 Pollux 项目各阶段的完成情况，随开发进展持续更新。

---

## 阶段 1：最小可运行骨架（Minimal Runnable Scaffold）

**状态：✅ 已完成**  
**完成日期：2026-03-25**  
**对应 Prompt：** `docs/prompts/01-cursor-min-scaffold.md`

### 1.1 项目初始化

| 项目 | 状态 | 说明 |
|------|------|------|
| Next.js 15 + App Router | ✅ | 手动搭建，未使用 create-next-app |
| TypeScript 5 (strict) | ✅ | 启用 strict 模式，路径别名 `@/*` |
| Tailwind CSS 4 | ✅ | 通过 `@tailwindcss/postcss` 集成 |
| Prisma 6 | ✅ | schema 已定义，面向 PostgreSQL |
| ESLint 9 + next config | ✅ | flat config 格式 |

### 1.2 Prisma Schema

6 个数据模型 + 4 个枚举，全部使用字符串 ID（cuid）：

| 模型 | 用途 | 关键 TODO |
|------|------|-----------|
| `UserProfile` | 用户主体 | `id` 未来映射 Auth0 `sub` claim |
| `ConnectedAccount` | OAuth 账号连接 | Token 未来由 Auth0 Token Vault 管理 |
| `StyleCard` | 用户写作风格配置 | — |
| `StyleExample` | 风格训练样本 | — |
| `MessageItem` | 收件箱消息 | `externalMessageId` / `externalThreadId` 预留给 Gmail/Slack 原始 ID |
| `SendLog` | 发送记录 | — |

枚举：`Provider`（gmail / slack）、`AutomationLevel`、`RiskLevel`、`AccountStatus`

### 1.3 核心 TypeScript 类型

位置：`src/lib/types/index.ts`

定义了 7 个领域接口 + 1 个通用 API 响应类型：
- `UserProfile`、`ConnectedAccount`、`StyleCard`、`StyleExample`
- `MessageItem`、`ReplyCandidate`、`SendLog`
- `ApiResponse<T>` — 统一的 `{ success, data?, error? }` 结构

### 1.4 Mock 数据

位置：`src/lib/mocks/`

| 文件 | 内容 |
|------|------|
| `accounts.ts` | 2 个已连接账号（Gmail + Slack） |
| `messages.ts` | 6 条消息：3 Gmail + 3 Slack，风险等级混合（LOW / MEDIUM / HIGH） |
| `replies.ts` | 4 组回复候选（对应 4 条消息），每组 2 条；另有默认兜底回复 |
| `style.ts` | 1 张 professional 风格卡片 |
| `user.ts` | 1 个 Demo 用户 |

### 1.5 Adapter 抽象层

位置：`src/lib/adapters/`

| 接口 | Mock 实现 | 未来真实接入 |
|------|-----------|-------------|
| `InboxAdapter` | `MockGmailInboxAdapter`、`MockSlackInboxAdapter` | Gmail API / Slack Web API |
| `SendAdapter` | `MockGmailSendAdapter`、`MockSlackSendAdapter` | `gmail.users.messages.send` / `chat.postMessage` |
| `StyleSourceAdapter` | `MockStyleSourceAdapter` | 从已发送邮件学习用户风格 |

### 1.6 Service 层

位置：`src/lib/services/`

| Service | 职责 |
|---------|------|
| `inbox-service` | 聚合多 provider 消息，按时间倒序排列 |
| `reply-service` | 根据 messageId 返回 mock 回复候选（模拟 300ms 延迟） |
| `account-service` | 返回已连接账号列表 |
| `send-service` | 接收 messageId + replyText，返回 mock 发送结果 |

### 1.7 API Routes

| 端点 | 方法 | 功能 | 状态 |
|------|------|------|------|
| `/api/inbox` | GET | 返回聚合后的全部消息 | ✅ Mock |
| `/api/accounts` | GET | 返回账号连接状态 | ✅ Mock |
| `/api/reply/generate` | POST | 输入 `messageId`，输出回复候选 | ✅ Mock |
| `/api/send` | POST | 输入 `messageId` + `replyText`，模拟发送 | ✅ Mock |

统一响应格式：`{ success: boolean, data?: T, error?: string }`

### 1.8 页面

| 路由 | 类型 | 功能 |
|------|------|------|
| `/` | Server | 自动重定向到 `/dashboard` |
| `/dashboard` | Server | Summary cards（账号数、消息数、未读数、高风险数）+ 项目状态 + 下一步里程碑 |
| `/inbox` | Client | 左右分栏：左侧消息列表，右侧消息详情 + 回复生成 + 编辑发送 |
| `/settings` | Server + Client | 已连接账号管理 + 自动化级别选择 + 风格配置展示 + 未来集成说明 |

### 1.9 UI 组件

| 组件 | 位置 | 说明 |
|------|------|------|
| `AppShell` | `components/layout/` | 全局布局壳：Sidebar + 主内容区 |
| `Sidebar` | `components/layout/` | 侧边导航，包含 Dashboard / Inbox / Settings |
| `MessageList` | `components/inbox/` | 消息列表容器 |
| `MessageListItem` | `components/inbox/` | 单条消息行：provider 图标、发送者、摘要、风险徽标 |
| `MessageDetail` | `components/inbox/` | 消息全文 + 回复候选生成 + 编辑区 + 发送按钮 |
| `ReplyCandidateCard` | `components/reply/` | 回复候选卡片：文本、说明、置信度 |
| `AccountStatusCard` | `components/settings/` | 账号状态卡片 |
| `SettingsPanel` | `components/settings/` | 设置面板（自动化级别、风格、账号） |
| `RiskBadge` / `AccountStatusBadge` | `components/shared/` | 彩色状态徽标 |
| `ProviderIcon` | `components/shared/` | Gmail / Slack 图标 |

### 1.10 验收结果

| 验收项 | 结果 |
|--------|------|
| `next build` 编译通过 | ✅ 零错误，8.6s 完成 |
| Dashboard 页面可访问 | ✅ |
| Inbox 页面展示 Gmail + Slack 消息 | ✅ 6 条消息，按时间排序 |
| 点击消息查看详情 | ✅ |
| 生成 mock 回复候选 | ✅ 2-3 条候选，带 confidence 和 explanation |
| 编辑回复并模拟发送 | ✅ |
| Settings 页面可访问 | ✅ |
| Prisma schema 为下阶段准备 | ✅ |
| Auth0 / Gmail / Slack TODO 标记 | ✅ 所有预留位置已标注 |

### 1.11 当前明确不包含的内容

以下内容按设计在本阶段不实现：

- ❌ 真实认证（Auth0 / 任何 OAuth）
- ❌ 真实数据库读写
- ❌ 真实 Gmail / Slack API 调用
- ❌ 后台任务 / WebSocket 同步
- ❌ Embeddings / 向量搜索
- ❌ LangGraph / 多智能体架构
- ❌ 复杂风险评估引擎

### 1.12 .gitignore 配置

**完成日期：2026-03-25**

创建了项目根目录 `.gitignore`，覆盖以下类别：

| 类别 | 忽略内容 | 原因 |
|------|----------|------|
| Dependencies | `node_modules/` | 通过 `npm install` 还原 |
| Next.js 构建产物 | `.next/`、`out/` | 编译输出，本地/CI 重新 build |
| 环境变量 | `.env`、`.env.*`（保留 `.env.example`） | 含密钥等敏感信息 |
| Prisma 本地生成 | `prisma/generated/`、`*.db` | generated client 由 `prisma generate` 重建 |
| 日志 | `*.log`、`*-debug.log*` | 运行时临时日志 |
| TS/Next 缓存 | `*.tsbuildinfo`、`next-env.d.ts` | 增量编译缓存和自动生成的类型声明 |
| OS 垃圾文件 | `.DS_Store`、`Thumbs.db` 等 | macOS / Windows 系统自动生成 |
| SpecStory | `.specstory/` | Cursor 插件本地历史，纯个人数据 |
| IDE 本地配置 | `.vscode/settings.json`、`.idea/`、`.cursor/` | 个人编辑器偏好 |
| Vercel | `.vercel` | 部署本地缓存 |

---

## 阶段 2：（待定）

> 下一阶段预计方向：Auth0 集成、真实 Gmail API 接入、OpenAI 回复生成。  
> 具体 Prompt 见 `docs/prompts/02-*.md`（尚未创建）。

---

## 文件索引

```
pollux/
├── prisma/schema.prisma
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── globals.css
│   │   ├── dashboard/page.tsx
│   │   ├── inbox/page.tsx
│   │   ├── settings/page.tsx
│   │   └── api/
│   │       ├── inbox/route.ts
│   │       ├── accounts/route.ts
│   │       ├── reply/generate/route.ts
│   │       └── send/route.ts
│   ├── components/
│   │   ├── layout/        (AppShell, Sidebar)
│   │   ├── inbox/         (MessageList, MessageListItem, MessageDetail)
│   │   ├── reply/         (ReplyCandidateCard)
│   │   ├── settings/      (AccountStatusCard, SettingsPanel)
│   │   └── shared/        (StatusBadge, ProviderIcon)
│   └── lib/
│       ├── types/index.ts
│       ├── mocks/         (accounts, messages, replies, style, user)
│       ├── adapters/      (inbox, send, style-source)
│       └── services/      (inbox, reply, account, send)
├── docs/
│   ├── prompts/01-cursor-min-scaffold.md
│   └── history.md          ← 本文件
├── .gitignore
├── package.json
├── tsconfig.json
├── next.config.ts
├── postcss.config.mjs
└── eslint.config.mjs
```

---

## 技术栈总览

| 技术 | 版本 | 用途 |
|------|------|------|
| Next.js | 15 | 全栈框架，App Router |
| React | 19 | UI 渲染 |
| TypeScript | 5 | 类型安全 |
| Tailwind CSS | 4 | 样式系统 |
| Prisma | 6 | ORM，面向 PostgreSQL |
| ESLint | 9 | 代码质量 |

## 本地运行

```bash
npm install
npm run dev        # http://localhost:3000
```
