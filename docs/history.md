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

## 阶段 2：Auth0 + Gmail + OpenAI 增量接入

**状态：✅ 已完成**  
**完成日期：2026-03-28**  
**对应 Prompt：** `docs/prompts/02-cursor-auth0-gmail-openai.md`

按优先级分 4 批推进，在第一阶段骨架上增量开发，不重构现有结构。

### 2-A Auth0 基础登录 + Gmail 连接状态（第 1 批）

**状态：✅ 已完成**  
**完成日期：2026-03-25**

#### 2-A.1 Auth0 集成

使用 `@auth0/nextjs-auth0` v4 SDK（Auth0Client + middleware 模式）。

| 项目 | 说明 |
|------|------|
| SDK | `@auth0/nextjs-auth0` v4.16，通过 `Auth0Client` 初始化 |
| 中间件 | `src/middleware.ts`，自动处理 `/auth/login`、`/auth/callback`、`/auth/logout` |
| Session 获取 | Server Components 中调用 `auth0.getSession()` |
| 路由保护 | 各页面自行检查 session，未登录展示 Sign in 提示 |
| 登出 | Sidebar 底部 "Sign out" 链接，指向 `/auth/logout` |

认证链路：`/auth/login` → Auth0 Universal Login → `/auth/callback` → session cookie → 页面读取

#### 2-A.2 Gmail OAuth 连接流程

使用 `google-auth-library` 实现独立的 Google OAuth 流程（与 Auth0 登录分离）。

| 步骤 | 实现 |
|------|------|
| 发起授权 | `GET /api/auth/gmail/connect` → 校验 Auth0 session → 重定向到 Google 授权页 |
| 回调处理 | `GET /api/auth/gmail/callback` → 交换 code 为 tokens → 存储 → 跳转 `/settings` |
| Token 存储 | `src/lib/gmail/token-store.ts` — 内存 Map（hackathon 用） |
| 申请 Scopes | `gmail.readonly`、`gmail.send`、`userinfo.email` |

**限制：** Token 存于内存，服务器重启后需重新连接。TODO 迁移至数据库。

#### 2-A.3 新建文件

| 文件 | 作用 |
|------|------|
| `.env.example` | 环境变量模板（Auth0 / Google / OpenAI / DB） |
| `src/lib/auth0.ts` | `Auth0Client` 单例 |
| `src/middleware.ts` | Auth 中间件，matcher 排除静态资源 |
| `src/lib/gmail/oauth.ts` | Google OAuth2 客户端，生成授权 URL + 交换 token |
| `src/lib/gmail/token-store.ts` | Gmail token 内存存储 + CRUD 函数 |
| `src/app/api/auth/gmail/connect/route.ts` | 发起 Gmail OAuth |
| `src/app/api/auth/gmail/callback/route.ts` | Gmail OAuth 回调 |

#### 2-A.4 修改文件

| 文件 | 变更内容 |
|------|----------|
| `src/lib/types/index.ts` | 新增 `SessionUser` 接口（sub / name / email / picture） |
| `src/app/layout.tsx` | 调用 `auth0.getSession()`，将 `user` 传入 `AppShell` |
| `src/components/layout/app-shell.tsx` | 接收 `user` prop 并透传给 `Sidebar` |
| `src/components/layout/sidebar.tsx` | 已登录显示头像 + 姓名 + Sign out；未登录显示 Sign in 按钮 |
| `src/lib/services/account-service.ts` | 接收 `userId` 参数，通过 token-store 检查真实 Gmail 连接状态；Slack 暂标为 DISCONNECTED |
| `src/app/api/accounts/route.ts` | 从 session 获取 userId 传给 account-service |
| `src/components/settings/account-status-card.tsx` | Gmail 未连接时展示 "Connect" 链接；已连接时展示 "Live"；Slack 展示 "Coming soon" |
| `src/components/settings/settings-panel.tsx` | 新增 Account 区域（登录状态展示）+ Integration Status 面板（进度清单） |
| `src/app/settings/page.tsx` | session 感知，未登录显示 Sign in 提示 |
| `src/app/dashboard/page.tsx` | session 感知：真实用户名、真实 Gmail 连接状态、里程碑更新 |
| `src/app/page.tsx` | 已登录重定向 `/dashboard`；未登录显示 landing page + "Get Started" 按钮 |

#### 2-A.5 新增依赖

| 包 | 版本 | 用途 |
|----|------|------|
| `@auth0/nextjs-auth0` | ^4.16 | Auth0 登录 / session / 中间件 |
| `google-auth-library` | latest | Google OAuth2 客户端 |

#### 2-A.6 环境变量

使用前需创建 `.env.local` 并填入以下值（模板见 `.env.example`）：

```
AUTH0_DOMAIN=         # Auth0 tenant 域名
AUTH0_CLIENT_ID=      # Auth0 应用 Client ID
AUTH0_CLIENT_SECRET=  # Auth0 应用 Client Secret
AUTH0_SECRET=         # 32 字节 hex（openssl rand -hex 32）
APP_BASE_URL=http://localhost:3000
GOOGLE_CLIENT_ID=     # Google Cloud OAuth Client ID
GOOGLE_CLIENT_SECRET= # Google Cloud OAuth Client Secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/gmail/callback
```

Auth0 Dashboard 配置：
- Allowed Callback URL: `http://localhost:3000/auth/callback`
- Allowed Logout URL: `http://localhost:3000`

Google Cloud Console 配置：
- OAuth 2.0 Redirect URI: `http://localhost:3000/api/auth/gmail/callback`

#### 2-A.7 验收结果

| 验收项 | 结果 |
|--------|------|
| `next build` 编译通过 | ✅ 零错误（Auth0 env var 警告为预期行为） |
| 中间件正确编译 | ✅ 87.4 kB |
| 未登录显示 landing page | ✅ |
| Sidebar 显示 Sign in 按钮 | ✅ |
| Dashboard / Settings 未登录提示 | ✅ |
| 已登录时显示真实用户名和头像 | ✅ |
| Settings 展示 Gmail 连接状态 | ✅ DISCONNECTED → Connect 按钮 |
| Gmail OAuth 链路可用 | ✅ connect → Google 授权 → callback → CONNECTED |
| Dashboard 里程碑反映真实状态 | ✅ |
| Inbox 页面未被破坏 | ✅ 仍使用 mock 数据正常运行 |
| Slack 状态 | ✅ 显示为 DISCONNECTED + "Coming soon"，未被破坏 |
| 所有页面路由正确 | ✅ 13 条路由全部就绪 |

- Gmail token 当前为 in-memory store
- 仅适用于 hackathon demo
- 后续考虑迁移到 DB / Auth0 Token Vault / 更安全的 token persistence

### 2-B 真实 Gmail Inbox（第 2 批）

**状态：✅ 已完成**  
**完成日期：2026-03-28**

#### 2-B.1 GmailInboxAdapter v1

位置：`src/lib/adapters/gmail-inbox.ts`

使用 `googleapis` SDK 通过存储的 OAuth token 调用 Gmail API，实现完整的收件箱读取链路。

| 功能 | 实现 |
|------|------|
| 邮件列表 | `gmail.users.messages.list` — 拉取 INBOX 标签下最近 20 封邮件 |
| 邮件详情 | `gmail.users.messages.get` — 批量并发获取每封邮件的 full payload |
| 字段映射 | From / Subject / Date 从 headers 提取；snippet 直接使用；threadId 保留原始值 |
| 已读状态 | 检查 `labelIds` 是否包含 `UNREAD` |
| 风险等级 | 暂统一 `LOW`（真实风险引擎待后续实现） |
| ID 格式 | `gmail-{messageId}` 前缀，避免与 Slack mock ID 冲突 |

#### 2-B.2 邮件正文解析

位置：`src/lib/gmail/parse.ts`

递归解析 Gmail MIME payload，提取可读文本：

1. 优先提取 `text/plain` 部分
2. 退而求其次提取 `text/html` 并 strip HTML 标签
3. 递归搜索 multipart 嵌套结构
4. 兜底使用 snippet

辅助函数：
- `getHeader()` — 按名称查找 header（大小写不敏感）
- `extractTextBody()` — 递归解析 payload 树
- `decodeBase64Url()` — Gmail base64url 解码
- `stripHtml()` — HTML → 纯文本（保留换行结构）

#### 2-B.3 Gmail 客户端工厂

位置：`src/lib/gmail/client.ts`

- 从 token-store 读取用户的 OAuth token
- 创建 `OAuth2Client` 并设置 credentials
- 注册 `tokens` 事件监听器：access_token 过期自动刷新时回写 token-store
- 返回 `google.gmail({ version: "v1" })` 实例

#### 2-B.4 inbox-service 真实聚合

位置：`src/lib/services/inbox-service.ts`

| 条件 | adapter 选择 |
|------|-------------|
| userId 存在且 Gmail 已连接 | `GmailInboxAdapter`（真实 API） |
| Gmail 未连接 | 不添加 Gmail adapter（无 mock Gmail 数据） |
| Slack | 始终使用 `MockSlackInboxAdapter` |

使用 `Promise.allSettled` 聚合：单个 adapter 失败不影响其余，错误记录到 console。

#### 2-B.5 新建文件

| 文件 | 作用 |
|------|------|
| `src/lib/gmail/client.ts` | 创建认证的 Gmail API 客户端，自动 token 刷新 |
| `src/lib/gmail/parse.ts` | Gmail MIME payload 解析（base64url 解码 + HTML strip） |
| `src/lib/adapters/gmail-inbox.ts` | 真实 `GmailInboxAdapter`：list + get + 映射为 `MessageItem` |

#### 2-B.6 修改文件

| 文件 | 变更内容 |
|------|----------|
| `src/lib/services/inbox-service.ts` | 接收 `userId`；Gmail 已连接走真实 adapter，Slack 保留 mock；`Promise.allSettled` 容错 |
| `src/app/api/inbox/route.ts` | 从 Auth0 session 获取 userId 传给 inbox-service |
| `src/app/inbox/page.tsx` | 新增 error state（含 Retry）+ empty state 引导；标注消息来源（live / mock） |
| `src/app/dashboard/page.tsx` | `getAggregatedInbox(user.sub)` 传入 userId；里程碑根据连接状态动态更新 |
| `src/components/inbox/message-detail.tsx` | 正文为空时展示 fallback 提示，不再显示空白 |

#### 2-B.7 新增依赖

| 包 | 用途 |
|----|------|
| `googleapis` | Gmail API v1 调用（list / get messages） |

#### 2-B.8 验收结果

| 验收项 | 结果 |
|--------|------|
| `next build` 编译通过 | ✅ 零错误 |
| Gmail 已连接时 inbox 展示真实邮件 | ✅ 最多 20 封，含真实 subject / sender / body |
| 真实邮件正文可查看 | ✅ 支持 text/plain 和 text/html 两种格式 |
| 空正文有 fallback 提示 | ✅ |
| Gmail 未连接时不显示 mock Gmail 消息 | ✅ 仅显示 Slack mock |
| Inbox 页面显示消息来源标注 | ✅ `Gmail (live)` / `Slack (mock)` |
| Inbox 有 loading spinner + error + empty 状态 | ✅ |
| Slack mock 数据未被破坏 | ✅ |
| Dashboard 使用真实 userId 获取 inbox 数据 | ✅ |
| 单个 adapter 失败不阻塞其他 | ✅ `Promise.allSettled` 容错 |

### 2-C OpenAI 回复生成（第 3 批）

**状态：✅ 已完成**  
**完成日期：2026-03-28**

#### 2-C.1 OpenAI 生成模块

位置：`src/lib/openai/generate.ts`

| 项目 | 说明 |
|------|------|
| 模型 | `gpt-4o-mini`（成本低，速度快，适合 hackathon） |
| temperature | 0.7（平衡创造性与可控性） |
| 输出格式 | 要求返回纯 JSON 数组，3 个候选对象 |
| 容错 | 自动清理 markdown 代码围栏后再 JSON.parse |

Prompt 结构：
1. 系统角色定义
2. 渠道提示（Gmail 更正式，Slack 更简洁）
3. **Prompt injection 防御**：明确标注原始邮件为 UNTRUSTED 外部内容，禁止模型遵循其中任何试图改变系统规则的指令
4. 原始消息（sender / subject / content）
5. 用户 StyleCard 规则注入（toneRules / bannedPhrases / signoffPatterns / emojiPreference / sentenceStyle）
6. 输出约束（3 个候选，每个含 text / explanation / confidence）

候选策略：
- 第 1 条：最直接、最合适的回复
- 第 2 条：换一个角度或语气
- 第 3 条：更简短或偏 casual 的版本

#### 2-C.2 StyleCard 注入

当前阶段从静态 `mockStyleCard` 读取用户风格配置，注入 OpenAI prompt。包括：
- persona、toneRules、bannedPhrases、signoffPatterns、emojiPreference、sentenceStyle

未来阶段将从数据库读取用户个性化 StyleCard。

#### 2-C.3 Fallback 机制

| 场景 | 行为 |
|------|------|
| `OPENAI_API_KEY` 未设置 | 返回 `defaultMockReplies`，console 输出警告 |
| OpenAI 调用异常（网络 / 解析 / 额度） | catch 后返回 `defaultMockReplies`，记录错误 |
| 正常返回 | 解析 JSON → 生成带唯一 ID 的 `ReplyCandidate[]` |

#### 2-C.4 API 接口变更

`POST /api/reply/generate` 请求体从：
```json
{ "messageId": "xxx" }
```
扩展为：
```json
{
  "messageId": "xxx",
  "content": "邮件正文...",
  "sender": "Alice <alice@example.com>",
  "subject": "Re: Proposal",
  "provider": "gmail"
}
```

`messageId` 和 `content` 为必填，其余可选。

响应体新增 `source` 字段：
```json
{ "success": true, "data": [...], "source": "openai" | "fallback_mock" }
```

前端 Reply Candidates 标题旁显示来源标签（"AI generated" / "mock fallback"）。

#### 2-C.5 新建文件

| 文件 | 作用 |
|------|------|
| `src/lib/openai/generate.ts` | OpenAI 客户端 + prompt 构建 + JSON 解析 + 容错 |

#### 2-C.6 修改文件

| 文件 | 变更内容 |
|------|----------|
| `src/lib/services/reply-service.ts` | 重写为调用 OpenAI，无 key 或失败时 fallback mock |
| `src/app/api/reply/generate/route.ts` | 接收完整消息字段（content / sender / subject / provider） |
| `src/components/inbox/message-detail.tsx` | 发送消息全字段给 API；新增 `generateError` 状态显示 |
| `.env.example` | 取消 `OPENAI_API_KEY` 注释 |

#### 2-C.7 新增依赖

| 包 | 用途 |
|----|------|
| `openai` | OpenAI Chat Completions API |

#### 2-C.8 验收结果

| 验收项 | 结果 |
|--------|------|
| `next build` 编译通过 | ✅ 零错误 |
| 有 OPENAI_API_KEY 时调用真实 OpenAI | ✅ gpt-4o-mini |
| 返回 3 条候选回复 | ✅ 各含 text / explanation / confidence |
| StyleCard 规则体现在生成结果中 | ✅ toneRules + bannedPhrases + signoff 注入 prompt |
| 无 key 时 graceful fallback 到 mock | ✅ 不报错，返回默认回复 |
| OpenAI 异常时 fallback 到 mock | ✅ catch + console.error |
| 前端显示生成错误提示 | ✅ generateError 状态 |
| 前端仍能编辑和发送回复 | ✅ 未破坏已有 UI 流程 |

### 2-D 发送闭环与前端联调（第 4 批）

**状态：✅ 已完成**  
**完成日期：2026-03-28**

#### 2-D.1 GmailSendAdapter v1

位置：`src/lib/adapters/gmail-send.ts`

| 功能 | 实现 |
|------|------|
| MIME 构建 | `buildRawEmail()` — 生成 RFC 2822 邮件（To / Subject / Content-Type / In-Reply-To / References） |
| 线程关联 | 发送时传入 `threadId`，Gmail 自动归入同一对话 |
| 编码 | `Buffer.from(raw).toString("base64url")` |
| API 调用 | `gmail.users.messages.send` — 真实发送邮件 |
| 返回值 | 成功返回 Gmail 分配的 `externalMessageId` |

#### 2-D.2 send-service 重写

位置：`src/lib/services/send-service.ts`

新增结构化输入 `SendInput`：

```ts
{ messageId, replyText, provider, threadId?, sender?, subject?, userId? }
```

路由逻辑：

| 条件 | 行为 |
|------|------|
| provider=gmail 且 Gmail 已连接 | `GmailSendAdapter` 真实发送 |
| Gmail 发送失败 | 返回 `{ success: false, error }` |
| provider=slack 或 Gmail 未连接 | `MockSlackSendAdapter` mock 发送 |

辅助函数 `extractEmail()` 从 `"Alice <alice@example.com>"` 格式中提取纯邮箱地址。

#### 2-D.3 API route 改造

`POST /api/send` 请求体从：
```json
{ "messageId": "xxx", "replyText": "..." }
```
扩展为：
```json
{
  "messageId": "xxx",
  "replyText": "...",
  "provider": "gmail",
  "threadId": "thread-123",
  "sender": "Alice <alice@example.com>",
  "subject": "Re: Proposal"
}
```

Route 从 Auth0 session 获取 userId 传入 send-service。

#### 2-D.4 前端联调

`MessageDetail` 组件变更：
- Send 请求传递完整消息上下文（provider / threadId / sender / subject）
- 发送结果区分真实和 mock：`"Sent via Gmail"` vs `"Sent (mock)"`
- 新增网络错误 catch

#### 2-D.5 新建文件

| 文件 | 作用 |
|------|------|
| `src/lib/adapters/gmail-send.ts` | 真实 Gmail 发送（MIME 构建 + API 调用） |

#### 2-D.6 修改文件

| 文件 | 变更内容 |
|------|----------|
| `src/lib/adapters/send.ts` | 接口扩展 `subject` / `inReplyToMessageId` 参数；移除 `MockGmailSendAdapter`（已被真实实现取代） |
| `src/lib/services/send-service.ts` | 重写为 `SendInput` 结构；Gmail 已连接走真实 adapter；Slack/未连接走 mock |
| `src/app/api/send/route.ts` | session 感知；接收完整消息字段；传 userId 给 send-service |
| `src/components/inbox/message-detail.tsx` | Send 发送完整字段；结果区分真实/mock；新增 catch |
| `src/lib/openai/generate.ts` | Prompt injection 防御（标注邮件为 UNTRUSTED 外部内容） |
| `src/lib/services/reply-service.ts` | 返回 `{ candidates, source }` 结构 |
| `src/app/api/reply/generate/route.ts` | 响应新增 `source: "openai" \| "fallback_mock"` |

#### 2-D.7 验收结果

| 验收项 | 结果 |
|--------|------|
| `next build` 编译通过 | ✅ 零错误 |
| Gmail 已连接时真实发送邮件 | ✅ 通过 `gmail.users.messages.send` |
| 发送邮件自动归入原 thread | ✅ 传入 threadId + In-Reply-To header |
| 前端区分 "Sent via Gmail" vs "Sent (mock)" | ✅ |
| Gmail 发送失败返回明确错误 | ✅ catch + error message |
| Slack 消息发送走 mock | ✅ 未被破坏 |
| Reply generate 返回 `source` 字段 | ✅ `"openai"` / `"fallback_mock"` |
| 前端展示 AI generated / mock fallback 标签 | ✅ |
| Prompt injection 防御已加入 | ✅ 邮件正文标注为 UNTRUSTED |

---

## 阶段 3：Inbox 增强 + 风险分类 + Event Log

**状态：✅ 已完成**  
**完成日期：2026-03-29**

基于阶段 2 的完整 Gmail/OpenAI 接入，对 Inbox 进行 6 项功能增强，全部增量实现，不重构已有结构。

### 3.1 可配置邮件上限

**状态：✅ 已完成**

之前 Gmail adapter 硬编码 `MAX_RESULTS = 20`，Slack mock 固定 3 条，总上限 23 条，不可调整。

现在通过统一配置常量控制整条链路：

| 层级 | 实现 |
|------|------|
| 配置源 | `src/lib/config.ts` → `INBOX_MAX_RESULTS`，从 `process.env.INBOX_MAX_RESULTS` 读取，默认 30，上限 100 |
| Gmail adapter | `fetchMessages(options?)` 使用 `options.limit ?? INBOX_MAX_RESULTS` 作为 `maxResults` |
| inbox-service | 聚合所有 adapter 结果后 `slice(0, limit)` 截断 |
| API route | `GET /api/inbox?limit=N&filter=...&cursor=...`，接受查询参数覆盖默认值 |
| 前端 | 展示 API 返回的全部数据，不二次截断 |

**最终上限**：默认 **30 条**（由 `INBOX_MAX_RESULTS` 控制）。用户可在 `.env.local` 设置 `INBOX_MAX_RESULTS=50` 调整。

API 响应新增 `meta` 字段：
```json
{ "success": true, "data": [...], "meta": { "count": 25, "filter": "primary", "cursor": null } }
```

`cursor` 参数已在接口层预留，当前未实现完整分页，后续可扩展。

#### 新建文件

| 文件 | 作用 |
|------|------|
| `src/lib/config.ts` | 全局配置常量（`INBOX_MAX_RESULTS`） |

#### 修改文件

| 文件 | 变更内容 |
|------|----------|
| `src/lib/types/index.ts` | 新增 `InboxFetchOptions`（limit / filter / cursor） |
| `src/lib/adapters/inbox.ts` | `InboxAdapter.fetchMessages()` 新增 `options?: InboxFetchOptions` 参数 |
| `src/lib/adapters/gmail-inbox.ts` | 使用 config limit 替代硬编码 20 |
| `src/lib/services/inbox-service.ts` | 接受 `InboxFetchOptions`，聚合后统一 limit 截断 |
| `src/app/api/inbox/route.ts` | 解析 `?limit=` / `?filter=` / `?cursor=` 查询参数 |
| `.env.example` | 新增 `INBOX_MAX_RESULTS` 条目 |

### 3.2 Inbox 指标实时计算 + 风险分类引擎

**状态：✅ 已完成**

#### 3.2.1 指标计算

之前 Inbox 顶部只显示 `N messages — M Gmail (live) · K Slack (mock)`。

现在从返回邮件列表实时计算 4 个指标：

| 指标 | 定义 | 数据源 |
|------|------|--------|
| Messages | 当前返回列表总条数 | `messages.length` |
| Unread | `status === "unread"` 的邮件数 | Gmail: `labelIds` 含 `UNREAD`；Slack mock: 预设值 |
| High Risk | `riskLevel === "HIGH"` 的邮件数 | 风险分类函数输出 |
| Medium | `riskLevel === "MEDIUM"` 的邮件数 | 风险分类函数输出 |

**更新链路**：`fetchMessages()` → `setMessages()` → 指标自动重算。触发时机：页面加载、手动刷新、切换 filter。

#### 3.2.2 风险分类引擎

位置：`src/lib/services/risk-service.ts`

独立函数 `classifyRisk(input: RiskInput): RiskLevel`，扫描 subject + content，基于正则关键词匹配：

| 等级 | 触发关键词 |
|------|------------|
| HIGH | invoice, payment, wire transfer, bank account, overdue, urgent, asap, deadline, contract, nda, legal, lawsuit, interview, offer letter, confidential, immediate action, penalty, suspend, terminat, fraud, phishing, verify your account |
| MEDIUM | by {weekday}/eod/cob, action required, please respond, follow up, time sensitive, due date, expir, remind, schedul, review needed, board meeting, escalat, blocking, approval needed |
| LOW | 其余所有 |

**设计决策**：函数签名和输入结构已抽象，后续可直接替换为 ML 模型调用，不影响调用层。

之前真实 Gmail 邮件全部硬编码为 `LOW`，现在每封邮件在 `GmailInboxAdapter` 中调用 `classifyRisk()` 实时判定。Mock Slack 消息保持原有预设 riskLevel 不变。

#### 新建文件

| 文件 | 作用 |
|------|------|
| `src/lib/services/risk-service.ts` | 独立风险分类函数，正则关键词匹配 |

#### 修改文件

| 文件 | 变更内容 |
|------|----------|
| `src/lib/adapters/gmail-inbox.ts` | 导入 `classifyRisk()`，替代硬编码 `"LOW"` |
| `src/app/inbox/page.tsx` | 新增指标栏（Messages / Unread / High Risk / Medium） |

### 3.3 HTML 邮件渲染 + 附件 Metadata

**状态：✅ 已完成**

#### 3.3.1 HTML 内容支持

之前 MIME 解析只走纯文本链路：`text/plain` 优先，`text/html` 被 `stripHtml()` 转为纯文本。所有邮件以 `whitespace-pre-wrap` 纯文本展示。

现在同时提取两种内容：

| 字段 | 类型 | 来源 |
|------|------|------|
| `content` | `string` | `extractTextBody()` — 纯文本，保持向后兼容 |
| `htmlContent` | `string?` | `extractHtmlBody()` — 原始 HTML（新增） |

MIME 解析层新增：
- `extractHtmlBody()` — 递归查找 `text/html` MIME part 并 base64url 解码
- `extractAttachments()` — 递归遍历所有 part，提取有 `attachmentId` 的附件 metadata

前端渲染逻辑：
1. **优先渲染 HTML**：如果 `htmlContent` 存在，使用 DOMPurify sanitize 后通过 `dangerouslySetInnerHTML` 渲染，配合 `prose` 样式
2. **Fallback 纯文本**：如果无 HTML，显示 `content` 纯文本
3. **空内容兜底**：显示 italic 提示

DOMPurify 配置：
- 白名单 tag：p, br, strong, em, b, i, u, a, ul, ol, li, h1-h6, blockquote, pre, code, table, thead, tbody, tr, td, th, img, span, div, hr, sup, sub
- 白名单 attr：href, target, rel, src, alt, width, height, style, class, colspan, rowspan
- 禁止 data 属性
- 使用动态 `import("dompurify")` 避免 SSR 问题

#### 3.3.2 附件 Metadata

`MessageItem` 新增 `attachments?: Attachment[]`：

```ts
interface Attachment {
  filename: string;
  mimeType: string;
  size: number;
  attachmentId: string;
}
```

前端展示：
- 有附件时显示 "Attachments (N)" 列表
- 每项显示：回形针图标 + 文件名 + 类型缩写 + 文件大小
- 底部提示 "Attachment download coming soon"

附件下载 API 骨架：
- `GET /api/attachments/[messageId]/[attachmentId]` — 当前返回 501
- 注释中包含完整实现步骤（strip gmail- prefix → Gmail API attachments.get → base64url decode → binary response）

#### 新建文件

| 文件 | 作用 |
|------|------|
| `src/app/api/attachments/[messageId]/[attachmentId]/route.ts` | 附件下载 API 骨架（501 + 实现步骤注释） |

#### 修改文件

| 文件 | 变更内容 |
|------|----------|
| `src/lib/types/index.ts` | 新增 `Attachment` 接口；`MessageItem` 新增 `htmlContent` + `attachments` |
| `src/lib/gmail/parse.ts` | 新增 `extractHtmlBody()`、`extractAttachments()`；导出 `decodeBase64Url()` |
| `src/lib/adapters/gmail-inbox.ts` | 调用新解析函数，填充 `htmlContent` + `attachments` |
| `src/components/inbox/message-detail.tsx` | DOMPurify HTML 渲染 + 附件列表展示 |

#### 新增依赖

| 包 | 用途 |
|----|------|
| `dompurify` | HTML sanitize（白名单过滤 XSS） |
| `@types/dompurify` | TypeScript 类型定义 |

### 3.4 广告/促销邮件自动过滤

**状态：✅ 已完成**

基于 Gmail category 过滤，在 adapter 拉取层实现，不在前端过滤。

| 模式 | Gmail API 查询 | 效果 |
|------|---------------|------|
| Primary Only（默认） | `q: "category:primary"` | 只拉取重要邮件，过滤 promotions / social / forums / updates |
| All Inbox | 不加 category 过滤 | 拉取全部 INBOX 邮件 |

前端 toggle：
- Inbox 左上角 segmented button：「Primary Only」/「All Inbox」
- 状态通过 `localStorage` 持久化（key: `pollux_inbox_filter`）
- 默认选中 Primary Only
- 切换时自动重新拉取邮件

数据流：`localStorage` → `?filter=primary|all` 查询参数 → inbox API → inbox-service → `GmailInboxAdapter` → Gmail API `q` 参数。

Mock Slack adapter 不受 filter 参数影响，始终返回全部 mock 消息。

**后续迁移**：将 filter 偏好从 localStorage 迁移到 DB user preferences，只需替换前端存取逻辑。

#### 修改文件

| 文件 | 变更内容 |
|------|----------|
| `src/lib/adapters/gmail-inbox.ts` | 根据 `options.filter` 构造 `q: "category:primary"` |
| `src/app/inbox/page.tsx` | 新增 filter toggle UI + localStorage 持久化 + 带参数重新请求 |

### 3.5 Event Log 事件记录系统

**状态：✅ 已完成**

#### 3.5.1 架构设计

位置：`src/lib/services/event-log.ts`

内存循环缓冲（max 1000 条），与 token-store.ts 架构一致。提供 3 个函数：

| 函数 | 作用 |
|------|------|
| `logEvent(entry)` | 写入一条事件，自动生成 eventId + timestamp |
| `getEvents(userId?, limit?, eventType?)` | 按条件查询事件列表（最新在前） |
| `getEventCount()` | 返回总事件数 |

6 种事件类型：

| eventType | 触发位置 | 触发时机 |
|-----------|----------|----------|
| `inbox_fetched` | inbox-service（服务端） | 每次聚合 inbox 调用 |
| `risk_classified` | inbox-service（服务端） | 每次 inbox 聚合后统计风险分布 |
| `filter_changed` | inbox page（客户端 → POST /api/events） | 用户切换 Primary Only / All Inbox |
| `message_opened` | inbox page（客户端 → POST /api/events） | 用户点击某封邮件 |
| `reply_generated` | /api/reply/generate（服务端） | 回复生成完成后 |
| `reply_sent` | /api/send（服务端） | 回复发送完成后 |

每条事件结构：
```ts
{
  eventId: "evt-1711700000-abc123",
  eventType: "reply_sent",
  timestamp: "2026-03-29T10:00:00.000Z",
  userId: "auth0|abc123",
  provider: "gmail",
  messageId: "gmail-19abc...",
  threadId: "19abc...",
  metadata: { success: true, externalMessageId: "...", source: "openai" }
}
```

#### 3.5.2 REST API

位置：`src/app/api/events/route.ts`

| 方法 | 用途 | 参数 |
|------|------|------|
| `GET /api/events` | 查询事件列表 | `?limit=50&type=reply_sent` |
| `POST /api/events` | 写入事件（前端客户端调用） | body: `{ eventType, provider?, messageId?, threadId?, metadata? }` |

自动从 Auth0 session 获取 userId。

#### 3.5.3 限制与迁移计划

- 内存存储：服务器重启后事件丢失
- 迁移点：将 `store` 数组替换为 Prisma DB 表操作，保持 `EventLogEntry` 结构不变
- 建议 DB schema：`EventLog` 表，字段与 `EventLogEntry` 一致，`metadata` 用 JSON 类型

#### 新建文件

| 文件 | 作用 |
|------|------|
| `src/lib/services/event-log.ts` | 内存事件日志（循环缓冲 1000 条） |
| `src/app/api/events/route.ts` | 事件 REST API（GET + POST） |

#### 修改文件

| 文件 | 变更内容 |
|------|----------|
| `src/lib/services/inbox-service.ts` | 记录 `inbox_fetched` + `risk_classified` 事件 |
| `src/app/api/reply/generate/route.ts` | 记录 `reply_generated` 事件 |
| `src/app/api/send/route.ts` | 记录 `reply_sent` 事件 |
| `src/app/inbox/page.tsx` | 客户端调用 POST /api/events 记录 `filter_changed` + `message_opened` |

### 3.6 验收结果

| 验收项 | 结果 |
|--------|------|
| `next build` 编译通过 | ✅ 零新增错误 |
| Inbox 默认最多显示 30 条 | ✅ 由 `INBOX_MAX_RESULTS` 控制 |
| `?limit=N` 可覆盖默认值 | ✅ |
| 指标栏实时显示 Messages / Unread / High Risk / Medium | ✅ |
| 真实 Gmail 邮件风险不再全部 LOW | ✅ classifyRisk() 关键词匹配 |
| HTML 邮件渲染（DOMPurify sanitize） | ✅ 优先 HTML，fallback 纯文本 |
| 附件 metadata 展示 | ✅ 文件名 + 类型 + 大小 |
| 附件下载 API 骨架 | ✅ 501 + 实现步骤注释 |
| Primary Only / All Inbox filter toggle | ✅ Gmail category 过滤 |
| filter 状态 localStorage 持久化 | ✅ |
| 6 种事件记录到 event log | ✅ |
| `GET /api/events` 可查询事件 | ✅ 支持 limit + type 过滤 |
| Mock Slack 数据未被破坏 | ✅ |
| 所有页面路由正确 | ✅ 新增 /api/events + /api/attachments/[id]/[id] |

### 3.7 当前明确不包含的内容

- ❌ 完整分页（cursor 参数已预留，未实现翻页逻辑）
- ❌ 附件真实下载（API 骨架已准备，返回 501）
- ❌ ML 风险模型（独立函数已抽象，待替换）
- ❌ Event log 数据库持久化（内存存储，迁移点已标注）
- ❌ Filter 偏好数据库持久化（localStorage，迁移点已标注）

### 3.8 Bugfix：Gmail 真实发送显示 `Sent (mock)` 问题

**状态：✅ 已修复**  
**修复日期：2026-03-29**

#### 3.8.1 问题现象

用户在手动测试中发现：
- 回复候选已正确显示 `AI generated`（OpenAI 链路正常）
- 点击 Send Reply 后，前端显示 `Sent (mock)` 而非 `Sent via Gmail`
- 服务端终端日志出现 `[MockSlackSend]`，确认走了 mock 路径

#### 3.8.2 根因分析

`send-service.ts` 中真实 Gmail 发送的前提条件为三重判断：

```typescript
if (provider === "gmail" && userId && hasGmailConnection(userId))
```

三个条件必须同时为 true 才走 `GmailSendAdapter`：

| 条件 | 说明 |
|------|------|
| `provider === "gmail"` | 对真实 Gmail 邮件恒为 true |
| `userId` | 需要 Auth0 session 存在 |
| `hasGmailConnection(userId)` | 需要内存 token store 中有该用户的 token |

**核心问题**：`hasGmailConnection()` 检查的是 `token-store.ts` 中的 `Map`，这是一个模块级内存变量。在 **dev server 热更新 / HMR / 代码修改触发重新加载** 时，模块被重新执行，`const store = new Map()` 重新初始化，**所有已存储的 Gmail OAuth token 丢失**。

实际发生链路：
1. 用户连接 Gmail → token 存入内存 Map → inbox 成功拉取真实邮件
2. 开发过程中代码修改 → dev server 热更新 → `token-store.ts` 模块重新执行 → Map 清空
3. 前端 React state 中的邮件列表未丢失（仍是之前拉取的真实邮件，state 保留在浏览器内存中）
4. 用户点 Send → 服务端检查 `hasGmailConnection(userId)` → **false**
5. 条件不满足 → fall through 到 `MockSlackSendAdapter` → 返回 `externalMessageId: "mock-slack-sent-xxx"`
6. 前端检测到以 `mock-` 开头 → 显示 `Sent (mock)`

**附带发现的两个 bug**：

| Bug | 说明 | 影响 |
|-----|------|------|
| `In-Reply-To` 头含 `gmail-` 前缀 | `buildRawEmail()` 收到的 messageId 为 `gmail-19abc123`（adapter 层加的前缀），不是合法的 RFC 2822 Message-ID | Gmail 无法识别，线程关联失败 |
| 前端判定逻辑脆弱 | 通过 `externalMessageId.startsWith("mock-")` 猜测是否真实发送，依赖 mock 返回值的命名约定 | 判定不可靠，易误判 |

#### 3.8.3 修复方案

**1. send-service.ts 重构**

新增 `SendChannel` 类型和 `SendReplyResult` 接口：

```typescript
export type SendChannel = "gmail_api" | "mock" | "gmail_api_error";

export interface SendReplyResult extends SendResult {
  provider: Provider;
  sendChannel: SendChannel;
}
```

- 返回值中明确包含 `sendChannel` 字段，标记实际使用的发送通道
- 新增 `stripGmailPrefix()` 函数，在传入 `In-Reply-To` 前剥离 `gmail-` 前缀
- 新增详细诊断日志，输出每个条件的实际值：
  - 成功时：`[send-service] Gmail send SUCCESS: externalId=xxx`
  - 条件不满足时：`[send-service] Gmail requested but falling back to mock. Reason: ...`

**2. /api/send 响应结构优化**

从返回完整 result 对象改为精确结构：

```json
{
  "success": true,
  "data": {
    "provider": "gmail",
    "sendChannel": "gmail_api",
    "externalMessageId": "19abc456def"
  }
}
```

**3. 前端状态显示重写**

基于 `sendChannel` 字段精确判断，不再依赖 externalMessageId 命名约定：

| sendChannel | 前端显示 | 颜色 |
|-------------|----------|------|
| `gmail_api` | "Sent via Gmail" | 绿色 |
| `mock` | "Sent (mock — not delivered). Gmail tokens may have expired; try reconnecting in Settings." | 黄色 |
| `gmail_api_error` | "Gmail send failed: {具体错误}" | 红色 |
| 网络异常 | "Network error — could not send" | 红色 |

#### 3.8.4 修改文件

| 文件 | 变更内容 |
|------|----------|
| `src/lib/services/send-service.ts` | 新增 `SendChannel` / `SendReplyResult` 类型；返回 `sendChannel` 字段；新增 `stripGmailPrefix()`；新增详细诊断日志 |
| `src/app/api/send/route.ts` | 响应结构改为 `{ provider, sendChannel, externalMessageId }`；event log metadata 加入 `sendChannel` |
| `src/components/inbox/message-detail.tsx` | 发送状态判定改为基于 `sendChannel`；三种明确状态 + 差异化颜色（绿/黄/红） |

#### 3.8.5 已知限制

- **根本限制未变**：Gmail token 仍为内存存储，dev server 重启后必须重新去 Settings 连接 Gmail
- 这是 hackathon MVP 的 in-memory token store 架构决策的直接后果
- 彻底解决需要将 token 持久化到数据库（`ConnectedAccount` 表），迁移点已在 `token-store.ts` 中标注

#### 3.8.6 验收方法

| 步骤 | 预期结果 |
|------|----------|
| dev server 启动后重新连接 Gmail | Settings 显示 Gmail "Live" |
| 打开 Inbox → 选真实 Gmail 邮件 → Generate → Send | 前端显示绿色 "Sent via Gmail" |
| 终端日志 | `[send-service] Gmail send SUCCESS: externalId=...`，无 `[MockSlackSend]` |
| Gmail 已发送文件夹 | 可看到刚发出的回复 |
| `/api/events?type=reply_sent` | `sendChannel: "gmail_api"` |
| 不重连 Gmail 直接发送（token 丢失场景） | 前端显示黄色 mock 提示 + 终端 warn 日志 |

### 3.9 Bugfix：token-store 改用 globalThis 防止 HMR 清空

**状态：✅ 已修复**  
**修复日期：2026-03-29**

#### 3.9.1 问题定位过程

在 3.8 的修复中加入了 `sendChannel` 和诊断日志后，终端日志确认：

```
[send-service] provider=gmail, userId="auth0|abc123", hasGmailConnection=false, storeSize=0, storeKeys=[]
[send-service] Gmail requested but falling back to mock...
[MockSlackSend] ...
```

关键信息：`storeSize=0, storeKeys=[]` — token store **为空**。

排除了 key 不一致的可能性（全链路统一使用 `session.user.sub`），锁定根因为 **Next.js dev 模式 HMR 导致模块级 Map 被重新初始化**。

| 排查项 | 结果 |
|--------|------|
| OAuth callback 存 token 用的 key | `session.user.sub` |
| inbox-service 读 token 用的 key | `session.user.sub`（从 API route 传入） |
| send-service 读 token 用的 key | `session.user.sub`（从 API route 传入） |
| account-service 读 token 用的 key | `session.user.sub`（从 API route 传入） |
| **key 一致性** | **全链路一致，无不一致** |
| **store 内容** | **为空，token 被 HMR 清空** |

#### 3.9.2 根因

`token-store.ts` 原实现：

```typescript
const store = new Map<string, GmailTokens>(); // 模块级变量
```

Next.js dev 模式下，当任何依赖链上的文件修改时（开发过程中极其频繁），webpack/turbopack 会重新执行被影响的模块。`token-store.ts` 被多个模块 import（send-service、inbox-service、account-service、client.ts、callback route），任何相关文件的修改都会触发 `token-store.ts` 重新执行 → `const store = new Map()` 重新初始化 → **所有已存储的 token 丢失**。

这是 Next.js 开发模式的已知行为，Prisma 官方文档对 PrismaClient 也推荐了相同的 globalThis 解决方案。

#### 3.9.3 修复方案

将 Map 实例挂载到 `globalThis`，使其在 HMR 周期中持久存在：

```typescript
const globalStore = globalThis as unknown as {
  __polluxGmailTokenStore?: Map<string, GmailTokens>;
};

if (!globalStore.__polluxGmailTokenStore) {
  globalStore.__polluxGmailTokenStore = new Map();
}

const store: Map<string, GmailTokens> = globalStore.__polluxGmailTokenStore;
```

`globalThis` 是 Node.js 进程级全局对象，不受模块重新加载影响。只有进程真正退出（`npm run dev` 被终止）时才会丢失。

同时新增 `getStoreDebugInfo()` 函数暴露 store 的 size 和 keys，供诊断日志使用。

在 OAuth callback 和 send-service 中加入完整诊断日志，输出：
- 实际 userId 值
- token store 当前 size 和 keys 列表
- 每个条件的 true/false

#### 3.9.4 修改文件

| 文件 | 变更内容 |
|------|----------|
| `src/lib/gmail/token-store.ts` | Map 改用 `globalThis.__polluxGmailTokenStore` 持久化；新增 `getStoreDebugInfo()`；`setGmailTokens()` 加存储确认日志 |
| `src/app/api/auth/gmail/callback/route.ts` | 新增 3 条诊断日志：token exchange 结果、存储后 verify、store 完整状态 |
| `src/lib/services/send-service.ts` | 日志升级：输出实际 userId 值 + store size + store keys 列表 |

#### 3.9.5 修复效果

| 场景 | 修复前 | 修复后 |
|------|--------|--------|
| 修改代码文件后 HMR 触发 | token 丢失，发送走 mock | token 保留，发送走 Gmail API |
| dev server 进程重启 | token 丢失 | token 仍然丢失（globalThis 随进程销毁） |
| 生产部署多实例 | 不共享 | 不共享（需 DB） |

#### 3.9.6 验收方法

| 步骤 | 预期结果 |
|------|----------|
| 启动 dev server → 连接 Gmail | 终端打印 `[token-store] SET key="auth0|..."` 和 `[Gmail OAuth] Verify ... =true, storeSize=1` |
| **随意修改一个 ts 文件并保存**（触发 HMR） | 终端显示 HMR 更新，但不应出现 `new Map()` 重新初始化 |
| HMR 后立即去 Inbox 发送回复 | 终端打印 `storeSize=1, hasGmailConnection=true` + `Gmail send SUCCESS` |
| 前端显示 | 绿色 "Sent via Gmail" |

### 3.10 后续必做：Gmail Token 持久化迁移

> **优先级：HIGH — 如果 Pollux 继续发展，这是最先需要解决的基础设施问题。**

当前 Gmail OAuth token 使用 `globalThis` + 内存 Map 存储。虽然 3.9 的修复解决了 HMR 清空问题，但内存存储方案仍然存在以下 **不可接受的生产限制**：

| 问题 | 说明 | 影响 |
|------|------|------|
| **服务重启即掉线** | `npm run dev` 或生产进程重启后 token 丢失，用户必须重新 OAuth 连接 | 每次部署都断开所有用户的 Gmail 连接 |
| **多实例部署不共享** | 内存 Map 只存在于单个 Node.js 进程，负载均衡下不同实例无法共享 token | 用户请求被路由到不同实例时连接状态不一致 |
| **无法长期维持连接** | access_token 过期后 refresh 成功写回内存，但进程重启丢失 refresh_token | 用户需频繁重新授权，体验差 |
| **不适合真正用户使用** | 仅适合单人本地 demo，不具备任何生产可用性 | 无法向真实用户开放 |

#### 建议迁移方案

**目标**：将 token 存入持久化存储，保持现有 `token-store.ts` 的接口不变（`set/get/has/remove`），只替换底层实现。

**方案 A：Prisma + 数据库（推荐）**

复用已有 `prisma/schema.prisma` 中的 `ConnectedAccount` 模型：

```prisma
model ConnectedAccount {
  id            String   @id @default(cuid())
  userId        String
  provider      String   // "gmail"
  accessToken   String
  refreshToken  String
  scope         String
  expiresAt     DateTime
  email         String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@unique([userId, provider])
}
```

改造 `token-store.ts`：`setGmailTokens()` → `prisma.connectedAccount.upsert()`，`getGmailTokens()` → `prisma.connectedAccount.findUnique()`。

**方案 B：Auth0 Token Vault**

如果不想自管 token，可使用 Auth0 的 Token Vault 功能存储第三方 OAuth token，但需要 Auth0 付费计划。

**方案 C：加密文件存储（过渡方案）**

将 token 加密后写入本地 JSON 文件（如 `.data/tokens.json`），适合单机部署过渡，但不适合多实例。

#### 迁移影响范围

只需修改 **1 个文件**：`src/lib/gmail/token-store.ts`。所有消费方（inbox-service、send-service、account-service、client.ts、callback route）通过已有接口调用，无需任何修改。这是当初将 token 操作封装为独立模块的设计收益。

---

## 阶段 4：竞赛版前端 Polish

**状态：✅ 已完成**  
**完成日期：2026-03-30**

目标：打磨主链路（登录 → 连接 Gmail → 查看邮件 → AI 生成回复 → 发送）的视觉和交互，使其在 60-90 秒演示内达到成品级 demo 观感。不扩展新平台，不做重型后端重构，不动核心业务逻辑。

### 4.1 Inbox 页面比赛版优化

**状态：✅ 已完成**

| 改动项 | 之前 | 之后 |
|--------|------|------|
| 页面标题 | "Inbox" 无副标题 | "Inbox" + 副标题 "AI-prioritized communication feed" |
| Metrics 区 | 横排文字标签 `N Messages · M Unread` | 3 列 grid 卡片，数字大字号 + 标签小字号 |
| Filter 区 | "Primary Only" / "All Inbox" | "Important" / "Everything"（产品化文案） |
| Refresh 按钮 | 文字链接 "Refresh" | 图标按钮（循环箭头） |
| Source 指示 | 文字描述 | 绿色/灰色圆点 + 数量 |
| Loading 状态 | 居中 spinner + "Loading messages..." | 左栏骨架屏（6 行 skeleton）+ 右栏 spinner |
| Error 状态 | 红色文字 + 小按钮 | 大图标 + 标题 + 详情 + "Try Again" 按钮 |
| Empty 状态（邮件列表） | "No messages" 纯文字 | 邮件图标 + "No messages yet" + Settings 引导链接 |
| Empty 状态（详情面板） | "Select a message to view details" | 大图标 + "Select a conversation" + 引导文案 |
| 左栏宽度 | `w-96`（384px） | `w-[400px]`（400px）|

### 4.2 邮件列表项优化

**状态：✅ 已完成**

| 改动项 | 之前 | 之后 |
|--------|------|------|
| 未读指示 | 整行 `font-medium` | 蓝色实心圆点 + 发件人/subject 加粗 |
| 选中高亮 | `bg-blue-50 border-l-2` | `bg-blue-50/80 border-l-[3px] border-l-blue-600` |
| 发件人名字 | 完整 "Alice &lt;alice@example.com&gt;" | 提取名字 "Alice"（`extractName()` 函数） |
| 时间显示 | "10:30 AM" 绝对时间 | "2h" / "1d" / "Mar 25" 相对时间（`relativeTime()` 函数） |
| Risk 徽标 | 彩色文字方块 "HIGH" / "MEDIUM" | 紧凑彩色圆点（红/黄） |
| Provider 标签 | emoji ProviderIcon 组件 | `Gmail` / `Slack` 文字标签（红/紫背景） |
| Snippet 样式 | 灰色 `text-xs` | 根据 viewed 状态区分灰度 |

### 4.3 邮件详情面板优化

**状态：✅ 已完成**

| 改动项 | 之前 | 之后 |
|--------|------|------|
| Header 布局 | Provider图标 + 发件人 + Risk + Subject + Time 一列 | Subject 最大字号在上 → sender/time/provider/risk 水平排列 |
| 邮件正文容器 | `bg-gray-50 rounded-lg p-4` | `border border-gray-100 rounded-xl bg-gray-50/60 p-5`，更自然 |
| HTML 渲染 | 基础 prose 样式 | 增强 blockquote/link/img 样式 |
| 附件卡片 | 文字堆叠 + 回形针图标 | 独立圆角卡片（文件图标 + 文件名 + 大小 + 类型标签） |
| 背景色 | 白色 | `bg-white` 主体 + `bg-gray-50/50` 右侧底色 |

### 4.4 AI Reply 区域优化

**状态：✅ 已完成**

这是比赛演示中最重要的视觉焦点区域，做了全面提升：

#### Generate 按钮

| 状态 | 表现 |
|------|------|
| 默认 | 蓝色圆角按钮 + sparkle 图标 + "Generate AI Reply" |
| Loading | spinner 动画 + "Generating..." |
| 已有候选后 | 按钮隐藏，展示候选卡片 |

#### Reply Candidate 卡片

| 改动项 | 之前 | 之后 |
|--------|------|------|
| 整体样式 | 普通 border card | `border-2 rounded-xl`，选中态 `border-blue-500 bg-blue-50/50 shadow-sm` |
| 编号 | 无 | 蓝色数字圆球（1/2/3），选中时白底蓝字 |
| 信心值 | 文字百分比 "85%" | 进度条 + 百分比（绿/黄/灰三色） |
| Source 标签 | 小文字 "AI generated" / "mock fallback" | pill 式 badge + sparkle 图标 |
| 正文 | 无缩进 | `pl-8` 缩进与编号对齐 |

#### Composer

| 改动项 | 之前 | 之后 |
|--------|------|------|
| 区域分割 | `border-t` 分隔线 | "AI Reply" 居中 label 分割线 + "COMPOSE" 标签 |
| 收件人提示 | 无 | 右上角 "To: {senderName}" |
| 文本框 | `rounded-lg p-3` | `rounded-xl p-4`，更大行距 |
| Send 按钮 | 绿色小按钮 | 圆角大按钮 + 发送图标 + Loading spinner |

#### 发送结果

| 之前 | 之后 |
|------|------|
| 行内彩色文字 "Sent via Gmail" / "Sent (mock)" | 全宽圆角卡片，三种状态明确区分 |

| sendChannel | 卡片样式 | 内容 |
|-------------|---------|------|
| `gmail_api` | 绿色边框 + 绿色背景 + ✓ 图标 | "Reply sent via Gmail" + "Delivered to {sender}'s inbox" |
| `mock` | 黄色边框 + 黄色背景 + ⚠ 图标 | "Sent via mock (not delivered)" + Settings 链接 |
| `error` | 红色边框 + 红色背景 | "Send failed" + 错误详情 + Retry 链接 |

### 4.5 Settings 页面优化

**状态：✅ 已完成**

| 改动项 | 之前 | 之后 |
|--------|------|------|
| Account 卡片 | `rounded-lg p-4` | `rounded-xl p-5`，头像有 ring |
| Gmail 连接卡片 | 基础 flex 布局 | 连接态绿色边框+背景；未连接态灰色；显示 scopes 标签 |
| Automation 选项 | `border rounded-lg` | `border-2 rounded-xl`，选中态蓝色边框 |
| Style Card | 列表式 toneRules/bannedPhrases | 可视化预览卡片 + Tone/Avoid/Sign-offs 标签 + "Preview" badge + "editor coming soon" 提示 |
| Integration Status | ✅/☐ 文字清单 | **移除**（过时内容，与当前进度不符） |
| 未登录页面 | 简单文字 + Sign in 按钮 | 大头像图标 + 标题 + 描述 + 圆角按钮 |
| 页面宽度 | `max-w-3xl p-6` | `max-w-2xl mx-auto p-8` |

### 4.6 共享组件优化

**状态：✅ 已完成**

#### RiskBadge

| 之前 | 之后 |
|------|------|
| 方形背景 + 全大写 "HIGH" / "MEDIUM" / "LOW" | pill 式 `rounded-full` + 首字母大写 "High" / "Medium" / "Low" |
| HIGH 无特殊标识 | HIGH 带 ⚠ 警告图标 |

#### AccountStatusBadge

| 之前 | 之后 |
|------|------|
| 方形标签 "CONNECTED" / "DISCONNECTED" | pill 式 + 颜色圆点 + 人性化文案 "Connected" / "Disconnected" / "Pending" |

#### Sidebar

| 改动项 | 之前 | 之后 |
|--------|------|------|
| Tagline | "AI Communication Layer" | "AI Communication Copilot" |

### 4.7 用户头像 Broken Image 修复

**状态：✅ 已完成**  
**修复日期：2026-03-30**

#### 问题

Sidebar 左下角和 Settings 页面的用户头像偶尔显示浏览器原生 broken image 图标，原因包括：
- Auth0/Google 头像 URL 过期或不可用
- 跨域 referrer 策略导致 Google CDN 返回 403
- 网络问题导致头像加载失败

之前的实现是条件渲染：`user.picture ? <img> : <div>{initials}</div>`。问题在于 `user.picture` 存在（非空字符串）但 URL 实际不可访问时，`<img>` 会显示 broken image。

#### 修复方案

新建统一头像组件 `src/components/shared/user-avatar.tsx`：

```tsx
// 核心逻辑
const [failed, setFailed] = useState(false);
useEffect(() => { setFailed(false); }, [src]); // src 变化时重置

// src 存在且未失败 → 渲染 <img onError={() => setFailed(true)}>
// 否则 → 渲染首字母 fallback
```

关键设计：
- `onError` 自动捕获图片加载失败，切换到首字母 fallback
- `referrerPolicy="no-referrer"` 避免 Google CDN 的 403
- `useEffect` 监听 `src` 变化，重新登录后自动尝试新 URL
- 支持 `sm`（32px）/ `md`（40px）/ `lg`（44px）三种尺寸
- 全项目统一：Sidebar 和 Settings 均使用 `UserAvatar`

#### 影响文件

| 文件 | 变更 |
|------|------|
| `src/components/shared/user-avatar.tsx` | **新建** — 统一头像组件 |
| `src/components/layout/sidebar.tsx` | 替换手写 `<img>` + fallback `<div>` 为 `<UserAvatar>` |
| `src/components/settings/settings-panel.tsx` | 替换手写 `<img>` + fallback `<div>` 为 `<UserAvatar>` |

### 4.8 Pollux 本地 Viewed/Opened 状态

**状态：✅ 已完成**  
**完成日期：2026-03-30**

#### 问题背景

当前 "Unread" 完全基于 Gmail 的 `UNREAD` label。用户在 Pollux 中打开邮件详情后，Gmail 侧仍然是未读状态，导致：
- Unread 计数不会因打开邮件而减少
- 用户反复看到相同的"未读"邮件
- 无法区分"全新邮件"和"已在 Pollux 看过但 Gmail 未标记已读"

#### 实现方案

**存储层**：`src/lib/viewed-store.ts`

```typescript
const STORAGE_KEY = "pollux_viewed_messages";
const MAX_ENTRIES = 500;

// getViewedIds() → Set<string>  — 从 localStorage 读取
// markViewed(id) → Set<string>  — 标记已查看，返回更新后的 Set
// isViewed(id) → boolean        — 查询单条
```

- 使用 `localStorage`，刷新/关标签页后状态保留
- 滚动淘汰：最多保留 500 条（超出时移除最早记录）
- 写入失败（localStorage 满或不可用）静默降级
- Key 设计：`pollux_viewed_messages` → JSON 数组

**Inbox 页面集成**：

1. `useEffect` 初始化时从 `localStorage` 读取 `viewedIds` 到 React state
2. `handleSelectMessage` 中调用 `markViewed(id)` → 同步更新 state
3. `viewedIds` 通过 props 传递：`InboxPage` → `MessageList` → `MessageListItem`

**邮件列表三态视觉**：

| 状态 | 条件 | 左侧指示点 | 文字样式 |
|------|------|-----------|---------|
| **New** | Gmail UNREAD + Pollux 未打开 | 实心蓝色圆点 | 发件人 `font-semibold text-gray-900`、subject `font-medium text-gray-800` |
| **Seen** | Gmail UNREAD + Pollux 已打开 | 空心蓝色圆圈（`border border-blue-300`） | 发件人 `text-gray-500`、subject `text-gray-500` |
| **已读** | Gmail 非 UNREAD | 无圆点 | 发件人 `text-gray-700`、subject `text-gray-600` |

Snippet 文字灰度也跟随 viewed 状态：未看过 `text-gray-400`，看过 `text-gray-300`。

### 4.9 Unread 文案与 Metrics 逻辑优化

**状态：✅ 已完成**  
**修复日期：2026-03-30**

#### 问题

顶部 Metrics 显示 "Unread"，用户可能误以为在 Pollux 打开邮件后 Gmail 侧也会标记已读。实际上 Pollux 当前不修改 Gmail 已读状态。

#### 修改

**Metrics 卡片**：

| 之前 | 之后 |
|------|------|
| **Unread** — `messages.filter(m => m.status === "unread").length` | **New** — `messages.filter(m => m.status === "unread" && !viewedIds.has(m.id)).length` |

"New" 的含义：Gmail 未读 **且** 用户尚未在 Pollux 中打开过。这是最有行动价值的指标。

**Tooltip（hover）**：

鼠标悬停 "New" 卡片时，显示 tooltip：
- 主文案："Unread in Gmail & not yet opened in Pollux"
- 次文案："{N} total unread in Gmail"

清晰传达 "New" 是 Pollux 的概念，Gmail 未读数另行展示。

**Source 行**：

在底部来源行新增 Gmail 未读总数：

```
🟢 12 Gmail · ⚪ 3 Slack · 5 unread in Gmail
```

用户可以对比 "New" 和 "unread in Gmail" 来理解两者差异。

#### 设计决策

| 决策 | 理由 |
|------|------|
| 不自动调用 Gmail API mark as read | 避免引入 side effect，保持 Pollux 为只读消费者 |
| 不持久化到数据库 | Hackathon MVP，localStorage 足够，后续迁移点清晰 |
| "New" 而非 "Unread in Gmail" 作为主指标 | 更贴近用户关心的"还没处理的邮件"，而非邮件系统的技术状态 |
| Tooltip 补充说明而非主界面展示 | 信息层级：主指标简洁，hover 获取详情 |

### 4.10 影响文件总览

| 文件 | 阶段 | 变更类型 |
|------|------|---------|
| `src/app/inbox/page.tsx` | 4.1, 4.8, 4.9 | 重写 — Metrics grid、skeleton loading、error/empty states、viewedIds 集成、"New" 指标 |
| `src/components/inbox/message-list.tsx` | 4.2, 4.8 | 重写 — 新增 `viewedIds` prop 透传 |
| `src/components/inbox/message-list-item.tsx` | 4.2, 4.8 | 重写 — 三态视觉、相对时间、名字提取、viewed 样式 |
| `src/components/inbox/message-detail.tsx` | 4.3, 4.4 | 重写 — Header 布局、AI Reply 分割线、候选卡片编号、Composer 区、发送结果卡片 |
| `src/components/reply/reply-candidate-card.tsx` | 4.4 | 重写 — 编号圆球、进度条 confidence、增大内边距 |
| `src/components/shared/status-badge.tsx` | 4.6 | 重写 — pill 式 badge、HIGH 警告图标、AccountStatusBadge 带圆点 |
| `src/components/shared/user-avatar.tsx` | 4.7 | **新建** — 统一头像组件（onError fallback） |
| `src/components/shared/provider-icon.tsx` | — | 未改（emoji 保留） |
| `src/app/settings/page.tsx` | 4.5 | 重写 — 居中布局、未登录 empty state |
| `src/components/settings/settings-panel.tsx` | 4.5, 4.7 | 重写 — UserAvatar、Style Card 可视化预览、移除过时 checklist |
| `src/components/settings/account-status-card.tsx` | 4.5 | 重写 — 连接态绿色、scopes 标签、Reconnect 链接 |
| `src/components/layout/sidebar.tsx` | 4.6, 4.7 | 修改 — UserAvatar 替换、tagline 更新 |
| `src/lib/viewed-store.ts` | 4.8 | **新建** — localStorage viewed 消息管理 |

### 4.11 验收结果

| 验收项 | 结果 |
|--------|------|
| `next build` 编译通过 | ✅ 零新增 lint 错误 |
| Inbox 骨架屏 loading 正确显示 | ✅ 左栏 6 行 skeleton + 右栏 spinner |
| Inbox error 状态有 Retry | ✅ 大图标 + Try Again 按钮 |
| 邮件列表空态有引导 | ✅ 邮件图标 + Settings 链接 |
| 详情面板空态有引导 | ✅ "Select a conversation" + 说明文案 |
| Reply candidates 编号 + 进度条 | ✅ 1/2/3 圆球 + 彩色进度条 |
| 发送结果全宽卡片 | ✅ 绿/黄/红三态 |
| Settings Style Card 可视化预览 | ✅ Tone/Avoid/Sign-offs 标签 |
| 用户头像 broken image 修复 | ✅ onError 自动 fallback 到首字母 |
| Pollux viewed 状态持久化 | ✅ localStorage，刷新后保留 |
| 邮件列表三态指示（实心/空心/无） | ✅ |
| Metrics "New" 指标正确计算 | ✅ Gmail UNREAD ∩ !Pollux viewed |
| "New" 卡片 hover tooltip | ✅ 解释含义 + Gmail 未读总数 |
| Source 行展示 Gmail unread 数 | ✅ |

### 4.12 当前明确不包含的内容

- ❌ 打开邮件时自动调用 Gmail API mark as read（需后端新 API）
- ❌ Viewed 状态数据库持久化（当前 localStorage，后续迁移）
- ❌ Dashboard 页面产品化改造（仍为 milestone 风格）
- ❌ 发送后 thread 回复预览
- ❌ 多平台（Outlook / Slack）真实接入

---

## 阶段 5：Daily Brief / 外部事件总结

**状态：✅ 已完成**  
**完成日期：2026-03-31**

目标：让 Pollux 不只是显示单条邮件，而是能在 Dashboard 上总结"今天外部世界发生了什么、哪些消息值得处理、接下来该做什么"。设计为 provider-agnostic，当前基于 Gmail + Slack mock 数据工作，后续可直接扩展 Outlook 等新平台。

### 5.1 Summary Service — 聚合层

**位置：** `src/lib/services/summary-service.ts`

provider-agnostic 的消息聚合服务，输入任意 `MessageItem[]`，输出结构化 `DailyBrief`。

#### 5.1.1 核心函数

```typescript
generateDailyBrief(allMessages: MessageItem[], options?: { useAI?: boolean }): Promise<DailyBrief>
```

处理流程：

| 步骤 | 逻辑 |
|------|------|
| 1. 时间过滤 | 优先取今天的消息；如果今天无消息，fallback 到全部消息并标记为 "Recent" |
| 2. Provider 计数 | `computeProviderCounts()` — 按 provider 分组统计 total/unread |
| 3. Attention 提取 | `extractAttentionItems()` — HIGH/MEDIUM risk + unread，按风险排序，最多 8 条 |
| 4. Action 提取 | `extractActionItems()` — 正则关键词匹配，提取待处理事项，最多 10 条 |
| 5. Summary 生成 | AI 或 rule-based 自然语言摘要 |
| 6. Headline 生成 | 根据 attention 数量生成一句话标题 |

#### 5.1.2 Action Item 提取

10 种 action 模式，基于 subject + content 正则匹配：

| 类型 | 触发关键词 | 输出动作 |
|------|-----------|---------|
| payment | invoice, payment, billing, wire transfer, receipt, overdue | "Process payment" |
| deadline | deadline, due date, due by | "Review deadline" |
| interview | interview, screening, phone screen | "Prepare for interview" |
| contract | contract, nda, agreement, terms | "Review document" |
| follow_up | follow up, get back, circle back, ping back | "Follow up" |
| meeting | meeting, calendar, schedule, appointment, sync | "Check schedule" |
| delivery | delivery, shipping, tracking, package, shipment | "Track delivery" |
| review | test, testing, QA, staging, deploy, release | "Review & test" |
| proposal | proposal, quote, estimate, pricing | "Review proposal" |
| approval | approval, approve, sign off | "Give approval" |

每条 ActionItem 包含 `type`、`description`、`sourceMessageId`、`sourceProvider`、`sender`、`priority`，设计完全 provider-agnostic。

#### 5.1.3 Summary 文本生成

**Rule-based（默认）**：

根据 provider 计数、attention 数量、action 数量拼接自然语言段落。示例：

> "You received 12 messages today — 9 from gmail, 3 from slack. 1 high-risk and 2 medium-risk items need your attention. The most urgent is "Invoice Overdue" from Alice Corp. 4 action items detected, including payment, meeting, follow_up."

**AI-powered（OpenAI 可用时）**：

调用 `gpt-4o-mini`，传入消息列表、attention items、action items，要求生成 2-3 句 executive summary。
- temperature: 0.5（偏确定性，避免编造）
- max_tokens: 300
- 失败时自动 fallback 到 rule-based

`DailyBrief.sourceMode` 标记实际使用的生成方式：

| sourceMode | 含义 |
|------------|------|
| `ai_generated` | OpenAI 生成成功 |
| `rule_based` | 未启用 AI 或 OPENAI_API_KEY 未设置 |
| `fallback` | AI 调用失败，降级到规则版 |

### 5.2 数据类型

位置：`src/lib/types/index.ts`

新增 5 个接口：

```typescript
interface AttentionItem {
  messageId: string;
  provider: string;        // 不绑定 Provider enum，可扩展
  sender: string;
  subject?: string;
  reason: string;
  riskLevel: RiskLevel;
}

interface ActionItem {
  id: string;
  type: string;
  description: string;
  sourceMessageId: string;
  sourceProvider: string;  // 不绑定 Provider enum
  sender: string;
  priority: "high" | "medium" | "low";
}

interface ProviderCount {
  provider: string;
  total: number;
  unread: number;
}

interface DailyBrief {
  headline: string;
  summaryText: string;
  totalToday: number;
  totalAll: number;
  periodLabel: string;     // "Today" | "Recent"
  providerCounts: ProviderCount[];
  attentionItems: AttentionItem[];
  actionItems: ActionItem[];
  generatedAt: string;
  sourceMode: "rule_based" | "ai_generated" | "fallback";
}
```

**设计决策**：`provider` 字段使用 `string` 而非 `Provider` enum，使聚合层无需修改即可处理未来新增的 Outlook / Instagram / X 等平台数据。

### 5.3 API 端点

位置：`src/app/api/summary/route.ts`

| 方法 | 路径 | 参数 | 说明 |
|------|------|------|------|
| GET | `/api/summary` | `?ai=false` 可禁用 AI | 获取 auth session → 拉取 inbox → 生成 DailyBrief |

自动从 Auth0 session 获取 userId，复用现有 `getAggregatedInbox()` 获取消息数据。

### 5.4 Dashboard 产品化改造

位置：`src/app/dashboard/page.tsx` + `src/components/dashboard/daily-brief-card.tsx`

Dashboard 从 milestone-checklist 风格改为产品 landing page：

| 区域 | 内容 |
|------|------|
| Greeting | 根据时间自动切换 Good morning/afternoon/evening + 用户名 + 日期 |
| Daily Brief（hero） | DailyBriefCard 客户端组件，异步加载 |
| Quick Actions | 两个卡片：Open Inbox / Settings |
| Connection Status | Gmail / Slack / Outlook 连接状态指示 |

#### DailyBriefCard 组件

客户端组件，`useEffect` 初始化时调用 `/api/summary`，支持手动 Refresh。

UI 结构（从上到下）：

| 区块 | 内容 |
|------|------|
| Header | ☀️ Daily Brief 标题 + period label + Refresh 按钮 |
| Headline | 一句话要点（字号大，视觉焦点） |
| Summary | 自然语言摘要段落 |
| Stats row | 3 列 grid：Today/Total · Unread · Attention |
| Provider breakdown | 每个 provider 彩色圆点 + total + unread |
| Needs Attention | 风险色卡片列表（红/黄/蓝），显示 subject + sender + reason |
| Action Items | 待办清单式列表，每条有 priority 标签（Urgent/Soon/Low） |
| Footer | sourceMode 标签 + 生成时间 + "Open Inbox →" 链接 |

三种加载状态：
- **Loading**：skeleton 动画（卡片布局的占位骨架）
- **Error**：错误信息 + Retry 按钮
- **Empty**：消息为 0 时 summary 展示 "All clear — no new messages"

### 5.5 新建文件

| 文件 | 作用 |
|------|------|
| `src/lib/services/summary-service.ts` | Daily Brief 聚合服务（rule-based + AI summary） |
| `src/app/api/summary/route.ts` | Summary REST API |
| `src/components/dashboard/daily-brief-card.tsx` | Daily Brief 客户端组件 |

### 5.6 修改文件

| 文件 | 变更内容 |
|------|----------|
| `src/lib/types/index.ts` | 新增 `AttentionItem`、`ActionItem`、`ProviderCount`、`DailyBrief` 接口 |
| `src/app/dashboard/page.tsx` | 完全重写 — 从 milestone checklist 改为 greeting + DailyBrief + quick actions + connection status |

### 5.7 验收结果

| 验收项 | 结果 |
|--------|------|
| `next build` 编译通过 | ✅ 零新增 lint 错误 |
| Dashboard 显示 greeting + 日期 | ✅ 自动 Good morning/afternoon/evening |
| DailyBrief skeleton loading | ✅ 骨架屏动画 |
| DailyBrief headline + summary | ✅ 自然语言段落 |
| Stats row（Today/Unread/Attention） | ✅ |
| Provider breakdown | ✅ Gmail + Slack 计数 |
| Attention items 列表 | ✅ 按风险等级彩色卡片 |
| Action items 列表 | ✅ 待办式 + priority 标签 |
| sourceMode 标签（AI/rule-based/fallback） | ✅ |
| Refresh 按钮重新生成 | ✅ |
| 无 OPENAI_API_KEY 时降级到 rule-based | ✅ |
| 今天无消息时 fallback 到全部消息 | ✅ periodLabel 变为 "Recent" |
| Quick Actions（Inbox/Settings）链接 | ✅ |
| Connection Status（Gmail/Slack/Outlook） | ✅ |
| 未登录页面 | ✅ Sign in 提示 |

### 5.8 多平台扩展设计

当前 summary-service 已经完全 provider-agnostic：

| 扩展场景 | 需要做的 | 不需要改的 |
|----------|---------|-----------|
| 接入 Outlook | 新增 `OutlookInboxAdapter` 实现 `InboxAdapter` 接口 | summary-service、API route、DailyBriefCard |
| 接入 Instagram DM | 新增 adapter，`MessageItem.provider = "instagram"` | summary-service 自动聚合 |
| 接入 X (Twitter) DM | 新增 adapter，`MessageItem.provider = "x"` | summary-service 自动聚合 |

关键设计点：
- `ProviderCount.provider` / `AttentionItem.provider` / `ActionItem.sourceProvider` 均为 `string` 类型
- Action 提取基于消息内容而非 provider，新平台自动生效
- 风险分类基于 `classifyRisk()` 独立函数，与 provider 无关
- `computeProviderCounts()` 使用 `Map` 动态分组，无硬编码 provider 列表

### 5.9 当前明确不包含的内容

- ❌ 真实 Outlook / Instagram / X 接入（仅设计了扩展接口）
- ❌ AI summary 缓存（每次刷新重新生成）
- ❌ 用户可配置的 attention/action 规则
- ❌ Action items 状态持久化（完成/忽略）
- ❌ 定时自动刷新 brief

---

## 文件索引

```
pollux/
├── prisma/schema.prisma
├── src/
│   ├── middleware.ts                          ← 02-A 新增
│   ├── app/
│   │   ├── layout.tsx                         ← 02-A 修改
│   │   ├── page.tsx                           ← 02-A 修改
│   │   ├── globals.css
│   │   ├── dashboard/page.tsx                 ← 05 重写（greeting + DailyBrief）
│   │   ├── inbox/page.tsx                     ← 04 重写（Metrics + viewedIds + skeleton）
│   │   ├── settings/page.tsx                  ← 04 重写（居中布局 + empty state）
│   │   └── api/
│   │       ├── inbox/route.ts                 ← 03 修改（查询参数 + meta）
│   │       ├── accounts/route.ts              ← 02-A 修改
│   │       ├── reply/generate/route.ts        ← 03 修改（event log）
│   │       ├── send/route.ts                  ← 03 修改（event log）
│   │       ├── summary/route.ts               ← 05 新增（Daily Brief API）
│   │       ├── events/route.ts                ← 03 新增（Event Log REST API）
│   │       ├── attachments/
│   │       │   └── [messageId]/
│   │       │       └── [attachmentId]/
│   │       │           └── route.ts           ← 03 新增（下载骨架 501）
│   │       └── auth/gmail/                    ← 02-A 新增
│   │           ├── connect/route.ts
│   │           └── callback/route.ts
│   ├── components/
│   │   ├── layout/
│   │   │   ├── app-shell.tsx                  ← 02-A 修改
│   │   │   └── sidebar.tsx                    ← 04 修改（UserAvatar + tagline）
│   │   ├── dashboard/
│   │   │   └── daily-brief-card.tsx           ← 05 新增（Daily Brief 客户端组件）
│   │   ├── inbox/
│   │   │   ├── message-list.tsx                ← 04 重写（viewedIds prop）
│   │   │   ├── message-list-item.tsx          ← 04 重写（三态视觉 + 相对时间）
│   │   │   └── message-detail.tsx             ← 04 重写（AI Reply 区优化）
│   │   ├── reply/
│   │   │   └── reply-candidate-card.tsx       ← 04 重写（编号 + 进度条）
│   │   ├── settings/
│   │   │   ├── account-status-card.tsx        ← 04 重写（连接态绿色 + scopes）
│   │   │   └── settings-panel.tsx             ← 04 重写（UserAvatar + Style预览）
│   │   └── shared/
│   │       ├── status-badge.tsx               ← 04 重写（pill式 + 图标）
│   │       ├── provider-icon.tsx
│   │       └── user-avatar.tsx                ← 04 新建（头像 onError fallback）
│   └── lib/
│       ├── auth0.ts                           ← 02-A 新增
│       ├── config.ts                          ← 03 新增（INBOX_MAX_RESULTS）
│       ├── viewed-store.ts                    ← 04 新建（localStorage viewed 管理）
│       ├── types/index.ts                     ← 05 修改（DailyBrief + AttentionItem + ActionItem + ProviderCount）
│       ├── gmail/                             ← 02-A 新增
│       │   ├── oauth.ts
│       │   ├── token-store.ts
│       │   ├── client.ts                      ← 02-B 新增
│       │   └── parse.ts                       ← 03 修改（extractHtmlBody + extractAttachments）
│       ├── openai/
│       │   └── generate.ts                    ← 02-C 新增
│       ├── mocks/         (accounts, messages, replies, style, user)
│       ├── adapters/
│       │   ├── inbox.ts                       ← 03 修改（InboxFetchOptions 参数）
│       │   ├── gmail-inbox.ts                 ← 03 修改（config + filter + risk + html + attachments）
│       │   ├── gmail-send.ts                  ← 02-D 新增
│       │   ├── send.ts                        ← 02-D 修改
│       │   └── style-source.ts
│       └── services/
│           ├── inbox-service.ts               ← 03 修改（options + limit + event log）
│           ├── reply-service.ts               ← 02-C 修改
│           ├── account-service.ts             ← 02-A 修改
│           ├── send-service.ts                ← 02-D 修改
│           ├── risk-service.ts                ← 03 新增（classifyRisk）
│           ├── event-log.ts                   ← 03 新增（内存事件日志）
│           └── summary-service.ts             ← 05 新增（Daily Brief 聚合）
├── docs/
│   ├── prompts/
│   │   ├── 01-cursor-min-scaffold.md
│   │   └── 02-cursor-auth0-gmail-openai.md
│   └── history.md                             ← 本文件
├── .env.example                               ← 03 修改（新增 INBOX_MAX_RESULTS）
├── .gitignore
├── package.json                               ← 03 修改（新增 dompurify）
├── tsconfig.json
├── next.config.ts
├── postcss.config.mjs
└── eslint.config.mjs
```

---

## 阶段 5.1：Daily Brief 稳定性修正

**完成日期**: 2026-03-25

### 5.1.1 修正内容

本轮对阶段 5 的 Daily Brief 做了 5 项针对性修正，不改变整体架构，只提升稳定性和可信度。

### 5.1.2 时区判断修正

- `isToday()` 改用 `Intl.DateTimeFormat("en-CA", { timeZone: "Australia/Sydney" })` 进行日期比较
- 统一按 `Australia/Sydney` 时区判断"今天"
- 时间解析失败时安全返回 `false`，不会导致崩溃

### 5.1.3 轻量缓存

- `src/app/api/summary/route.ts` 增加 globalThis 内存缓存（同 token-store 模式）
- 缓存 key 为 `userId`，TTL 为 3 分钟
- 默认请求命中缓存时直接返回，响应带 `cached: true`
- `?refresh=true` 参数绕过缓存，强制重新生成
- 前端 Refresh 按钮和 Retry 按钮均传 `?refresh=true`

### 5.1.4 Action Items 优化

- 去重改为双层：单条消息内按 `messageId:type` 去重 + 跨消息按 `type:sender:subject` 去重
- description 更具体：带 subject 时格式为 `"{verb}: {subject} (from {sender})"`，无 subject 时为 `"{verb} with {sender}"`
- 避免同一发件人同一主题重复刷出多条 action

### 5.1.5 Attention Items 优化

- 改为评分制：`HIGH +10`、`MEDIUM +5`、`unread +3`、`有关联 action item +2`
- 过滤阈值 `score >= 3`：HIGH/MEDIUM 即使已读也保留，LOW 需 unread 或有 action
- 排序按总分降序，不再只看 riskLevel
- reason 文案区分 read/unread 状态

### 5.1.6 AI Summary Prompt 收紧

- 角色从"executive assistant summarize"改为"rewrite pre-extracted data"
- 新增 6 条严格约束：禁止编造、推测、扩展事实
- temperature 从 0.5 降到 0.3
- 数据稀疏时要求写更短的 summary，不允许 padding

### 5.1.7 改动文件

| 文件 | 改动 |
|------|------|
| `src/lib/services/summary-service.ts` | isToday 时区修正、attention 评分制、action 去重+具体化、AI prompt 收紧 |
| `src/app/api/summary/route.ts` | globalThis 缓存层（3 分钟 TTL + refresh 参数）|
| `src/components/dashboard/daily-brief-card.tsx` | Refresh/Retry 传 `?refresh=true` |

### 5.1.8 验证

- `next build` 通过（exit_code: 0）
- Today 判断基于 `Australia/Sydney` 时区
- 连续刷新 Dashboard 不再重复调 OpenAI（缓存命中）
- 手动 Refresh 绕过缓存
- Action items 不再重复，description 带具体 sender/subject
- HIGH risk 已读消息仍出现在 attention
- AI summary 不再编造未提供信息

---

## 阶段 6：Style Personalization V1

**完成日期**: 2026-03-25

### 6.1 产品目标

让用户能够"自主选择"如何建立自己的写作风格，使 AI 生成的回复明显更个性化。设计参考了 WeClone-Skills 的 persona pack / runtime context / review gate 结构，原生实现到 Pollux 中。

### 6.2 四条风格入口（Settings → Build Your Style）

| # | 入口 | 说明 |
|---|------|------|
| 1 | Learn from Gmail Sent | 拉取最近 15 封已发送邮件，AI 分析提取风格（需要 Gmail 已连接）|
| 2 | Upload Writing Samples | 上传 .txt / .md 文件 |
| 3 | Paste Writing Samples | 直接粘贴文本，用 `---` 分隔多个样本 |
| 4 | Start from a Preset | 4 个预设：Professional / Friendly / Concise / Assertive |

### 6.3 冷启动策略

| 样本数 | 策略 |
|--------|------|
| 0 | Preset only — 选一个预设即可开始 |
| 1-3 | 轻量提取 — signoff/greeting/句子风格/语气 |
| 4-9 | Few-shot — 注入 1-2 个匹配样本到 prompt |
| 10+ | Heuristic retrieval — 按 provider/length 匹配 top 3 |

### 6.4 类型扩展

**`src/lib/types/index.ts`**:
- `StyleCard` 新增可选字段：`greetingPatterns`, `directness`, `hedgeWords`
- `StyleExample` 扩展：`sourceProvider` 改为 `string`（provider-agnostic），新增 `intent?`, `lengthBucket?`
- 新增 `StyleSource` 类型：`"preset" | "gmail_sent" | "manual_samples" | "mixed"`
- 新增 `UserStyleProfile` 接口：`styleCard`, `examples[]`, `guardrails[]`, `source`, `exampleCount`, `updatedAt`

### 6.5 风格存储 — `src/lib/style/style-store.ts`

- globalThis 模式（同 token-store），HMR 安全
- `getUserStyleProfile(userId)` / `setUserStyleProfile(userId, profile)` / `removeUserStyleProfile(userId)`

### 6.6 预设 — `src/lib/style/presets.ts`

4 个预设 StyleCard（Professional / Friendly / Concise / Assertive），每个包含完整的 toneRules、bannedPhrases、signoffPatterns、greetingPatterns、directness、hedgeWords。

### 6.7 AI 风格提取 — `src/lib/style/extract.ts`

- `extractStyleFromSamples(texts, sourceProvider)` → `{ styleCard, examples }`
- AI 路径：将样本发送给 GPT-4o-mini，提取结构化 StyleCard（persona、tone rules、banned phrases、greeting/signoff patterns 等）
- 规则 fallback：无 OpenAI 时，分析 signoff 模式、sentence 长度、emoji 使用率、hedging 词频
- 样本自动转换为 `StyleExample[]`，附加 `lengthBucket`

### 6.8 Gmail 已发送邮件获取 — `src/lib/gmail/fetch-sent.ts`

- `fetchGmailSentEmails(userId, maxResults)` → `string[]`
- 使用 Gmail API `messages.list` with `labelIds: ['SENT']`
- 复用现有 `createGmailClient` 和 `extractTextBody`

### 6.9 API 路由

**`GET /api/style`** — 获取当前用户风格 profile
**`POST /api/style`** — 设置 preset 或更新 guardrails
  - `{ action: "set_preset", presetId: "professional" }`
  - `{ action: "update_guardrails", guardrails: [...] }`

**`POST /api/style/learn`** — 触发风格学习
  - `{ source: "gmail_sent" }` — 从 Gmail 已发送邮件学习
  - `{ source: "manual_samples", texts: [...] }` — 从粘贴/上传文本学习

### 6.10 增强的 Prompt — `src/lib/openai/generate.ts`

- 接口从 `generateRepliesWithOpenAI(input, styleCard)` 改为 `generateRepliesWithOpenAI(input, ctx: EnhancedStyleContext)`
- `EnhancedStyleContext` 包含：`styleCard`, `examples?`, `guardrails?`
- Prompt 新增：
  - "USER'S COMMUNICATION PROFILE" 区块（含 greetings、directness、hedgeWords）
  - "AUTHOR'S WRITING EXAMPLES" 区块（few-shot 注入 top 3 匹配样本）
  - "Guardrails" 区块（用户自定义边界）
- 启发式样本选择 `selectExamples()`：按 provider 匹配 +2、length bucket 匹配 +1，取 top 3

### 6.11 Reply Service 升级 — `src/lib/services/reply-service.ts`

- `generateReplies(input, userId?)` — 新增可选 `userId` 参数
- 自动从 `style-store` 加载用户风格 profile
- 无用户风格时 fallback 到 `mockStyleCard`
- 返回 `styleMeta`：`{ persona, source, exampleCount }`

### 6.12 StyleBuilder UI — `src/components/settings/style-builder.tsx`

- 加载时自动 fetch `/api/style` 检查现有 profile
- 两个 tab：`choose`（选择来源）和 `preview`（预览当前风格）
- 4 条入口卡片，Gmail 入口显示 "Recommended" 且未连接时 disabled
- 粘贴入口支持展开 textarea，实时显示检测到的样本数
- 上传入口支持多文件 .txt/.md
- 预设入口显示 4 个快速选择按钮
- Preview tab 显示完整 StyleCard（persona、tone、avoid、sign-offs、emoji/sentences/directness 三列指标）+ 代表性样本（最多 3 条）
- "Change Style Source" 按钮允许重新选择

### 6.13 Settings 页面集成

- `src/components/settings/settings-panel.tsx`：移除旧的静态 "Communication Style" preview
- 替换为 `<StyleBuilder gmailConnected={gmailConnected} />`
- `src/app/api/reply/generate/route.ts`：传 `userId` 给 `generateReplies`

### 6.14 WeClone-Skills 思想映射

| WeClone 概念 | Pollux 实现 |
|-------------|-------------|
| persona pack | `UserStyleProfile.styleCard` — 长期风格 |
| persona examples | `UserStyleProfile.examples` — 代表性历史样本 |
| state | runtime context 中的 provider / 收件人信息 |
| guardrails | `UserStyleProfile.guardrails` — 禁止短语/边界 |
| runtime context | `GenerateInput`（当前邮件内容/provider/sender）|
| review gate | 生成候选 → 用户编辑确认 → 手动发送 |

### 6.15 改动文件清单

| 文件 | 状态 |
|------|------|
| `src/lib/types/index.ts` | 修改 — 扩展 StyleCard/StyleExample，新增 UserStyleProfile |
| `src/lib/style/presets.ts` | 新增 — 4 个预设 StyleCard |
| `src/lib/style/style-store.ts` | 新增 — globalThis 风格存储 |
| `src/lib/style/extract.ts` | 新增 — AI 风格提取 + 规则 fallback |
| `src/lib/gmail/fetch-sent.ts` | 新增 — Gmail 已发送邮件获取 |
| `src/app/api/style/route.ts` | 新增 — 风格 CRUD API |
| `src/app/api/style/learn/route.ts` | 新增 — 风格学习 API |
| `src/components/settings/style-builder.tsx` | 新增 — Build Your Style UI |
| `src/lib/openai/generate.ts` | 修改 — 增强 prompt（examples + guardrails）|
| `src/lib/services/reply-service.ts` | 修改 — 加载用户风格，传 userId |
| `src/app/api/reply/generate/route.ts` | 修改 — 传 userId |
| `src/components/settings/settings-panel.tsx` | 修改 — 集成 StyleBuilder |

### 6.16 验证

- `next build` 通过（exit_code: 0）
- 4 条入口在 Settings 页面中清晰可见
- Preset 选择即时生效，Preview 正确显示
- Gmail Sent 学习（需已连接 Gmail）触发 AI 提取
- 粘贴/上传样本触发 AI 风格分析
- 回复生成使用用户个性化风格（日志中可见 persona/source/exampleCount）

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
| @auth0/nextjs-auth0 | 4.16 | 用户认证（02-A 新增） |
| google-auth-library | latest | Gmail OAuth（02-A 新增） |
| googleapis | latest | Gmail API v1（02-B 新增） |
| openai | latest | Chat Completions API（02-C 新增） |
| dompurify | latest | HTML sanitize，XSS 防御（03 新增） |

## 本地运行

```bash
npm install

# 首次运行前：复制 .env.example 为 .env.local 并填入 Auth0 / Google 凭据
cp .env.example .env.local

npm run dev        # http://localhost:3000
```
