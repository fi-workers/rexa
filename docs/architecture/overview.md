# Rexa 아키텍처 개요

## 핵심 철학

Rexa는 **"문서를 AI 입력으로 정제하는 파이프라인"**이다.

Rexa의 핵심은 RAG가 아니다.
핵심은 **"문서를 AI 입력으로 정제하는 파이프라인"**이다.

그래서:

- llms.txt는 독립적인 1급 산출물
- RAG는 선택 가능한 모듈
- MCP는 인터페이스 레이어

이 구조가 Rexa를 도구가 아니라 플랫폼으로 만든다.

## 전체 아키텍처

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

## 4개 핵심 모듈

Rexa는 다음 4개의 독립 모듈로 구성된다.
각 모듈은 단독 사용 가능하고, 조합 시 완전한 AI 문서 엔진이 된다.

### Module 1: DocCrawler
**"문서 사이트를 신뢰 가능한 Markdown Knowledge로 변환"**

- 웹 문서 사이트를 AI 친화적인 Markdown 파일 세트로 변환
- 이후 모든 단계의 단일 진실 소스(Source of Truth) 역할

### Module 2: LLMSTextBuilder
**"Markdown 문서를 LLM 표준 포맷(llms.txt)으로 재구성"**

- Markdown 문서들을 LLM 소비에 최적화된 단일 텍스트 포맷으로 변환
- RAG, fine-tuning, context injection의 공통 입력 포맷

### Module 3: RAGBuilder
**"llms.txt 기반 Retrieval-Augmented Generation 구축"**

- llms.txt를 검색 가능한 지식 인덱스로 변환
- AI가 질문에 맞는 문서 조각만 검색 가능하게 함

### Module 4: MCPResponder
**"RAG 기반으로 AI에게 응답하는 MCP 서버"**

- RAG 결과를 기반으로 MCP tool로 AI에게 정확한 응답 제공
- Rexa의 "AI 인터페이스 레이어"

## 설계 원칙

### 0️⃣ 공통 설계 원칙

#### ✔ Local-first

모든 모듈은 파일 기반 I/O를 기본으로 한다.

#### ✔ Pure + Injectable

외부 의존성(crawler, storage, embedder 등)은 주입한다.

#### ✔ One-way Data Flow

```
Docs → Markdown → llms.txt → RAG → MCP
```

#### ✔ 각 모듈은 "자기 산출물"에만 책임진다

각 모듈은 이전 단계의 산출물만 신뢰하고, 내부 구현은 모른다.

## 모듈 간 연동

### 파일 기반 인터페이스

각 모듈은 파일 시스템을 통해 통신한다:

```
docs/<domain>/
 ├─ pages/
 │   ├─ getting-started.md
 │   ├─ hooks-useState.md
 ├─ merged.md
 ├─ llms.txt
 ├─ rag-index/
 └─ meta.json
```

### 단방향 의존성

- Module 2는 Module 1의 Markdown 파일만 신뢰
- Module 3은 Module 2의 llms.txt만 신뢰
- Module 4는 Module 3의 RAGIndex 인터페이스만 사용

### 독립 테스트 가능

각 모듈은 다른 모듈 없이도 단독 테스트 가능하다.

## 실패 격리 설계

| 모듈 | 실패 시 영향 |
|------|-------------|
| DocCrawler | 이후 단계 실행 불가 |
| LLMSTextBuilder | RAG/MCP 불가 |
| RAGBuilder | MCP는 fallback(get_doc) 가능 |
| MCPResponder | CLI 기능은 정상 |

## 확장 포인트

- 다른 crawler 추가
- 다른 llms.txt 포맷
- 다른 RAG backend
- MCP tool 확장
- Cloud-only adapter 추가

## Monorepo 구조

```
rexa/
├─ packages/
│  ├─ crawler/        ← Module 1
│  ├─ llms/           ← Module 2
│  ├─ rag/            ← Module 3
│  ├─ mcp/            ← Module 4
│  ├─ cli/
│  └─ core/           ← shared types & utils
```

## 개발 전략

### Phase 1 (필수)

- Module 1: DocCrawler
- Module 2: LLMSTextBuilder

👉 이 두 개만 있어도 Rexa CLI 1차 가치 완성

### Phase 2

- Module 4: MCPResponder (파일 기반)

👉 RAG 없이도 "문서 제공 MCP" 가능

### Phase 3

- Module 3: RAGBuilder
- Module 4 확장

👉 AI가 질문에 답하는 완성형 Rexa

## 한 문장 요약

**Rexa는 문서를 Markdown으로 만들고 → llms.txt로 정제하고 → RAG로 구조화하고 → MCP로 AI에게 제공하는 4단계 모듈형 AI 문서 엔진이다.**

