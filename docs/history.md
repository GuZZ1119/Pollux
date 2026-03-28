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
│   │   ├── dashboard/page.tsx                 ← 02-A 修改
│   │   ├── inbox/page.tsx
│   │   ├── settings/page.tsx                  ← 02-A 修改
│   │   └── api/
│   │       ├── inbox/route.ts
│   │       ├── accounts/route.ts              ← 02-A 修改
│   │       ├── reply/generate/route.ts
│   │       ├── send/route.ts
│   │       └── auth/gmail/                    ← 02-A 新增
│   │           ├── connect/route.ts
│   │           └── callback/route.ts
│   ├── components/
│   │   ├── layout/
│   │   │   ├── app-shell.tsx                  ← 02-A 修改
│   │   │   └── sidebar.tsx                    ← 02-A 修改
│   │   ├── inbox/         (MessageList, MessageListItem, MessageDetail)
│   │   ├── reply/         (ReplyCandidateCard)
│   │   ├── settings/
│   │   │   ├── account-status-card.tsx        ← 02-A 修改
│   │   │   └── settings-panel.tsx             ← 02-A 修改
│   │   └── shared/        (StatusBadge, ProviderIcon)
│   └── lib/
│       ├── auth0.ts                           ← 02-A 新增
│       ├── types/index.ts                     ← 02-A 修改
│       ├── gmail/                             ← 02-A 新增
│       │   ├── oauth.ts
│       │   ├── token-store.ts
│       │   ├── client.ts                      ← 02-B 新增
│       │   └── parse.ts                       ← 02-B 新增
│       ├── openai/
│       │   └── generate.ts                    ← 02-C 新增
│       ├── mocks/         (accounts, messages, replies, style, user)
│       ├── adapters/
│       │   ├── inbox.ts          (接口 + MockSlackInboxAdapter)
│       │   ├── gmail-inbox.ts                 ← 02-B 新增
│       │   ├── gmail-send.ts                  ← 02-D 新增
│       │   ├── send.ts                        ← 02-D 修改
│       │   └── style-source.ts
│       └── services/
│           ├── inbox-service.ts               ← 02-B 修改
│           ├── reply-service.ts               ← 02-C 修改
│           ├── account-service.ts             ← 02-A 修改
│           └── send-service.ts                ← 02-D 修改
├── docs/
│   ├── prompts/
│   │   ├── 01-cursor-min-scaffold.md
│   │   └── 02-cursor-auth0-gmail-openai.md
│   └── history.md                             ← 本文件
├── .env.example                               ← 02-A 新增
├── .gitignore
├── package.json                               ← 02-A 修改（新增依赖）
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
| @auth0/nextjs-auth0 | 4.16 | 用户认证（02-A 新增） |
| google-auth-library | latest | Gmail OAuth（02-A 新增） |
| googleapis | latest | Gmail API v1（02-B 新增） |
| openai | latest | Chat Completions API（02-C 新增） |

## 本地运行

```bash
npm install

# 首次运行前：复制 .env.example 为 .env.local 并填入 Auth0 / Google 凭据
cp .env.example .env.local

npm run dev        # http://localhost:3000
```
