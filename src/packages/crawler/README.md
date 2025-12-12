# @rexa/crawler

Rexa의 Module 1: DocCrawler

웹 문서 사이트를 크롤링하여 신뢰 가능한 Markdown 문서 세트로 변환하는 모듈입니다.

## 설치

```bash
yarn add @rexa/crawler
```

## 사용법

```typescript
import { DocCrawler } from '@rexa/crawler';

const crawler = new DocCrawler();

const result = await crawler.crawl({
  entryUrl: 'https://react.dev/reference',
  scope: {
    type: 'prefix',
    allow: ['https://react.dev/reference'],
    deny: ['https://react.dev/blog']
  },
  outputDir: './docs'
});
```

## 주요 기능

- URL Scope 기반 크롤링 (필수)
- HTML → Markdown 변환 (turndown + GFM 플러그인)
- 파일 저장 구조 (`docs/<domain>/pages/`)
- 메타데이터 관리 (`meta.json`)

## 참고 문서

- [모듈 문서](../../../docs/modules/crawler.md)
- [API 설계](../../../docs/architecture/api-design.md)

