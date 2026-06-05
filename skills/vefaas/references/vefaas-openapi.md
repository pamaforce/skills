# OpenAPI 调用

高阶命令无法覆盖，或用户明确要求调用 veFaaS OpenAPI action 时，使用 `vefaas api <Action>`。

## CRITICAL 调用顺序

**CRITICAL — 调用任何具体 Action 前，MUST 先运行 `vefaas api <Action> --help` 查看参数结构。不要猜测参数名、大小写、请求体结构或 ID 字段。**

推荐顺序：

1. 用高阶命令确认是否已经能完成目标；能完成就不要走 OpenAPI。
2. 确定必须调用的 Action。
3. 运行 `vefaas api <Action> --help` 查看参数结构和示例。
4. 如果 Action 涉及其它资源，先调用相关资源的查询接口获取真实 ID、名称、revision、instance 等标识符。
5. 再调用目标 Action。

## 探索

```bash
vefaas api --help
vefaas api GetFunction --help
vefaas api UpdateFunction --help
vefaas api ListFunctions --PageSize 10 -o table
vefaas api GetFunction --Id <function-id> --output json
```

## 参数模式

简单参数用 flag：

```bash
vefaas api ListFunctions --PageSize 10 --output table
vefaas api GetFunction --Id <function-id> --output json
```

复杂请求体用 JSON：

```bash
vefaas api UpdateFunction --body '{"Id":"<function-id>","Description":"new description"}'
vefaas api UpdateFunction --body @request.json
cat request.json | vefaas api UpdateFunction --body -
```

## 输出处理

```bash
vefaas api ListFunctions --output table --fields Id,Name,Runtime --limit 5
vefaas api ListFunctions --output json --jq '.data'
```

## 规则

- 高阶命令能完成任务时，优先使用 `fn`、`sandbox`、`env`、`config`、`deploy` 等高阶命令。
- 每次调用具体 Action 前，先执行 `vefaas api <Action> --help`，再按 help 中的参数结构构造命令。
- 涉及其它资源时，先用相关查询接口获取真实标识符。例如先 `ListFunctions` / `GetFunction` 获取 function id，再调用更新、发布、回滚类 action；先 list/get sandbox 或 application，再操作对应资源。
- 大 JSON 或敏感 JSON 优先使用 `--body @file` 或 `--body -`，减少 shell quoting 错误。
- 破坏性 action 不要猜参数；必须先执行 list/get/read 类 action 或查看 help。
