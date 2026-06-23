-- Seed 20 example AI tools
INSERT INTO tools (name, slug, description, website_url, category, pricing, tags) VALUES
-- AI Agents
('AutoAgent', 'autoagent', 'Build and deploy autonomous AI agents that can browse the web, use APIs, and complete complex tasks on their own.', 'https://autoagent.ai', 'ai-agents', 'Freemium', ARRAY['agents', 'automation', 'autonomous']),
('AgentStack', 'agentstack', 'A platform for creating multi-agent workflows with visual builder. Connect AI agents together to automate business processes.', 'https://agentstack.io', 'ai-agents', 'Paid', ARRAY['agents', 'workflows', 'automation', 'business']),

-- Image AI
('PixelGen', 'pixelgen', 'Generate stunning high-resolution images from text descriptions with advanced style control and inpainting capabilities.', 'https://pixelgen.ai', 'image-ai', 'Freemium', ARRAY['image generation', 'text-to-image', 'art']),
('PhotoMaster', 'photomaster', 'AI-powered photo editor that removes backgrounds, enhances quality, colorizes old photos, and retouches faces automatically.', 'https://photomaster.ai', 'image-ai', 'Free', ARRAY['photo editing', 'enhancement', 'background removal']),
('DesignForge', 'designforge', 'Create professional logos, social media graphics, and marketing materials with AI. Thousands of templates available.', 'https://designforge.ai', 'image-ai', 'Freemium', ARRAY['design', 'logos', 'graphics', 'marketing']),

-- Video AI
('ClipCrafter', 'clipcrafter', 'Turn text into short-form videos for social media. Includes AI voiceover, auto-captioning, and music library.', 'https://clipcrafter.ai', 'video-ai', 'Freemium', ARRAY['video generation', 'social media', 'short form']),
('VideoSynth', 'videosynth', 'Advanced AI video generator that creates realistic video clips from text prompts with consistent characters and scenes.', 'https://videosynth.ai', 'video-ai', 'Paid', ARRAY['video generation', 'text-to-video', 'realistic']),

-- Coding AI
('CodePilot', 'codepilot', 'AI coding assistant that integrates with VS Code and JetBrains. Write, refactor, and debug code in any programming language.', 'https://codepilot.ai', 'coding-ai', 'Freemium', ARRAY['coding', 'assistant', 'ide', 'debugging']),
('DevM8', 'devm8', 'Generate full-stack applications from natural language descriptions. Supports React, Next.js, Python, and more.', 'https://devm8.ai', 'coding-ai', 'Paid', ARRAY['code generation', 'full-stack', 'app builder']),
('ReviewBot', 'reviewbot', 'Automated code review tool that catches bugs, security vulnerabilities, and suggests optimizations before merge.', 'https://reviewbot.ai', 'coding-ai', 'Free', ARRAY['code review', 'security', 'optimization']),

-- Writing AI
('TextCraft', 'textcraft', 'AI writing assistant for blogs, emails, social media, and marketing copy. Supports 50+ languages and multiple tones.', 'https://textcraft.ai', 'writing-ai', 'Freemium', ARRAY['writing', 'content', 'blog', 'marketing']),
('ScriptForge', 'scriptforge', 'Specialized AI for writing screenplays, video scripts, and podcast outlines with formatting and story structure templates.', 'https://scriptforge.ai', 'writing-ai', 'Freemium', ARRAY['scriptwriting', 'screenplay', 'video scripts', 'podcast']),

-- Audio AI
('VoiceForge', 'voiceforge', 'AI voice generator with 500+ realistic voices in 50+ languages. Perfect for voiceovers, audiobooks, and virtual assistants.', 'https://voiceforge.ai', 'audio-ai', 'Freemium', ARRAY['voice generation', 'tts', 'voiceovers', 'audiobooks']),
('SoundMatic', 'soundmatic', 'Generate royalty-free music and sound effects from text descriptions. Adjust tempo, genre, and instruments.', 'https://soundmatic.ai', 'audio-ai', 'Free', ARRAY['music generation', 'sound effects', 'royalty-free']),

-- Productivity AI
('TaskWiz', 'taskwiz', 'AI productivity assistant that manages your calendar, drafts emails, summarizes meetings, and creates to-do lists.', 'https://taskwiz.ai', 'productivity-ai', 'Freemium', ARRAY['productivity', 'assistant', 'calendar', 'email']),
('NoteGenius', 'notegenius', 'AI note-taking app that transcribes meetings, generates summaries, and extracts action items automatically.', 'https://notegenius.ai', 'productivity-ai', 'Freemium', ARRAY['note-taking', 'transcription', 'meetings', 'summaries']),

-- Research AI
('PaperPal', 'paperpal', 'AI research assistant that helps read, summarize, and analyze academic papers. Find relevant research in seconds.', 'https://paperpal.ai', 'research-ai', 'Freemium', ARRAY['research', 'academic', 'papers', 'summarization']),
('DataMind', 'datamind', 'Analyze datasets, generate insights, and create visualizations using natural language. No coding required.', 'https://datamind.ai', 'research-ai', 'Paid', ARRAY['data analysis', 'visualization', 'insights', 'no-code']),

-- Mixed categories
('ChatBot Pro', 'chatbot-pro', 'Build custom AI chatbots with your own data. Embed on your website with no-code setup. Supports GPT-4 and Claude.', 'https://chatbotpro.ai', 'ai-agents', 'Paid', ARRAY['chatbots', 'customer support', 'no-code', 'gpt']),
('StoryWeaver', 'storyweaver', 'AI-powered interactive storytelling platform. Create branching narratives, game dialogues, and choose-your-own-adventure content.', 'https://storyweaver.ai', 'writing-ai', 'Free', ARRAY['storytelling', 'interactive', 'narrative', 'gaming']);
