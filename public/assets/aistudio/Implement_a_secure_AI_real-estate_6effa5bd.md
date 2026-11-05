Implement a secure AI real-estate customer chat agent in this existing Attaie Properties codebase. Inspect the project first, then implement and test locally.

## Context and objective

- Production website: https://www.attaieproperties.com — WordPress and MySQL hosted on cPanel.
- New website: https://website.attaieproperties.com — described as React/Vue with PHP endpoints. Confirm the actual stack from the code.
- Customers primarily message in Afghan Dari (دری افغانستان).
- The assistant must retrieve relevant property information from MySQL before answering questions about listings.
- Administrators must be able to configure OpenAI, Google Gemini, or Anthropic Claude using their own API keys.
- Preserve the existing database and property records. Do not modify production or deploy without my explicit approval.

Proceed with reasonable defaults and local implementation. Avoid repeated design questions. Ask only when missing information genuinely blocks progress.

## 1. Inspect the existing project

Read applicable repository instructions. Inspect:
- Frontend framework, routing, components, and styling.
- PHP endpoints, database access, authentication, and administrator authorization.
- Database schema files and property relationships.
- Existing customer chat, inquiry, lead, and notification workflows.
- Build scripts, tests, and cPanel deployment configuration.

Reuse existing patterns and dependencies where practical. Do not assume database table names, column names, or that both React and Vue are actually used.

If database structure is unavailable, implement independent components and identify the exact schema information needed. Do not fabricate a working database mapping.

## 2. Customer chat interface

Integrate the chat into the existing website design and reuse its message box if one exists.

Include:
- Chat launcher and accessible chat panel.
- Afghan Dari interface text by default.
- Message history, loading indicators, retry controls, and clear error states.
- Suggested questions in Dari.
- Property cards showing verified listing information and valid listing links.
- Responsive mobile layout and keyboard accessibility.
- Right-to-left layout, with readable prices, phone numbers, currencies, and links.
- Clear identification as an AI assistant.
- A customer-requested option to contact a human agent.

Render messages safely. Do not render untrusted HTML or unsafe links from model output or database descriptions.

## 3. Afghan Dari language requirements

The assistant must understand natural Afghan Dari, including:
- Informal wording and spelling variations.
- Arabic/Persian character variations such as ي/ی and ك/ک.
- Persian, Arabic, and Western digits.
- Common Afghan real-estate terms such as اپارتمان، حویلی، نمره زمین، کرایه، گروی، منزل، اتاق، تشناب، and افغانی.
- Follow-up questions referring to earlier listings or preferences.

Respond politely and naturally using vocabulary familiar to customers in Afghanistan. Ask for clarification when wording is ambiguous.

Normalize search inputs without changing stored database records. Support Dari and English property names when existing data or explicit aliases allow matching. Do not invent translations or aliases that could select the wrong property.

Preserve exact prices, currencies, measurements, and availability. Never silently convert currencies or units.

Reply in another language when requested. Support English and Pashto alongside the default Afghan Dari.

Test realistic examples such as:
«در کابل یک اپارتمان سه اتاقه برای کرایه دارین؟»
«کرایه‌اش چند است؟»
«این اپارتمان هنوز موجود است؟»

## 4. Multiple AI providers and admin settings

Support:
- OpenAI
- Google Gemini
- Anthropic Claude

Create an administrator-only settings page that allows an authorized administrator to:
- Select a provider.
- Enter and securely save that provider’s API key.
- Choose a supported model.
- Test the connection.
- Activate a provider and model.
- Replace or delete saved credentials.

Allow separate credentials for each provider. Mask saved keys; never return full keys after saving.

Security requirements:
- Send keys to the PHP backend over HTTPS.
- Never put keys in frontend bundles, browser storage, chat history, source control, or logs.
- Encrypt saved keys server-side.
- Store the encryption secret outside the public web directory and database.
- Protect settings and connection tests with administrator authentication, authorization, CSRF defenses, and rate limits.
- Never expose credentials to customers.
- Use fixed, approved provider endpoints; do not accept arbitrary API base URLs.

Explain that API access and provider billing are required; consumer chat subscriptions may not include API usage.

Build a shared server-side provider interface with adapters for each provider’s official API and tool-calling format. Verify current API behavior using official documentation before implementing.

Only allow supported models capable of the required tool calls. Keep the model configurable rather than relying on an unverified model name.

Use the active provider for new conversations. Define safe behavior for existing conversations when settings change. Keep provider-specific message formats separate.

Disable automatic provider fallback by default. Any optional fallback must be explicitly configured because it can share customer data with another provider.

## 5. Secure PHP orchestration and property lookup

Create a PHP chat endpoint using the project’s existing conventions.

The server must:
1. Validate the customer request and session.
2. Load a bounded conversation history.
3. Call the selected provider.
4. Validate any requested tool and its arguments.
5. Execute an approved database lookup.
6. Return tool results to the provider.
7. Return the grounded answer and verified property cards to the customer.

Implement narrowly scoped tools based on the actual schema, for example:
- search_properties
- get_property_details
- get_project_details
- check_property_availability

Enforce:
- A fixed allowlist of tool names.
- Strict server-side argument validation.
- Parameterized SQL.
- Server-controlled table names, columns, sorting, and filters.
- Bounded result counts and query timeouts.
- Access only to approved public listing fields and published listings.

The model must never generate or execute arbitrary SQL. It must never change prices, availability, property records, or customer accounts.

Use a database account restricted to reading approved property data. Keep credentials for chat and lead writes separately scoped.

Treat customer messages, property descriptions, and tool results as untrusted content. They must not override instructions, expand permissions, expose secrets, or retrieve private records.

## 6. Grounded answers

For factual listing questions, require relevant database lookup before answering. Enforce this in server orchestration, not only through a prompt.

- Answer prices, availability, amenities, locations, and listing details from returned data.
- Use fresh lookups for current price and availability questions.
- Do not treat earlier assistant messages as authoritative property data.
- If a field is missing, say the information is unavailable.
- If no listings match, explain that and offer to adjust filters.
- If a request is ambiguous, ask a short clarifying question.
- If the database or AI provider fails, show a useful error instead of inventing an answer.
- Build property cards from validated database results rather than model-generated listing fields.
- Ordinary greetings and clarification questions do not require unnecessary database searches.

## 7. Conversation storage and privacy

Store conversation data separately from existing property records, using new, clearly named tables or a separate database appropriate to the project.

Provide reviewable, additive migrations. Do not execute them against production.

Include:
- Conversations and messages.
- Server-controlled ownership and session access.
- Minimal provider/model metadata.
- Optional lead and handoff records.
- Configurable retention and cleanup.
- Clear disclosure that messages are processed by the selected external AI provider.

Prevent one customer from reading or modifying another customer’s conversation. Never trust a client-supplied conversation ID as proof of ownership.

Bound message size, history length, and stored tool results. Send only necessary data to AI providers. Keep secrets and unnecessary personal information out of logs and model requests.

## 8. Lead collection and human handoff

The primary workflow is database-backed AI answers. Offer human handoff when the customer requests it or the assistant cannot resolve the question.

- Obtain explicit consent before collecting contact details or forwarding a conversation.
- Reuse existing lead management and notification workflows where available.
- Validate contact details server-side.
- Keep lead writes separate from property lookup permissions.
- Require explicit customer action for lead submission; do not let model output alone trigger it.
- Prevent duplicate submissions.
- Never claim that an agent was notified unless delivery succeeded.

If no handoff destination exists, make it configurable and clearly mark setup as pending. Do not invent email addresses, WhatsApp numbers, or a sales dashboard integration.

## 9. Reliability and abuse protection

Implement:
- Session and request validation.
- Appropriate CSRF and origin protections.
- Rate limits resistant to trivial session resets.
- Message-size and conversation-length limits.
- Maximum tool rounds and result sizes.
- Provider timeouts and bounded retries.
- Configurable token and spending controls.
- Safe handling of provider quotas and malformed responses.
- Duplicate-request protection where needed.
- Redacted diagnostic logging.
- User-facing errors without credentials, SQL, stack traces, or internal prompts.

Keep the implementation compatible with the actual cPanel hosting environment. Avoid requiring a persistent Node.js server unless the existing hosting explicitly supports it.

## 10. Tests and verification

Use the project’s test tools where available. Cover:
- Correct property matching and published-listing filtering.
- Missing fields and no matches.
- SQL injection and invalid tool arguments.
- Prompt injection in customer messages and database descriptions.
- Unauthorized administrator access and credential protection.
- Conversation ownership and session isolation.
- Rate limits and request bounds.
- Provider errors, timeouts, malformed tool calls, and tool-loop limits.
- Each provider adapter’s request and response format.
- Consent, duplicate lead prevention, and truthful handoff status.
- Afghan Dari spelling variations, digits, follow-up questions, and RTL layout.
- Safe rendering of messages and listing links.

Clearly distinguish mocked tests from real database or live provider tests. Do not claim live integration works unless it was actually tested with authorized credentials and a suitable environment.

## 11. cPanel deployment documentation

Provide practical instructions covering:
- Required PHP version and extensions.
- Frontend build and upload steps.
- PHP endpoint placement and routing.
- Secure configuration outside the public web directory.
- Provider credential encryption setup.
- Read-only property database permissions.
- Separately scoped chat and lead storage permissions.
- Optional additive migrations.
- HTTPS and session configuration.
- Retention cleanup through cPanel cron, if needed.
- Staging verification with a safe database copy.
- Backups, rollback, and a way to disable chat without affecting the website.

Do not deploy, change production configuration, run live migrations, alter existing property data, or send real notifications without my explicit approval.

## Completion report

Finish with:
- What was implemented.
- Files changed.
- Tests run and their results.
- Any untested or blocked integration.
- Configuration or schema information still required.
- Exact staging deployment steps.
- Production actions awaiting approval.

Do not stop at a generic architecture proposal when local implementation is possible. Complete all authorized local work while preserving the existing website and database.