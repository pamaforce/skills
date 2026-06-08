# veFaaS Skills

用于指导 AI Agent 使用 [Volcengine veFaaS](https://www.volcengine.com/product/vefaas) 和 `@volcengine/vefaas-cli` 的 Skills。

## 安装

```bash
npx -y skills add vefaas-dev/skills -g -y
```

手动安装时，将 `skills/vefaas` 目录复制到对应 Agent 的 skills 目录下。各主流 Agent 的 skills 目录如下：

| Agent | Skills 目录 |
|-------|------------|
| Claude Code | `~/.claude/skills/` |
| Gemini CLI / Antigravity | `~/.gemini/skills/` |
| OpenAI Codex | `~/.codex/skills/` |
| Trae | `~/.trae/skills/` |
| GitHub Copilot (VS Code) | `~/.copilot/skills/` |
| Cursor | `~/.cursor/skills/` |
| Windsurf | `~/.codeium/windsurf/skills/` |
| Cline | `~/.cline/skills/` |
| Roo Code | `~/.roo/skills/` |

例如，将本仓库的 vefaas skill 安装到 Claude Code 全局目录：

```bash
cp -r skills/vefaas ~/.claude/skills/vefaas
```

## Skills

| Skill | 说明 |
|-------|------|
| `vefaas` | 使用 `@volcengine/vefaas-cli` 构建和部署应用、管理函数和沙箱，并直接调用 veFaaS OpenAPI。 |

## CLI 版本要求

本仓库的 `vefaas` skill 面向：

```bash
npm i -g @volcengine/vefaas-cli@latest
vefaas --version
```

必须使用 `@volcengine/vefaas-cli@0.2.0` 或更高版本。旧版本命令形态不同，应先升级再使用本 skill。
