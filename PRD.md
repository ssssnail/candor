# Candor.Box 产品需求文档

## 1. 产品概述

Candor.Box 是一款匿名反馈收集工具，帮助用户收集匿名的真实反馈。通过生成唯一的反馈链接，任何人都可以在不透露身份的情况下提交反馈。

## 2. 功能模块

### 2.1 首页 `/`
- 生成反馈链接
- 复制链接到剪贴板
- 展示使用说明（三步流程卡片）
- 多语言切换

### 2.2 收件箱 `/inbox`
- 查看所有收到的反馈
- 管理反馈链接（复制、生成新链接）
- 标记反馈为已读
- 未读反馈优先显示（带左侧绿色边框标识）

### 2.3 反馈提交页 `/r/$linkId`
- 填写"最重要的一件事"（主要文本输入）
- 选择团队优点标签（多选）
- 选择改进建议标签（多选）
- 提交后跳转到感谢页面

### 2.4 感谢页 `/thanks/$replyToken`
- 展示已提交的反馈内容
- 查看管理员回复
- 多语言支持

### 2.5 隐私政策 `/privacy`
- 隐私保护说明
- 匿名机制说明

## 3. 数据模型

### 3.1 收件箱 (inboxes)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| owner_token_hash | string | 所有者令牌哈希（SHA256） |
| last_seen_at | timestamp | 最后访问时间 |
| created_at | timestamp | 创建时间 |

### 3.2 反馈链接 (feedback_links)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 主键（短ID） |
| inbox_id | uuid | 关联收件箱 |
| label | string | 链接标签（可选） |
| revoked | boolean | 是否撤销 |
| created_at | timestamp | 创建时间 |

### 3.3 反馈 (feedbacks)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| link_id | string | 关联反馈链接 |
| sanitized_text | text | 反馈内容 |
| reply_token | string | 回复令牌 |
| status | string | 状态（new/read/replied） |
| expires_at | timestamp | 过期时间 |
| created_at | timestamp | 创建时间 |

### 3.4 回复 (replies)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| feedback_id | uuid | 关联反馈 |
| reply_text | text | 回复内容 |
| created_at | timestamp | 创建时间 |

## 4. 技术栈

- **前端框架**：React 19 + TanStack Router
- **样式**：Tailwind CSS 4 + Radix UI 组件库
- **后端**：TanStack Start + Cloudflare Workers
- **数据库**：Supabase（PostgreSQL）
- **国际化**：i18n 多语言支持

## 5. 路由定义

| 路由 | 页面 | 访问控制 |
|------|------|----------|
| / | 首页 | 公开 |
| /inbox | 收件箱 | 需要令牌（localStorage） |
| /r/$linkId | 反馈提交 | 公开 |
| /thanks/$replyToken | 感谢页 | 公开 |
| /privacy | 隐私政策 | 公开 |

## 6. 核心流程

```
1. 生成链接：首页 → 生成链接 → 复制分享
2. 提交反馈：打开链接 → 填写表单 → 提交 → 查看感谢页
3. 管理反馈：收件箱 → 查看反馈 → 标记已读
```

## 7. 安全机制

- 收件箱所有权通过 SHA256 哈希验证
- 反馈链接支持撤销
- 反馈内容经过清理处理
- 无需注册即可使用（基于设备令牌）