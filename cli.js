#!/usr/bin/env node

import { program } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';
import dotenv from 'dotenv';
import { generateWorkReport } from './index.js';
import { sendToSlack, validateWebhookUrl } from './slack.js';
import { LLMProvider } from './llm-providers.js';

dotenv.config();

program
  .name('ai-work')
  .description('Generate AI-powered work reports from git commits')
  .version('1.0.0');

program
  .command('generate')
  .description('Generate work report from today\'s git commits')
  .option('-p, --provider <provider>', 'LLM provider (openai, claude, gemini, openrouter)', 'openai')
  .option('-k, --api-key <key>', 'API key for the selected provider')
  .option('-m, --model <model>', 'Model to use for the selected provider')
  .option('-d, --days <days>', 'Number of days to look back', '1')
  .option('-r, --repo <path>', 'Repository path', '.')
  .option('-a, --author <email>', 'Filter by author email')
  .option('-s, --slack', 'Send report to Slack after generation')
  .option('-w, --webhook <url>', 'Slack webhook URL')
  .action(async (options) => {
    try {
      const provider = options.provider || process.env.LLM_PROVIDER || 'openai';
      const providerInfo = LLMProvider.getProviderInfo(provider);
      
      if (!providerInfo) {
        console.error(chalk.red(`Unsupported provider: ${provider}`));
        console.log(chalk.yellow('Supported providers: openai, claude, gemini, openrouter'));
        process.exit(1);
      }
      
      let apiKey = options.apiKey || process.env[providerInfo.envKey];
      let model = options.model || process.env.DEFAULT_MODEL || providerInfo.defaultModel;
      
      if (!apiKey) {
        const answers = await inquirer.prompt([
          {
            type: 'password',
            name: 'apiKey',
            message: `Please enter your ${providerInfo.name} API key:`,
            validate: (input) => input.length > 0 || 'API key is required'
          }
        ]);
        apiKey = answers.apiKey;
      }
      
      if (!options.model && provider !== 'openai') {
        const models = LLMProvider.getProviderModels(provider);
        if (models.length > 0) {
          const modelAnswer = await inquirer.prompt([
            {
              type: 'list',
              name: 'model',
              message: `Select ${providerInfo.name} model:`,
              choices: models,
              default: providerInfo.defaultModel
            }
          ]);
          model = modelAnswer.model;
        }
      }

      const spinner = ora('Analyzing git logs...').start();
      
      const report = await generateWorkReport({
        provider,
        apiKey,
        model,
        days: parseInt(options.days),
        repoPath: options.repo,
        authorEmail: options.author
      });

      spinner.succeed('Report generated successfully!');
      
      console.log('\n' + chalk.bold.cyan('📊 Work Report'));
      console.log(chalk.gray('─'.repeat(50)));
      console.log(report);
      
      // Slack integration (optional)
      if (options.slack) {
        let webhookUrl = options.webhook || process.env.SLACK_WEBHOOK_URL;
        
        if (!webhookUrl) {
          const slackAnswer = await inquirer.prompt([
            {
              type: 'input',
              name: 'webhookUrl',
              message: 'Enter your Slack webhook URL:',
              validate: (input) => validateWebhookUrl(input) || 'Invalid Slack webhook URL format'
            }
          ]);
          webhookUrl = slackAnswer.webhookUrl;
        }
        
        const sendConfirm = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'send',
            message: 'Send this report to Slack?',
            default: true
          }
        ]);
        
        if (sendConfirm.send) {
          const slackSpinner = ora('Sending to Slack...').start();
          try {
            await sendToSlack(report, webhookUrl, {
              author: options.author,
              repoName: options.repo !== '.' ? options.repo : undefined
            });
            slackSpinner.succeed('Report sent to Slack successfully!');
          } catch (slackError) {
            slackSpinner.fail(`Failed to send to Slack: ${slackError.message}`);
          }
        }
      }
      
    } catch (error) {
      console.error(chalk.red('Error:', error.message));
      process.exit(1);
    }
  });

program
  .command('config')
  .description('Configure default settings')
  .action(async () => {
    const providerAnswer = await inquirer.prompt([
      {
        type: 'list',
        name: 'provider',
        message: 'Select LLM provider:',
        choices: [
          { name: 'OpenAI (GPT-3.5, GPT-4)', value: 'openai' },
          { name: 'Claude (Anthropic)', value: 'claude' },
          { name: 'Google Gemini', value: 'gemini' },
          { name: 'OpenRouter (Multiple LLMs)', value: 'openrouter' }
        ],
        default: 'openai'
      }
    ]);
    
    const provider = providerAnswer.provider;
    const providerInfo = LLMProvider.getProviderInfo(provider);
    const models = LLMProvider.getProviderModels(provider);
    
    const answers = await inquirer.prompt([
      {
        type: 'password',
        name: 'apiKey',
        message: `Enter your ${providerInfo.name} API key:`,
        validate: (input) => input.length > 0 || 'API key is required'
      },
      {
        type: 'list',
        name: 'model',
        message: `Select default ${providerInfo.name} model:`,
        choices: models,
        default: providerInfo.defaultModel
      },
      {
        type: 'confirm',
        name: 'configureSlack',
        message: 'Do you want to configure Slack integration?',
        default: false
      }
    ]);

    let envContent = `LLM_PROVIDER=${provider}\n${providerInfo.envKey}=${answers.apiKey}\nDEFAULT_MODEL=${answers.model}`;
    
    if (answers.configureSlack) {
      const slackConfig = await inquirer.prompt([
        {
          type: 'input',
          name: 'webhookUrl',
          message: 'Enter your Slack webhook URL:',
          validate: (input) => validateWebhookUrl(input) || 'Invalid Slack webhook URL format'
        }
      ]);
      envContent += `\nSLACK_WEBHOOK_URL=${slackConfig.webhookUrl}`;
    }
    
    try {
      const fs = await import('fs/promises');
      await fs.writeFile('.env', envContent);
      console.log(chalk.green('✓ Configuration saved to .env file'));
    } catch (error) {
      console.error(chalk.red('Error saving configuration:', error.message));
    }
  });

program.parse();