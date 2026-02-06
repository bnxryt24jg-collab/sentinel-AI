# 🛡️ SentinelAI — Prompt Risk Scanner & Auto-Rewrite Assistant

>SentinelAI helps users understand hidden prompt risks **before execution**, and suggests safer alternative prompts.

---

## 📌 Project Overview

SentinelAI is a **prompt-first risk detection and auto-remediation assistant** designed to identify, explain, and mitigate risks **before** a large language model executes a prompt.

Unlike traditional safety tools that focus solely on output moderation, SentinelAI operates at the **input layer**, helping developers and teams detect misuse, security, and compliance risks at an earlier and more controllable stage.

---

## 💡 Why Prompt Risk Analysis Matters

As large language models are increasingly embedded into:

- Customer support chatbots  
- Automated workflows  
- AI agents and decision-making systems  

A recurring problem emerges:

- Users are often unaware of **hidden logical, legal, or privacy risks** inside prompts  
- Most existing safety solutions act **after generation**, when damage may already be done  

A single flawed prompt can lead to:

- Business logic hijacking  
- Privilege escalation  
- Data leakage  
- Policy or compliance violations  

SentinelAI addresses this gap by analyzing **prompt risks before execution**, reducing downstream harm and operational uncertainty.

---

## 🧠 Key Features

### 🔍 Multi-Dimensional Risk Scanning

Powered by **Gemini 1.5 Flash**, SentinelAI performs millisecond-level prompt risk analysis, identifying patterns such as:

- Business logic override  
- Prompt injection  
- Privilege escalation  
- Sensitive content exposure  

It also supports **multimodal hidden instruction detection**, uncovering malicious OCR payloads embedded in images.

---

### 🔐 Privacy Gateway

Inspired by **Google Cloud Sensitive Data Protection (DLP)**, SentinelAI detects and optionally masks PII (e.g. phone numbers, API keys, identity data) **before** prompts reach the model.

---

### 🛠️ Smart Remediation

Automatically rewrites unsafe prompts into **safer alternatives**, preserving original intent while reducing risk.

- Bilingual prompt analysis (Chinese & English)  
- Minimal, targeted modifications rather than aggressive censorship  

---

### 🧩 Dynamic Hash Defense

A custom `generateEntropy` mechanism generates randomized secure anchors, effectively blocking prompt hijacking and instruction override attempts.

---

### 📐 XML-Based Structural Hardening

Prompts are automatically reconstructed using structured constraints.

Risk analysis results are returned as **structured JSON**, including:

- Risk categories  
- Labels  
- Confidence scores  

Human-readable explanations clarify **why** a prompt is considered risky.

---

### 🔴 Self Red-Teaming

An automated stress-testing module simulates adversarial attacks **after remediation**, validating whether defenses are effective and forming a closed-loop safety workflow.

---

## 📊 System Architecture Overview

```mermaid
User Prompt Input
↓
Sensitive Data Detection
↓
Risk Analysis Engine (Google Gemini)
↓
Structured Risk Output (JSON)
↓
Risk Explanation + Safe Rewrite

```

---

## 🚀 User Flow

1. User inputs a prompt or selects a built-in example  
2. SentinelAI detects sensitive data and applies masking by default  
3. Prompt is analyzed for risk patterns  
4. Structured JSON risk results are returned  
5. Human-readable explanations and safe rewrite suggestions are displayed  

---

## 📦 Tech Stack

- **AI Engine:** Google Gemini 1.5 Pro & 1.5 Flash  
- **Frontend & Logic:** TypeScript / React (Vite)  
- **Security Practices:** Exponential backoff retry strategy, Zero Trust–oriented design  

---

## 🛡️ Privacy & Security Policy

- Prompt analysis is performed **in-session by default**, without storing raw sensitive text  
- Prompt history is an **optional, user-controlled feature**  
- Sensitive data masking is implemented using **Google Cloud Sensitive Data Protection principles**  
- **Sensitive information is masked by default**

This design choice ensures that:

- The risk scanner itself does not process raw personal data  
- Users are protected even if they lack privacy awareness  
- Safety tools do not become new compliance risks  

In this hackathon version, input-level configurability is intentionally limited, prioritizing a **secure-by-default** product strategy.

---

## 🛠️ What’s Next

- IDE plugins (VS Code / Cursor / JetBrains)  
- Team-level prompt governance dashboards  
- Enterprise-grade custom risk policies  
- Dataset-driven risk tuning and calibration  

---

## 🚀 Run Locally

### Prerequisites

- **Node.js** v18 or higher

---

### Install Dependencies

```bash
npm install

### Configure API Key
Create a .env file in the project root and add your Gemini API key:
API_KEY=YOUR_GEMINI_API_KEY

### Start Development Server

npm run dev

---
