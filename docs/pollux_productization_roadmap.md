# Pollux Productization Roadmap

> 这份文档聚焦 **如果 Pollux 未来要走向产品化**，后期必须补齐或强烈建议补齐的能力。
> 当前项目已经具备可演示的 Gmail 单平台 MVP 闭环；本文不讨论比赛演示优先级，而是站在**真实产品化**角度整理后续建设项。

---

## 1. 当前 MVP 已完成的主链路

当前 Pollux 已具备以下能力：

- Auth0 登录
- Gmail OAuth 连接
- 真实 Gmail 邮件拉取
- OpenAI 候选回复生成（失败时 fallback）
- 真实 Gmail 回复发送
- 基础 inbox 指标、风险规则、筛选、HTML 邮件展示、事件记录

这意味着 Pollux 已经不是“概念 demo”，而是已经完成了一个真实可运行的邮件 copilot MVP。

但如果后续要面向真实用户长期使用，还需要补齐下面这些部分。

---

## 2. 产品化后必须补齐（P0）

这些不是“锦上添花”，而是只要面向真实用户，就迟早必须做。

### 2.1 OAuth / Gmail token 持久化存储

**当前问题**

- 目前 token 仍属于进程内持久化或临时方案
- HMR 场景已缓解，但服务真正重启后连接状态仍会丢失
- 不适合长期使用、多实例部署、线上环境

**必须补齐**

- 建立 `ConnectedAccount` / `OAuthAccount` 表
- 按用户存储：
  - provider
  - access token
  - refresh token
  - expiresAt
  - scope
  - connectedAt / updatedAt
- 对 token 做加密存储
- 设计 token refresh 逻辑
- 支持 disconnect / revoke

**为什么重要**

这是从 demo 走向真实产品的第一步。不解决这一点，Pollux 无法支持稳定连接和长期用户使用。

---

### 2.2 后端以 messageId 为准，减少对前端传入内容的信任

**当前风险**

- 如果生成或发送链路仍部分依赖前端传入的 message body / thread data
- 可能出现前后端不一致、thread 错误、内容被伪造、状态漂移

**必须补齐**

- 前端尽量只传 `messageId` / `threadId`
- 后端在生成或发送前主动读取真实 message detail
- 后端统一决定：
  - subject
  - body
  - threadId
  - references
  - In-Reply-To
  - recipients

**为什么重要**

这是稳定性和安全性的核心。邮件产品不能长期建立在“前端说什么就是什么”之上。

---

### 2.3 发送记录 / 事件日志持久化

**当前问题**

- event log 若仍为内存实现，只适合 demo
- 不能可靠审计，不利于 debug、分析和用户追溯

**必须补齐**

至少持久化：

- inbox_fetched
- message_opened
- reply_generated
- reply_sent
- send_failed
- gmail_connected
- gmail_disconnected
- filter_changed

建议字段：

- eventId
- userId
- provider
- messageId / threadId
- eventType
- timestamp
- metadata(JSON)

**为什么重要**

没有持久化的 history，就没有真正可追踪的产品行为记录。

---

### 2.4 更明确的连接状态与异常状态管理

**当前问题**

用户只看到“connected / disconnected”是不够的。

实际产品里会出现很多灰色状态：

- token expired
- refresh failed
- Gmail temporarily unavailable
- scope missing
- reconnect required
- send failed but inbox still readable

**必须补齐**

定义更完整的连接状态：

- connected
- expired
- reconnect_required
- degraded_read_only
- send_unavailable
- disconnected

并在前端给出明确提示与 CTA。

**为什么重要**

真实用户最怕“看起来连着，但其实不能发 / 不能读”。状态不清晰会极大伤害产品可信度。

---

### 2.5 安全与隐私基础能力

**必须补齐**

- token 加密存储
- 日志脱敏
- 不记录完整 OAuth token
- 不记录完整 Authorization header
- 默认不把整封邮件原文写入普通日志
- 用户断开 Gmail 时真正删除本地 token
- HTML 邮件渲染时防止 XSS
- 外部链接安全处理
- 默认不自动加载远程追踪图片

**为什么重要**

Pollux 处理的是用户真实邮件，属于高敏感场景。即使不是合规级产品，也必须有基本安全边界。

---

## 3. 强烈建议补齐（P1）

这些不是上线第一天必须全部完成，但越早做越好。

### 3.1 Thread 视图与上下文展示

**建议补齐**

- 支持 thread 级展示，不只看单封邮件
- 展示历史往来上下文
- 折叠 quoted text
- 更清楚地区分最新消息与历史引用

**价值**

邮件处理高度依赖上下文。thread 视图会显著提升可用性和专业感。

---

### 3.2 附件下载与基础处理能力

**建议补齐**

- 附件真实下载
- 权限校验
- 常见类型的安全处理
- 附件存在与大小提示
- 后续可再考虑预览

**价值**

现在只有 metadata 还不够。对真实邮件场景，附件是刚需。

---

### 3.3 风险 / 优先级机制升级

**当前问题**

- 规则版 risk 适合 MVP
- 但误判与漏判都会较多

**建议补齐**

- 规则与模型混合判断
- Need Reply / High Risk / Action Required 分层
- 区分“规则信号”和“模型判断”
- 建立 explainability（为什么被判高优先级）

**价值**

这部分会成为 Pollux 真正的智能价值之一。

---

### 3.4 Style card 数据化

**当前问题**

- 若仍为静态 mock，个性化能力不足

**建议补齐**

- style profile 存库
- 用户可编辑 tone / sentence style / banned phrases / signoff
- 不同 persona / 场景模板
- 可考虑基于历史 sent emails 做风格提炼

**价值**

这会让 Pollux 从“会生成回复”进化成“像你自己在写”。

---

### 3.5 可观测性与错误分析

**建议补齐**

- OpenAI generation success rate
- fallback rate
- Gmail fetch success rate
- Gmail send success rate
- 平均生成时延
- Top error reasons

**价值**

产品进入多人使用后，没有观测能力就很难排查问题。

---

## 4. 产品体验层建议（P1/P2）

### 4.1 更完整的 Inbox 信息架构

建议支持：

- All
- Unread
- Needs Reply
- High Risk
- Primary only
- Sent recently / Awaiting response

### 4.2 回复体验增强

建议支持：

- 多候选回复对比
- 一键插入 style preset
- 长度调节（short / normal / detailed）
- 更明确的生成来源提示（AI / fallback）

### 4.3 更清晰的发送结果反馈

发送结果应清楚区分：

- Sent via Gmail
- Sent via fallback/mock sender
- Send failed
- Gmail reconnect required

### 4.4 更好的 HTML 邮件显示策略

建议：

- sanitize 白名单持续维护
- 外链统一安全跳转
- 可选“显示原始 HTML”调试入口
- 远程图片默认关闭，允许用户手动加载

---

## 5. AI 增值能力（P2）

如果产品化继续推进，最值得做的 AI 增值能力不是“再多接几个平台”，而是把现有邮件能力做深。

### 5.1 Digest / Summary / Action Items

建议支持：

- 今日需要回复的邮件摘要
- 高优先级对话摘要
- 待办提取
- Deadline / follow-up 提示

### 5.2 自动建议队列

例如：

- Needs reply today
- Waiting on others
- Escalation needed
- Draft ready for review

### 5.3 风格学习 / 个性化回复增强

长期可做：

- 从历史 sent emails 提炼风格
- 用户确认后逐步调整 style profile
- 场景化风格：同事 / 客户 / 招聘 / 学校 / 合作方

---

## 6. 多平台接入应该放在什么时候

### 不建议过早做的原因

如果 Gmail 单平台都还没完全产品化，多平台通常会带来：

- 更复杂的 adapter 维护成本
- 更分散的 debug 成本
- 每个平台都“半成品”
- 比赛或早期用户阶段收益有限

### 更合理的顺序

建议顺序：

1. 先把 Gmail 单平台做到稳定、可信、可解释
2. 再考虑 Outlook
3. 再考虑 Slack / other channels

**原则：一个平台做深，通常优于多个平台做浅。**

---

## 7. 如果要真正上线给用户试用，最低补齐线

如果未来真的要给真实外部用户试，不一定要做完整 SaaS，但至少建议补齐以下最小集合：

### 最低必需

- Gmail token 持久化
- 发送/生成以后端真实 message detail 为准
- 持久化 send log / event log
- 清晰连接状态与 reconnect 流程
- 基本安全与隐私保护
- 稳定的 HTML 邮件处理
- 真实发送成功/失败反馈

### 上线前强烈建议

- style card 存库
- thread view
- attachment download
- digest / summary
- 基础 metrics / observability

---

## 8. 推荐推进顺序（产品化版本）

### Phase A：基础稳定性

1. Token 持久化到数据库
2. 发送/生成链路以后端 messageId 拉取真实详情为准
3. Event log / send log 持久化
4. 连接状态体系补齐

### Phase B：真实邮件体验

1. Thread view
2. Attachment download
3. HTML 邮件安全渲染增强
4. 更完整的 inbox filters

### Phase C：AI 增值

1. Digest / Summary / Action Items
2. Need Reply queue
3. 更强的风险/优先级机制
4. Style card 数据化与个性化

### Phase D：平台扩展

1. Outlook
2. Slack
3. 统一 inbox / cross-channel workflow

---

## 9. 一句话总结

Pollux 当前已经完成了一个有说服力的 Gmail 单平台 MVP。

如果后续要产品化，最重要的不是马上做更多平台，而是优先补齐：

- **token 持久化**
- **后端可信链路**
- **事件/发送记录持久化**
- **连接状态清晰化**
- **安全与隐私基础能力**

在此基础上，再继续做 thread、附件、digest、style card、优先级机制，Pollux 才会真正从“可演示项目”走向“可长期使用的产品”。
