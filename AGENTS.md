# הנחיות הפרויקט

## טכנולוגיות ומבנה
- צד השרת הוא JavaScript עם ES Modules; התלויות כוללות Express, Mongoose, Joi, `jsonwebtoken`, `bcryptjs` ו-`dotenv`. Vitest ו-Supertest משמשים לבדיקות.
- `app.js` מגדיר ומייצא את אפליקציית Express; `server.js` מתחבר למסד דרך `config/db.js` ומפעיל את השרת.
- תיקיות השרת בפועל: `config/`, `routes/`, `controllers/`, `models/`, `middleware/`, `validation/`, `utils/` ו-`tests/`. קיימת גם אפליקציית React/Vite נפרדת תחת `my-react-app/`.

## נתיבי API
- `app.js` מחבר את הנתיבים תחת `/api/tasks`, `/api/categories` ו-`/api/users`.
- משימות: `GET /`, `GET /:id`, `POST /`, `PUT /:id`, `DELETE /:id`.
- קטגוריות: `GET /`, `GET /:id`, `POST /`, `PUT /:id`, `DELETE /:id`.
- משתמשים: `POST /register` ו-`POST /login`.

## שגיאות, ולידציה ואימות
- `AppError` מוגדר ב-`middleware/AppError.js`; `middleware/error.middleware.js` מייצא את `middlewareHandler`, שממיר שגיאות לתגובות JSON.
- ולידציית Joi מתבצעת באמצעות `validateSchema` שב-`middleware/validateJoi.middleware.js`; הסכמות נמצאות ב-`validation/`.
- `auth` ו-`authorize` נמצאות ב-`middleware/auth.middleware.js`. `JWT_SECRET` נטען דרך `.env` ונקרא מ-`process.env`; אין לכתוב את ערכו בקוד. הזהות והתפקיד נקבעים מתוך ה-payload של JWT מאומת, ולא מנתוני גוף הבקשה או ה-query.

## הרצה ובדיקות
- `npm start` מריץ `node server.js`.
- `npm run dev` מריץ `node --watch app.js`.
- `npm test` מריץ `vitest run`; הבדיקות משתמשות גם ב-Supertest וב-mocks למסדי הנתונים.

# הנחיות לסוכן

- לכל פונקציה שנוצרת או מתעדכנת, הוסף או עדכן בדיקות יחידה רלוונטיות
  בתיקיית tests/.
- כל בדיקה כוללת מקרה תקין, מקרי קצה ומקרי כשל.
- אחרי כל שינוי בקוד הרץ את כל הבדיקות (npm test).
- אם יש בדיקה שנכשלת, אל תבצע commit. דווח על השגיאה ותקן אותה.
- אל תמחק ואל תחליש בדיקה כדי שתעבור.
- בבדיקות אין חיבור למסד אמיתי: משתמשים ב-mock.
- סיומות .js בכל ייבוא יחסי (ES Modules).