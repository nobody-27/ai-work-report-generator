import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';

const SYSTEM_PROMPT = `You are a helpful assistant that generates professional work reports from git commit messages. 
Your task is to:
1. Analyze the provided git commits
2. Group related commits together
3. Create a clear, concise work report summarizing what was accomplished
4. Use bullet points and clear formatting
5. Highlight key achievements and completed features
6. Mention any bug fixes or improvements made

Format the report professionally but keep it concise and easy to read.`;

export class LLMProvider {
  constructor(provider, apiKey, model) {
    this.provider = provider.toLowerCase();
    this.apiKey = apiKey;
    this.model = model;
    this.client = this.initializeClient();
  }

  initializeClient() {
    switch (this.provider) {
      case 'openai':
        return new OpenAI({ apiKey: this.apiKey });
      case 'claude':
      case 'anthropic':
        return new Anthropic({ apiKey: this.apiKey });
      case 'gemini':
      case 'google':
        return new GoogleGenerativeAI(this.apiKey);
      case 'openrouter':
        return null; // OpenRouter uses REST API directly
      default:
        throw new Error(`Unsupported provider: ${this.provider}`);
    }
  }

  async generateReport(logsText) {
    const userPrompt = `Please generate a work report based on these git commits:\n\n${logsText}`;
    
    switch (this.provider) {
      case 'openai':
        return await this.generateWithOpenAI(userPrompt);
      case 'claude':
      case 'anthropic':
        return await this.generateWithClaude(userPrompt);
      case 'gemini':
      case 'google':
        return await this.generateWithGemini(userPrompt);
      case 'openrouter':
        return await this.generateWithOpenRouter(userPrompt);
      default:
        throw new Error(`Unsupported provider: ${this.provider}`);
    }
  }

  async generateWithOpenAI(userPrompt) {
    try {
      const response = await this.client.chat.completions.create({
        model: this.model || 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 800
      });
      
      return response.choices[0].message.content;
    } catch (error) {
      throw new Error(`OpenAI API error: ${error.message}`);
    }
  }

  async generateWithClaude(userPrompt) {
    try {
      const response = await this.client.messages.create({
        model: this.model || 'claude-3-sonnet-20240229',
        max_tokens: 800,
        temperature: 0.7,
        system: SYSTEM_PROMPT,
        messages: [
          { role: 'user', content: userPrompt }
        ]
      });
      
      return response.content[0].text;
    } catch (error) {
      throw new Error(`Claude API error: ${error.message}`);
    }
  }

  async generateWithGemini(userPrompt) {
    try {
      const model = this.client.getGenerativeModel({ 
        model: this.model || 'gemini-pro' 
      });
      
      const prompt = `${SYSTEM_PROMPT}\n\n${userPrompt}`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      
      return response.text();
    } catch (error) {
      throw new Error(`Gemini API error: ${error.message}`);
    }
  }

  async generateWithOpenRouter(userPrompt) {
    try {
      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: this.model || 'openai/gpt-3.5-turbo',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.7,
          max_tokens: 800
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://github.com/git-work-reporter',
            'X-Title': 'Git Work Reporter'
          }
        }
      );
      
      return response.data.choices[0].message.content;
    } catch (error) {
      throw new Error(`OpenRouter API error: ${error.message}`);
    }
  }

  static getProviderModels(provider) {
    switch (provider.toLowerCase()) {
      case 'openai':
        return [
          'gpt-3.5-turbo',
          'gpt-3.5-turbo-16k',
          'gpt-4',
          'gpt-4-turbo-preview',
          'gpt-4-32k'
        ];
      case 'claude':
      case 'anthropic':
        return [
          'claude-3-opus-20240229',
          'claude-3-sonnet-20240229',
          'claude-3-haiku-20240307',
          'claude-2.1',
          'claude-instant-1.2'
        ];
      case 'gemini':
      case 'google':
        return [
          'gemini-pro',
          'gemini-1.5-pro-latest',
          'gemini-1.5-flash-latest'
        ];
      case 'openrouter':
        return [
          'openai/gpt-3.5-turbo',
          'openai/gpt-4',
          'anthropic/claude-3-opus',
          'anthropic/claude-3-sonnet',
          'google/gemini-pro',
          'meta-llama/llama-3-70b-instruct',
          'mistralai/mixtral-8x7b-instruct'
        ];
      default:
        return [];
    }
  }

  static getProviderInfo(provider) {
    const providers = {
      'openai': {
        name: 'OpenAI',
        envKey: 'OPENAI_API_KEY',
        defaultModel: 'gpt-3.5-turbo',
        description: 'OpenAI GPT models'
      },
      'claude': {
        name: 'Claude (Anthropic)',
        envKey: 'ANTHROPIC_API_KEY',
        defaultModel: 'claude-3-sonnet-20240229',
        description: 'Anthropic Claude models'
      },
      'anthropic': {
        name: 'Claude (Anthropic)',
        envKey: 'ANTHROPIC_API_KEY',
        defaultModel: 'claude-3-sonnet-20240229',
        description: 'Anthropic Claude models'
      },
      'gemini': {
        name: 'Google Gemini',
        envKey: 'GEMINI_API_KEY',
        defaultModel: 'gemini-pro',
        description: 'Google Gemini models'
      },
      'google': {
        name: 'Google Gemini',
        envKey: 'GEMINI_API_KEY',
        defaultModel: 'gemini-pro',
        description: 'Google Gemini models'
      },
      'openrouter': {
        name: 'OpenRouter',
        envKey: 'OPENROUTER_API_KEY',
        defaultModel: 'openai/gpt-3.5-turbo',
        description: 'Access multiple LLMs through OpenRouter'
      }
    };
    
    return providers[provider.toLowerCase()] || null;
  }
}