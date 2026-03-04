import { ipcMain } from 'electron';
import type { z } from 'zod';

type IpcSchema = {
  [channel: string]: {
    args: z.ZodType;
    return: z.ZodType;
  };
};

/**
 * Type-safe IPC handler registration with Zod validation.
 * Validates incoming arguments against the schema before executing the handler.
 */
export function createTypedHandler<S extends IpcSchema>(schema: S) {
  return function handle<K extends keyof S & string>(
    channel: K,
    handler: (...args: unknown[]) => unknown
  ): void {
    ipcMain.handle(channel, async (_event, ...rawArgs: unknown[]) => {
      try {
        const channelSchema = schema[channel];
        if (!channelSchema) {
          console.error(`[Conveyor] No schema for channel: ${channel}`);
          throw new Error(`Unknown channel: ${channel}`);
        }

        const parseResult = channelSchema.args.safeParse(rawArgs);
        if (!parseResult.success) {
          console.error(`[Conveyor] Validation failed for ${channel}:`, parseResult.error.format());
          throw new Error(`Invalid arguments for ${channel}: ${parseResult.error.message}`);
        }

        const validArgs = parseResult.data as unknown[];
        return await handler(...validArgs);
      } catch (err) {
        console.error(`[Conveyor] Handler error for ${channel}:`, err);
        throw err;
      }
    });
  };
}

/**
 * Type-safe IPC send handler (fire-and-forget, no return value).
 */
export function createTypedSendHandler<S extends IpcSchema>(schema: S) {
  return function onSend<K extends keyof S & string>(
    channel: K,
    handler: (...args: unknown[]) => void
  ): void {
    ipcMain.on(channel, (event, ...rawArgs: unknown[]) => {
      try {
        const channelSchema = schema[channel];
        if (channelSchema) {
          const parseResult = channelSchema.args.safeParse(rawArgs);
          if (!parseResult.success) {
            console.error(`[Conveyor] Validation failed for ${channel}:`, parseResult.error.format());
            return;
          }
        }
        handler(...rawArgs);
      } catch (err) {
        console.error(`[Conveyor] Send handler error for ${channel}:`, err);
      }
    });
  };
}
