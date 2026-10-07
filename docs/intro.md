---
sidebar_position: 0
---

# 系统概览

HTSystem 是一套物流供应链管理系统，采用前后端分离架构：

| 层 | 技术栈 |
| --- | --- |
| 后端 | .NET 10 + SqlSugar（DDD 分层，架构守卫测试约束） |
| 前端 | Vue 3 + Element Plus（vben-admin 5 框架） |
| 数据库 | SQL Server（多库：DB_BASE / DB_ERP / …，软删除 + 全局过滤） |
| 部署 | Jenkins CI + systemd（Linux） |

## 功能模块

- **系统底座（Core）**：认证（JWT + 刷新令牌 + 登录防护）、RBAC 权限（用户 / 角色 / 用户组 / 菜单）、数据字典、文件管理、发号规则、操作日志、开放接口对接方
- **供应商管理（SRM）**：供应商档案（联系人 / 银行账户 / 结算 / 业务 / 绩效等子表）
- **运输管理（TMS）**：物流订单、车辆、司机，及面向对接方的开放接口

## 文档导航

- [版本号规范](/docs/dev/versioning) —— 版本如何命名、如何在 git 与更新日志中体现
- [更新日志](/blog) —— 每周一个小版本的发布记录

> 本文档站使用 [Docusaurus](https://docusaurus.io/) 构建。
