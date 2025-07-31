import { exec } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import { tmpdir, platform, release } from 'os';


async function getContextInfo(): Promise<string> {
  return new Promise((resolve) => {
    // Get current directory and file listing
    exec('pwd && echo "--- Directory listing ---" && ls -la', {
      timeout: 5000 // 5 second timeout for context
    }, (error, stdout, stderr) => {
      if (error) {
        resolve(''); // If we can't get context, continue without it
        return;
      }
      resolve(stdout);
    });
  });
}

export async function generateCommand(request: string, previousCommand?: string, model: string = 'haiku'): Promise<string | null> {

  // Get OS information
  const osInfo = `${platform()} ${release()}`;
  const osName = platform() === 'darwin' ? 'macOS' : 
                 platform() === 'win32' ? 'Windows' : 
                 platform() === 'linux' ? 'Linux' : platform();

  // Fall back to Claude CLI for more complex requests
  let prompt: string;
  
  if (previousCommand) {
    prompt = `You are a command line expert for ${osName} systems. The user has refined their request.

PREVIOUS COMMAND: ${previousCommand}
REFINED REQUEST: ${request}

Generate a NEW command that addresses the refined request. This could be:
- A modification of the previous command with different flags/options
- A completely different command if the request changed direction
- A pipeline combining multiple commands if needed

Only respond with the command itself, no explanation or additional text.
Do not include markdown formatting or code blocks.
Use ${osName}-specific commands and utilities.

CRITICAL: DO NOT use any filesystem exploration tools (LS, Glob, Grep, Read). Just provide the command directly without exploring the filesystem.

System: ${osName} ${release()}`;
  } else {
    prompt = `You are a command line expert for ${osName} systems. Generate a single command line command for the following request. 
Only respond with the command itself, no explanation or additional text.
If the request cannot be fulfilled with a single command, suggest the most appropriate single command.
Do not include markdown formatting or code blocks.

IMPORTANT: Use ${osName}-specific commands and utilities. For example:
- On macOS: use vm_stat for memory, not free
- On macOS: use top -o mem for process sorting by memory
- On Linux: use free -h for memory
- On Windows: use tasklist for processes

CRITICAL: DO NOT use any filesystem exploration tools (LS, Glob, Grep, Read). Just provide the command directly without exploring the filesystem.

System: ${osName} ${release()}

Request: ${request}`;
  }

  return new Promise((resolve, reject) => {
    // Use echo to pipe the prompt to claude -p with model selection
    const modelFlag = model ? ` --model ${model}` : '';
    const command = `echo "${prompt.replace(/"/g, '\\"')}" | claude -p${modelFlag}`;
    
    const child = exec(command, {
      timeout: 10000, // 10 second timeout
      maxBuffer: 1024 * 1024 // 1MB buffer
    }, (error, stdout, stderr) => {
      if (error) {
        if (error.killed && error.signal === 'SIGTERM') {
          reject(new Error('Claude process timed out after 10 seconds'));
        } else {
          reject(new Error(`Claude process failed: ${error.message}`));
        }
        return;
      }

      // Clean up the output
      let generatedCommand = stdout.trim();
      
      // Remove markdown code blocks if present
      generatedCommand = generatedCommand.replace(/^```(?:bash|sh|shell)?\n?/, '');
      generatedCommand = generatedCommand.replace(/\n?```$/, '');
      generatedCommand = generatedCommand.trim();
      
      // If output has multiple lines, try to find the actual command
      const lines = generatedCommand.split('\n').filter(line => line.trim());
      if (lines.length === 1) {
        resolve(lines[0]);
      } else if (lines.length > 1) {
        // Try to find a line that looks like a command
        const commandLine = lines.find(line => 
          !line.startsWith('System:') && 
          !line.startsWith('User:') && 
          !line.startsWith('Assistant:') &&
          line.trim().length > 0
        );
        resolve(commandLine || lines[lines.length - 1]);
      } else {
        resolve(null);
      }
    });
  });
}