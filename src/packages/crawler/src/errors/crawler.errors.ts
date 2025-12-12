/**
 * Crawler 에러 클래스 정의
 * Backend 패키지의 에러 패턴 참고
 */

export class CrawlerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CrawlerError';
  }
}

export class InvalidUrlError extends CrawlerError {
  constructor(url: string) {
    super(`유효하지 않은 URL입니다: ${url}`);
    this.name = 'InvalidUrlError';
  }
}

export class ScopeViolationError extends CrawlerError {
  constructor(url: string, scope: string) {
    super(`URL이 scope를 위반했습니다. URL: ${url}, Scope: ${scope}`);
    this.name = 'ScopeViolationError';
  }
}

export class ConversionError extends CrawlerError {
  constructor(url: string, cause?: Error) {
    super(`HTML → Markdown 변환 실패: ${url}${cause ? ` - ${cause.message}` : ''}`);
    this.name = 'ConversionError';
    if (cause) {
      this.cause = cause;
    }
  }
}

export class StorageError extends CrawlerError {
  constructor(path: string, cause?: Error) {
    super(`파일 저장 실패: ${path}${cause ? ` - ${cause.message}` : ''}`);
    this.name = 'StorageError';
    if (cause) {
      this.cause = cause;
    }
  }
}

