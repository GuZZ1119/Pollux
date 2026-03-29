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
│   │   ├── dashboard/page.tsx                 ← 03 修改
│   │   ├── inbox/page.tsx                     ← 03 修改（filter toggle + 指标栏）
│   │   ├── settings/page.tsx                  ← 02-A 修改
│   │   └── api/
│   │       ├── inbox/route.ts                 ← 03 修改（查询参数 + meta）
│   │       ├── accounts/route.ts              ← 02-A 修改
│   │       ├── reply/generate/route.ts        ← 03 修改（event log）
│   │       ├── send/route.ts                  ← 03 修改（event log）
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
│   │   │   └── sidebar.tsx                    ← 02-A 修改
│   │   ├── inbox/
│   │   │   ├── message-list.tsx
│   │   │   ├── message-list-item.tsx
│   │   │   └── message-detail.tsx             ← 03 修改（HTML渲染 + 附件）
│   │   ├── reply/         (ReplyCandidateCard)
│   │   ├── settings/
│   │   │   ├── account-status-card.tsx        ← 02-A 修改
│   │   │   └── settings-panel.tsx             ← 02-A 修改
│   │   └── shared/        (StatusBadge, ProviderIcon)
│   └── lib/
│       ├── auth0.ts                           ← 02-A 新增
│       ├── config.ts                          ← 03 新增（INBOX_MAX_RESULTS）
│       ├── types/index.ts                     ← 03 修改（Attachment + InboxFetchOptions）
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
│           └── event-log.ts                   ← 03 新增（内存事件日志）
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
