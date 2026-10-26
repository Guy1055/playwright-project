# צ'קליסט פרויקט QA Automation + Claude

סמן [x] כשסיימת שלב. עובדים לפי הסדר.

## שלב 0 – הכנות
- [x] Node.js מותקן (v24 ✔), npm (✔), git (✔)
- [x] חשבון GitHub + ריפו: Guy1055/playwright-project (נדחף ל-main)
- [x] `git init` + חיבור לריפו בוצעו
- [x] אתר נבחר: https://practicesoftwaretesting.com (נבדק, נגיש)
- [x] קובץ `CLAUDE.md` נוצר

## שלב 1 – Skills (מכניקת בניית סקילים)
- [x] להבין מבנה של skill: תיקייה + `SKILL.md` (frontmatter: name, description) + קבצי עזר
- [x] לכתוב סקיל ראשון פשוט: `.claude/skills/commit-message`
- [ ] לבדוק שהוא מופעל (trigger) לפי ה-description
- [x] לשפר את ה-description עד שמופעל בדיוק כשצריך (הורחב: commits אוטומטיים, עברית, גבולות)
- [ ] סקיל שני, אמיתי לפרויקט: `write-playwright-test` (מוסכמות, POM, locators)

## שלב 2 – Test Plan + אוטומציה עם Claude
- [ ] חקירת האתר (ידנית + עם Claude/דפדפן)
- [ ] Test Plan: scope, תרחישים, עדיפויות, נתוני בדיקה, סיכונים
- [ ] תרגול ניסוח פרומפטים: למצוא את המילים שגורמות ל-Claude לעבוד כמו שאתה רוצה
  - [ ] תיעוד "פרומפט לפני/אחרי" בקובץ `prompt-notes.md`
- [ ] התקנת Playwright: `npm init playwright@latest`
- [ ] כתיבת טסטים ראשונים עם Claude (Page Object Model)
- [ ] הרצה יציבה מקומית (ללא flaky)

## שלב 3 – Playwright Traces
- [ ] הגדרת `trace: 'on-first-retry'` ב-`playwright.config`
- [ ] להריץ טסט שנכשל בכוונה ולפתוח trace: `npx playwright show-trace`
- [ ] ללמוד לקרוא: timeline, network, console, DOM snapshots
- [ ] לתקן באג/flakiness בעזרת trace
- [ ] (בונוס) Trace Viewer אונליין: trace.playwright.dev

## שלב 4 – Dynamic Workflow (פיצ'ר של Claude)
- [ ] מחקר: תיעוד רשמי של הפיצ'ר (קובץ שמגדיר פרומפט לכל שלב, model/effort לכל שלב)
- [ ] תכנון הפלואו:
  1. gather context
  2. draft test cases
  3. critic (לולאה עד אישור)
  4. draft code
  5. lint + fix
- [ ] לכתוב את קובץ ה-workflow
- [ ] לבחור model/effort שונה לכל שלב (למשל: critic חזק, lint זול)
- [ ] להריץ על פיצ'ר אמיתי באתר ולשפר פרומפטים

## שלב 5 – Claude ב-CI (GitHub Actions)
- [ ] workflow ב-`.github/workflows/` שמריץ Playwright
- [ ] שמירת traces/reports כ-artifacts
- [ ] הוספת `ANTHROPIC_API_KEY` ל-GitHub Secrets (לעולם לא בקוד!)
- [ ] שילוב Claude ב-CI (למשל Claude Code GitHub Action: review ל-PR או ניתוח כשלונות)
- [ ] הרצה מוצלחת + צילום מסך/לינק לריצה

## שלב 6 – ליטוש לתיק עבודות
- [ ] README בעברית/אנגלית: מטרה, ארכיטקטורה, איך מריצים, תמונות
- [ ] תיעוד מה למדת (פרומפטים, סקילים, workflow)
- [ ] ריפו ציבורי ונקי
- [ ] פוסט LinkedIn / הוספה לקו"ח
- [ ] הכנה לראיון: להסביר כל החלטה בפרויקט

## רעיונות "ועוד" (אופציונלי)
- [ ] API testing ב-Playwright
- [ ] Visual regression
- [ ] Accessibility (axe-core)
- [ ] Data-driven tests / fixtures
- [ ] MCP של Playwright עם Claude
