
export type Language = 'en' | 'zh';

export enum RiskLevel {
  SAFE = 'Safe',
  WARNING = 'Warning',
  CRITICAL = 'Critical'
}

export enum RiskTagType {
  BoundaryMissing = 'BoundaryMissing',
  ActionAuthorization = 'ActionAuthorization',
  DecisionEscalation = 'DecisionEscalation',
  InferenceOverreach = 'InferenceOverreach',
  CapabilityAmplification = 'CapabilityAmplification'
}

export interface GrantedCapability {
  type: string;
  description: string;
}

export interface RiskTag {
  tag: RiskTagType;
  severity: 'low' | 'medium' | 'high';
  explanation: string;
}

export interface PotentialImpact {
  impact_type: string;
  description: string;
}

export interface MitigationSuggestion {
  type: string;
  suggestion: string;
}

export interface SafePromptRewrite {
  rewritten_prompt: string;
  preserved_intent: string;
}

export interface ExplanationSummary {
  human_readable: string;
  key_reason: string;
}

export interface PIIItem {
  type: 'EMAIL' | 'PHONE' | 'API_KEY' | 'ID_NUMBER' | 'ADDRESS';
  original: string;
  redacted_label: string;
  index: number;
}

export interface PiiAnalysis {
  redacted_text: string;
  detected_items: PIIItem[];
  has_pii: boolean;
}

export interface ScanResult {
  risk_level: RiskLevel;
  granted_capabilities: GrantedCapability[];
  risk_tags: RiskTag[];
  potential_impacts: PotentialImpact[];
  explanation_summary: ExplanationSummary;
  mitigation_suggestions: MitigationSuggestion[];
  safe_prompt_rewrite: SafePromptRewrite;
  pii_analysis: PiiAnalysis;
}

export type FixCategory = 'Prompt Constraint' | 'Skill Restriction' | 'Human Confirmation' | 'Refusal Condition';

export interface FixSuggestion {
  category: FixCategory;
  description: string;
}

export interface HardenedResult {
  originalPrompt: string;
  hardenedPrompt: string;
  explanation: string;
  fix_details: FixSuggestion[];
  integrationCode: {
    python: string;
    node: string;
    swift: string;
  };
}

export interface AttackSimulation {
  success: boolean; // true means defense worked
  log: string;
  attackPrompt: string;
  defenseResponse: string;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  rawText: string; // Will be empty string if privacy mode is on
  riskLevel: RiskLevel;
  scanResult: ScanResult;
  remediationResult?: HardenedResult;
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  avatar: string | null;
  lang: Language;
  saveHistory: boolean; // Privacy setting
}

export type AppState = 'IDLE' | 'SCANNING' | 'REPORT' | 'REMEDIATING' | 'REMEDIATED';
