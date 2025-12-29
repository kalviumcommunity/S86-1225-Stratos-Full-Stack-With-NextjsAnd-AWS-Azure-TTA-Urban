/**
 * RBAC Audit Logger
 *
 * Logs all authorization decisions for security auditing and debugging.
 * Provides detailed information about who accessed what and whether it was allowed.
 */

import { Role, Permission } from "@/app/config/roles";

export enum AuditAction {
  PERMISSION_CHECK = "PERMISSION_CHECK",
  ROLE_CHECK = "ROLE_CHECK",
  RESOURCE_ACCESS = "RESOURCE_ACCESS",
  API_ACCESS = "API_ACCESS",
}

export enum AuditResult {
  ALLOWED = "ALLOWED",
  DENIED = "DENIED",
}

export interface AuditLogEntry {
  timestamp: Date;
  action: AuditAction;
  result: AuditResult;
  userId?: string;
  userEmail?: string;
  userRole?: Role;
  resource?: string;
  permission?: Permission;
  requiredRole?: Role;
  reason?: string;
  metadata?: Record<string, any>;
}

class RBACAuditLogger {
  private logs: AuditLogEntry[] = [];
  private readonly MAX_LOGS = 1000; // Keep last 1000 entries in memory

  /**
   * Log a permission check
   */
  logPermissionCheck(
    userId: string,
    userEmail: string,
    userRole: Role,
    permission: Permission,
    result: AuditResult,
    reason?: string,
    metadata?: Record<string, any>
  ): void {
    const entry: AuditLogEntry = {
      timestamp: new Date(),
      action: AuditAction.PERMISSION_CHECK,
      result,
      userId,
      userEmail,
      userRole,
      permission,
      reason,
      metadata,
    };

    this.addLog(entry);
    this.printLog(entry);
  }

  /**
   * Log a role check
   */
  logRoleCheck(
    userId: string,
    userEmail: string,
    userRole: Role,
    requiredRole: Role,
    result: AuditResult,
    reason?: string,
    metadata?: Record<string, any>
  ): void {
    const entry: AuditLogEntry = {
      timestamp: new Date(),
      action: AuditAction.ROLE_CHECK,
      result,
      userId,
      userEmail,
      userRole,
      requiredRole,
      reason,
      metadata,
    };

    this.addLog(entry);
    this.printLog(entry);
  }

  /**
   * Log a resource access attempt
   */
  logResourceAccess(
    userId: string,
    userEmail: string,
    userRole: Role,
    resource: string,
    result: AuditResult,
    permission?: Permission,
    reason?: string,
    metadata?: Record<string, any>
  ): void {
    const entry: AuditLogEntry = {
      timestamp: new Date(),
      action: AuditAction.RESOURCE_ACCESS,
      result,
      userId,
      userEmail,
      userRole,
      resource,
      permission,
      reason,
      metadata,
    };

    this.addLog(entry);
    this.printLog(entry);
  }

  /**
   * Log an API access attempt
   */
  logAPIAccess(
    userId: string | undefined,
    userEmail: string | undefined,
    userRole: Role | undefined,
    resource: string,
    result: AuditResult,
    reason?: string,
    metadata?: Record<string, any>
  ): void {
    const entry: AuditLogEntry = {
      timestamp: new Date(),
      action: AuditAction.API_ACCESS,
      result,
      userId,
      userEmail,
      userRole,
      resource,
      reason,
      metadata,
    };

    this.addLog(entry);
    this.printLog(entry);
  }

  /**
   * Add log entry to internal storage
   */
  private addLog(entry: AuditLogEntry): void {
    this.logs.push(entry);

    // Keep only the most recent logs
    if (this.logs.length > this.MAX_LOGS) {
      this.logs.shift();
    }
  }

  /**
   * Print log entry to console
   */
  private printLog(entry: AuditLogEntry): void {
    const color =
      entry.result === AuditResult.ALLOWED ? "\x1b[32m" : "\x1b[31m"; // Green for allowed, red for denied
    const reset = "\x1b[0m";

    const timestamp = entry.timestamp.toISOString();
    const user = entry.userEmail || entry.userId || "anonymous";
    const role = entry.userRole || "none";
    const resource =
      entry.resource || entry.permission || entry.requiredRole || "unknown";
    const result = entry.result;
    const reason = entry.reason || "No reason provided";

    console.log(
      `${color}[RBAC AUDIT]${reset} ${timestamp} | ` +
        `User: ${user} (${role}) | ` +
        `Action: ${entry.action} | ` +
        `Resource: ${resource} | ` +
        `Result: ${color}${result}${reset} | ` +
        `Reason: ${reason}`
    );

    if (entry.metadata && Object.keys(entry.metadata).length > 0) {
      console.log("  Metadata:", entry.metadata);
    }
  }

  /**
   * Get all logs
   */
  getLogs(): AuditLogEntry[] {
    return [...this.logs];
  }

  /**
   * Get logs filtered by result
   */
  getLogsByResult(result: AuditResult): AuditLogEntry[] {
    return this.logs.filter((log) => log.result === result);
  }

  /**
   * Get logs for a specific user
   */
  getUserLogs(userId: string): AuditLogEntry[] {
    return this.logs.filter((log) => log.userId === userId);
  }

  /**
   * Get logs for a specific action
   */
  getActionLogs(action: AuditAction): AuditLogEntry[] {
    return this.logs.filter((log) => log.action === action);
  }

  /**
   * Get denied access attempts
   */
  getDeniedAttempts(): AuditLogEntry[] {
    return this.getLogsByResult(AuditResult.DENIED);
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    this.logs = [];
  }

  /**
   * Get audit statistics
   */
  getStatistics(): {
    total: number;
    allowed: number;
    denied: number;
    byAction: Record<string, number>;
    byRole: Record<string, number>;
  } {
    const stats = {
      total: this.logs.length,
      allowed: this.logs.filter((l) => l.result === AuditResult.ALLOWED).length,
      denied: this.logs.filter((l) => l.result === AuditResult.DENIED).length,
      byAction: {} as Record<string, number>,
      byRole: {} as Record<string, number>,
    };

    this.logs.forEach((log) => {
      // Count by action
      stats.byAction[log.action] = (stats.byAction[log.action] || 0) + 1;

      // Count by role
      if (log.userRole) {
        stats.byRole[log.userRole] = (stats.byRole[log.userRole] || 0) + 1;
      }
    });

    return stats;
  }
}

// Export singleton instance
export const auditLogger = new RBACAuditLogger();

/**
 * Helper function to log permission checks
 */
export function logPermission(
  userId: string,
  userEmail: string,
  userRole: Role,
  permission: Permission,
  allowed: boolean,
  reason?: string
): void {
  auditLogger.logPermissionCheck(
    userId,
    userEmail,
    userRole,
    permission,
    allowed ? AuditResult.ALLOWED : AuditResult.DENIED,
    reason
  );
}

/**
 * Helper function to log role checks
 */
export function logRoleCheck(
  userId: string,
  userEmail: string,
  userRole: Role,
  requiredRole: Role,
  allowed: boolean,
  reason?: string
): void {
  auditLogger.logRoleCheck(
    userId,
    userEmail,
    userRole,
    requiredRole,
    allowed ? AuditResult.ALLOWED : AuditResult.DENIED,
    reason
  );
}
