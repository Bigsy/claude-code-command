# CCC - Claude Code Command

[![npm version](https://badge.fury.io/js/claude-code-command.svg)](https://badge.fury.io/js/claude-code-command)
[![npm downloads](https://img.shields.io/npm/dm/claude-code-command.svg)](https://www.npmjs.com/package/claude-code-command)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Natural language to CLI commands using Claude Code CLI. Transforms your plain English requests into OS-specific shell commands with an interactive workflow.

## Features

- 🗣️ **Natural Language Input**: Describe what you want in plain English
- 🖥️ **OS-Aware**: Automatically generates macOS, Linux, or Windows specific commands
- ⚡ **Interactive Menu**: Execute, copy, refine, or exit
- 🔄 **Iterative Refinement**: Refine your request to get the perfect command
- 🛡️ **Safe**: Always shows the command before execution

## Installation

```bash
npm install -g claude-code-command
```

### Local Development Install

```bash
git clone https://github.com/Bigsy/claude-code-command.git
cd claude-code-command
npm install
npm run build
npm install -g .
```

## Prerequisites

- Node.js (with npm) - version 18 or higher
- [Claude Code CLI](https://docs.anthropic.com/en/docs/claude-code) installed and authenticated
- Active Claude Code subscription (uses your existing Claude Code account)

## Usage

### Basic Usage

```bash
ccc "see current processes running"
# Generated command: ps aux (on macOS/Linux) or tasklist (on Windows)

ccc "show memory usage"
# Generated command: vm_stat (on macOS) or free -h (on Linux)

ccc "find all javascript files"
# Generated command: find . -name "*.js"

ccc "create a backup of typescript files with today's date"
# Generated command: tar -czf typescript_backup_$(date +%Y%m%d).tar.gz $(find . -name "*.ts")
```

### Model Selection

CCC uses Claude Sonnet by default for balanced speed and quality. You can specify a different model:

```bash
# Use default Sonnet (balanced)
ccc "list files"

# Use Opus for the most sophisticated commands
ccc -m opus "build a complex pipeline for log analysis with error detection"
```

### Interactive Menu

After generating a command, you get these options:

1. **Execute command** - Run the command immediately
2. **Copy to clipboard** - Copy command for later use
3. **Refine request** - Modify your request to improve the command
4. **Exit** - Quit without doing anything

### Refinement Workflow

The refinement feature allows you to iteratively improve the generated command:

```bash
ccc "show disk usage"
# ✨ Generated command: df -h
# 
# ? What would you like to do?
#   Execute command
#   Copy to clipboard
# ❯ Refine request
#   Exit

# Select "Refine request"
# Original request: "show disk usage"
# Current command: df -h
# 
# Refine your request (provide additional details, constraints, or modifications):
# Enter refined request: show disk usage sorted by percentage used
#
# 🔄 Regenerating with refined request...
# ✨ Generated command: df -h | sort -k 5 -nr
```

### Complex Examples

CCC excels at generating sophisticated commands:

```bash
ccc "find duplicate files by content hash and show which take up most space"
# Generated: find . -type f -exec md5sum {} + | sort | uniq -w32 -dD | cut -c 35- | xargs -I {} du -h {} | sort -hr

ccc "monitor network traffic and show top 10 connections by data usage"
# Generated: sudo iftop -nNPB -L 10

ccc "find all files modified in last 7 days and show their sizes"
# Generated: find . -type f -mtime -7 -exec ls -lh {} \;

ccc "count lines of code in this project"
# Generated: find . -type f \( -name "*.py" -o -name "*.js" -o -name "*.ts" ... \) -exec wc -l {} + | awk '{total += $1} END {print total}'
```

## OS-Specific Commands

CCC automatically detects your operating system and generates appropriate commands:

| Request | macOS | Linux | Windows |
|---------|-------|--------|---------|
| "show memory usage" | `vm_stat` | `free -h` | `wmic OS get TotalVisibleMemorySize,FreePhysicalMemory` |
| "list processes by memory" | `top -l 1 -o mem -n 10` | `ps aux --sort=-%mem` | `tasklist /fo table` |
| "check network connections" | `netstat -an \| grep LISTEN` | `netstat -tuln` | `netstat -an \| findstr LISTENING` |

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev -- "your command request"

# Build
npm run build

# Run built version
npm start -- "your command request"
```

## Tips

- Be specific about what you want: "show CPU usage for last 5 minutes" vs "show CPU"
- Use refinement to add constraints: "but exclude hidden files", "and sort by size", "only for Python files"
- The tool works best with single commands, but can generate pipelines when needed
- Always review commands before executing, especially those requiring sudo privileges