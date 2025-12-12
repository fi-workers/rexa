# Rexa - Claude 가이드

## 황금 규칙

구현 세부사항이 불확실할 때는 항상 개발자에게 먼저 물어보세요.

## 프로젝트 개요

Rexa는 웹 문서를 AI가 바로 이해하고 활용할 수 있는 형태로 재구성(Recast)해주는 로컬 퍼스트 문서 엔진입니다.

**핵심 철학**: "AI에게 무엇을 가르칠지는, 당신이 정한다."

Rexa는 4개의 독립적인 모듈로 구성됩니다:
1. **DocCrawler**: 웹 문서를 Markdown으로 변환
2. **LLMSTextBuilder**: Markdown을 llms.txt로 변환
3. **RAGBuilder**: llms.txt를 RAG 인덱스로 변환
4. **MCPResponder**: RAG를 MCP 서버로 제공

자세한 내용은 `.cursor/rules/` 디렉토리의 규칙 파일들을 참조하세요.

## 규칙 파일 참조

프로젝트의 상세한 개발 규칙은 `.cursor/rules/` 디렉토리에 목적별로 분리되어 있습니다:

- **ai-collaboration.mdc** - AI 협업 철학, 절대 원칙, 워크플로우
- **code-style.mdc** - 코드 스타일, 네이밍 컨벤션, TypeScript 규칙
- **tdd.mdc** - TDD 원칙, 테스트 가이드라인
- **project-structure.mdc** - 프로젝트 구조, 기술 스택
- **commands.mdc** - 일반적인 명령어 및 개발 환경 설정
- **git-workflow.mdc** - Git 워크플로우 및 커밋 규칙
- **domain-glossary.mdc** - 도메인 용어집 및 앵커 코멘트

## 핵심 원칙

- 영리함보다는 유지보수성을 우선시합니다
- 확실하지 않을 때는 지루한 솔루션을 선택하세요
- 구현 세부사항이 불확실할 때는 항상 개발자에게 먼저 물어보세요
- 작은 단위로 작업하고, 생성된 코드는 항상 검토하세요
