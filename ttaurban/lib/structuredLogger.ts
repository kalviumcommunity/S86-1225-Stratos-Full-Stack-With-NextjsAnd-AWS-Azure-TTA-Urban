/**
 * Structured Logging Utility
 *
 * Provides JSON-formatted structured logs for better searchability and correlation
 * in cloud monitoring services (AWS CloudWatch / Azure Monitor)
 */

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogContext {
  requestId?: string;
  userId?: string;
  endpoint?: string;
  method?: string;
  statusCode?: number;
  duration?: number;
  [key: string]: any;
}

export interface StructuredLog {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: {
    message: string;
    stack?: string;
    code?: string;
  };
  environment: string;
  service: string;
  version: string;
}

class StructuredLogger {
  private service: string;
  private version: string;
  private environment: string;

  constructor() {
    this.service = process.env.SERVICE_NAME || "ttaurban-nextjs";
    this.version = process.env.APP_VERSION || "1.0.0";
    this.environment = process.env.NODE_ENV || "development";
  }

  /**
   * Generate a unique correlation ID for request tracing
   */
  generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Create a structured log entry
   */
  private createLog(
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: Error
  ): StructuredLog {
    const log: StructuredLog = {
      timestamp: new Date().toISOString(),
      level,
      message,
      environment: this.environment,
      service: this.service,
      version: this.version,
    };

    if (context) {
      log.context = context;
    }

    if (error) {
      log.error = {
        message: error.message,
        stack: error.stack,
        code: (error as any).code,
      };
    }

    return log;
  }

  /**
   * Output log to console in JSON format
   */
  private output(log: StructuredLog): void {
    const logString = JSON.stringify(log);

    /* eslint-disable no-console */
    switch (log.level) {
      case "error":
        console.error(logString);
        break;
      case "warn":
        console.warn(logString);
        break;
      case "debug":
        if (this.environment === "development") {
          console.debug(logString);
        }
        break;
      default:
        console.log(logString);
    }
    /* eslint-enable no-console */
  }

  /**
   * Log debug message
   */
  debug(message: string, context?: LogContext): void {
    const log = this.createLog("debug", message, context);
    this.output(log);
  }

  /**
   * Log info message
   */
  info(message: string, context?: LogContext): void {
    const log = this.createLog("info", message, context);
    this.output(log);
  }

  /**
   * Log warning message
   */
  warn(message: string, context?: LogContext): void {
    const log = this.createLog("warn", message, context);
    this.output(log);
  }

  /**
   * Log error message
   */
  error(message: string, context?: LogContext, error?: Error): void {
    const log = this.createLog("error", message, context, error);
    this.output(log);
  }

  /**
   * Log HTTP request
   */
  logRequest(req: any, context?: LogContext): string {
    const requestId = context?.requestId || this.generateRequestId();

    this.info("API request received", {
      requestId,
      endpoint: req.url,
      method: req.method,
      userAgent: req.headers["user-agent"],
      ip: req.headers["x-forwarded-for"] || req.socket?.remoteAddress,
      ...context,
    });

    return requestId;
  }

  /**
   * Log HTTP response
   */
  logResponse(
    requestId: string,
    statusCode: number,
    duration: number,
    context?: LogContext
  ): void {
    this.info("API request completed", {
      requestId,
      statusCode,
      duration,
      ...context,
    });
  }

  /**
   * Log database query
   */
  logQuery(
    requestId: string,
    query: string,
    duration: number,
    context?: LogContext
  ): void {
    this.debug("Database query executed", {
      requestId,
      query: query.substring(0, 200), // Truncate long queries
      duration,
      ...context,
    });
  }

  /**
   * Log authentication event
   */
  logAuth(
    requestId: string,
    event: string,
    userId?: string,
    context?: LogContext
  ): void {
    this.info(`Authentication: ${event}`, {
      requestId,
      userId,
      event,
      ...context,
    });
  }

  /**
   * Log performance metric
   */
  logMetric(
    metricName: string,
    value: number,
    unit: string,
    context?: LogContext
  ): void {
    this.info("Performance metric", {
      metricName,
      value,
      unit,
      ...context,
    });
  }
}

// Export singleton instance
export const logger = new StructuredLogger();

// Export for testing
export { StructuredLogger };
