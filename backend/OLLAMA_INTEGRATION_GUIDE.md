# 🦙 Ollama Local LLM Integration Guide

This guide details how to integrate and use **Ollama** with the local **qwen2.5:3b** model inside the ATS Platform backend instead of using cloud APIs like Google Gemini or OpenRouter.

As requested, we have kept the existing codebase files untouched and created separate helper/service files so you can transition at your own pace.

---

## 🛠️ Step 1: Install Ollama Locally

1. **Download Ollama**:
   Go to [ollama.com](https://ollama.com) and download the installer for Windows. Run the installer and finish setup.
   
2. **Verify Installation**:
   Open a new Command Prompt or PowerShell window and verify that Ollama is installed:
   ```bash
   ollama --version
   ```

3. **Start the Ollama Application**:
   Ensure the Ollama application is running (you should see the llama icon in your Windows system tray/taskbar).

---

## 📥 Step 2: Download the `qwen2.5:3b` Model

Qwen 2.5 is an exceptionally strong local model for structured tasks (like parsing resumes and returning JSON). 

Run the following command in your terminal to download and run the 3-billion parameter model:
```bash
ollama run qwen2.5:3b
```
*Note: This will download a file of about 1.9GB. Once the download is complete, you can type `/bye` and hit enter to exit the interactive chat.*

---

## ⚙️ Step 3: Configure Environment Variables

Add the following variables to your `backend/.env` file:

```env
# Ollama Configuration
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen2.5:3b
```

---

## 🧪 Step 4: Run the Connection & Parsing Test

We have provided a test script to make sure the server can talk to Ollama, retrieve responses, and parse them into valid JSON.

Run the following command from the `backend/` directory:

```bash
npx ts-node -r tsconfig-paths/register src/scripts/test-ollama.ts
```

If Ollama is running and `qwen2.5:3b` is pulled, you should see output like:
```text
====================================================
      OLLAMA LOCAL LLM INTEGRATION TEST             
====================================================
Target Ollama Host:  http://localhost:11434
Target Ollama Model: qwen2.5:3b

1. Checking connection and parsing dummy resume...
✓ Success! Parsed Resume JSON Output:
{
  "name": "JOHN DOE",
  ...
}

2. Testing AI Summary generation...
...
====================================================
🎉 ALL OLLAMA TESTS PASSED SUCCESSFULLY!
====================================================
```

---

## 🔄 Step 5: Swapping from Gemini to Ollama in the Codebase

If you decide to switch the backend to use Ollama instead of Gemini, follow these simple import modifications:

### 1. Update Resume Service (`backend/src/modules/resumes/resume.service.ts`)

Open the file and modify the import at the top of the file:

```diff
- import GeminiService from '@services/gemini/gemini.service';
+ import OllamaService from '@services/ollama/ollama.service';
```

And update the usage in `resume.service.ts`:

```diff
-      // Parse resume with Gemini
-      const parsedData = await GeminiService.parseResume(normalizedText);
+      // Parse resume with Ollama
+      const parsedData = await OllamaService.parseResume(normalizedText);
```

```diff
-      const aiSummary = await GeminiService.generateAISummary(normalizedText, parsedData);
+      const aiSummary = await OllamaService.generateAISummary(normalizedText, parsedData);
```

---

### 2. Update Matching Service (`backend/src/modules/matching/matching.service.ts`)

Open the file and modify the import:

```diff
- import GeminiService from '@services/gemini/gemini.service';
+ import OllamaService from '@services/ollama/ollama.service';
```

And update the parsing usage:

```diff
-      // Parse job description with Gemini to get summary
-      const parsedJob = await GeminiService.parseJobDescription(jobDescriptionText);
+      // Parse job description with Ollama to get summary
+      const parsedJob = await OllamaService.parseJobDescription(jobDescriptionText);
```

---

## 💡 Why `qwen2.5:3b`?
- **Speed**: The `3b` parameter size is incredibly fast on standard CPUs and graphics cards.
- **JSON Format Support**: Ollama forces structured JSON matching through the `format: "json"` option, which Qwen 2.5 handles perfectly.
- **Privacy & Cost**: Runs fully locally on your computer. Your data never leaves your machine, and there are no API costs.
