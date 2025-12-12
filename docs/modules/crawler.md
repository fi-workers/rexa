# Module 1: DocCrawler

## 개요

DocCrawler는 웹 문서 사이트를 크롤링하여 신뢰 가능한 Markdown 문서 세트로 변환하는 모듈입니다.

## 핵심 원칙

**Rexa는 "사이트를 크롤링하지 않는다."**
**"URL 하위 스코프를 크롤링한다."**

## URL Scope 설계

### 기획 관점에서의 요구사항

#### 반드시 가능한 것

- `https://react.dev/reference/*` 만 크롤
- `https://docs.expo.dev/router/*` 만 크롤
- 다국어 중 한 언어만 선택
- 블로그/마케팅 페이지 배제

#### 절대 허용하지 않을 것

- 도메인 전체 무차별 크롤
- `/blog`, `/pricing`, `/company` 섞임
- 다른 언어 문서 자동 포함

### CrawlScope 정의

```typescript
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

### 기본 동작 규칙 (Default Policy)

**예시**

```
entryUrl = "https://react.dev/reference"
```

**자동 생성 scope**

```typescript
allow = ["https://react.dev/reference"]
deny = [
  "https://react.dev/blog",
  "https://react.dev/community",
  "https://react.dev/learn"
]
```

즉, `entryUrl` 하위만 기본 허용

### URL 필터링 알고리즘

```typescript
function isUrlAllowed(url: string, scope: CrawlScope): boolean {
  // 1. deny 우선 검사
  if (scope.deny?.some(prefix => url.startsWith(prefix))) {
    return false
  }

  if (scope.denyRegex?.some(rx => rx.test(url))) {
    return false
  }

  // 2. allow 검사
  if (scope.allow?.some(prefix => url.startsWith(prefix))) {
    return true
  }

  if (scope.allowRegex?.some(rx => rx.test(url))) {
    return true
  }

  return false
}
```

**중요 포인트**

- `allow → deny` 순서 아님
- `deny`가 항상 최우선
- 허용 규칙 하나라도 맞으면 OK

### CLI UX 설계

#### 기본 사용 (추천)

```bash
rexa crawl https://react.dev/reference
```

→ 자동으로 `/reference` 하위만 크롤

#### 명시적 scope 지정

```bash
rexa crawl https://react.dev \
  --allow /reference \
  --deny /blog \
  --deny /community
```

또는

```bash
rexa crawl https://docs.expo.dev \
  --allow /router,/config
```

#### Regex 기반 (고급)

```bash
rexa crawl https://example.com \
  --allow-regex "^/docs/.*" \
  --deny-regex "^/docs/legacy/.*"
```

### 다국어 문서 처리

**문제**

```
/docs/en/...
/docs/ko/...
/docs/ja/...
```

**해결**

Scope로 강제 제한

```bash
rexa crawl https://example.com/docs/en
```

or

```typescript
allow = ["https://example.com/docs/en"]
deny = ["https://example.com/docs/ko"]
```

### Scope는 metadata에 반드시 저장

```json
{
  "entryUrl": "https://react.dev/reference",
  "scope": {
    "type": "prefix",
    "allow": ["https://react.dev/reference"],
    "deny": ["https://react.dev/blog"]
  },
  "pageCount": 112,
  "lastCrawledAt": "2025-01-10T12:00:00Z"
}
```

**이유**

- 재크롤 시 동일 조건 유지
- SaaS에서 자동 업데이트 가능
- 문서 신뢰성 확보

### llms.txt / RAG 품질에 미치는 영향

**URL Scope가 없으면:**

- ❌ llms.txt가 잡음 덩어리
- ❌ RAG 검색 정확도 급락
- ❌ AI가 블로그 글 인용
- ❌ 답변 일관성 붕괴

**URL Scope가 있으면:**

- ✅ llms.txt = "정제된 지식 코퍼스"
- ✅ RAG recall/precision 상승
- ✅ MCP 응답 신뢰도 급상승

### 실패 방지용 필수 규칙

1. `entryUrl`은 반드시 scope에 포함
2. scope 외 URL은 절대 follow 금지
3. redirect 후 URL도 scope 재검증
4. canonical URL 기준으로 판단
5. hash(#) / query(?) 제거 후 검사

## Public API

```typescript
interface DocCrawler {
  crawl(input: CrawlInput): Promise<CrawlResult>
}

interface CrawlInput {
  entryUrl: string          // 시작 URL (필수)
  scope: CrawlScope         // ★ 핵심
  outputDir: string

  options?: {
    maxDepth?: number
    force?: boolean
  }
}

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

## 파일 산출물

```
docs/<domain>/
 ├─ pages/
 │   ├─ getting-started.md
 │   ├─ hooks-useState.md
 ├─ merged.md
 └─ meta.json
```

## 내부 서브 컴포넌트

- **CrawlerAdapter**: fetch / headless 브라우저 어댑터
- **LinkNormalizer**: URL 정규화 및 중복 제거
- **SidebarParser**: 사이드바/TOC 파싱
- **HtmlToMarkdownParser**: HTML → Markdown 변환
- **PageMerger**: 관련 페이지 병합

## 사용 기술

- TypeScript
- node-fetch / undici
- cheerio
- turndown
- Rexa Parser Rules

## Rexa 철학

**Rexa는 "많이 긁는 도구"가 아니라 "정확한 지식 범위를 정의하는 도구"다.**

그래서 URL Scope는 단순 옵션이 아니라 Rexa 품질의 핵심 제어 장치다.

