import {z} from 'zod';

export const MAX_LIMIT = 50;
export const BULK_LIMIT = 100;

export const FAILED = -1;
export const PENDING = 0;
export const DONE = 1;
export const PENDING_CALLBACK = 2;

export const DEVICE_IOS_PLATFORM = 'ios';
export const PASS_APPLE_PLATFORM = 'apple';
export const PASS_GOOGLE_PLATFORM = 'google';

export const WEBHOOK_PASS_REGISTER_EVENT = 'pass:register';
export const WEBHOOK_PASS_UNREGISTER_EVENT = 'pass:unregister';

export const errorResponseSchema = z.object({
  error: z.string(),
});
