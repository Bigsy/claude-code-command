import clipboardy from 'clipboardy';

export async function copyToClipboard(text: string): Promise<void> {
  try {
    await clipboardy.write(text);
  } catch (error) {
    throw new Error(`Failed to copy to clipboard: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}