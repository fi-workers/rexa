/**
 * 파일 저장 로직
 * docs/<domain>/ 구조로 저장
 */

import { promises as fs } from 'fs';
import { join } from 'path';
import type { CrawlMetadata, CrawledPage } from '@rexa/crawler/types';
import { StorageError } from '@rexa/crawler/errors/crawler.errors';
import { logger } from '@rexa/crawler/utils/logger';

/**
 * 파일 저장 클래스
 */
export class FileStorage {
  private outputDir: string;

  private domain: string;

  private pagesDir: string;

  constructor(outputDir: string, domain: string) {
    this.outputDir = outputDir;
    this.domain = domain;
    this.pagesDir = join(outputDir, domain, 'pages');
  }

  /**
   * 저장 디렉토리 초기화
   */
  async initialize(): Promise<void> {
    try {
      await fs.mkdir(this.pagesDir, { recursive: true });
      logger.info('저장 디렉토리 초기화 완료', { path: this.pagesDir });
    } catch (error) {
      logger.error('저장 디렉토리 초기화 실패', { path: this.pagesDir, error });
      throw new StorageError(this.pagesDir, error instanceof Error ? error : undefined);
    }
  }

  /**
   * URL을 파일명으로 변환
   *
   * @param url 원본 URL
   * @returns 파일명 (확장자 제외)
   */
  urlToFilename(url: string): string {
    try {
      const urlObj = new URL(url);
      let pathname = urlObj.pathname;

      // 루트 경로 처리
      if (pathname === '/' || pathname === '') {
        return 'index';
      }

      // 경로 정규화
      pathname = pathname
        .replace(/^\//, '') // 앞의 슬래시 제거
        .replace(/\/$/, '') // 뒤의 슬래시 제거
        .replace(/\//g, '-') // 슬래시를 하이픈으로
        .replace(/[^a-zA-Z0-9-]/g, '-') // 특수문자를 하이픈으로
        .replace(/-+/g, '-') // 연속된 하이픈을 하나로
        .replace(/^-|-$/g, ''); // 앞뒤 하이픈 제거

      return pathname || 'index';
    } catch {
      // URL 파싱 실패 시 기본값
      return 'index';
    }
  }

  /**
   * Markdown 파일 저장
   *
   * @param url 원본 URL
   * @param title 페이지 제목
   * @param markdown Markdown 내용
   * @returns 저장된 파일 경로
   */
  async savePage(url: string, title: string, markdown: string): Promise<string> {
    try {
      const filename = this.urlToFilename(url);
      const filepath = join(this.pagesDir, `${filename}.md`);

      // 파일 헤더 추가
      const content = `# ${title}\n\n**Source:** ${url}\n\n---\n\n${markdown}`;

      await fs.writeFile(filepath, content, 'utf-8');
      logger.debug('페이지 저장 완료', { url, filepath });

      return filepath;
    } catch (error) {
      logger.error('페이지 저장 실패', { url, error });
      throw new StorageError(url, error instanceof Error ? error : undefined);
    }
  }

  /**
   * 메타데이터 저장
   *
   * @param metadata 메타데이터
   */
  async saveMetadata(metadata: CrawlMetadata): Promise<void> {
    try {
      const metadataPath = join(this.outputDir, this.domain, 'meta.json');
      const content = JSON.stringify(metadata, null, 2);

      await fs.writeFile(metadataPath, content, 'utf-8');
      logger.info('메타데이터 저장 완료', { path: metadataPath });
    } catch (error) {
      logger.error('메타데이터 저장 실패', { error });
      throw new StorageError('meta.json', error instanceof Error ? error : undefined);
    }
  }

  /**
   * 모든 페이지를 하나의 파일로 병합
   *
   * @param pages 크롤된 페이지 목록
   */
  async mergePages(pages: CrawledPage[]): Promise<void> {
    try {
      const mergedPath = join(this.outputDir, this.domain, 'merged.md');
      const contents: string[] = [];

      for (const page of pages) {
        try {
          const pageContent = await fs.readFile(page.markdownPath, 'utf-8');
          contents.push(pageContent);
          contents.push('\n\n---\n\n');
        } catch (error) {
          logger.warn('페이지 읽기 실패 (병합 스킵)', { path: page.markdownPath, error });
        }
      }

      const mergedContent = contents.join('\n');
      await fs.writeFile(mergedPath, mergedContent, 'utf-8');
      logger.info('페이지 병합 완료', { path: mergedPath, pageCount: pages.length });
    } catch (error) {
      logger.error('페이지 병합 실패', { error });
      throw new StorageError('merged.md', error instanceof Error ? error : undefined);
    }
  }

  /**
   * 저장된 페이지 경로 반환
   *
   * @param url 원본 URL
   * @returns 저장된 파일 경로
   */
  getPagePath(url: string): string {
    const filename = this.urlToFilename(url);
    return join(this.pagesDir, `${filename}.md`);
  }
}

