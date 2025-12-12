# Rexa 모듈 설계

## Module 1: DocCrawler

**"문서 사이트를 신뢰 가능한 Markdown Knowledge로 변환"**

### 목적

웹 문서 사이트를 AI 친화적인 Markdown 파일 세트로 변환
이후 모든 단계의 단일 진실 소스(Source of Truth) 역할

### Input

- URL (docs 사이트 루트)
- 옵션: 크롤 깊이, include/exclude 패턴

### Output

```
docs/
 └─ react.dev/
     ├─ pages/
     │   ├─ hooks-useState.md
     │   ├─ hooks-useEffect.md
     ├─ merged.md
     └─ meta.json
```

### 내부 책임

- HTML 크롤링
- 링크 정규화 & 중복 제거
- sidebar / TOC 파싱
- HTML → Markdown 변환
- 코드 블록 정제
- 문서 병합

### 사용 기술

- TypeScript
- node-fetch / undici
- cheerio
- turndown
- Rexa Parser Rules

### 패키지

`@rexa/crawler`

### 다음 모듈과의 연동

➡ Module 2는 `docs/<domain>/pages/*.md` 와 `meta.json`만 신뢰한다.
HTML, URL 구조, 크롤링 로직은 절대 공유하지 않는다.

---

## Module 2: LLMSTextBuilder

**"Markdown 문서를 LLM 표준 포맷(llms.txt)으로 재구성"**

### 목적

Markdown 문서들을 LLM 소비에 최적화된 단일 텍스트 포맷으로 변환
RAG, fine-tuning, context injection의 공통 입력 포맷

### Input

- Markdown 파일들
- meta.json

### Output

`llms.txt`

예:

```
# React Documentation

## useState
<content>

## useEffect
<content>
```

### 내부 책임

- 문서 순서 재정렬
- 중복 제거
- heading 기반 section 분리
- 토큰 수 고려한 분할(optional)
- 메타데이터 주석 포함

### 사용 기술

- TypeScript
- markdown-it
- custom chunking logic

### 패키지

`@rexa/llms`

### 다음 모듈과의 연동

➡ Module 3은 `llms.txt` 하나만 입력으로 받는다.
Markdown 구조, 파일 수, 원본 문서는 알 필요 없음.

---

## Module 3: RAGBuilder

**"llms.txt 기반 Retrieval-Augmented Generation 구축"**

### 목적

llms.txt를 검색 가능한 지식 인덱스로 변환
AI가 질문에 맞는 문서 조각만 검색 가능하게 함

### Input

- llms.txt
- chunk 설정

### Output

- Vector index
- Retriever interface

### 내부 책임

- 텍스트 chunking
- embedding 생성
- 벡터 저장소 구축
- similarity search API 제공

### 사용 기술

**로컬**
- OpenAI / local embedding model
- in-memory / sqlite vector store

**SaaS**
- OpenAI embeddings
- pgvector / Qdrant / Pinecone

### 패키지

`@rexa/rag`

### 다음 모듈과의 연동

➡ Module 4는 `RAGIndex.query()` 인터페이스만 사용한다.
임베딩 모델, 벡터 DB는 MCP가 전혀 몰라도 된다.

---

## Module 4: MCPResponder

**"RAG 기반으로 AI에게 응답하는 MCP 서버"**

### 목적

RAG 결과를 기반으로 MCP tool로 AI에게 정확한 응답 제공
Rexa의 "AI 인터페이스 레이어"

### Input

- User Query
- RAG Retriever

### Output

- Context-aware answer
- Source references (optional)

### 내부 책임

- MCP tool 정의
- 질문 수신
- RAG 검색 실행
- 관련 문서 context 반환
- 응답 구조화

### 사용 기술

- TypeScript
- @modelcontextprotocol/sdk
- Node.js / Cloudflare Workers

### 패키지

`@rexa/mcp`

---

## 전체 연결 흐름 (Critical Path)

```
Docs Website
   ↓
[ DocCrawler ]
   ↓
Markdown Files
   ↓
[ LLMSTextBuilder ]
   ↓
llms.txt
   ↓
[ RAGBuilder ]
   ↓
Retriever
   ↓
[ MCPResponder ]
   ↓
ChatGPT / Cursor / Windsurf
```

