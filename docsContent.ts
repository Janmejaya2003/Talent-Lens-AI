import { 
  Zap, 
  User, 
  Users, 
  BarChart3, 
  Target, 
  TrendingUp, 
  ShieldCheck, 
  CreditCard, 
  RefreshCcw, 
  Terminal, 
  Webhook, 
  Table 
} from 'lucide-react';

export interface DocSectionContent {
  id: string;
  title: string;
  description: string;
  icon: any;
  content: string;
}

export const DOCS_CONTENT: Record<string, DocSectionContent> = {
  'quick-start': {
    id: 'quick-start',
    title: 'Quick Start Guide',
    description: 'Get up and running with TalentLens AI in less than 5 minutes.',
    icon: Zap,
    content: `
# Welcome to TalentLens AI

TalentLens is an AI-powered recruitment intelligence platform designed to help you identify top-tier talent through deep semantic analysis.

## 3 Steps to Your First Match

1. **Configure Your Profile**: Complete your company settings and invite your hiring team.
2. **Upload a Job Description**: Use our JD analyzer to extract core requirements and secondary preferences.
3. **Screen Candidates**: Upload resumes and get instant, objective match scores based on real-world capabilities.

### Core Philosophy
We believe hiring should be objective and efficient. Our AI doesn't just look for keywords; it understands the context of experience and the nuance of skill application.
    `
  },
  'account': {
    id: 'account',
    title: 'Account Configuration',
    description: 'Manage your organizational settings and billing preferences.',
    icon: User,
    content: `
# Account Settings

Managing your enterprise account effectively ensures your team has the resources they need for high-velocity hiring.

## Profiles & Branding
Customize how your organization appears to candidates. High-quality branding increases application conversion rates by up to 40%.

## Security Defaults
We support SSO (Single Sign-On) for Enterprise customers. Ensure your team follows NIST password guidelines to protect sensitive candidate data.

### Permissions
- **Admin**: Full access to billing, team management, and global settings.
- **Recruiter**: Can create JDs, upload resumes, and view analytics.
- **Reviewer**: View-only access to specific reports.
    `
  },
  'teams': {
    id: 'teams',
    title: 'Managing Teams',
    description: 'Collaborate with hiring managers and other recruiters effectively.',
    icon: Users,
    content: `
# Team Collaboration

Hiring is a team sport. TalentLens makes it easy to share insights and make collaborative decisions.

## Organizing Departments
Group your recruiters and hiring managers into departments (e.g., Engineering, Marketing, Sales) to streamline JD ownership and candidate flow.

## Collaborative Reviewing
Add comments to candidate reports and tag your teammates. Shared reports have a 30% higher success rate in final-stage interviews.

### Best Practices
- Assign a "Owner" to every Job Description.
- Use the "Shared Dashboard" view during weekly hiring syncs.
    `
  },
  'match-scores': {
    id: 'match-scores',
    title: 'Understanding Match Scores',
    description: 'A deep dive into our proprietary scoring algorithm.',
    icon: BarChart3,
    content: `
# The TalentLens Match Score

The match score is a weighted percentage (0-100%) indicating how well a candidate fits the specific requirements of a Job Description.

## How it's Calculated
We use a three-layer analysis:
1. **The Core Layer**: Mandatory technical requirements (40% weight).
2. **The Context Layer**: Industry experience and seniority level (30% weight).
3. **The Potential Layer**: Soft skills, growth trajectory, and cultural signal (30% weight).

### Interperting the Score
- **90%+**: Exceptionally qualified. High priority for interview.
- **70-89%**: Qualified. Worth screening if the candidate fits the culture.
- **Below 60%**: Significant gaps identified. Review the "Missing Skills" report.
    `
  },
  'skills': {
    id: 'skills',
    title: 'Skill Extraction Logic',
    description: 'How we identify and categorize skills from unstructured text.',
    icon: Target,
    content: `
# AI Skill Extraction

Our NLP engine identifies thousands of distinct skills and maps them to a global capability graph.

## Direct vs. Implicit Skills
- **Direct**: Explicitly mentioned (e.g., "Full-stack React developer").
- **Implicit**: Deduced from project descriptions (e.g., Mentioning "optimizing SQL queries" implies deep understanding of Database Performance).

## Semantic Mapping
The engine understands that "NextJS" is a specialization of "React", and "Go" is often interchangeable for "Distributed Systems" roles when focusing on backend concurrency.
    `
  },
  'experience': {
    id: 'experience',
    title: 'Experience Level Mapping',
    description: 'Translating years of service into real-world seniority levels.',
    icon: TrendingUp,
    content: `
# Seniority & Experience

Years of experience is a crude metric. TalentLens focuses on **Role Depth** and **Progressive Responsibility**.

## Seniority Tiers
- **Entry**: 0-2 years, or career pivoters. High focus on educational foundation.
- **Mid-Level**: 3-6 years. Focus on independent project ownership.
- **Senior**: 7-12 years. Focus on architectural decision-making and mentorship.
- **Staff/Principal**: 12+ years. Focus on organization-wide impact.

### Contextual Normalization
The AI understands that 3 years at a high-growth startup often carries as much "operational weight" as 6 years at a mature corporation.
    `
  },
  'tokens': {
    id: 'tokens',
    title: 'Token Consumption Table',
    description: 'Understand exactly how your subscription tokens are consumed.',
    icon: ShieldCheck,
    content: `
# Token Usage Reference

Tokens are the fuel of TalentLens AI. Use this table to plan your monthly resource allocation.

| Action | Token Cost | Notes |
| :--- | :--- | :--- |
| **Resume Analysis** | 10 Tokens | Full context extraction and ATS scoring |
| **JD Extraction** | 20 Tokens | Requirement mining and market benchmarking |
| **Candidate Matching** | 25 Tokens | Deep-dive semantic fit analysis |
| **Bulk Matching (5+ candidates)** | 20 / search | Discounted rate for high-volume batches |

*Costs are per-operation and deducted at the time of processing.*
    `
  },
  'billing': {
    id: 'billing',
    title: 'Billing Information',
    description: 'Invoicing, payment methods, and subscription management.',
    icon: CreditCard,
    content: `
# Billing & Payments

We offer flexible billing to accommodate teams of all sizes.

## Currency & Taxes
For users in India, all prices are in INR (₹) and include applicable GST. International customers are billed in USD ($) based on current daily exchange rates.

## Auto-Renewal
Subscriptions renew automatically at the end of each billing cycle. You can cancel at any time via the "Plan Management" section.

### Refund Policy
We offer a 7-day "No Questions Asked" refund for any tokens that haven't been consumed in your current billing cycle.
    `
  },
  'reload': {
    id: 'reload',
    title: 'Auto-Reload Setup',
    description: 'Never run out of tokens in the middle of an important hiring cycle.',
    icon: RefreshCcw,
    content: `
# Auto-Reload Credits

Enable Auto-Reload to ensure your team never hits a "Low Balance" wall during critical hiring periods.

## How it Works
When your token balance falls below 10%, our system will automatically purchase a pre-defined "Top-up Bundle".

## Thresholds
- **Alert Threshold**: Default 15%.
- **Reload Trigger**: Default 5%.

### Security Controls
Set a **Monthly Max Spend** to prevent unexpected billing spikes during high-intensity seasons.
    `
  },
  'api': {
    id: 'api',
    title: 'REST API Reference',
    description: 'The technical documentation for our public API endpoints.',
    icon: Terminal,
    content: `
# Public API Reference (v2.4)

Integrate TalentLens directly into your custom ATS or internal dashboard.

## Authentication
All requests must include your API Key in the \`X-TALENT-API-KEY\` header.

## Endpoints
### POST /v2/analyze-resume
Extracts data from a PDF/DOCX file stream.
- **Payload**: Multipart file.
- **Return**: JSON Profile.

### GET /v2/tokens
Returns current balance and usage stats for the authenticated account.
    `
  },
  'webhooks': {
    id: 'webhooks',
    title: 'Webhooks Documentation',
    description: 'React to hiring events in real-time with event-driven hooks.',
    icon: Webhook,
    content: `
# Webhook Integrations

Push data to your internal servers as soon as a candidate report is completed.

## Supported Events
- \`analysis.completed\`: Triggered when a resume finishes processing.
- \`match.scored\`: Triggered when a JD match is finalized.
- \`billing.low_balance\`: Triggered when tokens are below 10%.

## Security
All webhooks are signed with a HMAC-SHA256 signature provided in the \`X-Signature\` header. Always verify signatures to ensure data integrity.
    `
  },
  'mapping': {
    id: 'mapping',
    title: 'Custom Field Mapping',
    description: 'Sync our AI data with your specific ATS database fields.',
    icon: Table,
    content: `
# Field Mapping Configuration

Ensure the data we extract fits perfectly into your existing HCM or ATS schema.

## Default Mappings
By default, we export following fields: \`candidate_name\`, \`email\`, \`phone\`, \`total_exp\`, \`top_skills\`.

## Custom Aliases
Rename our fields to match your database.
Example: Map \`candidate_info.location\` to your field \`city_state_zip\`.

### Advanced Logic
Transform data during export (e.g., converting "Years" to "Months") via our custom mapping script engine.
    `
  }
};
