# 踩坑总览

这里沉淀 HTSystem 开发中**真实踩过的坑**。每条按统一格式记录，目标是同样的坑绝不踩第二遍。

## 记录格式

复制 [`_template.md`](https://github.com/fuhuitao/htsystemdocs/blob/main/docs/pitfalls/_template.md) 开写（该文件以 `_` 开头，不会被渲染成页面）：

```
### 坑名（一句话）
- 现象：表面症状（报错/卡死/诡异行为）
- 根因：底层原因（越具体越好）
- 解法：当时怎么修的
- 预防：以后怎么避免（工具/约定/检查点）
```

## 目录

| 分类 | 内容 |
| --- | --- |
| [.NET 与测试](dotnet.md) | 并行竞态、测试语义、命名冲突 |
| [前端与工具链](toolchain.md) | SWC 缓存、BOM、ChunkLoadError |
| [数据库](database.md) | 描述生成器、权限、软删除唯一索引 |
| [Windows 环境](windows.md) | PowerShell 版本坑、权限、文件删除 |
| [Git 与部署](git-github.md) | Actions 不触发、billing 锁、代理、凭据改名、历史邮箱重写 |

## 写坑原则

1. **踩完立刻记**——过三天根因就忘了
2. **根因必须到底**——「重启好了」不算解法，要能回答"为什么重启就好了"
3. **预防可执行**——落在工具链/CI/约定上，不落在"下次小心"
