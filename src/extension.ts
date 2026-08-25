// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Create output channel for logging
const outputChannel = vscode.window.createOutputChannel('Claude Commit');

class ClaudeCLIExecutor {
    private claudePath: string | null = null;
    private debugMode: boolean;

    constructor(debugMode: boolean = false) {
        this.debugMode = debugMode;
        if (this.debugMode) {
            outputChannel.appendLine('[DEBUG] ClaudeCLIExecutor initialized');
            outputChannel.appendLine(`[DEBUG] Debug mode: ${debugMode}`);
        }
    }

    async detectClaudePath(customPath?: string): Promise<string> {
        if (this.debugMode) {
            outputChannel.appendLine('\n=== CLAUDE PATH DETECTION START ===');
            outputChannel.appendLine(`Input customPath: ${customPath || 'none'}`);
            outputChannel.appendLine(`Current claudePath: ${this.claudePath || 'none'}`);
            outputChannel.appendLine(`Process PATH: ${process.env.PATH}`);
            outputChannel.appendLine(`Process HOME: ${process.env.HOME}`);
        }
        
        if (customPath && customPath.trim() !== '') {
            if (this.debugMode) {
                outputChannel.appendLine(`\n[CUSTOM PATH] Checking: "${customPath}"`);
            }
            
            try {
                // Escape path for shell
                const escapedPath = customPath.replace(/'/g, "'\\'\''");
                const testCommand = `'${escapedPath}' --version`;
                if (this.debugMode) {
                    outputChannel.appendLine(`[CUSTOM PATH] Test command: ${testCommand}`);
                }
                
                const result = await execAsync(testCommand);
                if (this.debugMode) {
                    outputChannel.appendLine(`[CUSTOM PATH] Success! Output: ${result.stdout}`);
                }
                
                this.claudePath = customPath;
                if (this.debugMode) {
                    outputChannel.appendLine(`[CUSTOM PATH] ✓ Set claudePath to: ${customPath}`);
                }
                return customPath;
            } catch (error: any) {
                if (this.debugMode) {
                    outputChannel.appendLine(`[CUSTOM PATH] ✗ Failed: ${error.message}`);
                    outputChannel.appendLine(`[CUSTOM PATH] Error code: ${error.code}`);
                    outputChannel.appendLine(`[CUSTOM PATH] Full error: ${JSON.stringify(error)}`);
                }
                throw new Error(`Custom Claude CLI path not valid: ${customPath} - ${error.message}`);
            }
        }

        // Try to detect in PATH
        if (this.debugMode) {
            outputChannel.appendLine('\n[PATH SEARCH] Using "which" command...');
        }
        try {
            const whichCmd = 'which claude';
            if (this.debugMode) {
                outputChannel.appendLine(`[PATH SEARCH] Command: ${whichCmd}`);
            }
            
            const { stdout, stderr } = await execAsync(whichCmd);
            if (this.debugMode) {
                outputChannel.appendLine(`[PATH SEARCH] stdout: ${stdout}`);
                outputChannel.appendLine(`[PATH SEARCH] stderr: ${stderr || 'none'}`);
            }
            
            this.claudePath = stdout.trim();
            if (this.debugMode) {
                outputChannel.appendLine(`[PATH SEARCH] ✓ Found at: ${this.claudePath}`);
            }
            return this.claudePath;
        } catch (error: any) {
            if (this.debugMode) {
                outputChannel.appendLine(`[PATH SEARCH] which failed: ${error.message}`);
            }
        }
        
        // Try using bash shell
        if (this.debugMode) {
            outputChannel.appendLine('\n[BASH SHELL] Trying bash -l -c "which claude"...');
        }
        try {
            const bashCmd = '/bin/bash -l -c "which claude"';
            if (this.debugMode) {
                outputChannel.appendLine(`[BASH SHELL] Command: ${bashCmd}`);
            }
            
            const { stdout, stderr } = await execAsync(bashCmd);
            if (this.debugMode) {
                outputChannel.appendLine(`[BASH SHELL] stdout: ${stdout}`);
                outputChannel.appendLine(`[BASH SHELL] stderr: ${stderr || 'none'}`);
            }
            
            this.claudePath = stdout.trim();
            if (this.debugMode) {
                outputChannel.appendLine(`[BASH SHELL] ✓ Found at: ${this.claudePath}`);
            }
            return this.claudePath;
        } catch (error: any) {
            if (this.debugMode) {
                outputChannel.appendLine(`[BASH SHELL] Failed: ${error.message}`);
            }
        }
        
        // Try zsh shell
        if (this.debugMode) {
            outputChannel.appendLine('\n[ZSH SHELL] Trying zsh -l -c "which claude"...');
        }
        try {
            const zshCmd = '/bin/zsh -l -c "which claude"';
            if (this.debugMode) {
                outputChannel.appendLine(`[ZSH SHELL] Command: ${zshCmd}`);
            }
            
            const { stdout, stderr } = await execAsync(zshCmd);
            if (this.debugMode) {
                outputChannel.appendLine(`[ZSH SHELL] stdout: ${stdout}`);
                outputChannel.appendLine(`[ZSH SHELL] stderr: ${stderr || 'none'}`);
            }
            
            this.claudePath = stdout.trim();
            if (this.debugMode) {
                outputChannel.appendLine(`[ZSH SHELL] ✓ Found at: ${this.claudePath}`);
            }
            return this.claudePath;
        } catch (error: any) {
            if (this.debugMode) {
                outputChannel.appendLine(`[ZSH SHELL] Failed: ${error.message}`);
            }
        }
        
        // Try common installation paths
        const home = process.env.HOME || process.env.USERPROFILE || '~';
        if (this.debugMode) {
            outputChannel.appendLine(`\n[COMMON PATHS] Home directory: ${home}`);
        }
        
        const commonPaths = [
            '/usr/local/bin/claude',
            '/usr/bin/claude',
            '/opt/homebrew/bin/claude',
            `${home}/.local/bin/claude`,
            `${home}/.nvm/versions/node/v22.13.0/bin/claude` // Common NVM path
        ];
        
        // Try to find in NVM dynamically
        if (home) {
            if (this.debugMode) {
                outputChannel.appendLine('\n[NVM SEARCH] Looking for claude in NVM...');
            }
            try {
                const findCmd = `find ${home}/.nvm -name claude -type f 2>/dev/null | head -1`;
                if (this.debugMode) {
                    outputChannel.appendLine(`[NVM SEARCH] Command: ${findCmd}`);
                }
                
                const { stdout } = await execAsync(findCmd);
                if (this.debugMode) {
                    outputChannel.appendLine(`[NVM SEARCH] Result: ${stdout || 'none'}`);
                }
                
                if (stdout.trim()) {
                    commonPaths.unshift(stdout.trim());
                    if (this.debugMode) {
                        outputChannel.appendLine(`[NVM SEARCH] Added to paths: ${stdout.trim()}`);
                    }
                }
            } catch (error: any) {
                if (this.debugMode) {
                    outputChannel.appendLine(`[NVM SEARCH] Failed: ${error.message}`);
                }
            }
        }

        if (this.debugMode) {
            outputChannel.appendLine('\n[COMMON PATHS] Checking paths:');
            commonPaths.forEach(p => outputChannel.appendLine(`  - ${p}`));
        }
        
        for (const path of commonPaths) {
            if (this.debugMode) {
                outputChannel.appendLine(`\n[COMMON PATHS] Testing: ${path}`);
            }
            try {
                // Escape path for shell
                const escapedPath = path.replace(/'/g, "'\\'\''");
                const testCmd = `'${escapedPath}' --version`;
                if (this.debugMode) {
                    outputChannel.appendLine(`[COMMON PATHS] Command: ${testCmd}`);
                }
                
                const result = await execAsync(testCmd);
                if (this.debugMode) {
                    outputChannel.appendLine(`[COMMON PATHS] ✓ Success! Version: ${result.stdout}`);
                }
                
                this.claudePath = path;
                if (this.debugMode) {
                    outputChannel.appendLine(`[COMMON PATHS] ✓ Set claudePath to: ${path}`);
                }
                return path;
            } catch (error: any) {
                if (this.debugMode) {
                    outputChannel.appendLine(`[COMMON PATHS] ✗ Failed: ${error.message}`);
                }
            }
        }
        
        // Last resort: try direct execution
        if (this.debugMode) {
            outputChannel.appendLine('\n[DIRECT EXEC] Trying direct "claude --version"...');
        }
        try {
            const directCmd = 'claude --version';
            if (this.debugMode) {
                outputChannel.appendLine(`[DIRECT EXEC] Command: ${directCmd}`);
            }
            
            const result = await execAsync(directCmd);
            if (this.debugMode) {
                outputChannel.appendLine(`[DIRECT EXEC] ✓ Success! Output: ${result.stdout}`);
            }
            
            this.claudePath = 'claude';
            if (this.debugMode) {
                outputChannel.appendLine(`[DIRECT EXEC] ✓ Using 'claude' directly`);
            }
            return 'claude';
        } catch (error: any) {
            if (this.debugMode) {
                outputChannel.appendLine(`[DIRECT EXEC] ✗ Failed: ${error.message}`);
            }
        }

        if (this.debugMode) {
            outputChannel.appendLine('\n=== CLAUDE PATH DETECTION FAILED ===');
        }
        throw new Error('Claude CLI not found. Please ensure Claude Code is installed and available in your PATH. You can also set a custom path in the extension settings.');
    }

    async executeCommand(prompt: string): Promise<string> {
        if (this.debugMode) {
            outputChannel.appendLine('\n=== EXECUTE COMMAND START ===');
            outputChannel.appendLine(`claudePath: ${this.claudePath}`);
            outputChannel.appendLine(`prompt length: ${prompt?.length} chars`);
        }
        
        if (!this.claudePath) {
            if (this.debugMode) {
                outputChannel.appendLine('[EXECUTE] No path set, detecting...');
            }
            await this.detectClaudePath();
        }
        
        // Double-check the path is valid
        if (!this.claudePath || this.claudePath.trim() === '') {
            if (this.debugMode) {
                outputChannel.appendLine('[EXECUTE] ✗ Claude path is empty!');
            }
            throw new Error('Claude path could not be determined');
        }
        
        if (this.debugMode) {
            outputChannel.appendLine(`[EXECUTE] Using path: ${this.claudePath}`);
        }

        // Use base64 encoding to completely avoid shell escaping issues
        const base64Prompt = Buffer.from(prompt, 'utf8').toString('base64');
        
        // Build command that decodes base64 and pipes to claude
        let command = `echo "${base64Prompt}" | base64 -d | ${this.claudePath}`;
        
        // Add all flags
        command += ' --print';  // Use explicit --print flag
        command += ' --model sonnet';  // Hardcoded model
        command += ' --output-format json';
        command += ' --dangerously-skip-permissions';  // Skip permissions check

        if (this.debugMode) {
            outputChannel.appendLine(`\n[EXECUTE] Command structure: echo [base64] | base64 -d | claude [options]`);
            outputChannel.appendLine(`[EXECUTE] Base64 length: ${base64Prompt.length} chars`);
            outputChannel.appendLine(`[EXECUTE] Original prompt length: ${prompt.length} chars`);
        }
        
        try {
            if (this.debugMode) {
                outputChannel.appendLine('[EXECUTE] Starting execution...');
            }
            
            const execOptions = {
                timeout: 60000,  // 60 seconds timeout
                shell: '/bin/bash',
                maxBuffer: 1024 * 1024 * 10, // 10MB buffer for large outputs
                env: { 
                    ...process.env, 
                    PATH: `/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:${process.env.PATH}:${process.env.HOME}/.nvm/versions/node/*/bin` 
                }
            };
            
            if (this.debugMode) {
                outputChannel.appendLine(`[EXECUTE] Using shell: ${execOptions.shell}`);
                outputChannel.appendLine(`[EXECUTE] Timeout: ${execOptions.timeout}ms`);
                outputChannel.appendLine(`[EXECUTE] PATH: ${execOptions.env.PATH}`);
            }
            
            const startTime = Date.now();
            
            // Try to execute with empty stdin to force non-interactive mode
            const { stdout, stderr } = await new Promise<{stdout: string, stderr: string}>((resolve, reject) => {
                const child = require('child_process').exec(command, execOptions, (error: any, stdout: string, stderr: string) => {
                    if (error && error.code !== 'ETIMEDOUT') {
                        // Allow non-zero exit codes as long as we got output
                        if (stdout || stderr) {
                            resolve({ stdout, stderr });
                        } else {
                            reject(error);
                        }
                    } else {
                        resolve({ stdout, stderr });
                    }
                });
                
                // Send empty input and close stdin immediately
                if (child.stdin) {
                    child.stdin.end();
                }
            });
            const duration = Date.now() - startTime;
            
            if (this.debugMode) {
                outputChannel.appendLine(`[EXECUTE] ✓ Success in ${duration}ms`);
                outputChannel.appendLine(`[EXECUTE] stdout length: ${stdout?.length || 0} chars`);
                outputChannel.appendLine(`[EXECUTE] stderr length: ${stderr?.length || 0} chars`);
            }
            
            // Sometimes Claude outputs to stderr instead of stdout
            if (stderr && this.debugMode) {
                outputChannel.appendLine(`[EXECUTE] stderr content: ${stderr}`);
            }
            
            // Always log the output for debugging
            if (this.debugMode) {
                outputChannel.appendLine(`[EXECUTE] Raw stdout: ${stdout || '(empty)'}`);
                outputChannel.appendLine(`[EXECUTE] Raw stderr: ${stderr || '(empty)'}`);
            }
            
            // Try to use stdout first, then stderr if stdout is empty
            const output = stdout?.trim() || stderr?.trim() || '';
            
            if (!output) {
                if (this.debugMode) {
                    outputChannel.appendLine(`[EXECUTE] ⚠️ No output received from Claude!`);
                }
                throw new Error('No output received from Claude CLI');
            }
            
            if (this.debugMode) {
                outputChannel.appendLine(`[EXECUTE] Using output from: ${stdout?.trim() ? 'stdout' : 'stderr'}`);
                outputChannel.appendLine(`[EXECUTE] Output preview: ${output.substring(0, 500)}...`);
            }
            
            return output;
        } catch (error: any) {
            if (this.debugMode) {
                outputChannel.appendLine(`[EXECUTE] ✗ Error: ${error.message}`);
                outputChannel.appendLine(`[EXECUTE] Error code: ${error.code}`);
                outputChannel.appendLine(`[EXECUTE] Error stack: ${error.stack}`);
            }
            
            if (error.code === 'ETIMEDOUT') {
                throw new Error('Claude CLI timed out after 60 seconds. Please check if Claude is authenticated.');
            }
            throw new Error(`Claude CLI execution failed: ${error.message}`);
        }
    }

    parseResponse(output: string): string {
        if (this.debugMode) {
            outputChannel.appendLine(`\n[PARSE] Parsing response (${output?.length || 0} chars)...`);
        }
        
        if (!output) {
            if (this.debugMode) {
                outputChannel.appendLine('[PARSE] ✗ No output to parse!');
            }
            return '';
        }
        
        if (this.debugMode) {
            outputChannel.appendLine(`[PARSE] First 200 chars: ${output.substring(0, 200)}`);
        }
        
        try {
            const parsed = JSON.parse(output);
            if (this.debugMode) {
                outputChannel.appendLine('[PARSE] ✓ JSON parsed successfully');
                outputChannel.appendLine(`[PARSE] JSON keys: ${Object.keys(parsed).join(', ')}`);
            }
            
            // Claude CLI with --output-format json returns the result in a 'result' field
            if (parsed.result !== undefined && parsed.result !== null) {
                if (this.debugMode) {
                    outputChannel.appendLine(`[PARSE] ✅ Found 'result' field!`);
                    outputChannel.appendLine(`[PARSE] Result type: ${typeof parsed.result}`);
                    outputChannel.appendLine(`[PARSE] Raw result value: ${parsed.result}`);
                }
                
                // Check if it's an error response
                if (parsed.subtype === 'error_during_execution' || parsed.is_error) {
                    if (this.debugMode) {
                        outputChannel.appendLine('[PARSE] ✗ Error response from Claude');
                        outputChannel.appendLine(`[PARSE] Error details: ${JSON.stringify(parsed)}`);
                    }
                    throw new Error('Claude returned an error response');
                }
                
                let finalResult = String(parsed.result).trim();
                
                // Extract commit message from markdown code blocks if present
                const codeBlockMatch = finalResult.match(/```[\s\S]*?\n([\s\S]*?)\n```/);
                if (codeBlockMatch) {
                    if (this.debugMode) {
                        outputChannel.appendLine('[PARSE] Extracting from code block');
                    }
                    finalResult = codeBlockMatch[1].trim();
                } else {
                    // If there's explanatory text before the actual commit message,
                    // try to find where the actual message starts
                    const lines = finalResult.split('\n');
                    const filteredLines = [];
                    let foundCommitStart = false;
                    
                    for (const line of lines) {
                        // Skip explanatory lines that often come before the actual commit
                        if (!foundCommitStart && 
                            (line.toLowerCase().includes('based on') ||
                             line.toLowerCase().includes('here\'s') ||
                             line.toLowerCase().includes('here is') ||
                             line.toLowerCase().includes('commit message') ||
                             line.trim() === '')) {
                            continue;
                        }
                        foundCommitStart = true;
                        filteredLines.push(line);
                    }
                    
                    if (filteredLines.length > 0) {
                        finalResult = filteredLines.join('\n').trim();
                    }
                }
                
                if (this.debugMode) {
                    outputChannel.appendLine(`[PARSE] ✅ Final result: ${finalResult}`);
                }
                return finalResult;
            }
            
            // Fallback to other possible fields
            if (parsed.text) {
                if (this.debugMode) {
                    outputChannel.appendLine(`[PARSE] Using 'text' field: ${parsed.text}`);
                }
                return parsed.text.trim();
            }
            
            if (parsed.message) {
                if (this.debugMode) {
                    outputChannel.appendLine(`[PARSE] Using 'message' field: ${parsed.message}`);
                }
                return parsed.message;
            }
            
            if (parsed.content) {
                if (this.debugMode) {
                    outputChannel.appendLine(`[PARSE] Using 'content' field: ${parsed.content}`);
                }
                return parsed.content;
            }
            
            if (typeof parsed === 'string') {
                if (this.debugMode) {
                    outputChannel.appendLine(`[PARSE] Parsed is string: ${parsed}`);
                }
                return parsed;
            }
            
            if (this.debugMode) {
                outputChannel.appendLine(`[PARSE] ⚠️ WARNING: Unknown JSON structure`);
                outputChannel.appendLine(`[PARSE] Available keys: ${Object.keys(parsed).join(', ')}`);
            }
            
            // Never return the full JSON object
            const errorMsg = 'Could not extract commit message from Claude response. Check Output panel for details.';
            if (this.debugMode) {
                outputChannel.appendLine(`[PARSE] ✗ ${errorMsg}`);
                outputChannel.appendLine(`[PARSE] Full response was: ${JSON.stringify(parsed)}`);
            }
            throw new Error(errorMsg);
        } catch (error: any) {
            if (this.debugMode) {
                outputChannel.appendLine(`[PARSE] JSON parse failed: ${error.message}`);
                outputChannel.appendLine('[PARSE] Falling back to plain text parsing...');
            }
            
            let cleaned = output.trim();
            
            // Remove markdown code blocks
            const beforeClean = cleaned;
            cleaned = cleaned.replace(/^```[a-zA-Z]*\n?/, '').replace(/\n?```$/, '');
            
            if (beforeClean !== cleaned && this.debugMode) {
                outputChannel.appendLine('[PARSE] Removed markdown code blocks');
            }
            
            // Look for conventional commit message pattern
            const lines = cleaned.split('\n');
            if (this.debugMode) {
                outputChannel.appendLine(`[PARSE] Checking ${lines.length} lines for commit pattern...`);
            }
            
            for (const line of lines) {
                if (line.match(/^(feat|fix|docs|style|refactor|test|chore|build|ci|perf)(\(.+\))?:/i)) {
                    if (this.debugMode) {
                        outputChannel.appendLine(`[PARSE] ✓ Found commit pattern: ${line}`);
                    }
                    return line;
                }
            }
            
            if (this.debugMode) {
                outputChannel.appendLine(`[PARSE] Returning cleaned output: ${cleaned}`);
            }
            return cleaned;
        }
    }
}

class CommitMessageGenerator {
    private cliExecutor: ClaudeCLIExecutor;
    private config: vscode.WorkspaceConfiguration;
    private debugMode: boolean;

    constructor() {
        this.config = vscode.workspace.getConfiguration('claude-commit');
        this.debugMode = this.config.get<boolean>('debugMode') || false;
        
        if (this.debugMode) {
            outputChannel.appendLine('\n=== CONFIGURATION ===');
            outputChannel.appendLine(`claudePath: ${this.config.get<string>('claudePath') || 'not set'}`);
            outputChannel.appendLine(`debugMode: ${this.debugMode}`);
        }
        
        this.cliExecutor = new ClaudeCLIExecutor(this.debugMode);
    }

    async generateCommitMessage(repositoryPath?: string): Promise<string> {
        if (this.debugMode) {
            outputChannel.appendLine('\n=== GENERATE COMMIT MESSAGE START ===');
            outputChannel.appendLine(`Repository path: ${repositoryPath}`);
        }
        
        try {
            // Get configuration
            const claudePath = this.config.get<string>('claudePath');
            
            if (this.debugMode) {
                outputChannel.appendLine(`[CONFIG] claudePath: ${claudePath || 'auto-detect'}`);
            }

            // Initialize CLI with custom path if provided
            if (claudePath && claudePath.trim() !== '') {
                if (this.debugMode) {
                    outputChannel.appendLine(`\n[INIT] Using custom path: ${claudePath}`);
                }
                await this.cliExecutor.detectClaudePath(claudePath);
            } else {
                if (this.debugMode) {
                    outputChannel.appendLine('\n[INIT] Auto-detecting Claude path...');
                }
                await this.cliExecutor.detectClaudePath();
            }

            const cwd = repositoryPath || vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
            if (this.debugMode) {
                outputChannel.appendLine(`\n[GIT] Working directory: ${cwd}`);
            }
            
            // Get git diff
            if (this.debugMode) {
                outputChannel.appendLine('[GIT] Getting staged changes...');
            }
            
            let { stdout: diff } = await execAsync('git diff --cached', { cwd });
            let isStaged = true;
            
            if (this.debugMode) {
                outputChannel.appendLine(`[GIT] Staged diff: ${diff?.length || 0} chars`);
            }
            
            if (!diff.trim()) {
                if (this.debugMode) {
                    outputChannel.appendLine('[GIT] No staged changes, checking unstaged...');
                }
                
                const result = await execAsync('git diff', { cwd });
                diff = result.stdout;
                isStaged = false;
                
                if (this.debugMode) {
                    outputChannel.appendLine(`[GIT] Unstaged diff: ${diff?.length || 0} chars`);
                }
            }

            if (!diff.trim()) {
                if (this.debugMode) {
                    outputChannel.appendLine('[GIT] ✗ No changes found!');
                }
                throw new Error('No changes found (staged or unstaged)');
            }

            const fileType = isStaged ? 'staged files' : 'changed files';
            if (this.debugMode) {
                outputChannel.appendLine(`\n[PROMPT] Creating prompt for ${fileType}...`);
            }
            
            // Build prompt with hardcoded conventional format
            const prompt = `Generate a git commit message for the following changes. 

IMPORTANT: Return ONLY the commit message text itself. Do not include:
- Any explanatory text like "Based on...", "Here's...", or "Here is..."
- Code blocks or backticks
- Any markdown formatting
- Any commentary before or after the message

Just return the raw commit message text that will be used directly in git commit.

Git diff:
${diff}

Rules:
- Use conventional commit format
- Keep under 72 characters for the first line
- Be specific and clear
- Common types: feat, fix, docs, style, refactor, test, chore

Remember: Return ONLY the commit message text, nothing else.`;

            if (this.debugMode) {
                outputChannel.appendLine(`[PROMPT] Length: ${prompt.length} chars`);
                outputChannel.appendLine(`[PROMPT] First 500 chars: ${prompt.substring(0, 500)}...`);
            }

            // Execute Claude CLI
            if (this.debugMode) {
                outputChannel.appendLine('\n[CLAUDE] Executing Claude CLI...');
            }
            
            const output = await this.cliExecutor.executeCommand(prompt);
            
            if (this.debugMode) {
                outputChannel.appendLine(`[CLAUDE] Response received: ${output?.length || 0} chars`);
            }
            
            // Parse response
            if (this.debugMode) {
                outputChannel.appendLine('\n[RESULT] Parsing response...');
            }
            
            const result = this.cliExecutor.parseResponse(output);
            
            if (this.debugMode) {
                outputChannel.appendLine(`[RESULT] ✓ Generated: ${result}`);
                outputChannel.appendLine('\n=== GENERATE COMMIT MESSAGE END ===\n');
            }
            
            return result;
        } catch (error: any) {
            if (this.debugMode) {
                outputChannel.appendLine(`\n[ERROR] ✗ ${error.message}`);
                outputChannel.appendLine(`[ERROR] Stack: ${error.stack}`);
                outputChannel.appendLine('\n=== GENERATE COMMIT MESSAGE FAILED ===\n');
            }
            
            if (error.message.includes('Claude CLI not found')) {
                throw new Error('Claude CLI not found. Please check the Output panel for details and ensure the Claude path is correctly configured in settings.');
            }
            throw new Error(`Failed to generate commit message: ${error.message}`);
        }
    }
}

// This method is called when your extension is activated
export function activate(context: vscode.ExtensionContext) {
    const config = vscode.workspace.getConfiguration('claude-commit');
    const debugMode = config.get<boolean>('debugMode') || false;
    
    if (debugMode) {
        outputChannel.appendLine('=== EXTENSION ACTIVATED ===');
        outputChannel.appendLine(`Extension path: ${context.extensionPath}`);
        outputChannel.show(); // Show output on activation in debug mode
    }

    const createCommitDisposable = vscode.commands.registerCommand('claude-commit.createCommitMessage', async (uri?: vscode.Uri) => {
        const config = vscode.workspace.getConfiguration('claude-commit');
        const debugMode = config.get<boolean>('debugMode') || false;
        
        if (debugMode) {
            outputChannel.appendLine('\n=== COMMAND TRIGGERED ===');
            outputChannel.appendLine(`URI: ${uri?.toString() || 'none'}`);
            outputChannel.show(); // Show output when command is triggered in debug mode
        }
        
        try {
            const generator = new CommitMessageGenerator();
            
            // Get Git extension
            if (debugMode) {
                outputChannel.appendLine('\n[GIT] Getting Git extension...');
            }
            
            const gitExtension = vscode.extensions.getExtension('vscode.git')?.exports;
            if (!gitExtension) {
                if (debugMode) {
                    outputChannel.appendLine('[GIT] ✗ Git extension not available!');
                }
                vscode.window.showErrorMessage('Git extension not available');
                return;
            }
            
            if (debugMode) {
                outputChannel.appendLine('[GIT] ✓ Git extension found');
            }

            const git = gitExtension.getAPI(1);
            if (debugMode) {
                outputChannel.appendLine(`[GIT] Repositories: ${git.repositories.length}`);
            }
            
            let targetRepo;

            // Find repository
            if (uri) {
                const uriPath = (uri as any).E?.fsPath || uri.path;
                if (debugMode) {
                    outputChannel.appendLine(`[GIT] Looking for repo matching: ${uriPath}`);
                }
                
                targetRepo = git.repositories.find((repo: any) => {
                    const repoPath = repo.rootUri.fsPath;
                    return uriPath && uriPath.startsWith(repoPath);
                });
                
                if (!targetRepo && debugMode) {
                    outputChannel.appendLine('[GIT] No matching repo for URI');
                }
            }

            // Select repository if not found
            if (!targetRepo) {
                if (git.repositories.length > 1) {
                    if (debugMode) {
                        outputChannel.appendLine('[GIT] Multiple repos, showing picker...');
                    }
                    
                    const repoItems = git.repositories.map((repo: any) => ({
                        label: repo.rootUri.fsPath,
                        repo: repo
                    }));
                    
                    const selected = await vscode.window.showQuickPick(repoItems, {
                        placeHolder: 'Select repository',
                        ignoreFocusOut: true
                    });
                    
                    if (!selected) {
                        if (debugMode) {
                            outputChannel.appendLine('[GIT] User cancelled');
                        }
                        return;
                    }
                    targetRepo = (selected as any).repo;
                } else if (git.repositories.length === 1) {
                    targetRepo = git.repositories[0];
                    if (debugMode) {
                        outputChannel.appendLine('[GIT] Using single repository');
                    }
                } else {
                    if (debugMode) {
                        outputChannel.appendLine('[GIT] ✗ No repository found!');
                    }
                    vscode.window.showErrorMessage('No Git repository found');
                    return;
                }
            }
            
            if (debugMode) {
                outputChannel.appendLine(`\n[REPO] Target: ${targetRepo.rootUri.fsPath}`);
                outputChannel.appendLine('\n[GENERATE] Starting...');
            }
            
            // Generate commit message
            const commitMessage = await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: "Generating commit message with Claude CLI...",
                cancellable: true
            }, async (_progress, token) => {
                token.onCancellationRequested(() => {
                    if (debugMode) {
                        outputChannel.appendLine('[GENERATE] Cancelled by user');
                    }
                });
                
                return await generator.generateCommitMessage(targetRepo.rootUri.fsPath);
            });

            if (commitMessage) {
                if (debugMode) {
                    outputChannel.appendLine(`\n[SUCCESS] Setting commit message: ${commitMessage}`);
                }
                
                targetRepo.inputBox.value = commitMessage;
                vscode.window.showInformationMessage(`Commit message generated!`);
            } else {
                if (debugMode) {
                    outputChannel.appendLine('[ERROR] No commit message generated');
                }
            }

        } catch (error: any) {
            if (debugMode) {
                outputChannel.appendLine(`\n[ERROR] Command failed: ${error.message}`);
                outputChannel.appendLine(`[ERROR] Stack: ${error.stack}`);
                outputChannel.show();
            }
            
            vscode.window.showErrorMessage(
                `Error: ${error.message}\n\nCheck 'Claude Commit' in Output panel for detailed logs.`
            );
        }
    });

    context.subscriptions.push(createCommitDisposable);
    
    if (debugMode) {
        outputChannel.appendLine('=== EXTENSION READY ===\n');
    }
}

// This method is called when your extension is deactivated
export function deactivate() {
    const config = vscode.workspace.getConfiguration('claude-commit');
    const debugMode = config.get<boolean>('debugMode') || false;
    
    if (debugMode) {
        outputChannel.appendLine('=== EXTENSION DEACTIVATED ===');
    }
}
