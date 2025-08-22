import simpleGit from 'simple-git';
import chalk from 'chalk';
import { LLMProvider } from './llm-providers.js';

export async function getGitLogs(options = {}) {
  const { repoPath = '.', days = 1, authorEmail } = options;
  
  const git = simpleGit(repoPath);
  
  const since = new Date();
  since.setDate(since.getDate() - days);
  const sinceDate = since.toISOString().split('T')[0];
  
  const logOptions = {
    from: sinceDate,
    to: 'HEAD',
    format: {
      hash: '%H',
      date: '%ai',
      message: '%s',
      body: '%b',
      author_name: '%an',
      author_email: '%ae'
    }
  };
  
  if (authorEmail) {
    logOptions['--author'] = authorEmail;
  }
  
  try {
    const logs = await git.log(logOptions);
    return logs.all;
  } catch (error) {
    throw new Error(`Failed to get git logs: ${error.message}`);
  }
}

export async function formatLogsForLLM(logs) {
  if (logs.length === 0) {
    return 'No commits found for the specified period.';
  }
  
  const formattedLogs = logs.map(log => {
    return `- ${log.message}${log.body ? '\n  Details: ' + log.body : ''}`;
  }).join('\n');
  
  return `Git commits from the specified period:\n\n${formattedLogs}`;
}

export async function generateReportWithLLM(logsText, options = {}) {
  const { provider = 'openai', apiKey, model } = options;
  
  try {
    const llmProvider = new LLMProvider(provider, apiKey, model);
    const report = await llmProvider.generateReport(logsText);
    return report;
  } catch (error) {
    throw new Error(`Failed to generate report with LLM: ${error.message}`);
  }
}

export async function generateWorkReport(options = {}) {
  try {
    const logs = await getGitLogs({
      repoPath: options.repoPath,
      days: options.days,
      authorEmail: options.authorEmail
    });
    
    if (logs.length === 0) {
      return 'No commits found for the specified period.';
    }
    
    const logsText = await formatLogsForLLM(logs);
    
    const report = await generateReportWithLLM(logsText, {
      provider: options.provider,
      apiKey: options.apiKey,
      model: options.model
    });
    
    return report;
  } catch (error) {
    throw new Error(`Failed to generate work report: ${error.message}`);
  }
}