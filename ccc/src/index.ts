#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { generateCommand } from './claude.js';
import { showMenu, getRefinedRequest } from './menu.js';
import { executeCommand } from './execute.js';
import { copyToClipboard } from './clipboard.js';

const program = new Command();

program
  .name('ccc')
  .description('Claude Code Command - Natural language to CLI commands')
  .version('1.0.0')
  .argument('<request...>', 'Natural language request for command')
  .option('-m, --model <model>', 'Claude model to use (opus, sonnet)', 'sonnet')
  .action(async (requestParts: string[], options) => {
    let request = requestParts.join(' ');
    let previousCommand: string | undefined;
    const model = options.model;
    
    try {
      while (true) {
        console.log(chalk.blue('🤔 Thinking...'));
        
        const command = await generateCommand(request, previousCommand, model);
        
        if (!command) {
          console.log(chalk.red('❌ Could not generate a command for that request.'));
          process.exit(1);
        }
        
        console.log(chalk.green('\n✨ Generated command:'));
        console.log(chalk.yellow(`   ${command}`));
        console.log();
        
        const action = await showMenu();
        
        switch (action) {
          case 'execute':
            await executeCommand(command);
            return; // Exit after execution
          case 'copy':
            await copyToClipboard(command);
            console.log(chalk.green('✅ Command copied to clipboard!'));
            return; // Exit after copying
          case 'refine':
            previousCommand = command; // Store current command as previous
            request = await getRefinedRequest(request, command);
            console.log(chalk.blue('\n🔄 Regenerating with refined request...'));
            continue; // Loop back to generate new command
          case 'exit':
            console.log(chalk.gray('👋 Exiting...'));
            return; // Exit
        }
      }
    } catch (error) {
      console.error(chalk.red('❌ Error:'), error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

// Handle process termination gracefully
process.on('SIGTERM', () => {
  process.exit(0);
});

process.on('SIGINT', () => {
  process.exit(0);
});

program.parse();