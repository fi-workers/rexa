/**
 * LinkNormalizer: URL 정규화 및 중복 제거
 */

import { normalizeUrl } from '@rexa/crawler/utils/scope';

/**
 * URL 정규화 및 중복 제거 유틸리티
 */
export class LinkNormalizer {
  private seenUrls = new Set<string>();

  /**
   * URL 정규화
   * - hash 제거
   * - query 제거
   * - trailing slash 정규화
   *
   * @param url 원본 URL
   * @returns 정규화된 URL
   */
  normalize(url: string): string {
    const normalized = normalizeUrl(url);
    // trailing slash 정규화 (선택적)
    return normalized.replace(/\/$/, '');
  }

  /**
   * URL이 이미 처리되었는지 확인
   *
   * @param url 확인할 URL
   * @returns 이미 처리된 URL인지 여부
   */
  hasSeen(url: string): boolean {
    const normalized = this.normalize(url);
    return this.seenUrls.has(normalized);
  }

  /**
   * URL을 처리된 목록에 추가
   *
   * @param url 추가할 URL
   */
  markSeen(url: string): void {
    const normalized = this.normalize(url);
    this.seenUrls.add(normalized);
  }

  /**
   * 처리된 URL 목록 초기화
   */
  reset(): void {
    this.seenUrls.clear();
  }

  /**
   * 처리된 URL 개수
   */
  get count(): number {
    return this.seenUrls.size;
  }
}

