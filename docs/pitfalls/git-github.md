# Git 与部署

文档站上线 GitHub Pages 全过程踩的坑。共性：**每个坑的表面症状都不指向真凶**，靠对照实验才定位到。

## 新仓库首次 push 不触发 Actions

- **现象**：push 成功、workflow 文件已注册（API 查 `state: active`）、默认分支也对，但 Actions 页面一条 run 都不出现
- **排查路径**：等 4 分钟重查（排除缓存）→ 匿名 API + 认证 API 对照（排除权限）→ 确认是 push 事件根本没触发
- **根因**：GitHub 平台偶发行为——**新仓库首次 push 且同时新增 workflow 文件**时，该次 push 事件有时不派发 workflow
- **解法**：推一个空提交强制触发（此时 workflow 已注册，必定响应）：
  ```bash
  git commit --allow-empty -m "ci: trigger initial deploy"
  git push
  ```
  或用 API 手动触发（返回 `202` 即成功，还能顺带验证 workflow 文件有效性——`422` = 文件无效，`403` = 权限问题）：
  ```powershell
  Invoke-RestMethod -Method Post 'https://api.github.com/repos/<owner>/<repo>/actions/workflows/deploy.yml/dispatches' `
    -Body '{"ref":"main"}' -Headers @{ Authorization = 'Bearer <token>'; Accept = 'application/vnd.github+json' }
  ```
- **预防**：新仓库首次部署后盯着 Actions 页 2 分钟，无 run 就主动 dispatch，不干等

## Actions「三无声」的真凶是账号 billing 锁定

- **现象**：run 能创建了但 job 永远 queued 不启动；点开日志 404；`runs` API 诡异（workflow 有效却查不到 run）
- **根因**：GitHub 账号因 billing 问题（支付失败/plan 争议）被**锁定 Actions**——上面三种静默表现全是锁的症状，跟 workflow 写法无关
- **解法**：Settings → Billing 处理欠费/争议，解锁后 Actions 立即恢复，workflow 一个字不用改
- **预防**：遇到「三无声」（job 不动、日志 404、API 查空）先查账号 billing 状态，再怀疑 workflow；期间的部署可以本地 `npm run deploy` 直推 gh-pages 顶上（记得 `$env:GIT_USER='<用户名>'`）

## git 连不上 github.com，浏览器却正常

- **现象**：`git push` 报 `Failed to connect to github.com:443`，同一时刻浏览器开 GitHub 完全正常
- **排查路径**（三步定位）：
  1. `Test-NetConnection github.com -Port 443` → False；`Test-NetConnection api.github.com -Port 443` → True（分裂结果说明不是全网断）
  2. `Invoke-WebRequest https://github.com` → HTTP 200（网页栈通！）
  3. 查系统代理：`Get-ItemProperty 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings'` → `ProxyEnable=1, ProxyServer=127.0.0.1:7897`
- **根因**：本机代理（Clash 系，`127.0.0.1:7897`）只对走系统代理的应用生效；浏览器/Invoke-WebRequest 走代理，**git 默认裸连**，而直连 GitHub 的 IP 被间歇阻断
- **解法**：给 git 配**仅 github.com** 的代理（不影响公司内网 git）：
  ```bash
  git config --global http.https://github.com.proxy http://127.0.0.1:7897
  ```
- **预防**：「git 连不上但浏览器正常」≈ 代理只罩住了浏览器。按上面三步走 10 分钟内定位

## GitHub 改名后，本地凭据还是旧账号

- **现象**：GitHub 用户名已改（如 `Eliaukufgnix → fuhuitao`），但 GCM 取出的凭据 `username` 还是旧名
- **根因**：凭据是改名前 OAuth 授权存的。token 绑定的是**账号本身**而非用户名，GitHub 对旧名自动重定向，所以一直能用——但凭据管理器里的条目名、显示身份全是旧名，还会越积越多（一个主条目 + 带用户名的旧格式条目 + VS 扩展残留条目）
- **解法**：
  1. 删光旧条目：`cmdkey /delete:"git:https://github.com"` 等
  2. 条目名**带空格**的（如 `GitHub for Visual Studio - …`）cmdkey 解析不了，用 Windows API 删：
     ```powershell
     $sig = '[DllImport("advapi32.dll", CharSet=CharSet.Unicode)] public static extern bool CredDelete(string t, int type, int flags);'
     ([Add-Type -MemberDefinition $sig -Name CredDel -Namespace Win32 -PassThru)::CredDelete('<条目全名>', 1, 0)
     ```
  3. `git push` 一次触发重新授权（浏览器弹窗，用新名登录），验证：`git credential fill` 输入 `protocol=https\nhost=github.com\n`（**必须以空行结尾**，且 PowerShell 管道会吃换行，要用文件重定向喂 stdin）
- **预防**：改 GitHub 用户名后顺手重置 GCM 凭据，别让新旧条目并存

## 历史提交署名邮箱错了（已推送）

- **现象**：个人仓库全部提交显示的是公司邮箱——git 全局 `user.email` 是工作邮箱，个人项目忘了单独配
- **解法**：
  1. 先改增量：仓库级配置覆盖全局（工作项目不受影响）
     ```bash
     git config user.email huitao.fu@gmail.com   # 只对本仓库生效
     ```
  2. 再改存量：`filter-branch` 全量重写
     ```bash
     FILTER_BRANCH_SQUELCH_WARNING=1 git filter-branch --env-filter '
       if [ "$GIT_AUTHOR_EMAIL" = "旧邮箱" ]; then GIT_AUTHOR_EMAIL="新邮箱"; fi
       if [ "$GIT_COMMITTER_EMAIL" = "旧邮箱" ]; then GIT_COMMITTER_EMAIL="新邮箱"; fi' -- --all
     ```
  3. 收尾三件：**标签重打**（filter-branch 不自动更新 tag：`git tag -f v2026.41.0 <新SHA>`）、清备份引用（`git for-each-ref refs/original/` 逐个 `update-ref -d`）、force push（`git push --force origin main gh-pages v2026.41.0`）
- **注意**：force push 后旧提交对象在 GitHub 侧仍可通过旧 SHA 静默访问（平台保留机制），正常浏览不会出现；想物理清除需联系 Support。另外提交要关联头像，邮箱必须已在账号 Settings → Emails 绑定
- **预防**：个人仓库初始化第一件事就是配仓库级邮箱；定期体检一条命令：`git log --all --format='%ae' | sort -u`
