# Multi-Provider Examples

## 🤖 OpenAI (GPT Models)

```bash
# Using GPT-3.5 (default)
$ git-work-report generate

# Using GPT-4
$ git-work-report generate -p openai -m gpt-4

# Using GPT-4 Turbo
$ git-work-report generate -p openai -m gpt-4-turbo-preview -k sk-xxx...
```

## 🧠 Claude (Anthropic)

```bash
# Using Claude 3 Sonnet
$ git-work-report generate -p claude

? Please enter your Claude (Anthropic) API key: ********************************
? Select Claude (Anthropic) model: 
  claude-3-opus-20240229      (Most capable, best for complex tasks)
❯ claude-3-sonnet-20240229    (Balanced performance)
  claude-3-haiku-20240307      (Fastest, most cost-effective)
  claude-2.1                   (Previous generation)
  claude-instant-1.2           (Fast, lightweight)

⠋ Analyzing git logs...
✔ Report generated successfully!

📊 Work Report
──────────────────────────────────────────────────

Today's Engineering Progress:

Technical Achievements:
• Successfully implemented OAuth 2.0 authentication flow with refresh token handling
• Architected and deployed microservices communication layer using gRPC
• Optimized database queries resulting in 65% performance improvement

Code Quality Improvements:
• Refactored legacy authentication module to follow SOLID principles
• Increased test coverage from 72% to 91% with comprehensive unit tests
• Implemented automated code review checks in CI/CD pipeline

Infrastructure Updates:
• Migrated application to Kubernetes with auto-scaling policies
• Configured monitoring and alerting using Prometheus and Grafana
• Established disaster recovery procedures with automated backups
```

## ✨ Google Gemini

```bash
# Using Gemini Pro
$ git-work-report generate -p gemini

? Please enter your Google Gemini API key: ********************************
? Select Google Gemini model:
❯ gemini-pro                  (Best for text generation)
  gemini-1.5-pro-latest       (Advanced reasoning, longer context)
  gemini-1.5-flash-latest     (Fast, efficient)

⠏ Analyzing git logs...
✔ Report generated successfully!

📊 Work Report
──────────────────────────────────────────────────

Daily Development Summary:

🚀 Features Delivered:
• Real-time chat functionality with WebSocket implementation
• Advanced search with Elasticsearch integration
• Multi-language support for 5 new languages

🐛 Issues Resolved:
• Fixed critical memory leak in message processing service
• Resolved race condition in concurrent data updates
• Corrected timezone handling across different regions

📈 Performance Enhancements:
• Reduced API response time by 40% through caching
• Optimized image loading with lazy loading implementation
• Decreased bundle size by 25% with code splitting
```

## 🌐 OpenRouter (Multiple LLMs)

```bash
# Choose from multiple providers through OpenRouter
$ git-work-report generate -p openrouter

? Please enter your OpenRouter API key: ********************************
? Select OpenRouter model:
  openai/gpt-3.5-turbo         (OpenAI GPT-3.5)
  openai/gpt-4                 (OpenAI GPT-4)
❯ anthropic/claude-3-opus      (Claude 3 Opus - Most capable)
  anthropic/claude-3-sonnet    (Claude 3 Sonnet - Balanced)
  google/gemini-pro            (Google Gemini Pro)
  meta-llama/llama-3-70b       (Meta Llama 3 70B)
  mistralai/mixtral-8x7b       (Mistral Mixtral 8x7B)

⠹ Analyzing git logs...
✔ Report generated successfully!

[Report content based on selected model...]
```

## ⚙️ Configuration Examples

### Setting Default Provider

```bash
$ git-work-report config

? Select LLM provider:
  OpenAI (GPT-3.5, GPT-4)
❯ Claude (Anthropic)
  Google Gemini
  OpenRouter (Multiple LLMs)

? Enter your Claude (Anthropic) API key: ********************************
? Select default Claude (Anthropic) model: claude-3-sonnet-20240229
? Do you want to configure Slack integration? No

✓ Configuration saved to .env file
```

### Using Environment Variables

```bash
# .env file
LLM_PROVIDER=claude
ANTHROPIC_API_KEY=sk-ant-api03-xxx...
DEFAULT_MODEL=claude-3-sonnet-20240229

# Now just run without specifying provider
$ git-work-report generate
# Will automatically use Claude with saved settings
```

### Switching Providers On-the-Fly

```bash
# Quick switch to different provider
$ git-work-report generate -p gemini -k AIza...

# Compare outputs from different models
$ git-work-report generate -p openai -m gpt-3.5-turbo > report-gpt.txt
$ git-work-report generate -p claude -m claude-3-haiku-20240307 > report-claude.txt
$ git-work-report generate -p gemini -m gemini-pro > report-gemini.txt
```

## 📊 Provider Comparison

| Provider | Best For | Speed | Cost | Context Window |
|----------|----------|-------|------|----------------|
| **OpenAI GPT-3.5** | General purpose, fast | Fast | Low | 16K tokens |
| **OpenAI GPT-4** | Complex reasoning | Moderate | High | 32K tokens |
| **Claude 3 Opus** | Most complex tasks | Slow | High | 200K tokens |
| **Claude 3 Sonnet** | Balanced performance | Moderate | Medium | 200K tokens |
| **Claude 3 Haiku** | Quick tasks | Very Fast | Low | 200K tokens |
| **Gemini Pro** | General purpose | Fast | Low | 32K tokens |
| **Gemini 1.5 Pro** | Long context | Moderate | Medium | 1M tokens |
| **OpenRouter** | Access to multiple models | Varies | Varies | Varies |

## 🔄 Batch Processing with Different Providers

```bash
# Generate reports for team using different providers
for dev in john@company.com jane@company.com bob@company.com; do
  echo "Generating report for $dev"
  git-work-report generate -a "$dev" -p claude -s
done
```

## 🎯 Provider-Specific Features

### Claude - Better at Technical Documentation
```bash
# Claude excels at creating detailed technical reports
$ git-work-report generate -p claude -m claude-3-opus-20240229 -d 7
# Produces highly detailed, well-structured technical documentation
```

### GPT-4 - Best for Creative Summaries
```bash
# GPT-4 creates more creative, narrative-style reports
$ git-work-report generate -p openai -m gpt-4 -d 30
# Generates comprehensive monthly summaries with insights
```

### Gemini - Fast and Efficient
```bash
# Gemini Flash for quick daily standups
$ git-work-report generate -p gemini -m gemini-1.5-flash-latest
# Very fast generation for daily reports
```

### OpenRouter - Model Flexibility
```bash
# Try different models without multiple API keys
$ git-work-report generate -p openrouter -m meta-llama/llama-3-70b-instruct
# Access open-source models through unified API
```