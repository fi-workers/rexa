/**
 * HTML → Markdown 변환기
 * turndown + turndown-plugin-gfm 사용
 */

import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';
import { ConversionError } from '@rexa/crawler/errors/crawler.errors';
import { logger } from '@rexa/crawler/utils/logger';

/**
 * HTML을 Markdown으로 변환하는 클래스
 */
export class HtmlToMarkdownConverter {
  private turndownService: TurndownService;

  constructor() {
    this.turndownService = new TurndownService({
      headingStyle: 'atx', // # 스타일 사용
      codeBlockStyle: 'fenced', // ``` 코드 블록 사용
      fence: '```',
      emDelimiter: '*',
      strongDelimiter: '**',
      linkStyle: 'inlined', // 인라인 링크 스타일
      linkReferenceStyle: 'full',
    });

    // GFM 플러그인 사용 (테이블, 취소선 등)
    this.turndownService.use(gfm);

    // 코드 블록 보존 설정
    this.turndownService.addRule('codeBlock', {
      filter: ['pre'],
      replacement: (content: string, node: Node) => {
        const element = node as Element;
        const codeNode = element.querySelector('code');
        if (codeNode) {
          const language = codeNode.className?.replace(/^language-/, '') || '';
          const code = codeNode.textContent || '';
          return `\n\n\`\`\`${language}\n${code}\n\`\`\`\n\n`;
        }
        return `\n\n${content}\n\n`;
      },
    });
  }

  /**
   * HTML 문자열을 Markdown으로 변환
   *
   * @param html HTML 문자열
   * @param url 원본 URL (에러 메시지용)
   * @returns Markdown 문자열
   * @throws ConversionError 변환 실패 시
   */
  convert(html: string, url?: string): string {
    try {
      const markdown = this.turndownService.turndown(html);
      return markdown;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('HTML → Markdown 변환 실패', { url, error: errorMessage });
      throw new ConversionError(url || 'unknown', error instanceof Error ? error : undefined);
    }
  }

  /**
   * DOM 요소를 Markdown으로 변환
   *
   * @param element DOM 요소
   * @param url 원본 URL (에러 메시지용)
   * @returns Markdown 문자열
   * @throws ConversionError 변환 실패 시
   */
  convertElement(element: Element, url?: string): string {
    try {
      const markdown = this.turndownService.turndown(element as HTMLElement);
      return markdown;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('HTML → Markdown 변환 실패', { url, error: errorMessage });
      throw new ConversionError(url || 'unknown', error instanceof Error ? error : undefined);
    }
  }
}

