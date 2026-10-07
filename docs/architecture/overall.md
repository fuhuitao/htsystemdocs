# 总体架构

HTSystem 是**物流供应链管理平台**：模块化单体架构，业务域彼此隔离，底座能力统一供给。本文自上而下用四张图描述系统——业务看能力、架构看分层、技术看选型、运维看部署。

**四条架构总原则**

1. **模块化单体**：域与域之间零依赖，任何域未来可独立拆出
2. **底座下沉**：认证、字典、文件、审计等公共能力由平台底座统一提供
3. **数据同源**：所有表描述由实体注释生成，文档与代码永不脱节
4. **架构即测试**：架构规则不是文档约定，是会挂 CI 的自动化测试

---

## 业务架构 · 能力地图

对外呈现的业务能力，非技术人也能看懂：

```mermaid
flowchart TB
    subgraph PLATFORM["HTSystem 物流供应链管理平台"]

        subgraph SRM["供应商关系管理（SRM）"]
            direction LR
            S1["供应商档案<br/>编码唯一 · 全生命周期"]
            S2["联系人 / 银行账户"]
            S3["资质 · 绩效考核"]
            S4["结算记录"]
        end

        subgraph TMS["运输管理（TMS）"]
            direction LR
            T1["车辆管理"]
            T2["司机管理"]
            T3["运输单"]
        end

        subgraph BASE["平台底座（一切业务域的地基）"]
            direction LR
            B1["组织与权限<br/>用户组 · 角色 · 权限码"]
            B2["认证与会话<br/>JWT · 刷新令牌 · 防爆破"]
            B3["数据字典"]
            B4["文件附件"]
            B5["单据编号规则"]
            B6["操作审计日志"]
        end
    end

    SRM ---|"供应商承运运输业务"| TMS
    BASE -.- SRM
    BASE -.- TMS
```

> SRM 与 TMS 通过业务数据（供应商承运）关联，但**代码上互不知晓**——这是模块化的核心价值。

## 应用架构 · 分层视角

经典分层 + 模块化拆分，请求自上而下流动：

```mermaid
flowchart TB
    USER(["用户<br/>浏览器 / 后续 App"])

    subgraph ACCESS["接入层"]
        GW["统一 API 入口<br/>身份认证 · 权限校验 · 请求路由"]
    end

    subgraph APP["应用层（按业务域模块化）"]
        direction LR
        MSRM["供应商域"]
        MTMS["运输域"]
        MSYS["系统管理域"]
        MSRM x--x MTMS
    end

    subgraph DOMAIN["领域层"]
        ENT["业务实体 · 领域规则<br/>软删除 · 雪花 ID · 数据校验"]
    end

    subgraph DATA["数据层"]
        direction LR
        REPO["统一仓储<br/>全局软删除过滤"]
        STORE[("SQL Server<br/>DB_ERP")]
    end

    subgraph CROSS["横切关注（贯穿所有层）"]
        direction LR
        AUTH["认证授权"]
        CACHE["缓存"]
        LOG["结构化日志"]
        AUDIT["操作审计"]
    end

    USER --> GW
    GW --> MSRM
    GW --> MTMS
    GW --> MSYS
    MSRM & MTMS & MSYS --> ENT
    ENT --> REPO --> STORE
    CROSS -.- ACCESS
```

> 图中 `x---x` 表示**禁止依赖**：域与域之间只能通过底座共享能力协作。

## 技术架构 · 技术栈全景

```mermaid
flowchart LR
    subgraph FRONT["前端"]
        F1["React SPA"]
        F2["pnpm 工作区"]
    end
    subgraph BACK["后端"]
        K1["ASP.NET Core 10"]
        K2["模块化单体"]
        K3["SqlSugar ORM"]
    end
    subgraph INFRA["基础设施"]
        I1[("SQL Server")]
        I2[("Redis 缓存")]
        I3[("Seq 日志")]
    end
    subgraph QUALITY["质量与交付"]
        Q1["xUnit 单元测试"]
        Q2["架构守卫测试"]
        Q3["lefthook 提交钩子"]
        Q4["Jenkins 流水线"]
        Q5["Docker 镜像"]
    end
    FRONT -- "HTTP · JSON · JWT" --> BACK
    BACK --> INFRA
    QUALITY -.-> BACK
```

| 层 | 选型 | 一句话理由 |
| --- | --- | --- |
| 前端 | React SPA | 组件化 + 生态成熟，后续移动端可复用接口层 |
| 后端 | ASP.NET Core 10 | 模块化单体能吃到单体开发效率，又保留拆分余地 |
| ORM | SqlSugar | 仓储模式封装，软删除全局过滤一处生效 |
| 主键 | YitId 雪花 ID | 趋势递增、分库友好、不暴露业务计数 |
| 缓存 | Redis | 登录防护计数、热点字典 |
| 日志 | Serilog → Seq | 结构化查询，异步写入不拖请求 |
| 数据库 | SQL Server | 过滤索引支撑「唯一 + 软删除」并存 |

## 部署架构

```mermaid
flowchart TB
    USER(["用户浏览器"])

    subgraph HOST["应用服务器（Linux · Docker）"]
        WEB["静态前端<br/>Nginx 托管"]
        API["WebAPI 容器<br/>Serilog 异步日志"]
    end

    subgraph SUPPORT["支撑设施"]
        DB[("SQL Server")]
        REDIS[("Redis")]
        SEQ[("Seq")]
    end

    CI["Jenkins 流水线<br/>构建 · 测试 · 打镜像"]

    USER --> WEB
    WEB -- "API 请求" --> API
    API --> DB
    API --> REDIS
    API -. "日志流" .-> SEQ
    CI == "部署" ==> HOST
```

> 质量门禁在流水线上：架构守卫测试不过 → 不出镜像；单元测试不过 → 不部署。

---

## 从抽象到代码

| 想了解 | 去哪 |
| --- | --- |
| 分层怎么落到具体项目与依赖规则 | [模块与代码结构](modules.md) |
| 登录、令牌、权限的完整流程 | [认证与授权](auth.md) |
| 24 张表的关系与设计约定 | [数据模型](data-model.md) |
