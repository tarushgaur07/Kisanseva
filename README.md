# KisanSeva (किसानसेवा) 🌾

AI-Powered Crop & Livestock Disease Diagnosis Platform for Indian Farmers.

Built with React, TypeScript, Tailwind CSS, Google Gemini 3.8 Flash Multimodal Vision, and Open-Meteo Live Weather.

---

## 🚀 Key Features Implemented

1. **Bilingual Everywhere (English & सरल हिन्दी)**:
   - Visible top-bar toggle `EN | हिन्दी` on every screen.
   - First-launch preference selection modal.
   - All labels, descriptions, errors, and diagnosis reports generated in both languages.
   - Text-to-Speech (`speechSynthesis`) "Listen Aloud" button for reading diagnoses in Hindi (`hi-IN`) or Indian English (`en-IN`).
   - Voice typing via browser Web Speech API mic on all note and symptom inputs.

2. **Mobile-First Farmer-Centric UI**:
   - High-contrast, clean light theme with deep green (`#1B5E20`) primary, warm amber for warnings, and red reserved for urgent conditions.
   - Minimum 48px touch targets, big intuitive icons with clear Hindi/English labels.
   - Responsive layout: bottom navigation bar on mobile (360px+), top sub-bar on desktop.

3. **4-Step Diagnosis Wizard**:
   - **Step 1 - Type & Subtype**: Crop (Wheat, Rice, Maize, Sugarcane, Cotton, Mustard, Potato, Tomato, Other) or Livestock (Cow, Buffalo, Goat, Sheep, Poultry, Other).
   - **Step 2 - Capture**: Camera capture, gallery multi-upload (up to 3 photos), and 20s video recording with canvas frame extraction (4-5 frames). Built-in instant test sample images for 1-click evaluation without camera. Real-time canvas brightness/contrast quality checks.
   - **Step 3 - Guided Symptoms**: Crop questions (affected part, duration, spreading, humidity, spray used) and Livestock questions (age, fever, appetite loss, milk drop, diarrhoea, coughing, swelling, limping).
   - **Step 4 - Review & Submit**: Animated multi-stage AI analysis screen calling `/api/diagnose`.

4. **Safety & Confidence Routing**:
   - Strict adherence to agricultural safety: no exact chemical or prescription drug dosages; directs users to product labels or veterinarians.
   - Automatic routing: If confidence < 70% or severity is "urgent" or model flags uncertain symptoms, case status becomes **"Sent to Expert"** and enters the veterinary review queue.

5. **Comprehensive Diagnosis Report**:
   - Circular confidence meter gauge, color-coded severity tag, and status badge.
   - Collapsible cards: Summary, Symptoms Seen, Likely Causes, Interactive checkable Treatment Steps, Generic Indian Formulations (e.g. Mancozeb, Propiconazole, Meloxicam), Safe Home Remedies, Prevention, and When to Call an In-Person Expert.
   - Downloadable bilingual PDF export via `jsPDF`.
   - 1-click WhatsApp report share with formatted summary message.
   - Thumbs up/down helpfulness feedback loop.

6. **Interactive AI Assistant ("Ask KisanSeva")**:
   - Conversational chat with quick question chips, mic speech input, and voice narration.
   - Runs with or without report context.

7. **Veterinary & Agronomy Help ("Call a Vet")**:
   - National toll-free 24x7 emergency helplines: **Kisan Call Centre 1800-180-1551** and **Pashu Helpline 1962**.
   - "Find Nearest Vet" button opening Google Maps hospital search.
   - Directory with state, district, specialisation filters, and 1-tap `tel:` and WhatsApp links.
   - Automatic emergency alert banner when an urgent livestock case exists.

8. **Expert Review Desk**:
   - Role-based workflow for doctors/agronomists.
   - Pending, In Review, and Completed tabs.
   - Doctors can confirm AI diagnosis, correct disease tags, write bilingual notes with mic, or mark urgent. Updates case to **"Expert Verified"** and pushes in-app notification.

9. **History, Insights & Recharts**:
   - Full history table with search, category/severity/status filters, and sorting.
   - Recharts monthly diagnoses bar chart and top detected diseases pie chart.
   - Recurring farm problem detection (e.g. repeated rust/blight within 90 days).
   - Full CSV export button compliant with RFC 4180.

10. **Platform Governance (Admin Desk)**:
    - Overall KPIs: active farmers, total diagnoses, expert escalations, average confidence.
    - Adjustable AI confidence routing threshold slider.
    - Vet directory management (add, edit, delete verified doctors).

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Recharts, jsPDF.
- **Backend**: Express on Node.js running on port 3000 (`server.ts`).
- **AI Models**: Google Gemini 2.5/3.8 Flash Multimodal Vision (`@google/genai`) with fallback simulation so offline or keyless runs never break.
- **Weather API**: Open-Meteo Live Forecast API (geolocation based, zero key required).

---

## 📦 What is Implemented vs Mocked

| Feature | Implementation Status |
| :--- | :--- |
| **Multimodal AI Diagnosis** | **Implemented** (calls Gemini API via server `/api/diagnose`; includes realistic fallback mode if offline) |
| **Bilingual Translations** | **Implemented** (Full spoken Hindi + English in `translations.ts`) |
| **Speech-to-Text & TTS** | **Implemented** (Web Speech API Recognition + `window.speechSynthesis`) |
| **Weather & Farming Advisory** | **Implemented Live** (Real-time data from Open-Meteo API) |
| **PDF Generation** | **Implemented** (Browser-side PDF generation via `jsPDF`) |
| **WhatsApp Share** | **Implemented** (`wa.me` URL schema with formatted summary) |
| **Confidence Routing & Escalation** | **Implemented** (Pure logic module + admin threshold slider) |
| **Photo Quality Analysis** | **Implemented** (Canvas pixel luminance & contrast variance calculation) |
| **Recharts Visualizations** | **Implemented** (Monthly Bar Chart + Top Diseases Donut Pie Chart) |
| **Vet Directory Data** | **Sample Entries** (Clearly labeled sample records; admin can add real doctors) |
| **Helplines** | **Real Verified** (Govt. of India: 1800-180-1551 & 1962) |

---

## ⚙️ Running Locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the dev server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.
3. Run unit tests:
   ```bash
   npx --yes tsx --test src/utils/logic.test.ts
   ```
4. Build for production:
   ```bash
   npm run build
   ```
