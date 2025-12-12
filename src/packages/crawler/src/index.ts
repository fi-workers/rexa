/**
 * @rexa/crawler
 * Rexa Module 1: DocCrawler
 *
 * 웹 문서 사이트를 크롤링하여 신뢰 가능한 Markdown 문서 세트로 변환
 */

// Public API
export { DocCrawler } from './crawler/doc-crawler';

// Types
export type {
  CrawlInput,
  CrawlResult,
  CrawlScope,
  CrawlScopeType,
  CrawledPage,
  CrawlOptions,
  CrawlMetadata,
} from './types';

// Utils
export { isUrlAllowed, createDefaultScope, normalizeUrl } from './utils/scope';
export { LinkNormalizer } from './utils/link-normalizer';

// Converters
export { HtmlToMarkdownConverter } from './converters/html-to-markdown';

// Storage
export { FileStorage } from './storage/file-storage';

// Metadata
export { MetadataManager } from './metadata/metadata-manager';

// Errors
export {
  CrawlerError,
  InvalidUrlError,
  ScopeViolationError,
  ConversionError,
  StorageError,
} from './errors/crawler.errors';

// Logger
export { logger } from './utils/logger';

