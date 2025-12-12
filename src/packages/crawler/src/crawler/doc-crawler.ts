/**
 * DocCrawler: 웹 문서 사이트를 크롤링하여 Markdown으로 변환
 * Crawlee 라이브러리 사용
 */

import { PlaywrightCrawler } from 'crawlee';
import type { CrawlInput, CrawlResult, CrawledPage } from '@rexa/crawler/types';
import { isUrlAllowed, createDefaultScope, normalizeUrl } from '@rexa/crawler/utils/scope';
import { LinkNormalizer } from '@rexa/crawler/utils/link-normalizer';
import { HtmlToMarkdownConverter } from '@rexa/crawler/converters/html-to-markdown';
import { FileStorage } from '@rexa/crawler/storage/file-storage';
import { MetadataManager } from '@rexa/crawler/metadata/metadata-manager';
import { InvalidUrlError, ScopeViolationError } from '@rexa/crawler/errors/crawler.errors';
import { logger } from '@rexa/crawler/utils/logger';

/**
 * DocCrawler 클래스
 * 웹 문서 사이트를 크롤링하여 신뢰 가능한 Markdown 문서 세트로 변환
 */
export class DocCrawler {
  private linkNormalizer: LinkNormalizer;

  private markdownConverter: HtmlToMarkdownConverter;

  private metadataManager: MetadataManager;

  constructor() {
    this.linkNormalizer = new LinkNormalizer();
    this.markdownConverter = new HtmlToMarkdownConverter();
    this.metadataManager = new MetadataManager();
  }

  /**
   * 크롤링 실행
   *
   * @param input 크롤링 입력
   * @returns 크롤링 결과
   */
  async crawl(input: CrawlInput): Promise<CrawlResult> {
    const startedAt = new Date().toISOString();

    // 입력 검증
    this.validateInput(input);

    // URL 파싱
    const entryUrlObj = new URL(input.entryUrl);
    const domain = entryUrlObj.hostname;

    // Scope 설정 (없으면 기본 생성)
    const scope = input.scope.allow?.length
      ? input.scope
      : createDefaultScope(input.entryUrl);

    // 파일 저장소 초기화
    const fileStorage = new FileStorage(input.outputDir, domain);
    await fileStorage.initialize();

    // 크롤된 페이지 목록
    const crawledPages: CrawledPage[] = [];

    // LinkNormalizer 초기화
    this.linkNormalizer.reset();

    logger.info('크롤링 시작', {
      entryUrl: input.entryUrl,
      domain,
      scope,
    });

    // Crawlee PlaywrightCrawler 설정
    const crawler = new PlaywrightCrawler({
      maxRequestsPerCrawl: input.options?.maxDepth ? undefined : 1000, // 기본 제한
      requestHandlerTimeoutSecs: 60,
      requestHandler: async ({ request, page, enqueueLinks }) => {
        const url = request.loadedUrl || request.url;

        // URL 정규화
        const normalizedUrl = normalizeUrl(url);

        // 중복 체크
        if (this.linkNormalizer.hasSeen(normalizedUrl)) {
          logger.debug('중복 URL 스킵', { url: normalizedUrl });
          return;
        }

        // Scope 검사
        if (!isUrlAllowed(normalizedUrl, scope)) {
          logger.debug('Scope 위반 URL 스킵', { url: normalizedUrl });
          return;
        }

        // 처리 시작
        this.linkNormalizer.markSeen(normalizedUrl);
        logger.info('페이지 처리 중', { url: normalizedUrl });

        try {
          // 페이지 로드 대기
          await page.waitForLoadState('networkidle', { timeout: 30000 });

          // 제목 추출
          const title = await page.title();

          // HTML 추출
          const html = await page.content();

          // Markdown 변환
          const markdown = this.markdownConverter.convert(html, normalizedUrl);

          // 파일 저장
          const markdownPath = await fileStorage.savePage(normalizedUrl, title, markdown);

          crawledPages.push({
            url: normalizedUrl,
            title,
            markdownPath,
          });

          logger.info('페이지 저장 완료', {
            url: normalizedUrl,
            title,
            path: markdownPath,
          });

          // 링크 추출 및 큐에 추가
          await enqueueLinks({
            selector: 'a[href]',
            label: 'documentation',
            transformRequestFunction: (req) => {
              const linkUrl = normalizeUrl(req.url);
              // Scope 검사 및 중복 체크
              if (isUrlAllowed(linkUrl, scope) && !this.linkNormalizer.hasSeen(linkUrl)) {
                return req;
              }
              return false; // 큐에 추가하지 않음
            },
          });
        } catch (error) {
          logger.error('페이지 처리 실패', {
            url: normalizedUrl,
            error: error instanceof Error ? error.message : String(error),
          });
          // 에러가 발생해도 계속 진행
        }
      },
    });

    // 크롤링 시작
    await crawler.run([input.entryUrl]);

    const finishedAt = new Date().toISOString();

    // 메타데이터 생성 및 저장
    const metadata = this.metadataManager.createMetadata(
      input.entryUrl,
      domain,
      scope,
      crawledPages.length,
    );
    await fileStorage.saveMetadata(metadata);

    // 페이지 병합 (선택적)
    if (crawledPages.length > 0) {
      await fileStorage.mergePages(crawledPages);
    }

    logger.info('크롤링 완료', {
      domain,
      pageCount: crawledPages.length,
      duration: new Date(finishedAt).getTime() - new Date(startedAt).getTime(),
    });

    return {
      site: {
        url: input.entryUrl,
        domain,
      },
      pages: crawledPages,
      meta: {
        pageCount: crawledPages.length,
        startedAt,
        finishedAt,
      },
    };
  }

  /**
   * 입력 검증
   *
   * @param input 크롤링 입력
   * @throws InvalidUrlError 유효하지 않은 URL
   * @throws ScopeViolationError entryUrl이 scope에 포함되지 않음
   */
  private validateInput(input: CrawlInput): void {
    // URL 검증
    try {
      new URL(input.entryUrl);
    } catch {
      throw new InvalidUrlError(input.entryUrl);
    }

    // Scope 검증: entryUrl이 scope에 포함되어야 함
    if (input.scope.allow?.length || input.scope.allowRegex?.length) {
      const normalizedEntryUrl = normalizeUrl(input.entryUrl);
      if (!isUrlAllowed(normalizedEntryUrl, input.scope)) {
        throw new ScopeViolationError(
          input.entryUrl,
          JSON.stringify(input.scope),
        );
      }
    }
  }
}

