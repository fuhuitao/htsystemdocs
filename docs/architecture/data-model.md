# 数据模型

24 张表 = 基础平台 `Base_*` 13 张 + 供应商 `Srm_*` 7 张 + 运输 `Tms_*` 3 张 + 刷新令牌 1 张。所有表统一软删除三件套（`IsDeleted` / `DeletedAt` / `DeletedBy`）与 YitId 主键。

## 权限体系（RBAC）

```mermaid
erDiagram
    Base_User ||--o{ Base_UserUserGroupRelation : "加入"
    Base_UserGroup ||--o{ Base_UserUserGroupRelation : "收录成员"
    Base_UserGroup ||--o{ Base_UserGroupRoleRelation : "授予"
    Base_Role ||--o{ Base_UserGroupRoleRelation : "绑定"
    Base_Role ||--o{ Base_RolePermissionRelation : "拥有"
    Base_Permission ||--o{ Base_RolePermissionRelation : "分配"
    Base_User ||--o{ Base_RefreshToken : "持有（哈希落库）"

    Base_User {
        bigint Id PK
        string UserName "登录名"
        string PasswordHash
        bit IsSuper "超级管理员短路"
    }
    Base_UserGroup {
        bigint Id PK
        string Name
    }
    Base_Role {
        bigint Id PK
        string Name
    }
    Base_Permission {
        bigint Id PK
        string Code "权限码·随SQL脚本演进"
    }
    Base_RefreshToken {
        bigint Id PK
        string TokenHash "SHA256"
        datetime ExpiresAt
        bit IsRevoked
    }
```

## 供应商（SRM）

主表 + 六张子表，子表全部以 `SupplierId` 回联主表：

```mermaid
erDiagram
    Srm_Supplier ||--o{ Srm_SupplierContact : "联系人"
    Srm_Supplier ||--o{ Srm_SupplierBank : "银行账户"
    Srm_Supplier ||--o{ Srm_SupplierBusiness : "营业执照等资质"
    Srm_Supplier ||--o{ Srm_SupplierExtra : "扩充信息"
    Srm_Supplier ||--o{ Srm_SupplierPerformance : "绩效记录"
    Srm_Supplier ||--o{ Srm_SupplierSettlement : "结算记录"

    Srm_Supplier {
        bigint Id PK
        string Code "编码·唯一（仅约束未删除记录）"
        string Name
    }
```

- 供应商编码唯一索引带软删除过滤：删除重建同编码不冲突
- `BatchSaveAsync` 是**更新语义**：按 `Id` 找不到即抛「供应商不存在」

## 运输（TMS）

```mermaid
erDiagram
    Tms_Vehicle ||--o{ Tms_LogisticsOrder : "承运"
    Tms_Driver ||--o{ Tms_LogisticsOrder : "驾驶"

    Tms_Vehicle {
        bigint Id PK
        string PlateNo "车牌"
    }
    Tms_Driver {
        bigint Id PK
        string Name
    }
    Tms_LogisticsOrder {
        bigint Id PK
        string OrderNo
    }
```

## 基础平台其余各表

| 表 | 用途 |
| --- | --- |
| `Base_DictType` / `Base_DictItem` | 字典两件套，类型约束取值 |
| `Base_File` | 附件元数据 |
| `Base_NumberRule` | 单据编号规则 |
| `Base_OperationLog` | 操作日志（带索引与清理策略） |
| `Base_AppClient` | 接入客户端注册 |

## MS_Description 约定

数据库列描述 = 实体 XML 注释 `summary` **首行**（`db/gen-descriptions.ps1` 生成）：

- 首行：简洁名词短语，不带句号、不重复表名
- 引用其它表必须写 `<para>`（首行 `<see>` 会被生成器清空）
- 字典引用统一「字典 xxx」格式；枚举含义统一「0xx 1xx」
