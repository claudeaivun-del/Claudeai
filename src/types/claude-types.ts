// Types for Claude API compatibility

export type BetaContentBlockParam = 
  | BetaTextBlockParam
  | BetaImageBlockParam
  | BetaToolUseBlockParam
  | BetaToolResultBlockParam

export interface BetaTextBlockParam {
  type: 'text'
  text: string
  cache_control?: { type: 'ephemeral' | '1h' }
}

export interface BetaImageBlockParam {
  type: 'image'
  source: { type: 'base64'; media_type: string; data: string }
  cache_control?: { type: 'ephemeral' }
}

export interface BetaToolUseBlockParam {
  type: 'tool_use'
  id: string
  name: string
  input: Record<string, unknown>
}

export interface BetaToolResultBlockParam {
  type: 'tool_result'
  tool_use_id: string
  content: string | BetaContentBlock[]
}

export type BetaMessageParam = {
  role: 'user' | 'assistant'
  content: BetaContentBlockParam[] | string
}

export interface BetaMessage {
  id: string
  type: 'message'
  role: 'assistant'
  content: BetaContentBlock[]
  model: string
  stop_reason: BetaStopReason
  stop_sequence: string | null
  usage: BetaUsage
}

export type BetaContentBlock =
  | BetaTextBlock
  | BetaImageBlock
  | BetaToolUseBlock
  | BetaToolResultBlock
  | BetaThinkingBlock

export interface BetaTextBlock {
  type: 'text'
  text: string
}

export interface BetaToolUseBlock {
  type: 'tool_use'
  id: string
  name: string
  input: Record<string, unknown>
}

export interface BetaThinkingBlock {
  type: 'thinking'
  thinking: string
}

export interface BetaImageBlock {
  type: 'image'
  source: { type: 'base64'; media_type: string; data: string }
}

export interface BetaToolResultBlock {
  type: 'tool_result'
  tool_use_id: string
  content: string | BetaContentBlock[]
}

export type BetaStopReason = 
  | 'end_turn'
  | 'max_tokens'
  | 'tool_use'
  | 'stop_sequence'
  | 'model_context_window_exceeded'

export interface BetaUsage {
  input_tokens: number
  output_tokens: number
  cache_creation_input_tokens?: number
  cache_read_input_tokens?: number
}

export type BetaRawMessageStreamEvent =
  | MessageStartEvent
  | ContentBlockStartEvent
  | ContentBlockDeltaEvent
  | ContentBlockStopEvent
  | MessageDeltaEvent
  | MessageStopEvent

export interface MessageStartEvent {
  type: 'message_start'
  message: BetaMessage
}

export interface ContentBlockStartEvent {
  type: 'content_block_start'
  index: number
  content_block: BetaContentBlock
}

export interface ContentBlockDeltaEvent {
  type: 'content_block_delta'
  index: number
  delta: { type: 'text_delta'; text: string } | { type: 'input_json_delta'; partial_json: string }
}

export interface ContentBlockStopEvent {
  type: 'content_block_stop'
  index: number
}

export interface MessageDeltaEvent {
  type: 'message_delta'
  delta: { stop_reason: BetaStopReason }
  usage: BetaUsage
}

export interface MessageStopEvent {
  type: 'message_stop'
}

export interface BetaMessageCreateParams {
  model: string
  max_tokens: number
  system?: string
  tools?: BetaTool[]
  messages: BetaMessageParam[]
  thinking?: { type: 'enabled'; budget_tokens: number }
  betas?: string[]
  metadata?: Record<string, unknown>
}

export interface BetaTool {
  type: 'function'
  function: {
    name: string
    description: string
    input_schema: Record<string, unknown>
  }
}
