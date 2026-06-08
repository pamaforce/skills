# 沙箱管理

本页用于指导如何使用 `vefaas sandbox` 管理沙箱应用和沙箱实例。重点是理解“预热镜像 -> 沙箱应用 -> 沙箱实例”的流程；具体参数以 `vefaas sandbox <command> --help` 为准。

## Sandbox 模型

沙箱是一种特殊/定制的函数。它的 Function、Revision、Instance 模型和普通函数类似，但创建和运行方式不同：

- **Sandbox application**：沙箱应用，本质上是 `FunctionType=sandbox` 的函数资源，用来定义镜像、启动命令、端口、环境变量、资源规格和发布版本。
- **Sandbox revision**：沙箱应用的镜像和配置版本。修改镜像、启动命令、端口、环境变量或资源规格后，需要发布 revision 才会影响后续实例。
- **Sandbox instance**：从沙箱应用主动创建出来的隔离运行实体。它不是由请求流量自动扩缩容出来的普通函数实例。
- **预热镜像**：沙箱必须基于已预热镜像创建，预热后才能达到秒级拉起实例的效果。

沙箱主要面向代码沙箱、浏览器/计算机沙箱、模型评测、临时隔离执行环境等场景。用户要的是部署网站/API 或普通函数动态扩缩容时，不要走沙箱工作流。

## 常见使用流程

### 1. 选择或预热镜像

创建沙箱应用前，必须先确认可用镜像。公共镜像可以按 image type / image group 选择；私有镜像需要先预热，预热成功后再用于创建沙箱应用。

常用入口是 `vefaas sandbox images`、`vefaas sandbox images list`、`vefaas sandbox images groups` 和 `vefaas sandbox images precache`。不确定镜像参数时，先看 `vefaas sandbox images --help`，不要直接用未预热镜像创建沙箱应用。

### 2. 创建沙箱应用

沙箱应用定义一类可反复拉起的运行环境。创建时需要确认镜像、启动命令、监听端口、CPU/内存、并发、超时、环境变量、IAM role、项目和标签等配置。

用 `vefaas sandbox create` 创建沙箱应用。创建后先用 `vefaas sandbox info` 确认应用 ID、镜像、命令、端口和 runtime 信息。后续所有实例操作都要使用 sandbox application ID。

### 3. 更新配置并发布 Revision

沙箱应用的配置和镜像变化会形成新的版本语义。修改应用级配置时，用 `vefaas sandbox config` 或 `vefaas deploy --sandboxId`，然后用 `vefaas sandbox release` 发布新 revision。

发布前确认变更是否会影响后续新建实例。已存在实例是否受影响取决于平台行为和实例状态；不要默认所有运行中实例都会自动切换到新 revision。

### 4. 主动创建沙箱实例

沙箱实例需要主动创建，适合一次任务、一次会话或一次评测运行环境。创建实例时可以按需覆盖超时、CPU/内存、并发、请求超时、环境变量、metadata、session，必要时也可以覆盖实例镜像、命令和端口。

用 `vefaas sandbox instance create` 创建实例，用 `vefaas sandbox instance list` / `describe` 确认实例状态。sandbox application ID 和 instance name/ID 不是同一个概念，不能混用。

### 5. 访问特定实例

沙箱应用下的多个实例通常共享访问域名。访问特定实例时，可使用 `x-faas-instance-name` 请求头或 `faasInstanceName` 查询参数定位实例。

如果需要为沙箱对外提供 HTTP 访问入口，需要确认沙箱应用的触发器和 APIG 资源配置。遇到 APIG 权限不足时，常见原因是 SSO 登录权限域不足，可提示用户切换 AK/SK 登录或到 Web 控制台操作。

### 6. 管理实例生命周期

沙箱实例生命周期可显式管理：

- **pause/resume**：暂停和恢复实例，适合临时保留状态但停止运行的场景。
- **timeout**：查询或调整实例过期时间，适合长任务或会话续期。
- **kill**：销毁实例，属于高风险操作，必须确认 sandbox application ID 和 instance name。
- **webshell/logs**：进入实例或查看日志，用于调试运行环境和任务问题。

实例管理类操作前，先用 `vefaas sandbox instance list` 确认目标实例；不要凭用户口述的名称直接 pause、resume 或 kill。

### 7. 排障顺序

沙箱创建、访问或执行失败时，按下面顺序排查：

1. 确认镜像是否已预热成功，image ID / image URL 是否匹配。
2. 用 `vefaas sandbox info` 检查沙箱应用的镜像、启动命令、端口、资源和 revision。
3. 用 `vefaas sandbox instance list` / `describe` 检查实例状态。
4. 通过实例日志或 WebShell 排查启动失败、端口错误、依赖缺失、权限或业务逻辑问题。
5. 必要时更新沙箱应用配置并发布新 revision，再创建新实例验证。

删除沙箱应用、删除镜像、kill/pause/resume 实例都可能影响正在运行的任务，执行前必须确认资源 ID 和用户意图。
