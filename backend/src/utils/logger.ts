type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';

const getTimestamp = (): string => new Date().toISOString();

const log = (level: LogLevel, context: string, message: string): void => {
  const formatted = `[${getTimestamp()}] [${level}] [${context}] ${message}`;
  if (level === 'ERROR') {
    console.error(formatted);
  } else if (level === 'WARN') {
    console.warn(formatted);
  } else {
    console.log(formatted);
  }
};

export const logger = {
  info: (context: string, message: string) => log('INFO', context, message),
  warn: (context: string, message: string) => log('WARN', context, message),
  error: (context: string, message: string) => log('ERROR', context, message),
  debug: (context: string, message: string) => log('DEBUG', context, message),
};
