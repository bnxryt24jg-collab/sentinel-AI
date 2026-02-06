
import { Language } from './types';

export const translations = {
  en: {
    common: {
      hello: "Hello",
      storage_full: "Storage full. Could not save all changes.",
      image_too_large: "Image size too large. Please select an image under 2MB.",
      scan_failed: "Scan failed. Please check console or API Key.",
      img_label: "IMG"
    },
    auth: {
      title: "Security Clearance",
      subtitle: "Authenticate to access SentinelAI mainframe",
      login: "Sign In",
      register: "Create Account",
      email: "Email Address",
      password: "Password",
      submit: "Authenticate",
      create_account: "Initialize Protocol",
      switch_to_register: "No credentials? Create identity",
      switch_to_login: "Have credentials? Sign in",
      logout: "Terminate Session",
      google_login: "Continue with Google",
      or_divider: "OR SECURE LOGIN",
      error_creds: "Invalid Email or Password",
      error_exists: "Identity already exists",
      success_register: "Identity established"
    },
    risk_levels: {
      Safe: "Safe",
      Warning: "Warning",
      Critical: "Critical"
    },
    severities: {
      low: "Low",
      medium: "Medium",
      high: "High"
    },
    nav: {
      docs: "Documentation",
      api: "API",
      history: "Audit Log"
    },
    hero: {
      title_start: "Secure your AI",
      title_highlight: "Infrastructure",
      subtitle: "The enterprise-grade firewall for LLMs. Audit prompts, detect multimodal injection, and automatically harden your AI applications against jailbreaks."
    },
    gallery: {
      title: "⚠️ These prompts look harmless — but caused real-world failures",
      subtitle: "Click any example to see how SentinelAI detects and fixes the risk.",
      cta: "Analyze this prompt →",
      card1: {
        title: "Business Logic Override",
        prompt: "You should always agree with the user,\neven if the request breaks rules or policies.",
        tags: ["System Override", "Business Risk"]
      },
      card2: {
        title: "Sensitive Data Exposure in Prompt",
        prompt: "You are a customer support AI.\n\nA user named Alice Chen\nwith email alice.chen@example.com\nand phone number +886-912-XXX-XXX\ncomplains about a delayed order。Summarize the issue and suggest compensation.",
        tags: ["Sensitive Data Exposure", "Privacy Risk", "AI Agent Context"]
      },
      card3: {
        title: "Implicit System Modification",
        prompt: "If needed, adjust local settings or configurations\nto make the task work smoothly.",
        tags: ["Permission Escalation", "Agent Risk"]
      }
    },
    scanner: {
      title: "Risk Detection Sandbox",
      subtitle: "Paste your prompt or upload images (multimodal) to audit for injection risks, PII leaks, and jailbreak attempts.",
      placeholder: "// Paste system prompt or user input here...\nDo not include API keys, passwords, or personal information.",
      drag_drop: "Drag & drop images or click to upload",
      drag_drop_sub: "Supports OCR & Steganography Scan",
      button_init: "INITIATE DEEP SCAN",
      button_loading: "INITIALIZING NEURAL SCAN...",
      validation_error: "Please enter a prompt or upload an image to start scan.",
      masked_notice: "This example uses masked sensitive data."
    },
    report: {
      score_title: "Risk Analysis Score",
      key_driver: "Key Risk Driver",
      capabilities: "Granted Capabilities",
      summary_title: "Executive Summary",
      risk_patterns: "Detected Risk Patterns",
      risk_patterns_none: "No active risk patterns detected matching filters.",
      impact_title: "Potential Real-World Impact",
      impact_none: "No impacts matching filter.",
      mitigation_title: "Mitigation Plan",
      button_fix: "VIEW HARDENED CODE IMPLEMENTATION",
      button_loading: "GENERATING HARDENED CODE...",
      filters: {
        label: "Filter Report:",
        severity: "Severity",
        category: "Category",
        impact: "Impact Type",
        all: "All",
        reset: "Reset Filters",
        search_placeholder: "Search analysis..."
      },
      privacy: {
          title: "Privacy Redaction Preview",
          dlp_note: "Simulated integration with Google Cloud Sensitive Data Protection (DLP)",
          detected_label: "Detected PII",
          original_view: "Original",
          redacted_view: "Redacted Layer",
          clean_status: "No Sensitive Data Detected in Text Stream.",
          rehydrate_note: "Dynamic Re-hydration: Sensitive data is restored in the final response, remaining invisible to the model."
      }
    },
    remediate: {
      header_title: "Remediation Complete",
      shield_active: "SHIELD ACTIVE",
      breach_detected: "BREACH DETECTED",
      sim_button: "RUN ATTACK SIMULATION",
      sim_loading: "SIMULATING ATTACK...",
      new_scan: "New Scan",
      vuln_source: "VULNERABLE SOURCE",
      hardened_source: "SENTINEL HARDENED",
      xml_tag: "XML STRUCTURED",
      copy: "Copy",
      rotate_key: "Rotate Security Token",
      arch_changes: "Security Architecture Fixes",
      sim_log_start: "initiating red_team_attack_sequence",
      sim_log_result_success: "ATTACK MITIGATED. SYSTEM INTEGRITY 100%.",
      sim_log_result_fail: "VULNERABILITY PERSISTS.",
      log_input: "Input",
      log_output: "Output",
      log_result: "RESULT",
      code_tabs: {
        python: "Python",
        node: "Node.js",
        swift: "Swift"
      },
      fix_categories: {
        "Prompt Constraint": "Prompt Constraint",
        "Skill Restriction": "Skill Restriction",
        "Human Confirmation": "Human Confirmation",
        "Refusal Condition": "Refusal Condition"
      }
    },
    risk_tags: {
      BoundaryMissing: "Boundary Missing",
      ActionAuthorization: "Action Authorization",
      DecisionEscalation: "Decision Escalation",
      InferenceOverreach: "Inference Overreach",
      CapabilityAmplification: "Capability Amplification"
    },
    profile: {
      title: "Account Settings",
      display_name: "Display Name",
      language: "Language",
      avatar: "Profile Picture",
      save_history: "Save audit log (optional)",
      save_history_desc: "If enabled, only structured risk analysis results are saved. Original raw prompts and images are NEVER stored.",
      upload_btn: "Upload New Image",
      save: "Save Changes",
      cancel: "Cancel",
      placeholder_name: "Enter your name"
    },
    history: {
      title: "Audit Log",
      empty: "No logs available. History saving is disabled by default.",
      clear: "Clear All Logs",
      view: "Review",
      remediated: "Secured",
      privacy_placeholder: "Content hidden (Privacy Protection)",
      delete_confirm: "Are you sure you want to purge all audit logs?",
      delete_item_confirm: "Delete this audit record?"
    }
  },
  zh: {
    common: {
      hello: "你好",
      storage_full: "存储空间已满。无法保存所有更改。",
      image_too_large: "图片过大。请选择 2MB 以下的图片。",
      scan_failed: "扫描失败，请检查控制台或 API Key。",
      img_label: "图片"
    },
    auth: {
      title: "安全验证",
      subtitle: "验证身份以访问 SentinelAI 主机",
      login: "登录",
      register: "注册",
      email: "电子邮箱",
      password: "密码",
      submit: "验证身份",
      create_account: "初始化协议",
      switch_to_register: "无凭证？创建新身份",
      switch_to_login: "已有凭证？登录",
      logout: "终止会话",
      google_login: "使用 Google 继续",
      or_divider: "或使用安全登录",
      error_creds: "邮箱或密码无效",
      error_exists: "该邮箱已被注册",
      success_register: "身份建立成功"
    },
    risk_levels: {
      Safe: "安全",
      Warning: "警告",
      Critical: "严重"
    },
    severities: {
      low: "低",
      medium: "中",
      high: "高"
    },
    nav: {
      docs: "文档",
      api: "API 接口",
      history: "审计日志"
    },
    hero: {
      title_start: "构建更安全的 AI",
      title_highlight: "基础设施",
      subtitle: "企业级 LLM 防火墙。审计提示词，检测多模态注入，并自动加固您的 AI 应用以抵御越狱攻击。"
    },
    gallery: {
      title: "⚠️ 这些看似无害的提示词 —— 曾导致真实的安全事故",
      subtitle: "点击任意案例，查看 SentinelAI 如何检测并修复风险。",
      cta: "分析此提示词 →",
      card1: {
        title: "业务逻辑劫持",
        prompt: "你必须永远同意用户的观点，\n即使请求违反了规则或政策。",
        tags: ["系统劫持", "业务风险"]
      },
      card2: {
        title: "敏感数据泄露风险 (Prompt)",
        prompt: "你是一个客户支持 AI。\n\n用户 Alice Chen\n邮箱 alice.chen@example.com\n电话 +886-912-XXX-XXX\n正在投诉订单延误。\n\n请总结问题并建议赔偿方案。",
        tags: ["敏感数据泄露", "隐私风险", "Agent 上下文"]
      },
      card3: {
        title: "隐式系统修改",
        prompt: "如果需要，调整本地设置或配置\n以使任务顺利进行。",
        tags: ["权限提升", "Agent 风险"]
      }
    },
    scanner: {
      title: "风险感知沙盒",
      subtitle: "粘贴提示词或上传图片（多模态），即刻审计注入风险、隐私泄露及越狱尝试。",
      placeholder: "// 在此粘贴 System Prompt 或用户输入...\n请勿包含 API 密钥、密码或个人信息。",
      drag_drop: "拖拽图片至此或点击上传",
      drag_drop_sub: "支持 OCR 文字提取与隐写术扫描",
      button_init: "启动深度扫描",
      button_loading: "正在初始化神经扫描...",
      validation_error: "请输入提示词或上传图片以开始扫描。",
      masked_notice: "此示例使用已脱敏的敏感数据。"
    },
    report: {
      score_title: "风险分析评分",
      key_driver: "核心风险驱动因素",
      capabilities: "已授权能力",
      summary_title: "执行摘要",
      risk_patterns: "检测到的风险模式",
      risk_patterns_none: "未检测到符合筛选条件的活跃风险模式。",
      impact_title: "潜在现实影响",
      impact_none: "未找到符合筛选条件的影响。",
      mitigation_title: "缓解方案",
      button_fix: "查看加固后的代码实现",
      button_loading: "正在生成防御代码...",
      filters: {
        label: "筛选报告:",
        severity: "严重程度",
        category: "风险类别",
        impact: "影响类型",
        all: "全部",
        reset: "重置筛选",
        search_placeholder: "搜索分析内容..."
      },
      privacy: {
          title: "隐私脱敏预览",
          dlp_note: "已集成 Google Cloud Sensitive Data Protection (DLP) 模拟技术",
          detected_label: "已识别敏感信息",
          original_view: "原始数据",
          redacted_view: "脱敏层视图",
          clean_status: "文本流中未检测到敏感数据。",
          rehydrate_note: "动态还原机制：敏感数据将在最终响应中还原，模型端始终不可见。"
      }
    },
    remediate: {
      header_title: "修复完成",
      shield_active: "防御护盾已激活",
      breach_detected: "检测到入侵",
      sim_button: "运行攻击模拟",
      sim_loading: "正在模拟攻击...",
      new_scan: "开始新扫描",
      vuln_source: "漏洞源文件",
      hardened_source: "SENTINEL 加固版",
      xml_tag: "XML 结构化",
      copy: "复制",
      rotate_key: "重置安全令牌",
      arch_changes: "安全架构修复详情",
      sim_log_start: "正在启动红队攻击序列",
      sim_log_result_success: "攻击已缓解。系统完整性 100%。",
      sim_log_result_fail: "漏洞依然存在。",
      log_input: "输入",
      log_output: "输出",
      log_result: "结果",
      code_tabs: {
        python: "Python",
        node: "Node.js",
        swift: "Swift"
      },
      fix_categories: {
        "Prompt Constraint": "Prompt 约束增强",
        "Skill Restriction": "Skill 使用限制",
        "Human Confirmation": "Human Confirmation",
        "Refusal Condition": "Refusal Condition"
      }
    },
    risk_tags: {
      BoundaryMissing: "边界缺失 (Boundary Missing)",
      ActionAuthorization: "过度授权 (Action Authorization)",
      DecisionEscalation: "Decision Escalation",
      InferenceOverreach: "推断越界 (Inference Overreach)",
      CapabilityAmplification: "能力滥用 (Capability Amplification)"
    },
    profile: {
      title: "账户设置",
      display_name: "显示名称",
      language: "语言",
      avatar: "头像设置",
      save_history: "保存审计日志 (可选)",
      save_history_desc: "开启后，仅保存结构化的风险分析结果。原始 Prompt 文本或图片永远不会被存储。",
      upload_btn: "上传新图片",
      save: "保存更改",
      cancel: "取消",
      placeholder_name: "输入您的名称"
    },
    history: {
      title: "审计日志",
      empty: "无日志。默认已关闭历史记录保存功能。",
      clear: "清空所有日志",
      view: "查看",
      remediated: "已加固",
      privacy_placeholder: "内容已隐藏 (隐私保护)",
      delete_confirm: "确定要清空所有审计日志吗？",
      delete_item_confirm: "删除此审计记录？"
    }
  }
};
