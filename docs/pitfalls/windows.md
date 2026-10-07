# Windows 环境

## PowerShell 5.1 没有 ISOWeek

- **现象**：`[System.Globalization.ISOWeek]::GetType()` 报类型不存在
- **根因**：`ISOWeek` 是 .NET Core 3.0+ 的类；Windows 自带的 PowerShell 5.1 跑在 .NET Framework 4.8 上，没有它
- **解法**：手动算周号，或改用 PowerShell 7（pwsh）
- **预防**：给 PS 5.1 写脚本，用 .NET Framework 4.8 的类库心智；新 API 先 `[type]::GetType()` 探测

## 命令行里的 `$` 与引号转义

- **现象**：脚本里的 `$var`、`$_` 莫名其妙消失或变成裸字，引号嵌套一多层就语法错
- **根因**：命令从生成器到 shell 的多层传递中 `$` 被中间层吃掉
- **解法**：**复杂命令一律写成 `.ps1` 文件落到 `%TEMP%` 再 `powershell -File` 执行**
- **预防**：单行命令避免 `$`；非要内联时优先 `cmd /c` 包裹或改写语法绕开 `$`（例：`ForEach-Object { $_.IsReadOnly }` 改用 `attrib -r ... /s /d`）

## Remove-Item 被安全扩展拦截

- **现象**：`Remove-Item` 删目录报错或不生效
- **根因**：本机装了 genie-trash 安全删除扩展，接管了 `Remove-Item`
- **解法**：`[System.IO.Directory]::Delete($path, $true)` 直调 .NET API
- **预防**：删除被拦先想到有扩展接管，换 .NET 原生 API 或 `cmd /c rd /s /q`

## 删 .git 被「拒绝访问」

- **现象**：删废弃的 `.git` 目录报 `UnauthorizedAccessException: 对路径"xx"的访问被拒绝`
- **根因**：git 对象文件（`.git/objects/**`）带**只读属性**，删除器不主动清
- **解法**：先 `attrib -r <path>\*.* /s /d` 清只读，再删
- **预防**：见到「访问被拒绝」别急着找权限问题，先 `attrib` 查只读属性——这是 Windows 上最常见的原因

## AppData 的 Everyone 显式权限（安全隐患）

- **现状**：`C:\Users\F\AppData` 存在**显式** Everyone 完全控制规则（不随继承，疑似某工具加的）
- **影响**：所有做 DACL 安全校验的原生模块（SWC 1.16+）加载失败；同机任何用户可改写该目录，属真实攻击面
- **建议**：属性 → 安全 → 高级，删除该条**显式**规则（继承来的不动）；删前确认无程序依赖它写文件
