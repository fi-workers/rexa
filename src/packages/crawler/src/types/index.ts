/**
 * Rexa Crawler 타입 정의
 * API 설계 문서 기반: docs/architecture/api-design.md
 */

/**
 * URL Scope 타입
 */
export type CrawlScopeType = 'prefix' | 'regex';

/**
 * URL Scope 정의
 * Rexa는 "사이트를 크롤링하지 않는다." "URL 하위 스코프를 크롤링한다."
 */
export interface CrawlScope {
  type: CrawlScopeType;

  // prefix 방식 (권장)
  allow?: string[]; // 허용 URL prefix
  deny?: string[]; // 차단 URL prefix

  // regex 방식 (고급 사용자)
  allowRegex?: RegExp[];
  denyRegex?: RegExp[];
}

/**
 * 크롤링 옵션
 */
export interface CrawlOptions {
  maxDepth?: number;
  force?: boolean;
}

/**
 * 크롤링 입력
 */
export interface CrawlInput {
  entryUrl: string; // 시작 URL (필수)
  scope: CrawlScope; // ★ 핵심: URL 범위 제한
  outputDir: string;

  options?: CrawlOptions;
}

/**
 * 크롤된 페이지 정보
 */
export interface CrawledPage {
  url: string;
  title: string;
  markdownPath: string;
}

/**
 * 크롤링 결과
 */
export interface CrawlResult {
  site: {
    url: string;
    domain: string;
  };

  pages: CrawledPage[];

  meta: {
    pageCount: number;
    startedAt: string;
    finishedAt: string;
  };
}

/**
 * 메타데이터 JSON 구조
 */
export interface CrawlMetadata {
  url: string;
  domain: string;
  scope: CrawlScope;
  pageCount: number;
  lastCrawledAt: string;
}

