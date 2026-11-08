# צ'קליסט פרויקט QA Automation + Claude

סמן [x] כשסיימת שלב. עובדים לפי הסדר.

## שלב 0 – הכנות
- [x] Node.js מותקן (v24 ✔), npm (✔), git (✔)
- [x] חשבון GitHub + ריפו: Guy1055/playwright-project (נדחף ל-main)
- [x] `git init` + חיבור לריפו בוצעו
- [x] אתר נבחר: https://practicesoftwaretesting.com (נבדק, נגיש)
- [x] קובץ `CLAUDE.md` נוצר
- [x] להפעיל Push protection בגיטהאב (הופעל)

## שלב 1 – Skills (מכניקת בניית סקילים)
- [x] להבין מבנה של skill: תיקייה + `SKILL.md` (frontmatter: name, description) + קבצי עזר
- [x] לכתוב סקיל ראשון פשוט: `.claude/skills/commit-message`
- [x] לבדוק שהוא מופעל (trigger) לפי ה-description (נבדק בשיחה נקייה)
- [x] לשפר את ה-description עד שמופעל בדיוק כשצריך (הורחב: commits אוטומטיים, עברית, גבולות)
- [x] סקיל שני, אמיתי לפרויקט: `write-playwright-test` (מוסכמות, POM, locators)
- [ ] לבדוק שהסקיל השני מופעל אוטומטית (שיחה חדשה: "תוסיף טסט לחיפוש" בלי להזכיר את שמו)

## שלב 2 – Test Plan + אוטומציה עם Claude
- [x] חקירת האתר (ידנית + עם Claude/דפדפן)
- [x] Test Plan: scope, תרחישים, עדיפויות, נתוני בדיקה, סיכונים (`TEST-PLAN.md`)
- [~] תרגול ניסוח פרומפטים: למצוא את המילים שגורמות ל-Claude לעבוד כמו שאתה רוצה
  - [~] תיעוד בקובץ `prompt-notes.md` – נפתח (סעיף MCP מול דפדפן מובנה); חסר "לפני/אחרי"
- [x] התקנת Playwright: `npm init playwright@latest`
- [x] כתיבת טסטים אמיתיים עם Claude (POM, תיוג `@sanity`) – כל האתר: לקוח, admin, API, SQL, a11y, visual
- [x] הרצה יציבה מקומית (ללא flaky)

## שלב 3 – Playwright Traces
- [x] הגדרת `trace: 'on-first-retry'` ב-`playwright.config`
- [~] להריץ טסט שנכשל בכוונה ולפתוח trace: הטסט והמדריך מוכנים (`docs/TRACE-GUIDE.md`); פתיחת ה-trace עליך
- [ ] ללמוד לקרוא: timeline, network, console, DOM snapshots
- [ ] לתקן באג/flakiness בעזרת trace
- [ ] (בונוס) Trace Viewer אונליין: trace.playwright.dev

## שלב 4 – Dynamic Workflow (פיצ'ר של Claude)
- [x] מחקר: תיעוד רשמי של הפיצ'ר (`docs/DYNAMIC-WORKFLOW.md`)
- [x] תכנון הפלואו:
  1. gather context
  2. draft test cases
  3. critic (לולאה עד אישור)
  4. draft code
  5. lint + fix
- [x] לכתוב את קובץ ה-workflow (`.claude/workflows/generate-tests.js`)
- [~] לבחור model/effort שונה לכל שלב: model לכל שלב הוגדר; effort לכל שלב לא מתועד ב-`agent()`
- [ ] להריץ על פיצ'ר אמיתי באתר ולשפר פרומפטים (`/generate-tests <feature>`; הלוגיקה נבדקה ב-dry run בלבד)

## שלב 5 – Claude ב-CI (GitHub Actions)
- [x] workflow ב-`.github/workflows/` שמריץ Playwright
- [x] שמירת traces/reports כ-artifacts
- [ ] הוספת `ANTHROPIC_API_KEY` ל-GitHub Secrets (לעולם לא בקוד!)
- [~] שילוב Claude ב-CI: ניתוח כשלונות בנוי; ירוץ בפועל רק אחרי הוספת המפתח
- [ ] הרצה מוצלחת + צילום מסך/לינק לריצה

## שלב 6 – ליטוש לתיק עבודות
- [~] README: מטרה, ארכיטקטורה, איך מריצים (עדיין בלי תמונות)
- [ ] תיעוד מה למדת (פרומפטים, סקילים, workflow)
- [x] ריפו ציבורי ונקי
- [ ] פוסט LinkedIn / הוספה לקו"ח
- [ ] הכנה לראיון: להסביר כל החלטה בפרויקט

## רעיונות "ועוד" (אופציונלי)
- [x] API testing ב-Playwright
- [x] Visual regression
- [x] Accessibility (axe-core)
- [x] Data-driven tests / fixtures
- [x] פרויקט תאום ב-Selenium Java (`Guy1055/selenium-java-project`)
- [x] שכבת SQL (placeholders מול סכמה אמיתית; רצה רק עם `DB_URL`)
- [x] MCP של Playwright עם Claude (`.mcp.json`, גרסה נעוצה; נטען בסשן חדש אחרי אישור ב-/mcp)
