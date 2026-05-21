# Accident Networks — v2 Architecture

## The Difference from v1

| | v1 (old) | v2 (this) |
|---|---|---|
| Pages | 50 HTML files | **1 HTML file** |
| CSS | 1 shared file | **1 shared file** |
| JS | Baked into each page | **1 loader.js** |
| City data | Hardcoded in each file | **50 × ~1.3KB config files** |
| Update content | Rebuild 50 files | **Edit 1 HTML/CSS, re-deploy** |
| Add a city | Add row + rebuild | **Add row + run compile.js** |
| Load speed | ~58KB per page | **~44KB HTML + ~1.3KB config** |

## File Structure

```
accident-networks/
├── index.html              ← ONE page, all 50 cities
├── styles.css              ← Shared styles (all cities)
├── loader.js               ← Wires city config to DOM + form
├── compile.js              ← Generates /configs/ from master-data.js
├── master-data.js          ← Source of truth — 50 cities, full SEO data
├── google-apps-script.js   ← Deploy this to Google Apps Script
├── vercel.json             ← Hosting config
└── configs/
    ├── _map.js             ← Hostname → cityId map (not used in v2)
    ├── houston.js          ← ~1.3KB city config
    ├── chicago.js
    └── ... (all 50)
```

## What Each City Config Contains

- City, state, county, phone, coordinates
- Statute of limitations
- PIP/no-fault vs at-fault status
- Fault system (contributory, pure comparative, modified)
- 6-8 major highways and roads
- 5 high-crash hotspot descriptions
- 4-6 local medical centers
- 7-9 surrounding neighborhoods/suburbs
- 2 airports
- 3 local crash facts with specifics

All of this populates:
- Page title, meta description, canonical URL
- Geo meta tags (lat/lng, region, placename)
- 3 JSON-LD schemas (LegalService, FAQPage, LocalBusiness)
- All `data-city="*"` text nodes throughout the page
- The local SEO block (highways list, hotspots, med centers, law facts)
- Neighborhoods chips grid
- FAQ answers (statute, fault system)
- Testimonial location lines
- Footer copyright

## Step 1 — Set Up Google Sheets

1. Create new Sheet at sheets.google.com
2. **Extensions → Apps Script** → delete default code
3. Paste `google-apps-script.js` → Save
4. **Deploy → New Deployment → Web App**
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Copy the Web App URL
6. Open `loader.js` → find `FORM_ENDPOINT` at top → paste URL

## Step 2 — Compile City Configs

```bash
node compile.js
# Outputs 50 files to ./configs/
```

To rebuild one city after editing master-data.js:
```bash
node compile.js houston
```

## Step 3 — Update Phone Numbers

1. Open `master-data.js`
2. Find each city, update the `phone` field
3. Run `node compile.js`

Recommend: use call tracking numbers (CallRail, Twilio) so he can see which city drives which calls.

## Step 4 — Deploy to Vercel

### Option A: Vercel CLI
```bash
npm i -g vercel
vercel login
vercel --prod
```

### Option B: GitHub + Vercel
1. Push repo to GitHub
2. vercel.com → New Project → Import from GitHub
3. No build command needed — static files only
4. Deploy

### Subdomain DNS Setup (once per city)
In the DNS for `accidentnetworks.com`, add:

```
birmingham    CNAME    cname.vercel-dns.com.
anchorage     CNAME    cname.vercel-dns.com.
phoenix       CNAME    cname.vercel-dns.com.
little-rock   CNAME    cname.vercel-dns.com.
los-angeles   CNAME    cname.vercel-dns.com.
denver        CNAME    cname.vercel-dns.com.
bridgeport    CNAME    cname.vercel-dns.com.
wilmington    CNAME    cname.vercel-dns.com.
jacksonville  CNAME    cname.vercel-dns.com.
atlanta       CNAME    cname.vercel-dns.com.
honolulu      CNAME    cname.vercel-dns.com.
boise         CNAME    cname.vercel-dns.com.
chicago       CNAME    cname.vercel-dns.com.
indianapolis  CNAME    cname.vercel-dns.com.
des-moines    CNAME    cname.vercel-dns.com.
wichita       CNAME    cname.vercel-dns.com.
louisville    CNAME    cname.vercel-dns.com.
new-orleans   CNAME    cname.vercel-dns.com.
portland-me   CNAME    cname.vercel-dns.com.
baltimore     CNAME    cname.vercel-dns.com.
boston        CNAME    cname.vercel-dns.com.
detroit       CNAME    cname.vercel-dns.com.
minneapolis   CNAME    cname.vercel-dns.com.
jackson       CNAME    cname.vercel-dns.com.
kansas-city   CNAME    cname.vercel-dns.com.
billings      CNAME    cname.vercel-dns.com.
omaha         CNAME    cname.vercel-dns.com.
las-vegas     CNAME    cname.vercel-dns.com.
manchester    CNAME    cname.vercel-dns.com.
newark        CNAME    cname.vercel-dns.com.
albuquerque   CNAME    cname.vercel-dns.com.
new-york      CNAME    cname.vercel-dns.com.
charlotte     CNAME    cname.vercel-dns.com.
fargo         CNAME    cname.vercel-dns.com.
columbus      CNAME    cname.vercel-dns.com.
oklahoma-city CNAME    cname.vercel-dns.com.
portland-or   CNAME    cname.vercel-dns.com.
philadelphia  CNAME    cname.vercel-dns.com.
providence    CNAME    cname.vercel-dns.com.
columbia      CNAME    cname.vercel-dns.com.
sioux-falls   CNAME    cname.vercel-dns.com.
memphis       CNAME    cname.vercel-dns.com.
houston       CNAME    cname.vercel-dns.com.
salt-lake-city CNAME   cname.vercel-dns.com.
burlington    CNAME    cname.vercel-dns.com.
virginia-beach CNAME   cname.vercel-dns.com.
seattle       CNAME    cname.vercel-dns.com.
charleston    CNAME    cname.vercel-dns.com.
milwaukee     CNAME    cname.vercel-dns.com.
cheyenne      CNAME    cname.vercel-dns.com.
```

In Vercel: Project Settings → Domains → add each subdomain.

## Testing Locally

Since subdomains don't work on localhost, use the `?city=` param:

```
http://localhost:3000/?city=houston
http://localhost:3000/?city=chicago
http://localhost:3000/?city=new-york
```

Serve with any static server:
```bash
npx serve . -p 3000
```

## What Makes This Rank

Every city page has:

**In `<head>` (injected by loader.js):**
- Unique title: `[City] Car Accident Helpline | Free Attorney & Doctor Referrals | Accident Networks`
- Unique meta description with city + county + phone
- Canonical URL per subdomain
- `geo.region`, `geo.placename`, `geo.position`, `ICBM` meta tags
- LegalService JSON-LD with city name, coordinates, area served
- FAQPage JSON-LD with city-specific questions including statute of limitations and highway names
- LocalBusiness JSON-LD with aggregate rating

**In the page body:**
- H1 contains city name
- 20+ city/county name mentions throughout copy
- Highway names in accident types section + about section
- High-crash hotspot descriptions (AEO gold — these match how people actually ask voice/AI queries)
- Local medical center names
- State-specific law facts (statute, fault type, PIP status)
- Neighborhoods grid (long-tail coverage)
- Testimonials with city and neighborhood location lines

**The AEO advantage:**
The local SEO block directly answers the questions that show up in AI overviews and voice search:
- "What highways in [city] have the most accidents?"
- "What is the statute of limitations for car accidents in [state]?"
- "What hospitals near me treat car accident injuries?"
- "Is [state] a no-fault state?"

These are high-intent, zero-competition AEO targets that most personal injury sites completely ignore.

## Updating Content

- **Change body copy, layout, structure** → edit `index.html` → redeploy
- **Change styles** → edit `styles.css` → redeploy
- **Change city data** → edit `master-data.js` → `node compile.js` → redeploy `/configs/`
- **Change form handling** → edit `loader.js` → redeploy
- **Change phone numbers** → edit `master-data.js` → `node compile.js` → redeploy

Only the changed file needs to be redeployed.
