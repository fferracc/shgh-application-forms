# SHGH Application Forms

Public multilingual application and enrolment forms for Sovereign House GH, a Greater Manchester digital inclusion charity. Many applicants are refugees and families who apply from a phone, so the forms work in five languages.

Part of the **SHGH Digital Platform**: [Intranet Portal](https://github.com/fferracc/shgh-intranet-portal) · [UK Learning App](https://github.com/fferracc/shgh-learning-app-uk) · [Ghana Attendance App](https://github.com/fferracc/shgh-attendance-app-ghana) · [n8n Automations](https://github.com/fferracc/n8n-automations)

<!-- ![Application form](docs/screenshot.png) -->

## What it does
- Course application, registration, Bury programme, robotics enrolment and partner referral forms
- Five languages: English, Arabic, Tigrinya, Amharic and Farsi, with right to left layout for Arabic and Farsi
- Robotics enrolment with PayPal payment, confirmed through an n8n webhook
- Submissions saved to Firestore for staff to process
- Served on three Firebase Hosting sites from one codebase
- A "closed" mode (`firebase.closed.json`) that swaps every site for a notice page and locks the database when intake ends
- Campaign conversion events for enrolment tracking

## My role
Designed the forms with the programme team and built, deployed and maintained the app.

## Stack
React 19, Vite, Tailwind CSS, React Hook Form, i18next, React Router, Firebase (Firestore, Hosting), n8n, PayPal

## Run locally
```
cp .env.example .env    # add your Firebase web config
npm install
npm run dev
```

## Data and privacy
No applicant data is in this repository. Configuration values come from environment variables.

## Status
Retired in October 2026. The forms now live inside the Intranet Portal, and this project's database is locked (`firestore.locked.rules`).

Shown with permission of Sovereign House GH.
