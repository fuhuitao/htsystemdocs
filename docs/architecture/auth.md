# 认证与授权

## 登录流程

失败计数达到阈值（3 次）后强制验证码，防止在线爆破：

```mermaid
sequenceDiagram
    autonumber
    participant B as 浏览器
    participant A as WebAPI
    participant C as Redis/缓存
    participant D as SQL Server

    B->>A: 登录（账号 · 密码 · 验证码?）
    alt 已连续失败 ≥ 3 次
        A->>C: 校验验证码答案
        A--xB: 验证码错误 → 终止
    end
    A->>D: 校验密码（哈希比对）
    alt 密码错误
        A->>C: 失败计数 +1
        A--xB: 连续登录失败次数过多
    else 密码正确
        A->>C: 清零失败计数
        A->>D: 写入 RefreshToken（SHA256 哈希落库）
        A--xB: AccessToken + RefreshToken
    end
```

要点：

- **RefreshToken 落库只存 SHA256 哈希**——库被拖也无法重放令牌
- 密码错误与验证码错误的文案**不泄露对方哪一步失败**
- 失败计数按用户名隔离，成功登录即清零

## 刷新令牌

```mermaid
sequenceDiagram
    autonumber
    participant B as 浏览器
    participant A as WebAPI
    participant D as SQL Server

    B->>A: 刷新（RefreshToken）
    A->>D: SHA256 后查库
    alt 不存在 / 已过期 / 已撤销
        A--xB: 401 → 重新登录
    else 有效
        A->>D: 旧令牌标记已用（旋转）
        A->>D: 写入新 RefreshToken 哈希
        A--xB: 新 AccessToken + 新 RefreshToken
    end
```

- **旋转语义**：每次刷新签发新 RefreshToken，旧的立即作废
- **连坐撤销**：修改密码等敏感操作会撤销该用户全部 RefreshToken

## 权限聚合

权限 = 用户所有用户组下挂角色的权限并集；`super` 超级管理员短路放行：

```mermaid
flowchart LR
    U["Base_User<br/>用户"] --> R1["Base_UserUserGroupRelation"]
    R1 --> G["Base_UserGroup<br/>用户组"]
    G --> R2["Base_UserGroupRoleRelation"]
    R2 --> RO["Base_Role<br/>角色"]
    RO --> R3["Base_RolePermissionRelation"]
    R3 --> P["Base_Permission<br/>权限码"]

    P --> AGG["聚合：并集去重"]
    SUPER{"isSuper?"} -- 是 --> PASS["直接放行"]
    SUPER -- 否 --> AGG
    AGG --> APIQ["API 鉴权点校验"]
```

- 权限码挂角色，角色挂用户组，用户进组——**用户不直接挂角色**，便于批量授权
- 聚合结果做去重，避免多组重叠权限重复计数
- 测试覆盖：组间传递、并集去重、super 放行（`UserPermissionTests`，8 例）
