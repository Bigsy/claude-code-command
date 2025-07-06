import { select, input } from '@inquirer/prompts';

export type MenuAction = 'execute' | 'copy' | 'refine' | 'exit';

export async function showMenu(): Promise<MenuAction> {
  const answer = await select({
    message: 'What would you like to do?',
    choices: [
      {
        name: 'Execute command',
        value: 'execute',
      },
      {
        name: 'Copy to clipboard',
        value: 'copy',
      },
      {
        name: 'Refine request',
        value: 'refine',
      },
      {
        name: 'Exit',
        value: 'exit',
      },
    ],
  });

  return answer as MenuAction;
}

export async function getRefinedRequest(originalRequest: string, currentCommand: string): Promise<string> {
  console.log(`\nOriginal request: "${originalRequest}"`);
  console.log(`Current command: ${currentCommand}`);
  console.log('\nRefine your request (provide additional details, constraints, or modifications):');
  
  const refinedRequest = await input({
    message: 'Enter refined request:',
    default: originalRequest,
  });

  return refinedRequest;
}