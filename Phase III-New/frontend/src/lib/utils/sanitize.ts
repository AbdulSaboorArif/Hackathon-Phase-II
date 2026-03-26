export function sanitizeAIResponse(content: string): string {
  const withoutTags = content.replace(/<[^>]*>/g, '');
  const withoutScripts = withoutTags.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  const withoutEvents = withoutScripts.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
  return withoutEvents;
}

export function sanitizeUserInput(input: string): string {
  const trimmed = input.trim();
  const withoutNullBytes = trimmed.replace(/\0/g, '');
  return withoutNullBytes;
}

export function validateMessageLength(message: string, maxLength: number = 2000): boolean {
  return message.length > 0 && message.length <= maxLength;
}
