/**
 * Evaluation logging middleware — structured logs without console.* APIs.
 * Server: writes JSON lines to stdout. Browser: optional remote sink.
 */

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogRecord {
  level: LogLevel;
  message: string;
  timestamp: string;
  service: string;
  context?: Record<string, unknown>;
}

type RemoteSink = (record: LogRecord) => void | Promise<void>;

function serialize(record: LogRecord): string {
  return JSON.stringify(record);
}

function writeStdoutLine(line: string): void {
  if (typeof process !== "undefined" && process.stdout?.write) {
    process.stdout.write(`${line}\n`);
  }
}

export interface Logger {
  debug(message: string, context?: Record<string, unknown>): void;
  info(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  error(message: string, context?: Record<string, unknown>): void;
}

export function createLogger(service: string, remoteSink?: RemoteSink): Logger {
  const emit = (level: LogLevel, message: string, context?: Record<string, unknown>) => {
    const record: LogRecord = {
      level,
      message,
      timestamp: new Date().toISOString(),
      service,
      ...(context && Object.keys(context).length ? { context } : {}),
    };
    if (remoteSink) {
      void Promise.resolve(remoteSink(record)).catch(() => {
        writeStdoutLine(serialize({ ...record, message: `${message} (remote sink failed)` }));
      });
    } else {
      writeStdoutLine(serialize(record));
    }
  };

  return {
    debug: (message, context) => emit("debug", message, context),
    info: (message, context) => emit("info", message, context),
    warn: (message, context) => emit("warn", message, context),
    error: (message, context) => emit("error", message, context),
  };
}

export interface RequestLogContext {
  method: string;
  path: string;
  status?: number;
  durationMs?: number;
}

/**
 * Express-style middleware factory (also usable manually in Route Handlers).
 */
export function createRequestLoggingMiddleware(service: string) {
  const log = createLogger(service);

  return function logRequestStart(ctx: Pick<RequestLogContext, "method" | "path">) {
    const start = Date.now();
    log.info("request:start", { method: ctx.method, path: ctx.path });
    return {
      complete(status: number) {
        const durationMs = Date.now() - start;
        log.info("request:complete", {
          method: ctx.method,
          path: ctx.path,
          status,
          durationMs,
        });
      },
    };
  };
}
