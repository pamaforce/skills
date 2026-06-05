# 函数管理

本页用于指导如何使用 `vefaas fn` 管理函数。重点是理解函数类型、代码形态和常见生命周期；具体参数以 `vefaas fn <command> --help` 为准。

## Function 模型

函数是 veFaaS（函数服务）的核心资源，承载代码或镜像、运行时、启动命令、端口、环境变量、CPU/内存、并发、超时、触发器、版本、实例、日志和监控。

- **Function**：函数资源本身，是用户主要创建和管理的对象。
- **Revision**：函数代码/镜像和配置形成的版本快照，发布、回滚围绕 revision 展开。
- **Instance**：运行 revision 的实际执行单元，普通函数实例通常由平台按请求流量和扩缩容策略动态创建或回收。
- **策略**：函数可以配置实例上下限、预留实例、定时/弹性扩缩容等策略；CLI 高阶命令只覆盖部分能力，复杂策略先查 help 或 OpenAPI 参数结构。

## 函数类型

创建函数前，先确认用户想要的运行形态。CLI 支持四类函数：

| 类型 | 适用场景 | 特点 |
| --- | --- | --- |
| `runtime` | 事件函数、轻量逻辑、SDK runtime 代码 | 使用 Python/Node.js/Go 等托管 runtime，不强调常驻服务端口，适合事件驱动调用。 |
| `webserver` | HTTP Web 服务、API 服务、容器化 Web 应用 | 默认类型，基于 `native/v1`，有启动命令和监听端口，通常通过触发器对外访问。 |
| `microservice` | 需要常驻的微服务 | 基于 `native/v1`，CPU 策略默认偏常驻，适合不希望频繁冷启动的服务形态。 |
| `job` | 异步任务、批处理、长耗时任务 | 默认独占执行，单实例并发较低，适合任务型调用和更长超时。 |

不确定类型、runtime、source、资源规格或高级参数时，先运行 `vefaas fn create --help`，不要猜参数。

## 代码与镜像形态

函数通常有两种代码管理方式：

- **纯镜像函数**：以完整容器镜像作为 source，镜像内包含运行环境和业务代码。CLI 可以创建和更新配置，但不适合用 `pull` / `push` 管理代码包。
- **基础镜像/托管 runtime + 代码包**：函数基于平台 runtime 或基础运行环境，业务代码由 CLI 从本地目录、zip 或 TOS 上传。CLI 用户通常在本地维护这份代码。

使用 CLI 创建函数时，可以从本地目录、zip、TOS 或镜像创建。交互式创建或模板化创建通常会生成/携带一份默认代码；后续常见流程是在本地修改代码，再用 `vefaas fn push` 上传更新，或用 `vefaas deploy --funcId <function-id>` 完成构建、上传和发布链路。

## 常见使用流程

### 1. 定位或创建函数

已有函数时，先用 `vefaas fn list` / `vefaas fn info` 确认函数 ID、类型、source、runtime、端口和当前配置。涉及写操作时优先使用函数 ID，不要只凭名称操作。

新建函数时，用 `vefaas fn create`。创建前先根据上面的四种类型选择 `--type`，再确认 source 形态：

- 本地代码或 zip：适合后续继续用 CLI 管理代码。
- 镜像 source：适合已有完整容器镜像的服务。
- TOS source：适合已有代码包上传位置的场景。

### 2. 本地修改并推送代码

CLI 用户通常会在本地管理函数代码。已有函数可以用 `vefaas fn pull` 拉取代码到本地；镜像类型函数不支持这种代码拉取方式。

修改代码后，如果只想上传代码包，用 `vefaas fn push`。`push` 只负责上传，不等同于发布上线；用户说“发布、上线、部署”时，应继续执行发布动作，或使用 `vefaas deploy --funcId <function-id>` 走完整部署链路。

### 3. 更新函数配置

函数配置包括启动命令、端口、CPU/内存、并发、超时、环境变量、VPC、IAM role、标签等。简单配置可用 `vefaas fn config` 和 `vefaas fn env` 更新；复杂 JSON 配置先查 `vefaas fn config --help`。

更新 secret 类环境变量时，不要把值明文回显给用户。生产函数调整资源规格、实例上下限或扩缩容策略前，先确认当前配置和预期影响。

### 4. 安装依赖并发布

代码上传后，如 runtime 或代码包需要云端依赖安装，使用 `vefaas fn deps` 相关命令确认依赖安装成功。依赖安装能力和参数可能随 source/runtime 不同而变化，先看 `vefaas fn deps --help`。

确认代码和配置无误后，用 `vefaas fn release` 发布新 revision。发布后可用 `vefaas fn revision` 查看版本信息。若发布后发现问题，用 `vefaas fn rollback` 回滚到指定 revision；回滚前必须确认函数 ID 和目标 revision number。

### 5. 测试调用

发布后先用 `vefaas fn invoke` 做测试调用。事件函数通常传入事件 payload；HTTP/Webserver 形态可以用 method、path、header/body 或 request JSON 模拟 APIG 请求。

如果调用失败，先看错误信息、函数实例状态和日志，再决定是否修改配置、重新发布或回滚。

### 6. 绑定触发器并对外访问

如果函数需要对外提供访问地址，需要绑定触发器。目前 CLI 的触发器高阶命令只支持 APIG 触发器，基于已有 gateway 实例创建或关联 APIG 资源。操作前先查看 `vefaas fn trigger --help` 和 `vefaas fn trigger apig --help`。

绑定 APIG 触发器后，通过生成的访问地址请求函数。若触发器绑定报 APIG 权限不足，常见原因是当前 SSO 登录权限域不足，可提示用户切换 AK/SK 登录或到 Web 控制台操作。

### 7. 查看实例日志排障

线上请求异常时，先用 `vefaas fn instances` 找到相关实例，再用 `vefaas fn logs` 查看实例日志。需要进入运行环境排查时，可用 `vefaas fn webshell`，但应避免泄露日志、环境变量或连接串中的敏感信息。

常见排障顺序：

1. 确认函数 ID、当前 revision 和发布状态。
2. 用 `invoke` 复现问题。
3. 查看实例状态和日志。
4. 检查环境变量、启动命令、端口、资源规格和依赖安装状态。
5. 必要时修复后重新 push/release，或 rollback 到稳定 revision。
