/**
 * turndown-plugin-gfm 타입 정의
 * @types/turndown-plugin-gfm이 없어서 직접 정의
 * @types/turndown의 Plugin 타입을 사용
 */

import type TurndownService from 'turndown';

// @types/turndown에서 Plugin 타입을 가져옴
type Plugin = TurndownService.Plugin;

declare module 'turndown-plugin-gfm' {
  export const gfm: Plugin;
  export const tables: Plugin;
  export const strikethrough: Plugin;
  export const taskListItems: Plugin;
}
