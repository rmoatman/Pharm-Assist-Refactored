# Pharm-Assist: Refactored
_Refactored by R. Oatman with assistance from Claude Code (Anthropic) — July 2026_

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
<br><br>

<img src="./client/src/images/screenshot.png" alt="Image of Pharm-Assist homepage">
<br><br>

Pharm-Assist is not currently deployed. It runs locally (see [Local Installation](#local-installation)).
<br><br>

## Description
Pharm-Assist is an app designed to assist users in managing their medications. Pharm-Assist allows users to:

* Regularly update medications and daily schedules
* Conveniently print (or save as PDF) an up-to-date list of medications for dosing and sharing with providers
* Sort the list (by name or time of day) and email it to the address on file
* Quickly check medications for possible interactions with each other
* See what each medication is used for, plus a text description of the pill (color, shape, imprint)
* Autocomplete a medication's name and strength while adding it
* Check for prescription discounts (GoodRx / SingleCare)
<br><br>

> **Disclaimer:** Pharm-Assist is for informational purposes only and is **not medical advice**. Interaction and drug information comes from public FDA/NLM data and may be incomplete or out of date. Always consult a healthcare professional or pharmacist.
<br><br>

## Table of Contents
  * [Technologies](#technologies)
  * [Local Installation](#local-installation)
  * [Usage](#usage)
  * [Collaborators](#collaborators)
  * [Refactoring](#refactoring)
<br><br>

## Technologies
* React (with react-router-dom v5)
* React-to-Print
* Express.js — REST API
* MongoDB + Mongoose
* JWT authentication + bcrypt password hashing
* Axios for API calls
* NLM **RxNorm** API — medication names, strengths, and autocomplete
* **openFDA** drug labeling API — interaction checks, "used for," and pill descriptions
* NLM **DailyMed** API — pill images (available server-side; not currently shown in the UI)
* **GoodRx** / **SingleCare** — prescription discount links

<br>

## Local Installation

### Prerequisites
* **Node.js** (v16+)
* **MongoDB** running locally — the server connects to `mongodb://localhost/pharm-assist` by default

### Install
Clone the repository and install dependencies for both the server and the client:
~~~bash
gh repo clone rmoatman/Pharm-Assist-Refactored
cd Pharm-Assist-Refactored
npm install        # installs root, then server, then client dependencies
~~~

### Environment (optional)
The server reads configuration from `server/.env`. A local default is used if it's absent, so this step is optional for local development:
~~~bash
cp server/.env.example server/.env
# then edit server/.env to set JWT_SECRET (and MONGODB_URI if not using the default)
~~~

<br>

## Usage

The app has two parts plus a database:

| Part | What it is | Runs on |
| --- | --- | --- |
| **Client** | React front-end app | http://localhost:3000 |
| **Server** | Express REST API back-end | http://localhost:3001 |
| **Database** | MongoDB (`pharm-assist`) | mongodb://localhost:27017 |

Make sure **MongoDB is running** first.

**Run everything together** (from the project root) — starts the API and the React app concurrently:
~~~bash
npm run develop
~~~

**(Optional) seed sample data** into the database:
~~~bash
npm run seed
~~~

**Run each part on its own** instead:
~~~bash
# Back-end API (auto-reload with nodemon)
cd server && npm run watch      # or: npm start

# Front-end React app (in a second terminal)
cd client && npm start

# Production build of the front-end
cd client && npm run build
~~~

<br>

## Collaborators
* Anam Brazik  https://github.com/abrazik
* Bernie McKnight  https://github.com/sissyhanks
* Judy Motha  https://github.com/JudyMotha
* Lance Bailey  https://github.com/lancebailey26
* Raemarie Oatman  https://github.com/rmoatman

<br>

## Refactoring
This project was refactored and extended in July 2026 (with assistance from Claude Code). Highlights:

**Architecture & fixes**
* Removed the unused **GraphQL layer** — the app now runs on a single, clean **REST API**.
* Hardened **authentication**: moved the JWT secret to an environment variable (`.env`), added input validation, and made auth cookies work over local `http://localhost`.
* Fixed cross-platform breakages: filename **casing** issues (would fail on Linux), a missing `react-router-dom` dependency, and the Node 17+ OpenSSL build error.
* Added a persistent **"not medical advice" disclaimer** across the app.
* Heavily **commented** every source file for readability.

**Drug data (replacing discontinued APIs)**
* The NLM **Drug Interaction API was discontinued**, so interaction checking was rebuilt on the free **openFDA** drug-labeling data, behind a swappable provider interface (so a paid, curated source can be dropped in later).
* Added **"used for"** (indications) and **pill appearance descriptions** from openFDA.
* Added medication **name + strength autocomplete** powered by RxNorm.

**Features**
* **Interaction flagging** on the medication list, plus a **public homepage checker** (enter two drugs, no sign-in).
* **Print / Save-as-PDF** medication list, grouped into a mini-table per time of day with checkboxes.
* **Sort** the on-screen list by name or time of day (multi-time meds sort by their earliest time), and **email** it — opens a pre-filled message in Gmail, Outlook, Yahoo, or your default mail app.
* **Edit** a medication's dosing schedule after adding it, and a new **Weekly** dosing option.
* **Prescription discount links** (GoodRx / SingleCare) per medication, plus a public price-check on the homepage.
* A dedicated **Login page** and assorted UX fixes (auto-refreshing list, working delete, etc.).
</content>
