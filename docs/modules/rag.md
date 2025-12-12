# Module 3: RAGBuilder

## 개요

RAGBuilder는 llms.txt를 검색 가능한 지식 인덱스(RAG)로 변환하는 모듈입니다.

## 목적

llms.txt를 검색 가능한 지식 인덱스로 변환
AI가 질문에 맞는 문서 조각만 검색 가능하게 함

## Public API

```typescript
interface RAGBuilder {
  build(input: RAGBuildInput): Promise<RAGIndex>
}

interface RAGBuildInput {
  llmsPath: string

  options?: {
    chunkSize?: number
    overlap?: number
  }
}

interface RAGIndex {
  query(input: RAGQueryInput): Promise<RAGQueryResult>
}
```

## Query API

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

## 내부 서브 컴포넌트

### 1. Chunker

텍스트를 적절한 크기의 chunk로 분할

- chunkSize: 기본 chunk 크기
- overlap: chunk 간 겹치는 부분 (컨텍스트 유지)

### 2. Embedder

텍스트를 벡터로 변환

**로컬 옵션:**
- OpenAI API
- Local embedding model (예: sentence-transformers)

**SaaS 옵션:**
- OpenAI embeddings
- Cohere embeddings
- 기타 embedding 서비스

### 3. VectorStore

벡터를 저장하고 검색

**로컬 옵션:**
- in-memory (개발/테스트용)
- sqlite (경량 프로덕션)

**SaaS 옵션:**
- pgvector (PostgreSQL)
- Qdrant
- Pinecone
- Weaviate

## 사용 기술

### 로컬

- OpenAI / local embedding model
- in-memory / sqlite vector store

### SaaS

- OpenAI embeddings
- pgvector / Qdrant / Pinecone

## 다음 모듈과의 연동

➡ Module 4는 `RAGIndex.query()` 인터페이스만 사용한다.
임베딩 모델, 벡터 DB는 MCP가 전혀 몰라도 된다.

## 선택 가능한 모듈

RAG는 Rexa의 핵심이 아닙니다.

- llms.txt만으로도 충분한 경우가 많음
- RAG는 "검색"이 필요한 경우에만 사용
- MCP는 RAG 없이도 동작 가능 (fallback: get_doc)

## 확장성

다양한 embedding 모델과 vector store를 지원하기 위해 추상 인터페이스 설계:

```typescript
interface Embedder {
  embed(text: string): Promise<number[]>
}

interface VectorStore {
  upsert(vectors: Vector[]): Promise<void>
  search(query: number[], topK: number): Promise<Vector[]>
}
```

