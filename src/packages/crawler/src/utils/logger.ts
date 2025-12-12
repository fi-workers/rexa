/**
 * 로거 유틸리티
 * Backend 패키지의 logger 패턴 참고
 */

const formatMessage = (level: string, ...args: unknown[]): string => {
  const timestamp = new Date().toISOString();
  const formattedArgs = args.map((arg) =>
    typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg),
  );
  return `[${timestamp}] [${level.toUpperCase()}] ${formattedArgs.join(' ')}`;
};

export const logger = {
  error: (...args: unknown[]) => console.error(formatMessage('error', ...args)),
  warn: (...args: unknown[]) => console.warn(formatMessage('warn', ...args)),
  info: (...args: unknown[]) => console.info(formatMessage('info', ...args)),
  debug: (...args: unknown[]) => console.debug(formatMessage('debug', ...args)),
};

