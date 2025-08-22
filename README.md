# Git Work Reporter

Generate professional work reports from your git commits using AI. Supports multiple LLM providers including OpenAI, Claude, Google Gemini, and OpenRouter.

## Installation

```bash
npm install git-work-reporter
```

Or install globally:

```bash
npm install -g git-work-reporter
```

## Usage

### Basic Usage

Generate a report from today's commits:

```bash
git-work-report generate
```

### With Options

```bash
# Look back 7 days
git-work-report generate -d 7

# Filter by author
git-work-report generate -a "your.email@example.com"

# Use a specific model
git-work-report generate -m gpt-4

# Use Claude
git-work-report generate -p claude -m claude-3-sonnet-20240229

# Use Google Gemini
git-work-report generate -p gemini -m gemini-pro

# Use OpenRouter
git-work-report generate -p openrouter -m anthropic/claude-3-opus

# Specify repository path
git-work-report generate -r /path/to/repo

# Send report to Slack
git-work-report generate -s

# Send to Slack with webhook URL
git-work-report generate -s -w https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

### Configuration

Save your API key for future use:

```bash
git-work-report config
```

Or create a `.env` file:

```env
# LLM Provider (openai, claude, gemini, openrouter)
LLM_PROVIDER=openai

# API Keys (set the one for your selected provider)
OPENAI_API_KEY=your-openai-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key
GEMINI_API_KEY=your-gemini-api-key
OPENROUTER_API_KEY=your-openrouter-api-key

# Model Configuration
DEFAULT_MODEL=gpt-3.5-turbo

# Slack Integration (optional)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

## Command Options

- `-p, --provider <provider>` - LLM provider: openai, claude, gemini, openrouter (default: openai)
- `-k, --api-key <key>` - API key for the selected provider
- `-m, --model <model>` - Model to use (provider-specific)
- `-d, --days <days>` - Number of days to look back (default: 1)
- `-r, --repo <path>` - Repository path (default: current directory)
- `-a, --author <email>` - Filter by author email
- `-s, --slack` - Send report to Slack after generation (optional)
- `-w, --webhook <url>` - Slack webhook URL (optional, can use env variable)

## Example Output

```
📊 Work Report
──────────────────────────────────────────────────

Today's Accomplishments:

• Feature Development
  - Implemented user authentication module
  - Added password reset functionality
  - Created login/logout endpoints

• Bug Fixes
  - Fixed memory leak in data processing
  - Resolved CSS styling issues on mobile

• Code Improvements
  - Refactored database connection logic
  - Updated dependencies to latest versions
  - Added unit tests for auth module
```

## Slack Integration

The tool supports optional Slack integration to automatically send reports to your team channel.

### Setting up Slack Webhook

1. Go to your Slack workspace and create an incoming webhook
2. Copy the webhook URL
3. Either:
   - Save it in your `.env` file as `SLACK_WEBHOOK_URL`
   - Pass it via command line with `-w` option
   - Enter it when prompted

### Sending to Slack

```bash
# Interactive mode - will ask for confirmation
git-work-report generate -s

# Direct send with webhook
git-work-report generate -s -w https://hooks.slack.com/services/YOUR/WEBHOOK/URL

# Automatic (if webhook is in .env)
git-work-report generate -s
```

The Slack message will be formatted with:
- Rich formatting and sections
- Date and repository information
- Clean, readable layout
- Optional author attribution

## Supported LLM Providers

### OpenAI
- Models: GPT-3.5-Turbo, GPT-4, GPT-4-Turbo
- Get API key: https://platform.openai.com/api-keys

### Claude (Anthropic)
- Models: Claude 3 Opus, Sonnet, Haiku; Claude 2.1, Instant
- Get API key: https://console.anthropic.com/

### Google Gemini
- Models: Gemini Pro, Gemini 1.5 Pro, Gemini 1.5 Flash
- Get API key: https://makersuite.google.com/app/apikey

### OpenRouter
- Access multiple LLMs through one API
- Models: OpenAI, Anthropic, Google, Meta Llama, Mistral, and more
- Get API key: https://openrouter.ai/keys

## Requirements

- Node.js 14 or higher
- Git repository
- API key for your chosen LLM provider
- Slack webhook URL (optional, for Slack integration)

## License

MIT