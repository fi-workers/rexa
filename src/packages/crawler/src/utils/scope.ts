/**
 * URL Scope 필터링 로직
 * Rexa의 핵심: "사이트를 크롤링하지 않는다." "URL 하위 스코프를 크롤링한다."
 */

import type { CrawlScope } from '@rexa/crawler/types';

/**
 * URL이 scope에 허용되는지 확인
 *
 * 규칙:
 * 1. deny 우선 검사 (deny에 포함되면 무조건 거부)
 * 2. allow 검사 (allow에 포함되면 허용)
 * 3. deny가 항상 최우선
 * 4. 허용 규칙 하나라도 맞으면 OK
 *
 * @param url 검사할 URL
 * @param scope CrawlScope 정의
 * @returns 허용 여부
 */
export function isUrlAllowed(url: string, scope: CrawlScope): boolean {
  // 1. deny 우선 검사
  if (scope.deny) {
    for (const denyPrefix of scope.deny) {
      if (url.startsWith(denyPrefix)) {
        return false;
      }
    }
  }

  if (scope.denyRegex) {
    for (const denyRegex of scope.denyRegex) {
      if (denyRegex.test(url)) {
        return false;
      }
    }
  }

  // 2. allow 검사
  if (scope.allow) {
    for (const allowPrefix of scope.allow) {
      if (url.startsWith(allowPrefix)) {
        return true;
      }
    }
  }

  if (scope.allowRegex) {
    for (const allowRegex of scope.allowRegex) {
      if (allowRegex.test(url)) {
        return true;
      }
    }
  }

  // allow 규칙이 없거나 매칭되지 않으면 거부
  return false;
}

/**
 * entryUrl을 기반으로 기본 scope 생성
 *
 * 기본 정책:
 * - entryUrl 하위만 허용
 * - 일반적인 블로그/마케팅 경로는 자동으로 deny
 *
 * @param entryUrl 시작 URL
 * @returns 기본 CrawlScope
 */
export function createDefaultScope(entryUrl: string): CrawlScope {
  const url = new URL(entryUrl);
  const baseUrl = `${url.protocol}//${url.hostname}${url.pathname}`;

  // 일반적으로 제외할 경로들
  const commonDenyPaths = [
    '/blog',
    '/blog/',
    '/news',
    '/news/',
    '/community',
    '/community/',
    '/pricing',
    '/pricing/',
    '/company',
    '/company/',
    '/about',
    '/about/',
  ];

  const deny = commonDenyPaths
    .map((path) => `${url.protocol}//${url.hostname}${path}`)
    .filter((denyUrl) => !baseUrl.startsWith(denyUrl));

  return {
    type: 'prefix',
    allow: [baseUrl],
    deny,
  };
}

/**
 * URL에서 hash와 query 제거
 *
 * @param url 원본 URL
 * @returns 정규화된 URL
 */
export function normalizeUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    urlObj.hash = '';
    urlObj.search = '';
    return urlObj.toString();
  } catch {
    return url;
  }
}

