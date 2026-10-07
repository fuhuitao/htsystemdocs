# .NET 与测试

## YitId 静态初始化竞态（7 个测试同时炸）

- **现象**：`YitIdHelper.NextId()` 抛 NullReferenceException，单独跑全绿，全量跑必挂 7 个
- **根因**：xUnit **类级并行**下，用 `Interlocked.CompareExchange` 做"跳过式初始化"存在窗口期——线程 A 正在执行 `SetIdGenerator` 还没完成，线程 B 已通过检查直接调 `NextId()`，内部状态未就绪
- **解法**：改为 `lock` + 双检屏障：

```csharp
private static readonly object YitGate = new();
private static bool _yitReady;

static void EnsureYitId()
{
    if (_yitReady) return;
    lock (YitGate)
    {
        if (_yitReady) return;
        YitIdHelper.SetIdGenerator(new YitIdGeneratorOptions(workerId: 1));
        _yitReady = true;
    }
}
```

- **预防**：任何"进程级单次初始化"遇到并行测试，一律 lock 双检，不用 Interlocked 跳过式

## 测试用例撞上验证码门槛

- **现象**：断言期望「密码错误」，实际返回「验证码错误」
- **根因**：登录失败计数阈值是 3；用例预置 `failedCount: 4` 时已**越过**验证码门槛，请求在校验密码前先被验证码拦截
- **解法**：预置验证码答案（`PresetCaptchaAsync("alice", 42)` + 请求带 `captcha: "42"`），才能走到密码判定分支
- **预防**：写涉及状态门槛的用例，先画清「请求会依次经过哪些闸门」，预置数据要让目标分支可达

## BatchSaveAsync 是更新语义

- **现象**：两个"新建供应商通过"用例失败，`Assert.Null(ex)` 不成立
- **根因**：`BatchSaveAsync` 按 `Id` 走 `GetByIdAsync`，找不到直接抛「供应商不存在」——它**只更新不新建**
- **解法**：用例改为先 `Save("S1", ...)` 建数据再 `BatchSave` 更新；类注释同步写明语义
- **预防**：给服务方法写测试前，先确认它的真实语义（新建/更新/upsert 三者天差地别）；语义模糊的方法值得改名

## 缓存接口命名冲突

- **现象**：`HTSystem.Core` 的 `ICacheService` 与 SqlSugar 自带的 `ICacheService` 在 UnitTests 里同时可见，编译歧义
- **根因**：SqlSugar 仓储引用链带进了它自己的 `ICacheService`
- **解法**：using 别名区分（`using CoreCacheService = HTSystem.Core.ICacheService;`）
- **预防**：自研基础设施接口取名时先搜一遍依赖包元数据，撞名概率高的名字（Cache/Log/Context）加项目前缀或换词

## 测试基建选型：手写 Fakes 而非 mock 库

- **背景**：服务类方法非 `virtual`，Moq/NSubstitute 无法拦截
- **决策**：零 mock 库依赖，手写 `FakeRepository` / `FakeCache` / `FakeJwtTokenService`（内存字典实现），配 `TenantManager` 的测试替身（抛 `NotSupportedException` 兜底）
- **收益**：84 用例无一行 mock 配置代码；Fake 即文档，新人读 Fake 就懂接口契约
- **代价**：接口新增成员时 Fake 要跟着补——但这恰好强制审视新成员的设计
