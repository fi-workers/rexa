/**
 * 메타데이터 관리
 * meta.json 생성 및 저장
 */

import type { CrawlScope, CrawlMetadata } from '@rexa/crawler/types';

/**
 * 메타데이터 관리 클래스
 */
export class MetadataManager {
  /**
   * 메타데이터 생성
   *
   * @param url 원본 URL
   * @param domain 도메인
   * @param scope 크롤링 scope
   * @param pageCount 페이지 개수
   * @returns 메타데이터 객체
   */
  createMetadata(
    url: string,
    domain: string,
    scope: CrawlScope,
    pageCount: number,
  ): CrawlMetadata {
    return {
      url,
      domain,
      scope,
      pageCount,
      lastCrawledAt: new Date().toISOString(),
    };
  }

  /**
   * 메타데이터 검증
   *
   * @param metadata 검증할 메타데이터
   * @returns 유효성 여부
   */
  validateMetadata(metadata: unknown): metadata is CrawlMetadata {
    if (typeof metadata !== 'object' || metadata === null) {
      return false;
    }

    const meta = metadata as Record<string, unknown>;

    return (
      typeof meta.url === 'string' &&
      typeof meta.domain === 'string' &&
      typeof meta.pageCount === 'number' &&
      typeof meta.lastCrawledAt === 'string' &&
      typeof meta.scope === 'object' &&
      meta.scope !== null
    );
  }
}

