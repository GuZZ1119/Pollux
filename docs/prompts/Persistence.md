## 阶段 7：Persistence / Reliability Hardening（规划稿）

**状态：🟡 规划中**  
**目标：** 将 Pollux 从“可演示的单实例 MVP”推进到“更稳定、可持续使用的产品原型”，重点解决当前内存存储、服务重启丢失、前后端一致性不足等问题。

---

### 7.1 为什么现在需要做持久化

当前 Pollux 已经具备较完整的主链路：

- Auth0 登录
- Gmail 连接
- 真实 Inbox 拉取
- AI 候选回复生成
- 真实 Gmail 发送
- Daily Brief
- Style Personalization V1

但目前仍有较明显的 demo 型技术债：

- Gmail token 仍然是 `globalThis` / in-memory 存储
- 用户风格 profile 仍然是 `globalThis` / in-memory 存储
- 服务重启后连接状态和风格学习结果会丢失
- reply / send 仍有部分字段依赖前端传入，而不是后端基于 messageId 自己拉真实数据
- 用户编辑后的最终发送文本尚未形成长期可积累的数据资产

因此，下一步需要先做 **持久化与可靠性补强**，而不是立刻扩展多平台。

---

### 7.2 本阶段核心目标

本阶段聚焦四件事：

1. **把关键状态从进程内存迁移到数据库**
2. **建立可持续积累的发送 / 风格反馈数据**
3. **提高 reply / send 的后端一致性与安全性**
4. **为后续“越来越像用户本人”的闭环打基础**

---

### 7.3 持久化范围

#### 7.3.1 Gmail Token 持久化

当前问题：
- Gmail OAuth token 保存在进程内存中
- 服务重启后用户需要重新连接 Gmail
- 不适合长期使用，也不适合未来多实例部署

目标：
- 将 Gmail token 从 `token-store` 迁移到数据库
- 支持按 userId 持久化保存
- 支持 access token 更新后的回写
- 保证服务重启后 Gmail 连接状态仍可恢复

建议持久化内容：
- access token
- refresh token
- expiry / token metadata
- provider account info（如 Gmail account email）
- updatedAt

---

#### 7.3.2 Style Profile 持久化

当前问题：
- `UserStyleProfile` 目前保存在 `style-store` 的 globalThis 内存中
- 服务重启后风格配置丢失
- 无法形成长期可复用的个性化资产

目标：
- 将用户风格 profile 迁移到数据库
- 支持持久化：
  - StyleCard
  - StyleExample
  - guardrails
  - source
  - exampleCount
  - updatedAt

建议结果：
- 用户学过一次风格后，后续登录仍然可直接使用
- Gmail Sent 学习 / 上传样本 / 粘贴样本 / preset 的结果都能长期保留
- 后续可支持“重新学习”“清空重建”“混合来源更新”

---

#### 7.3.3 SendLog 持久化

当前问题：
- 候选回复与最终发送结果没有形成完整的长期记录
- 用户编辑行为无法反哺风格学习
- 难以形成后续 personalized learning 的数据基础

目标：
- 对每次发送动作记录完整 send log
- 为后续风格优化、行为分析、产品数据积累做准备

建议记录内容：
- userId
- provider
- source messageId / threadId
- 原始 incoming message 的关键 metadata
- 生成的候选回复（至少保留被选中的版本）
- 用户最终发送文本
- 是否经过明显编辑
- style source / style snapshot
- sendChannel（gmail / mock / future providers）
- sentAt

产品意义：
- 为后续“learning from sent edits”提供基础数据
- 能解释系统是如何逐渐学会用户风格的
- 方便后续做 style feedback loop

---

### 7.4 后端一致性补强

#### 7.4.1 Reply Generate 后端以 messageId 为主

当前问题：
- `/api/reply/generate` 仍可能依赖前端传来的 `content / sender / subject / provider`
- 前后端字段可能不一致
- 理论上存在被前端篡改或传错的风险

目标：
- 后端在生成回复时，尽量基于 `messageId` 自己读取真实消息详情
- 前端只传最必要的标识信息
- 由后端统一组织 prompt 输入

预期效果：
- reply generation 更一致
- 风格学习与消息上下文更可信
- 降低前端传值导致的错配问题

---

#### 7.4.2 Send 后端以 messageId 为主

当前问题：
- `/api/send` 当前可能仍接受部分前端透传字段
- 后续会影响 threading、发送一致性和安全性

目标：
- send 时由后端根据 `messageId` 自己读取原始消息详情
- 统一确定：
  - threadId
  - recipient
  - subject
  - headers / reply context
- 尽量减少对前端直接传入 message metadata 的依赖

预期效果：
- 发送更可靠
- threading 更稳定
- 后端逻辑更闭环

---

### 7.5 生命周期与管理能力

在风格与连接状态持久化后，建议逐步增加最基本的 lifecycle 管理能力：

#### 风格侧
- 查看当前风格来源（gmail_sent / manual_samples / preset / mixed）
- 查看最后更新时间
- 重新学习风格
- 清空并重建风格
- 合并不同来源的样本

#### 连接侧
- 查看 Gmail 连接状态
- 显示连接邮箱
- 支持重新连接 / 断开连接
- 明确 token 失效后的恢复路径

---

### 7.6 实现原则

本阶段仍然保持“最小改动、最大稳定性提升”的原则，不做大重构。

原则包括：

- 优先复用现有 Prisma / API route / service 结构
- 不引入复杂基础设施作为前置条件
- 不因为持久化而打断现有主链路
- 先保证单实例 + 本地开发稳定
- 为未来多实例 / 更正式部署预留空间

---

### 7.7 建议优先级

#### 第一优先级
1. Gmail token 持久化到数据库
2. UserStyleProfile 持久化到数据库
3. SendLog 持久化

#### 第二优先级
4. `/api/reply/generate` 改为以后端 messageId 拉真实详情
5. `/api/send` 改为以后端 messageId 拉真实详情

#### 第三优先级
6. 补充风格与连接状态的 lifecycle 管理
7. 为后续 style feedback loop 留接口

---

### 7.8 本阶段明确不包含的内容

以下内容不作为本阶段重点：

- ❌ 多平台扩展（Outlook / QQ Mail / 飞书等）
- ❌ LoRA / fine-tuning
- ❌ 向量数据库
- ❌ 复杂后台任务系统
- ❌ 自动化风格训练流水线
- ❌ 大规模行为分析面板

本阶段的目标不是“做更多功能”，而是让现有功能更稳、更可持续积累。

---

### 7.9 完成后的预期效果

当本阶段完成后，Pollux 应达到以下状态：

- 服务重启后 Gmail 连接不丢失
- 服务重启后用户风格配置不丢失
- 用户发送行为形成长期可积累的 send log
- reply / send 链路更依赖后端真实 messageId，而不是前端透传字段
- 后续“learning from sent edits”具备可落地的数据基础
- 产品从 hackathon demo 更进一步接近真实可持续产品