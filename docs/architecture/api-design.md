# Rexa API 설계

이 문서는 Rexa의 4개 핵심 모듈에 대한 상세 API 설계 + 모듈 간 연동 설계를
**구현 가능한 수준(인터페이스·입출력·에러·확장 포인트 포함)**으로 정리한 문서다.

## 1️⃣ Module 1 — DocCrawler

### 책임

문서 사이트(URL)를 신뢰 가능한 Markdown 문서 세트로 변환

### Public API

```typescript
interface DocCrawler {
  crawl(input: CrawlInput): Promise<CrawlResult>
}
```

### Input

```typescript
interface CrawlInput {
  entryUrl: string          // 시작 URL (필수)
  scope: CrawlScope         // ★ 핵심: URL 범위 제한
  outputDir: string

  options?: {
    maxDepth?: number
    force?: boolean
  }
}

interface CrawlScope {
  type: "prefix" | "regex"

  // prefix 방식 (권장)
  allow?: string[]          // 허용 URL prefix
  deny?: string[]           // 차단 URL prefix

  // regex 방식 (고급 사용자)
  allowRegex?: RegExp[]
  denyRegex?: RegExp[]
}
```

### Output

```typescript
interface CrawlResult {
  site: {
    url: string
    domain: string
  }

  pages: CrawledPage[]

  meta: {
    pageCount: number
    startedAt: string
    finishedAt: string
  }
}

interface CrawledPage {
  url: string
  title: string
  markdownPath: string
}
```

### 파일 산출물 (Contract)

```
docs/<domain>/
 ├─ pages/
 │   ├─ getting-started.md
 │   ├─ hooks-useState.md
 ├─ merged.md
 └─ meta.json
```

**meta.json**

```json
{
  "url": "https://react.dev",
  "domain": "react.dev",
  "scope": {
    "type": "prefix",
    "allow": ["https://react.dev/reference"],
    "deny": ["https://react.dev/blog"]
  },
  "pageCount": 112,
  "lastCrawledAt": "2025-01-10T12:00:00Z"
}
```

### 내부 서브 컴포넌트

- CrawlerAdapter (fetch / headless)
- LinkNormalizer
- SidebarParser
- HtmlToMarkdownParser
- PageMerger

### 다음 모듈과의 연동

➡ Module 2는 `docs/<domain>/pages/*.md` 와 `meta.json`만 신뢰한다.
HTML, URL 구조, 크롤링 로직은 절대 공유하지 않는다.

---

## 2️⃣ Module 2 — LLMSTextBuilder

### 책임

Markdown 문서 세트를 **LLM 표준 입력 포맷(llms.txt)**으로 변환

### Public API

```typescript
interface LLMSTextBuilder {
  build(input: LLMSTextInput): Promise<LLMSTextResult>
}
```

### Input

```typescript
interface LLMSTextInput {
  docsDir: string        // docs/<domain>
  outputPath: string    // docs/<domain>/llms.txt

  options?: {
    maxTokensPerSection?: number
    dedupe?: boolean
  }
}
```

### Output

```typescript
interface LLMSTextResult {
  llmsPath: string
  sectionCount: number
  totalChars: number
}
```

### llms.txt 포맷 (Contract)

```
# React Documentation
# Source: https://react.dev

## useState
<content>

## useEffect
<content>
```

**규칙**

- Heading 기반(section)
- 중복 제거
- 코드 블록 유지
- 순서는 meta.json 또는 sidebar 기준

### 다음 모듈과의 연동

➡ Module 3은 `llms.txt` 하나만 입력으로 받는다.
Markdown 구조, 파일 수, 원본 문서는 알 필요 없음.

---

## 3️⃣ Module 3 — RAGBuilder

### 책임

llms.txt를 **검색 가능한 지식 인덱스(RAG)**로 변환

### Public API

```typescript
interface RAGBuilder {
  build(input: RAGBuildInput): Promise<RAGIndex>
}
```

### Input

```typescript
interface RAGBuildInput {
  llmsPath: string

  options?: {
    chunkSize?: number
    overlap?: number
  }
}
```

### Output

```typescript
interface RAGIndex {
  query(input: RAGQueryInput): Promise<RAGQueryResult>
}
```

### Query API

```typescript
interface RAGQueryInput {
  query: string
  topK?: number
}

interface RAGQueryResult {
  matches: RAGMatch[]
}

interface RAGMatch {
  content: string
  score: number
  source: {
    section: string
  }
}
```

### 내부 서브 컴포넌트

- Chunker
- Embedder (OpenAI / local)
- VectorStore (in-memory / sqlite / external)

### 다음 모듈과의 연동

➡ Module 4는 `RAGIndex.query()` 인터페이스만 사용한다.
임베딩 모델, 벡터 DB는 MCP가 전혀 몰라도 된다.

---

## 4️⃣ Module 4 — MCPResponder

### 책임

RAG 기반으로 MCP 서버를 통해 AI 요청에 응답

### MCP Tools 정의

#### list_docs

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

#### get_doc

```typescript
input: {
  domain: string
}
output: {
  content: string | null
}
```

#### query_docs (RAG)

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

### MCPResponder 내부 API

```typescript
interface MCPResponder {
  start(): Promise<void>
}
```

**Dependencies (Injected):**

```typescript
{
  metadataStore
  storage
  ragIndex?: RAGIndex
}
```

### 동작 흐름

```
AI Query
  ↓
MCP Tool 호출
  ↓
RAGIndex.query()
  ↓
Relevant Context
  ↓
MCP Response
```

---

## 5️⃣ 전체 연동 흐름 (Critical Path)

```
[ DocCrawler ]
    ↓ (Markdown files)
[ LLMSTextBuilder ]
    ↓ (llms.txt)
[ RAGBuilder ]
    ↓ (RAGIndex)
[ MCPResponder ]
    ↓
AI
```

### 핵심 포인트

- 파일 기반 인터페이스
- 단방향 의존성
- 각 모듈 독립 테스트 가능

---

## 6️⃣ 실패 격리 설계

| 모듈 | 실패 시 영향 |
|------|-------------|
| DocCrawler | 이후 단계 실행 불가 |
| LLMSTextBuilder | RAG/MCP 불가 |
| RAGBuilder | MCP는 fallback(get_doc) 가능 |
| MCPResponder | CLI 기능은 정상 |

---

## 7️⃣ 확장 포인트 요약

- 다른 crawler 추가
- 다른 llms.txt 포맷
- 다른 RAG backend
- MCP tool 확장
- Cloud-only adapter 추가

---

## 한 줄 요약

**Rexa는 Markdown → llms.txt → RAG → MCP라는 명확한 계약 기반 파이프라인으로 구성된 모듈형 AI 문서 엔진이다.**

