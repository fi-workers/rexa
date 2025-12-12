# Rexa 문서

이 폴더는 Rexa 프로젝트의 모든 문서를 포함합니다.

## 문서 구조

### 제품 문서 (`product/`)

- [제품 비전](./product/vision.md) - Rexa의 비전, 가치 제안, 타겟 사용자

### 아키텍처 문서 (`architecture/`)

- [아키텍처 개요](./architecture/overview.md) - 전체 아키텍처 및 설계 원칙
- [모듈 설계](./architecture/modules.md) - 4개 핵심 모듈 개요
- [API 설계](./architecture/api-design.md) - 모듈별 상세 API 설계

### 모듈별 가이드 (`modules/`)

- [DocCrawler](./modules/crawler.md) - Module 1: 문서 크롤링
- [LLMSTextBuilder](./modules/llms.md) - Module 2: llms.txt 생성
- [RAGBuilder](./modules/rag.md) - Module 3: RAG 인덱스 구축
- [MCPResponder](./modules/mcp.md) - Module 4: MCP 서버

## 빠른 시작

1. [제품 비전](./product/vision.md)을 읽어 Rexa가 무엇인지 이해
2. [아키텍처 개요](./architecture/overview.md)로 전체 구조 파악
3. [API 설계](./architecture/api-design.md)로 구현 세부사항 확인
4. [모듈별 가이드](./modules/)에서 각 모듈 상세 내용 참고

## 문서 작성 가이드

- 모든 문서는 Markdown 형식
- 코드 예제는 TypeScript 사용
- API 설계는 구현 가능한 수준으로 작성
- 각 모듈은 독립적으로 이해 가능해야 함

