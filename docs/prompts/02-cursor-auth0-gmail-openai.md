# Pollux 第二阶段：在现有骨架上接入 Auth0 + Gmail + OpenAI（增量开发版）

> 目标：**不要重写第一阶段骨架**，只在现有项目结构上，逐步把 mock 替换为真实能力，优先打通单平台（Gmail）真实闭环。  
> 当前阶段不追求“全平台”和“全自动代聊”，只做：**登录 → 连接 Gmail → 拉取真实邮件 → 查看详情 → AI 生成回复 → 用户确认发送**。

---

## 先读这个背景

当前项目 **第一阶段已经完成**，已有内容包括：

- Next.js 15 + TypeScript + App Router
- Prisma schema 已定义
- 核心类型已定义
- Mock 数据已就位
- adapters / services / API routes 已搭好
- 页面 `/dashboard` `/inbox` `/settings` 已可运行
- 当前 `/api/inbox`、`/api/accounts`、`/api/reply/generate`、`/api/send` 仍是 mock
- 代码结构和 UI 组件都已经存在

### 当前现有目录（不要推翻）
```txt
prisma/schema.prisma
src/app/layout.tsx
src/app/page.tsx
src/app/dashboard/page.tsx
src/app/inbox/page.tsx
src/app/settings/page.tsx
src/app/api/inbox/route.ts
src/app/api/accounts/route.ts
src/app/api/reply/generate/route.ts
src/app/api/send/route.ts

src/components/layout/
src/components/inbox/
src/components/reply/
src/components/settings/
src/components/shared/

src/lib/types/index.ts
src/lib/mocks/
src/lib/adapters/
src/lib/services/
```

---

## 你的工作原则

1. **不要重建项目**
2. **不要重构整个目录**
3. **不要推翻现有 types、services、API route 结构**
4. **优先复用第一阶段骨架**
5. **仅在必要处扩展 Prisma schema / types**
6. **优先让 Gmail 真实链路跑通**
7. **Slack 先继续保留 mock**
8. **不要引入 LangGraph、多 agent、websocket、复杂队列**
9. **自动化只保留 Draft only / One-click send 的 UI 与基础逻辑**
10. **所有高风险动作默认需要用户确认**

---

## 第二阶段核心目标

请在现有代码基础上完成：

### 目标 1：接入 Auth0 基础登录
完成后，用户应该能够：
- 进入应用
- 登录 / 登出
- 服务端读取当前 session
- 页面根据登录状态展示内容

### 目标 2：接入 Gmail 真实连接与读取
完成后，用户应该能够：
- 在 Settings 页面看到 Gmail 连接状态
- 连接 Gmail
- 通过已授权能力读取最近邮件
- 在 Inbox 页面看到真实 Gmail 消息

### 目标 3：接入真实邮件详情读取
完成后，用户应该能够：
- 点击某封 Gmail 邮件
- 查看真实正文、主题、发件人、时间、thread 信息

### 目标 4：接入 OpenAI 回复生成
完成后，用户应该能够：
- 点击“Generate replies”
- 基于真实邮件内容获取 2–3 条候选回复
- 每条包含 text / explanation / confidence

### 目标 5：接入 Gmail 真实发送
完成后，用户应该能够：
- 在编辑框中修改回复
- 点击发送
- 通过 Gmail 真实发出回复
- 得到成功/失败反馈

---

## 严格的范围限制

### 现在必须做
- Auth0 基础登录
- Gmail 连接状态
- Gmail 读取最近邮件
- Gmail 查看邮件详情
- OpenAI 生成候选回复
- Gmail 手动确认发送
- Settings 展示真实连接状态
- Inbox / Reply 基本 loading / error / empty states

### 现在不要做
- 不做 Slack 真实接入
- 不做 Outlook / X / Instagram
- 不做自动发送
- 不做后台常驻 agent
- 不做复杂风险引擎
- 不做真正风格训练平台
- 不做 embeddings / vector search
- 不做复杂异步任务系统
- 不做实时同步
- 不做全新 UI 重设计

---

## 优先级顺序（按这个顺序开发）

### 第 1 批：身份与授权
1. Auth0 基础登录
2. Gmail Connected Account 状态与连接流程

### 第 2 批：真实 Gmail Inbox
3. GmailInboxAdapter v1
4. inbox-service 真实聚合（优先 Gmail，Slack 保留 mock）
5. Message Detail 真实邮件详情读取

### 第 3 批：AI 回复生成
6. OpenAI reply-service v1
7. style card 接入生成链路（先静态使用现有 style card，不做真实样本导入）

### 第 4 批：发送闭环与前端联调
8. GmailSendAdapter v1
9. Reply 面板生成与发送反馈
10. Settings / Inbox / Dashboard 局部真实化

---

## 希望你创建或修改的内容

### A. Auth0 基础登录
- 采用适合 Next.js App Router 的实现
- 要有 login / logout / server-side session
- 未登录用户进入受保护页面时有清晰未登录状态或跳转
- 当前用户可映射到 `UserProfile`

### B. Prisma / 类型层增量扩展
只做必要增量扩展，不要大改：
- `ConnectedAccount`：provider、scopes、status、lastSyncAt、externalAccountEmail（可选）、vault reference（占位）、userId
- `MessageItem`：externalMessageId、externalThreadId、subject、sender、snippet、content、provider、timestamp、riskLevel、status
- `SendLog`：messageId、mode、approvedByUser、sentAt、result、provider

### C. Gmail 适配器真实化
在现有 `src/lib/adapters/` 基础上实现：
- `GmailInboxAdapter`
- `GmailSendAdapter`

`GmailInboxAdapter` 至少负责：
- 读取最近邮件列表
- 读取单封邮件详情
- 输出统一的 `MessageItem`

### D. account-service 真实化
- 优先读取真实登录用户的连接状态
- Gmail 已连接时返回真实状态
- Slack 暂时仍可回退为 mock 或 disconnected

`/api/accounts` 应返回：
- 当前用户
- Gmail 当前状态（CONNECTED / DISCONNECTED / PENDING）
- scope 列表（若可得）
- lastSyncAt（若可得）

### E. inbox-service 真实化
- 优先聚合真实 Gmail 邮件
- Slack 暂时仍可用 mock 数据
- 输出结构保持第一阶段 API 兼容

`/api/inbox` 要求：
- 登录后返回真实 Gmail 数据
- 若未连接 Gmail，返回清晰状态或空列表
- 按时间倒序排序
- 保持 `ApiResponse<T>` 格式

### F. 邮件详情读取
可以：
- 为 `/api/inbox` 直接返回足够详情
- 或新增一个读取 detail 的 route

最终要求：
- 点击消息时，右侧 `MessageDetail` 能展示真实内容
- 若正文为空，要有 fallback
- 主题、发件人、时间要和详情一致

### G. OpenAI 回复生成
把现有 `reply-service` 从 mock 改成真实生成。

输入：
- 当前 message detail
- 当前用户 style card（先用现有 static style card）
- persona（若已有）
- 风险等级（若已有）

输出：
- 2–3 条候选回复
- 每条包含 id / text / explanation / confidence

要求：
- 服务端调用，不暴露 key
- 失败时返回合理错误信息
- 可保留 fallback mock reply 兜底

### H. style card 接入生成链路（轻量版）
现在不要做真实样本导入，只做：
- 从现有 mock/static `StyleCard` 读取当前风格配置
- 在回复生成时注入：
  - toneRules
  - bannedPhrases
  - signoffPatterns
  - emojiPreference
  - sentenceStyle

### I. Gmail 真实发送
把现有 `send-service` 和 `/api/send` 从 mock 改成真实 Gmail 发送。

要求：
- 用户必须显式点击发送
- 默认 human-in-the-loop
- 成功后返回 provider / sentAt / result
- 失败时给前端明确错误提示

### J. 页面改造（尽量少改 UI）
`/settings`
- 展示当前登录状态
- 展示 Gmail 连接状态
- 展示 scope / provider info（若可得）
- 明确写出：Gmail 已真实接入，Slack 暂为 mock

`/inbox`
- 拉真实 `/api/inbox`
- 左侧显示真实 Gmail 消息
- 右侧显示真实详情
- “Generate replies” 触发真实 API
- “Send” 触发真实发送 API
- 有 loading / error / empty state

`/dashboard`
- 只做轻量真实化：
  - 当前用户
  - 连接账号数
  - inbox 条数

### K. 环境变量与开发体验
补齐：
- `.env.example`
- 必要的环境变量读取工具
- 缺少变量时的清晰报错

至少包括：
- Auth0 相关
- OpenAI 相关
- 数据库相关
- Gmail/provider 接入占位

---

## 验收标准

第二阶段完成后，本地至少应满足：

1. 可以登录
2. Settings 可看到 Gmail 连接状态
3. Inbox 可展示真实 Gmail 邮件
4. 点击消息能看到真实正文
5. 生成候选回复走真实 OpenAI
6. 手动发送走真实 Gmail
7. 页面有基本 loading / error / empty state
8. 现有项目能继续 `build` 成功
9. Slack 不必真实接通，但不能被破坏
10. 代码结构仍然沿用第一阶段骨架

---

## 编码要求

- 只增量修改，不大重构
- 保持类型安全
- 保持 imports 正确
- 保持现有 service / adapter / route 分层
- 不要大面积改名
- 不要把业务逻辑堆到页面组件里
- 复杂第三方接入写在 adapter / service 层
- 所有真实接入点加清晰注释
- 如果某一步接入成本太高，优先保证 Gmail 单平台闭环

---

## 输出顺序要求

请按以下顺序工作并汇报：

1. 先审视现有项目结构，列出你会修改的文件
2. 再增量修改 Prisma / types（若需要）
3. 接入 Auth0 基础登录
4. 接入 Gmail account / inbox / detail
5. 接入 OpenAI reply generation
6. 接入 Gmail send
7. 修改 settings / inbox / dashboard 页面
8. 补 `.env.example`
9. 最后告诉我：
   - 改了哪些文件
   - 如何配置环境变量
   - 如何本地运行和验证
   - 当前还保留了哪些 mock

---

## 如果你需要做取舍

请优先保证这个闭环：

**登录 → Gmail 已连接 → 真实邮件 → AI 回复 → 用户确认发送**

比起“做很多平台”，我更需要“一个真正能跑通的 Gmail MVP”。
