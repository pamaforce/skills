---
name: vefaas
version: 1.0.0
description: "火山引擎函数服务：当用户想把本地前端、Node.js、Python、静态站点或 API 服务部署上线，基于模板创建 serverless 应用，把已有项目接入 veFaaS，查看线上访问地址，配置生产环境变量、构建命令、启动命令或端口，发布、回滚、调用和调试线上函数，查看日志、实例状态或资源配置，拉取/推送云端函数代码，创建和管理沙箱实例，排查部署失败、鉴权失败、框架检测错误、网关缺失等问题，或需要直接调用 veFaaS OpenAPI 完成高级操作时使用。使用前需确保 @volcengine/vefaas-cli >= 0.2.0。"
metadata:
  requires:
    bins: ["node", "npm", "vefaas"]
  npmPackage: "@volcengine/vefaas-cli"
  minimumCliVersion: "0.2.0"
  cliHelp: "vefaas --help"
---

# vefaas

本 skill 指导您使用 `@volcengine/vefaas-cli` 操作火山引擎 veFaaS，包括应用部署、函数管理、沙箱管理、环境变量、配置、诊断等在火山引擎函数服务控制台能执行的操作以及 OpenAPI 调用。

## 前置要求

**CRITICAL — 执行任何 veFaaS 操作前，MUST 先确认本机 `vefaas` CLI 版本 >= 0.2.0。**

```bash
vefaas --version
```

如果命令不存在，或版本低于 `0.2.0`，必须先升级：

```bash
npm i -g @volcengine/vefaas-cli@latest
vefaas --version
```

## 适用场景

使用本 skill：

- 用户要把本地项目、网站、API 服务、Node.js 服务、Python 服务或静态站点部署到火山引擎 veFaaS。
- 用户要基于模板创建 serverless 应用，或把已有项目接入 veFaaS。
- 用户要查看线上访问地址、配置环境变量、调整构建命令、启动命令、端口或资源配置。
- 用户要管理线上函数：创建、查看、发布、回滚、调用、日志、实例、扩缩容、触发器、依赖、WebShell。
- 用户要拉取云端函数代码、本地修改后推送或重新部署。
- 用户要管理沙箱应用、沙箱实例、沙箱镜像、沙箱日志、沙箱 WebShell。
- 用户要排查部署失败、鉴权失败、框架检测错误、网关缺失、配置不一致或 OpenAPI 调用失败。
- 用户明确要调用 veFaaS OpenAPI action，或高阶命令无法覆盖目标操作。

## 资源心智模型

- 函数是 veFaaS（函数服务）的核心资源，承载代码/镜像、版本、实例、日志、资源规格和扩缩容策略；函数实例通常由平台按流量和策略动态扩缩容。
- 应用是在函数基础上编排应用级逻辑后的产品形态，包含整体版本管理、APIG 触发器关联、Git 仓库自动触发部署等，用于让用户更方便地发布并访问应用。
- 沙箱是一种特殊/定制的函数，Function、Revision、Instance 模型与函数类似，但必须基于已预热镜像创建，适合代码沙箱、模型评测等秒级拉起隔离环境的场景；沙箱实例需要主动创建，并支持暂停、恢复、关闭和调整过期时间。
- 需要更细的资源关系、ID 使用规则或 CLI target 映射时，读取 [CLI 与版本](references/vefaas-cli.md)。

## CRITICAL 工作流分流

**CRITICAL — 用户说“部署项目 / 网站上线 / API 上线 / serverless 应用 / 查看访问地址”时，默认走应用工作流，不要直接创建函数。**

应用工作流使用 `vefaas init`、`vefaas inspect`、`vefaas link`、`vefaas deploy`、`vefaas domains`、`vefaas env`、`vefaas config`。继续前 MUST 读取 [应用工作流](references/vefaas-application.md)。

**CRITICAL — 只有用户给出已有函数 ID/name，或明确说“函数 / function / fn / 拉取函数代码 / 发布函数 / 回滚函数 / 函数日志”时，才走函数工作流。**

函数工作流使用 `vefaas fn ...`、`vefaas pull`、`vefaas push`、`vefaas deploy --funcId`。继续前 MUST 读取 [函数管理](references/vefaas-function.md)。

**CRITICAL — 用户说“沙箱 / sandbox / 沙箱实例 / 临时实例 / 实例暂停恢复 kill / 沙箱镜像”时，走沙箱工作流。**

沙箱工作流必须区分 sandbox application 与 sandbox instance；application ID 和 instance name 不能混用。继续前 MUST 读取 [沙箱管理](references/vefaas-sandbox.md)。

**CRITICAL — 高阶命令能完成任务时，不要直接使用 `vefaas api`。**

只有在高阶命令缺失、用户明确要求 OpenAPI、或需要底层 action 字段时，才使用 OpenAPI 工作流。继续前 MUST 读取 [OpenAPI 调用](references/vefaas-openapi.md)，并先执行 `vefaas api <Action> --help` 查看参数结构。

## 必读 Reference 协议

执行对应任务前，MUST 读取对应 reference；不要只凭本文件的速查命令执行复杂操作。

| 场景 | 必读文件 |
|---|---|
| 安装、升级、确认 CLI 版本 | [CLI 与版本](references/vefaas-cli.md) |
| 登录、检查凭据、恢复鉴权 | [认证与凭据](references/vefaas-auth.md) |
| 初始化模板、部署应用、link、inspect、domains、应用 env/config | [应用工作流](references/vefaas-application.md) |
| 管理函数、代码、发布、回滚、日志、调用、配置、扩缩容 | [函数管理](references/vefaas-function.md) |
| 管理 sandbox application / instance | [沙箱管理](references/vefaas-sandbox.md) |
| 直接调用 veFaaS OpenAPI | [OpenAPI 调用](references/vefaas-openapi.md) |
| 排查失败、诊断环境 | [故障排查](references/vefaas-troubleshooting.md) |

## 全局执行规则

- 非交互式 AI/CI 场景中，目标明确时优先加 `--yes`。
- 需要解析输出时，优先使用 `--output json`，再配合 `--jq`、`--fields`、`--limit`。
- 不确定命令或 flag 时，先运行 `vefaas <command> --help`，不要猜参数。
- 遇到凭据、项目配置、本地环境或 OpenAPI 连通性问题时，优先执行 `vefaas doctor`。
- `--debug` 仅用于诊断；debug 输出和 `~/.vefaas/logs/` 可能包含敏感请求/响应信息。
- 不要把 Access Key ID、Secret Access Key、session token、OAuth/OIDC token、数据库连接串、`.env` value 明文回显给用户。

## 高风险操作协议

以下操作会影响线上行为或销毁资源，执行前必须确认目标资源和用户意图：

- 删除函数、删除沙箱应用、删除沙箱镜像。
- kill / pause / resume sandbox instance。
- 函数或沙箱 rollback。
- 修改生产环境触发器等。

处理规则：

1. 先展示将要操作的资源标识（app/function/sandbox ID 或名称）和动作。
2. 如果目标不唯一或来源只是用户口述名称，先 list/info 消歧。
3. 用户明确确认后再执行；不要静默添加 `--yes` 绕过确认。
4. 用户拒绝或目标不清楚时停止，不要自行猜测替代目标。

## 目标消歧规则

- App name、function name、sandbox name 可能不唯一；涉及写操作时，优先使用 ID。
- 只有名称没有 ID 时，先用 `list` / `info` / `config list` / `config pull` 获取真实资源信息。
- 新应用部署需要 gateway name；先执行 `vefaas gateway list --first`。如果没有返回，停止并询问用户提供已有网关或先创建网关。
- 当前目录存在 `.vefaas/config.json` 时，不代表一定是用户想操作的目标；涉及线上写操作前先 `vefaas config list` 确认。
- sandbox application ID 与 sandbox instance name 不可互换；实例操作前先 `vefaas sandbox instance list --id <sandbox-application-id>`。

## 常用命令速查

```bash
vefaas --help
vefaas doctor
vefaas login --sso
vefaas login --check
vefaas init
vefaas inspect
vefaas gateway list --first
vefaas link --newApp <name> --gatewayName <gateway-name> --yes
vefaas deploy
vefaas domains
vefaas env set KEY VALUE
vefaas fn list -o table
vefaas fn info --id <function-id>
vefaas sandbox instance create --id <sandbox-application-id>
vefaas api ListFunctions --PageSize 10 -o table
```
