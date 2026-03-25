你现在是我的资深全栈工程师，请帮助我从 0 开始搭建一个黑客松 MVP 项目 **Pollux** 的最小可运行骨架。

### 一、项目定位

Pollux **不是** 一个“全自动跨平台代聊机器人”。  
它是一个 **permissioned AI communication layer（有授权边界的 AI 沟通层）**：

- 用户先登录系统
- 之后再连接 Gmail / Slack
- 之后再导入历史消息
- 系统提供统一收件箱
- AI 根据用户风格生成回复草稿
- 默认由用户审核后发送
- 后续再加入低风险自动化能力

### 二、当前任务

请你现在做的事情是：

**从 0 搭建最小可运行骨架（minimal runnable scaffold）。**

注意：

- **不要** 现在接入真实 Auth0
- **不要** 现在接入真实 Gmail API
- **不要** 现在接入真实 Slack API
- **不要** 现在接任何外部服务
- 一律先使用 **mock 数据、清晰接口、TODO 注释**
- 后续真实接入时可以平滑替换

### 三、技术要求

请使用以下技术栈：

- Next.js 最新版本
- TypeScript
- App Router
- Tailwind CSS
- Prisma
- 面向 PostgreSQL 的 schema 设计
- 清晰的文件结构
- 强类型
- 可复用 UI 组件
- Mock 的 server-side API routes
- 不要过度设计
- 不要引入 LangGraph、多智能体等复杂架构
- 整体保持 **hackathon-friendly**，简单、稳、能跑

### 四、最终目标

完成后，我本地运行项目时，至少应该能看到：

1. 一个 dashboard 页面
2. 一个 inbox 页面，里面有 mock 的 Gmail / Slack 消息
3. 一个消息详情 / 回复面板
4. 一个 settings 页面
5. 一个通过内部 API route 生成 mock 回复候选的流程
6. 清楚预留未来接入 Auth0 Token Vault、Connected Accounts、Gmail API、Slack API 的位置

### 五、推荐项目结构

请按下面这个方向搭建：

```txt
src/
  app/
    page.tsx
    dashboard/page.tsx
    inbox/page.tsx
    settings/page.tsx
    api/
      inbox/route.ts
      reply/generate/route.ts
      accounts/route.ts
      send/route.ts
  components/
    layout/
    inbox/
    reply/
    settings/
    shared/
  lib/
    types/
    mocks/
    adapters/
    services/
    utils/
  server/
    services/
prisma/
  schema.prisma
```

### 六、你需要创建的内容

#### 1. 全局架构

请完成：

- 使用 App Router 初始化一个干净的 Next.js 项目结构
- 添加 root layout
- 添加基础导航（侧边栏或顶部导航都可以）
- 导航至少包含：
  - Dashboard
  - Inbox
  - Settings
- UI 风格简洁干净，不要做得太花

#### 2. 核心 TypeScript 领域类型

请创建强类型的领域模型。

先定义这些枚举：

- `Provider = 'gmail' | 'slack'`
- `AutomationLevel = 'DRAFT_ONLY' | 'ONE_CLICK' | 'AUTO_ALLOWLIST'`
- `RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH'`
- `AccountStatus = 'CONNECTED' | 'DISCONNECTED' | 'PENDING'`

然后定义这些接口：

- `UserProfile`
- `ConnectedAccount`
- `StyleCard`
- `StyleExample`
- `MessageItem`
- `ReplyCandidate`
- `SendLog`

建议字段如下：

**UserProfile**
- id
- name
- email
- defaultPersona
- automationLevel

**ConnectedAccount**
- id
- provider
- scopes
- status
- lastSyncAt

**StyleCard**
- id
- persona
- toneRules
- bannedPhrases
- signoffPatterns
- emojiPreference
- sentenceStyle

**StyleExample**
- id
- persona
- sourceProvider
- text

**MessageItem**
- id
- provider
- threadId
- sender
- subject（可选）
- snippet
- content
- timestamp
- riskLevel
- status

**ReplyCandidate**
- id
- text
- explanation
- confidence

**SendLog**
- id
- messageId
- mode
- approvedByUser
- sentAt
- result

#### 3. Prisma schema

请创建 Prisma schema，至少包含这些模型：

- `UserProfile`
- `ConnectedAccount`
- `StyleCard`
- `StyleExample`
- `MessageItem`
- `SendLog`

要求：

- 为了简化，全部使用字符串 ID
- 合适的地方使用 enum
- 设计尽量最小，但对后续扩展友好
- 在注释中说明未来 Auth0 用户身份会如何映射
- 在注释中说明未来外部 provider 的 messageId / threadId 放在哪里

#### 4. Mock 数据

请在 `lib/mocks` 中创建 mock 数据：

- connected accounts
- inbox messages
- style card
- reply candidates

要求：

- 至少 4 到 6 条 inbox 消息
- Gmail 和 Slack 混合
- 风险等级混合
- 文本尽量真实，不要写无意义占位内容

#### 5. Adapter 抽象层

请在 `lib/adapters` 中创建接口：

- `InboxAdapter`
- `SendAdapter`
- `StyleSourceAdapter`（可选，但建议预留）

并创建 mock 实现：

- `MockGmailInboxAdapter`
- `MockSlackInboxAdapter`
- `MockSendAdapter`

要求：

- 不调用任何真实服务
- 只返回 mock 数据
- 用 `TODO` 注释标出未来真实 provider 接入的位置

#### 6. Service 层

请创建简单的 service：

- `inboxService`：从多个 provider 聚合消息，并按最新时间排序
- `replyService`：根据一条消息，返回 2 到 3 条 mock 回复候选
- `accountService`：返回连接状态
- `sendService`：接受回复 payload，返回 mock success 结果

要求：

- service 保持短小、清晰、可替换
- 不要写得太重

#### 7. API Routes

请创建最小 route handlers：

- `GET /api/inbox`
  - 返回聚合后的 mock messages
- `GET /api/accounts`
  - 返回 mock account status
- `POST /api/reply/generate`
  - 输入：`messageId`
  - 输出：reply candidates
- `POST /api/send`
  - 输入：`messageId + replyText`
  - 输出：mock send success

统一返回结构：

```json
{
  "success": true,
  "data": {},
  "error": null
}
```

也可以在失败时返回：

```json
{
  "success": false,
  "error": "some message"
}
```

#### 8. 页面

请创建以下页面：

##### `/dashboard`

内容包括：

- 简单 summary cards：
  - connected accounts count
  - inbox items count
  - automation level
- 一个小的 “project status” 区域

##### `/inbox`

页面布局建议：

- 左侧：消息列表
- 右侧：选中消息详情 + 回复候选面板

要求：

- 点击某条消息后显示详情
- 点击 “generate replies” 时调用 `/api/reply/generate`
- 显示 2 到 3 条 reply candidates
- 每条 candidate 显示：
  - reply text
  - explanation
  - confidence
- 提供一个文本框，可编辑选中的回复
- 提供一个 mock 的 “send” 按钮

##### `/settings`

内容包括：

- connected account cards
- automation level selector
- persona / style summary
- 明确预留未来 Auth0 / Token Vault 集成的位置说明

#### 9. UI 组件拆分

请创建可复用组件，例如：

- `AppShell`
- `Sidebar` 或 `TopNav`
- `MessageList`
- `MessageListItem`
- `MessageDetail`
- `ReplyCandidateCard`
- `AccountStatusCard`
- `SettingsPanel`

#### 10. 编码风格要求

请遵守以下要求：

- 合理使用 server components / client components
- 保持文件可读性
- 在未来真实接入的位置加清晰注释
- 优先简单清晰，不要搞过重抽象
- 不要引入不必要的库
- 不要到处写 lorem ipsum
- 文案尽量贴合 Pollux 项目
- 变量名尽量真实
- 不要生成错误 import

#### 11. 重要约束

请注意：

- **不要** 实现真实认证
- **不要** 现在做真实数据库写入流程，除非非常必要
- **不要** 实现后台任务
- **不要** 实现 websocket 同步
- **不要** 实现 embeddings / vector search
- **不要** 实现复杂 AI orchestration
- **不要** 把 risk engine 做复杂，只保留 enum + mock label 即可
- 重点是：先把最小骨架做稳

#### 12. 验收标准

完成后，这个项目应满足：

- 本地可运行
- 编译通过
- 能看到 dashboard / inbox / settings 三个页面
- inbox 能显示 Gmail + Slack 的 mock 消息
- 能通过 API 生成 mock reply candidates
- 能模拟 send 成功
- Prisma schema 已经为下一阶段准备好
- 对未来 Auth0 / Gmail / Slack 接入有明确 TODO 标记

#### 13. 输出格式要求

请按以下顺序输出：

1. 先给出最终文件夹树
2. 再按顺序生成关键文件
3. 确保 import 正确
4. 如有需要，补充 package 安装说明
5. 最后给出本地运行命令
6. 如果某个文件较大，请尽量保持简洁但完整

请从以下顺序开始生成：

1. 文件夹树
2. `prisma/schema.prisma`
3. 核心共享 types
4. mock 数据
5. adapter interfaces + mock adapters
6. API routes
7. dashboard / inbox / settings 页面
8. 可复用组件
9. 本地运行说明

如果遇到需要做选择的地方，请优先选择 **最简单、最适合黑客松、最利于后续扩展** 的实现方式。

---