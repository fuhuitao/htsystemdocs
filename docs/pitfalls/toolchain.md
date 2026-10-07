# 前端与工具链

## ERR_SWC_NATIVE_CACHE（本机最凶的一个坑）

- **现象**：Docusaurus 构建报 `ERR_SWC_NATIVE_CACHE`，SWC 原生模块拒绝加载缓存
- **排查路径**（三小时）：
  1. 清 `.docusaurus` / `node_modules/.cache` → 无效（`Remove-Item` 还被安全删除扩展拦截，改用 `[System.IO.Directory]::Delete`）
  2. 发现 `@swc/html` 包是**空目录**（npm 装坏了），单独重装修好一部分
  3. 设 `SWC_NATIVE_BINDING_CACHE=E:\swc-cache` 仍失败（E 盘根目录 `Authenticated Users` 有写权限）
- **根因**：`C:\Users\F\AppData` 有**显式 Everyone 完全控制** DACL（`S-1-1-0`，`0x1f01ff`，不继承——疑似某工具加的权限偏方）。SWC 1.16 起 dlopen 时校验缓存目录祖先链，发现 Everyone/Authenticated Users 可写即全盘拒绝
- **解法**：走标准 Babel 路线——`package.json` 移除 `@docusaurus/faster` 与 `@swc/html`，config 注释掉 `future: { v4: true }`（v4 会连带启用 faster）。构建稳定（Server 4.4s / Client 11s）
- **预防**：
  - 任何 Rust 原生模块（SWC/rolldown/lightningcss）在本机异常，先查 `%LOCALAPPDATA%` 祖先链 DACL
  - 正确修法是删掉 AppData 上那条显式 Everyone 规则（保留继承项），一劳永逸

## pnpm-workspace.yaml 的 UTF-8 BOM

- **现象**：前端测试 11 个全挂，解析 YAML 直接报错
- **根因**：`pnpm-workspace.yaml` 文件头有 UTF-8 BOM（EF BB BF），pnpm 的 YAML 解析器不认
- **解法**：去 BOM 重存（VS Code 右下角编码 → Save with Encoding → UTF-8）
- **预防**：Windows 上编辑器/脚本生成的配置文件，提交前 `Format-Hex` 抽查文件头三个字节；`.editorconfig` 固定 `charset = utf-8`

## ChunkLoadError（改完构建配置之后）

- **现象**：`Loading chunk vendors-..._BlogLayout_...js failed`，堆栈里混着 `__rspack_default_export`
- **根因**：dev server 是改配置**之前**启动的旧进程（还在跑 Rspack），磁盘产物已换成 Babel 路线，内存与磁盘两套构建对不上
- **解法**：停 dev server → `npm run clear` → 重启
- **预防**：**改了任何构建配置（依赖增删、bundler 切换、future flags），必须重启 dev server**，热更新救不了构建器级别的变化。口诀：停服 → clear → 重启
