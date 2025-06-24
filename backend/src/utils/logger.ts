import chalk from "chalk";

type LogLevel = "info" | "warn" | "error" | "debug";

interface LogOptions {
  timestamp?: boolean;
  category?: string;
  level?: LogLevel;
}

class Logger {
  private static instance: Logger;
  private isDevelopment: boolean;

  private constructor() {
    this.isDevelopment = process.env.NODE_ENV !== "production";
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private formatMessage(message: string, options: LogOptions = {}): string {
    const { timestamp = true, category, level = "info" } = options;
    const timestampStr = timestamp ? `[${new Date().toISOString()}]` : "";
    const categoryStr = category ? `[${category}]` : "";
    const levelStr = `[${level.toUpperCase()}]`;

    const colorMap = {
      info: chalk.blue,
      warn: chalk.yellow,
      error: chalk.red,
      debug: chalk.gray,
    };

    const coloredLevel = colorMap[level](levelStr);
    return `${timestampStr} ${coloredLevel} ${categoryStr} ${message}`.trim();
  }

  private log(
    level: LogLevel,
    message: string | object,
    options: LogOptions = {},
  ) {
    if (!this.isDevelopment && level === "debug") return;

    const formattedMessage =
      typeof message === "object" ? JSON.stringify(message, null, 2) : message;

    const output = this.formatMessage(formattedMessage, { ...options, level });

    switch (level) {
      case "error":
        console.error(output);
        break;
      case "warn":
        console.warn(output);
        break;
      case "debug":
        console.debug(output);
        break;
      default:
        console.log(output);
    }
  }

  public info(message: string | object, options: LogOptions = {}) {
    this.log("info", message, options);
  }

  public warn(message: string | object, options: LogOptions = {}) {
    this.log("warn", message, options);
  }

  public error(message: string | object, options: LogOptions = {}) {
    this.log("error", message, options);
  }

  public debug(message: string | object, options: LogOptions = {}) {
    this.log("debug", message, options);
  }

  // Specialized loggers for different components
  public socket(message: string | object, level: LogLevel = "info") {
    this.log(level, message, { category: "Socket.IO" });
  }

  public server(message: string | object, level: LogLevel = "info") {
    this.log(level, message, { category: "Server" });
  }

  public db(message: string | object, level: LogLevel = "info") {
    this.log(level, message, { category: "Database" });
  }

  public api(message: string | object, level: LogLevel = "info") {
    this.log(level, message, { category: "API" });
  }
}

export const logger = Logger.getInstance();
