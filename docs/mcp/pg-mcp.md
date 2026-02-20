# rexa — PostgreSQL MCP (pg-mcp-server) 연결

목적: Claude Code에서 PostgreSQL을 **MCP 도구로 조회/쿼리**할 수 있게 설정합니다.

## 엔드포인트
- 기본: `http://localhost:8003/sse`

## docker-compose
- 이 레포가 docker-compose로 Postgres를 띄우는 경우, pg-mcp-server 서비스가 함께 포함됩니다.
- 기동 예:

```bash
cd ~/Projects/fi-workers/rexa
docker compose up -d --build
```

## Claude Code에 MCP 서버 등록

```bash
cd ~/Projects/fi-workers/rexa
./scripts/claude_mcp_add_pg_mcp.sh
```

## 사용 팁
- 먼저 `tools/list`로 도구가 보이는지 확인
- `connect`로 conn_id 만든 뒤, `pg_query`에 conn_id 지정해서 쿼리

