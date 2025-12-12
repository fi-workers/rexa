# Module 4: MCPResponder

## 개요

MCPResponder는 RAG 기반으로 MCP 서버를 통해 AI 요청에 응답하는 모듈입니다.

## 목적

RAG 결과를 기반으로 MCP tool로 AI에게 정확한 응답 제공
Rexa의 "AI 인터페이스 레이어"

## MCP Tools 정의

### list_docs

문서 사이트 목록 조회

```typescript
input: {}
output: {
  sites: {
    domain: string
    pageCount: number
    lastCrawledAt: string
  }[]
}
```

### get_doc

특정 도메인의 문서 내용 조회 (RAG 없이)

```typescript
input: {
  domain: string
}
output: {
  content: string | null
}
```

### query_docs (RAG)

RAG를 사용한 문서 검색

```typescript
input: {
  query: string
  topK?: number
}
output: {
  answers: {
    content: string
    score: number
  }[]
}
```

## Public API

```typescript
interface MCPResponder {
  start(): Promise<void>
}
```

## Dependencies (Injected)

```typescript
{
  metadataStore    // 문서 메타데이터 저장소
  storage          // 파일 저장소
  ragIndex?: RAGIndex  // RAG 인덱스 (optional)
}
```

## 동작 흐름

```
AI Query
  ↓
MCP Tool 호출
  ↓
RAGIndex.query() (또는 get_doc)
  ↓
Relevant Context
  ↓
MCP Response
```

## 사용 기술

- TypeScript
- @modelcontextprotocol/sdk
- Node.js / Cloudflare Workers

## RAG 없이 동작

MCPResponder는 RAG 없이도 동작 가능합니다:

- `list_docs`: 메타데이터만 조회
- `get_doc`: 파일에서 직접 읽기
- `query_docs`: RAG가 있을 때만 사용

## 확장 포인트

### 추가 MCP Tools

- `search_code`: 코드 예제만 검색
- `get_api_reference`: API 레퍼런스만 조회
- `compare_versions`: 버전 간 차이점 비교

### 다양한 AI 플랫폼 지원

- ChatGPT
- Cursor
- Windsurf
- Claude Desktop
- 기타 MCP 호환 AI 도구

## 에러 처리

- 문서가 없을 때: 명확한 에러 메시지
- RAG 실패 시: fallback to get_doc
- 네트워크 오류: 재시도 로직

## 성능 고려사항

- 응답 시간 최소화
- 캐싱 전략
- 배치 처리 지원

