import { spawn } from 'child_process';
import chalk from 'chalk';

export async function executeCommand(command: string): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log(chalk.blue('\n📟 Executing command...\n'));
    
    const shell = process.platform === 'win32' ? 'cmd.exe' : '/bin/sh';
    const shellArgs = process.platform === 'win32' ? ['/c', command] : ['-c', command];
    
    const child = spawn(shell, shellArgs, {
      stdio: 'inherit',
      shell: false,
    });
    
    child.on('error', (error) => {
      reject(new Error(`Failed to execute command: ${error.message}`));
    });
    
    child.on('exit', (code) => {
      if (code === 0) {
        console.log(chalk.green('\n✅ Command executed successfully!'));
        resolve();
      } else {
        console.log(chalk.red(`\n❌ Command exited with code ${code}`));
        resolve();
      }
    });
  });
}