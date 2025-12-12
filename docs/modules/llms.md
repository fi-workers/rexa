# Module 2: LLMSTextBuilder

## 개요

LLMSTextBuilder는 Markdown 문서 세트를 LLM 표준 포맷인 `llms.txt`로 재구성하는 모듈입니다.

## 목적

Markdown 문서들을 LLM 소비에 최적화된 단일 텍스트 포맷으로 변환
RAG, fine-tuning, context injection의 공통 입력 포맷

## Public API

```typescript
interface LLMSTextBuilder {
  build(input: LLMSTextInput): Promise<LLMSTextResult>
}

interface LLMSTextInput {
  docsDir: string        // docs/<domain>
  outputPath: string    // docs/<domain>/llms.txt

  options?: {
    maxTokensPerSection?: number
    dedupe?: boolean
  }
}

interface LLMSTextResult {
  llmsPath: string
  sectionCount: number
  totalChars: number
}
```

## llms.txt 포맷

### 기본 구조

```
# React Documentation
# Source: https://react.dev

## useState
<content>

## useEffect
<content>
```

### 규칙

1. **Heading 기반(section)**: 각 섹션은 heading으로 구분
2. **중복 제거**: 동일한 내용은 한 번만 포함
3. **코드 블록 유지**: 코드 블록은 그대로 보존
4. **순서**: meta.json 또는 sidebar 기준으로 정렬

### 예시

```
# React Documentation
# Source: https://react.dev
# Last Updated: 2025-01-10T12:00:00Z

## useState

`useState`는 React Hook으로, 컴포넌트에 state 변수를 추가할 수 있게 해줍니다.

```typescript
const [state, setState] = useState(initialState);
```

### Parameters

- `initialState`: 초기 state 값

### Returns

`useState`는 두 개의 값을 반환합니다:
1. 현재 state
2. state를 업데이트하는 함수

## useEffect

`useEffect`는 컴포넌트에 side effect를 추가할 수 있게 해주는 React Hook입니다.

...
```

## 내부 책임

### 1. 문서 순서 재정렬

- meta.json의 순서 정보 활용
- sidebar 구조 파싱
- 의존성 기반 정렬

### 2. 중복 제거

- 동일한 heading + content 조합 제거
- 유사도 기반 중복 감지 (optional)

### 3. Heading 기반 section 분리

- Markdown heading 레벨 파싱
- 각 section을 독립적인 단위로 처리

### 4. 토큰 수 고려한 분할 (optional)

- maxTokensPerSection 옵션 지원
- 섹션이 너무 길면 적절히 분할

### 5. 메타데이터 주석 포함

- 소스 URL
- 마지막 업데이트 시간
- 문서 개수 등

## 사용 기술

- TypeScript
- markdown-it
- custom chunking logic

## 다음 모듈과의 연동

➡ Module 3은 `llms.txt` 하나만 입력으로 받는다.
Markdown 구조, 파일 수, 원본 문서는 알 필요 없음.

## 독립성

LLMSTextBuilder는 독립적인 1급 산출물입니다.

- RAG 없이도 사용 가능
- Fine-tuning 입력으로 사용 가능
- Context injection에 직접 사용 가능

