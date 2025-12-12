# 🚀 Rexa

**Recast the web docs for AI.**

Rexa는 웹 문서 사이트를 크롤링해 **Markdown → llms.txt → RAG → MCP** 파이프라인으로 연결하는
로컬 퍼스트(Local-first) AI 문서 엔진입니다.

Rexa를 사용하면 원하는 공식 문서를 직접 선택해
AI(ChatGPT, Cursor, Windsurf 등)가 그 문서만 기준으로 답변하도록 만들 수 있습니다.

## ✨ What is Rexa?

Rexa는 단순한 크롤러가 아닙니다.

**Rexa는 AI의 입력(Context)을 설계하는 도구입니다.**

```
Docs Website
   ↓
Markdown
   ↓
llms.txt
   ↓
RAG
   ↓
MCP Server
   ↓
AI
```

### 핵심 기능

- 📄 **웹 문서를 신뢰 가능한 Markdown으로 변환**
- 🧠 **LLM 친화적인 llms.txt 생성**
- 🔎 **RAG(Retrieval-Augmented Generation) 구축**
- 🔌 **MCP(Model Context Protocol) 서버로 AI에 제공**
- 💻 **로컬에서 실행 (인프라 0)**
- 🔓 **오픈소스**

## 🎯 Why Rexa?

### ❌ 기존 문제

- AI는 항상 최신/정확한 공식 문서를 보지 못함
- RAG 구축은 설정이 너무 복잡함
- 대부분 클라우드 SaaS 중심 (프라이버시 문제)
- "이 문서 기준으로만 답해줘"가 어려움

### ✅ Rexa의 해결

- **Local-first**: 모든 문서를 로컬에 저장
- **Trustable**: 사용자가 직접 선택한 문서만 사용
- **AI-native**: MCP 기반, AI가 탐색 가능한 구조
- **Zero infra**: Node.js만 있으면 실행

## 🧩 Core Modules

Rexa는 4개의 독립적인 모듈로 구성됩니다.

### 1️⃣ DocCrawler

웹 문서 사이트를 크롤링하여 고품질 Markdown으로 변환

### 2️⃣ LLMSTextBuilder

Markdown 문서를 LLM 표준 포맷인 llms.txt로 재구성

### 3️⃣ RAGBuilder

llms.txt 기반으로 검색 가능한 RAG 인덱스 생성

### 4️⃣ MCPResponder

RAG를 기반으로 MCP 서버를 통해 AI에 응답 제공

각 모듈은 단독 사용 가능하며, 조합 시 완전한 AI 문서 엔진이 됩니다.

## 🚀 Quick Start

```bash
# 설치
npm install -g rexa

# 문서 크롤링
rexa crawl https://react.dev/reference

# llms.txt 생성
rexa build-llms

# RAG 인덱스 구축
rexa build-rag

# MCP 서버 시작
rexa serve --mcp
```

## 📚 Documentation

자세한 문서는 [docs/](./docs/) 폴더를 참고하세요.

- [제품 비전](./docs/product/vision.md)
- [아키텍처 개요](./docs/architecture/overview.md)
- [모듈 설계](./docs/architecture/modules.md)
- [API 설계](./docs/architecture/api-design.md)
- [모듈별 가이드](./docs/modules/)

## 🏗 Project Structure

```
rexa/
├─ packages/
│  ├─ crawler/        ← Module 1: DocCrawler
│  ├─ llms/           ← Module 2: LLMSTextBuilder
│  ├─ rag/            ← Module 3: RAGBuilder
│  ├─ mcp/            ← Module 4: MCPResponder
│  ├─ cli/            ← CLI 인터페이스
│  └─ core/           ← 공유 타입 및 유틸리티
├─ docs/              ← 문서
└─ README.md
```

## 🎯 Target Users

### 1차 타겟: 개인 개발자

ChatGPT / Cursor / Windsurf를 주로 사용하는 개발자
"이 프로젝트는 이 문서 기준으로만 답해줘"가 필요한 사람

### 2차 타겟: AI 기반 개발 팀

사내 기술 스택 문서 통합
내부 가이드 + 외부 공식 문서 혼합
RAG를 쓰고 싶지만 복잡한 인프라는 원하지 않음

### 3차 타겟: SaaS / 엔터프라이즈

문서 자동 수집
팀 단위 공유
보안 격리
SLA 필요

## 💡 Philosophy

**"AI에게 무엇을 가르칠지는, 당신이 정한다."**

Rexa는 단순한 도구가 아닙니다.

Rexa는 **AI 시대의 "개인 지식 인프라"**입니다.

개발자는 자신만의 문서 기준을 만들고,
AI는 그 기준 안에서만 사고합니다.

Rexa는 AI의 입력을 통제하는 첫 번째 도구가 되는 것을 목표로 합니다.

## 📄 License

MIT

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines first.

---

**Rexa** - Recast the web docs for AI.
