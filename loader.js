/**
 * ACCIDENT NETWORKS — loader.js
 * Fires when 'an:ready' event is dispatched by the inline config loader.
 * window.AN_CITY is guaranteed to be set before this runs.
 *
 * Google Sheets endpoint — replace with your deployed Apps Script URL:
 */
var FORM_ENDPOINT = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID_HERE/exec';

function AN_INIT() {
  'use strict';

  var c = window.AN_CITY;
  if (!c) { console.error('[AN] window.AN_CITY not set'); return; }

  var phone     = c.phone;
  var phoneHref = 'tel:' + phone.replace(/\D/g, '');
  var cityState = c.city + ', ' + c.stateCode;
  var canonical = 'https://' + c.id + '.accidentnetworks.com';

  // ── 1. Text node swaps ─────────────────────────────────────────────────────
  var textMap = {
    'city':          c.city,
    'state':         c.state,
    'stateCode':     c.stateCode,
    'county':        c.county,
    'phone':         phone,
    'statute':       c.statute + ' statute of limitations',
    'faultState':    c.faultState,
    'city-state':    cityState,
    'highway1':      c.highways[0] || 'a local highway',
    'highway2':      c.highways[1] || 'major roads',
    'neighborhood1': c.neighborhoods[0] || c.city,
    'neighborhood2': c.neighborhoods[1] || c.city,
    'local-fact-1':  c.localFacts[0] || ''
  };

  document.querySelectorAll('[data-city]').forEach(function (el) {
    var key = el.getAttribute('data-city');
    if (textMap[key] !== undefined) el.textContent = textMap[key];
  });

  // Hidden form inputs
  document.querySelectorAll('[data-city-input]').forEach(function (el) {
    var key = el.getAttribute('data-city-input');
    if (key === 'city')   el.value = c.city;
    if (key === 'state')  el.value = c.state;
    if (key === 'county') el.value = c.county;
    if (key === 'source') el.value = c.id + '.accidentnetworks.com';
  });

  var cityField = document.getElementById('f-city');
  if (cityField) cityField.value = c.city;

  var phoneField = document.getElementById('f-phone');
  if (phoneField) phoneField.placeholder = phone;

  // ── 2. Phone links ─────────────────────────────────────────────────────────
  [
    'header-phone-link', 'hero-phone-link', 'law-phone-link',
    'faq-phone-link', 'success-phone-link', 'cta-phone-link',
    'footer-cta-phone-link', 'footer-phone-link', 'mobile-cta-phone-link'
  ].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.href = phoneHref;
  });

  // ── 3. Local SEO lists ─────────────────────────────────────────────────────
  function buildList(id, items) {
    var ul = document.getElementById(id);
    if (!ul || !items) return;
    ul.innerHTML = items.map(function (item) {
      return '<li class="local-list-item">' + escHtml(item) + '</li>';
    }).join('');
  }

  buildList('local-highways',    c.highways);
  buildList('local-hotspots',    c.hotspots);
  buildList('local-med-centers', c.medCenters);

  var lawFacts = (c.localFacts || []).slice();
  if (c.pip) lawFacts.push(c.state + ' is a no-fault (PIP) state — your own insurer covers initial medical costs.');
  else        lawFacts.push(c.state + ' is an at-fault state — the responsible driver\'s insurer covers your damages.');
  buildList('local-law-facts', lawFacts);

  var nbGrid = document.getElementById('local-neighborhoods');
  if (nbGrid) {
    var chips = [c.city].concat(c.neighborhoods || [], [c.county]);
    nbGrid.innerHTML = chips.map(function (n) {
      return '<div class="area-chip">' + escHtml(n) + '</div>';
    }).join('');
  }

  // ── 4. JSON-LD schema injection ────────────────────────────────────────────
  var desc = c.city + '\'s free 24/7 car accident helpline. Connect accident victims in ' +
             c.county + ' with top-rated attorneys & chiropractors. Call ' + phone + '.';

  var schemas = [
    {
      '@context': 'https://schema.org',
      '@type': 'LegalService',
      'name': 'Accident Networks ' + c.city,
      'telephone': phone,
      'url': canonical,
      'areaServed': { '@type': 'City', 'name': c.city, 'addressRegion': c.stateCode, 'addressCountry': 'US' },
      'description': desc,
      'priceRange': 'Free',
      'serviceType': 'Car Accident Referral Service',
      'openingHours': 'Mo-Su 00:00-23:59',
      'availableLanguage': ['English', 'Spanish'],
      'geo': { '@type': 'GeoCoordinates', 'latitude': c.lat, 'longitude': c.lng }
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': [
        {
          '@type': 'Question',
          'name': 'Is the helpline really free in ' + c.city + '?',
          'acceptedAnswer': { '@type': 'Answer', 'text': 'Yes, 100% free. We connect you with verified attorneys and chiropractors in ' + c.county + ' at zero cost.' }
        },
        {
          '@type': 'Question',
          'name': 'What is the statute of limitations for car accidents in ' + c.state + '?',
          'acceptedAnswer': { '@type': 'Answer', 'text': c.state + ' has a statute of limitations of ' + c.statute + ' for personal injury claims. Call us immediately after a ' + c.city + ' accident.' }
        },
        {
          '@type': 'Question',
          'name': 'What major highways in ' + c.city + ' do you handle accidents on?',
          'acceptedAnswer': { '@type': 'Answer', 'text': 'We handle accidents on all major roads in ' + c.city + ', including ' + (c.highways || []).join(', ') + '.' }
        }
      ]
    },
    {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      'name': 'Accident Networks ' + c.city,
      'telephone': phone,
      'url': canonical,
      'address': { '@type': 'PostalAddress', 'addressLocality': c.city, 'addressRegion': c.stateCode, 'addressCountry': 'US' },
      'geo': { '@type': 'GeoCoordinates', 'latitude': c.lat, 'longitude': c.lng },
      'openingHoursSpecification': { '@type': 'OpeningHoursSpecification', 'dayOfWeek': ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'], 'opens': '00:00', 'closes': '23:59' },
      'aggregateRating': { '@type': 'AggregateRating', 'ratingValue': '4.9', 'reviewCount': '500', 'bestRating': '5' }
    }
  ];

  schemas.forEach(function (schema) {
    var s = document.createElement('script');
    s.type = 'application/ld+json';
    s.textContent = JSON.stringify(schema);
    document.head.appendChild(s);
  });

  // ── 5. Meta tags ───────────────────────────────────────────────────────────
  var titleText = c.city + ' Car Accident Helpline | Free Attorney & Doctor Referrals | Accident Networks';
  document.title = titleText;

  function setMeta(sel, attr, val) {
    var el = document.querySelector(sel);
    if (el) el.setAttribute(attr, val);
  }
  setMeta('meta[name="description"]',        'content', desc);
  setMeta('link[rel="canonical"]',            'href',    canonical + '/');
  setMeta('meta[name="geo.region"]',          'content', 'US-' + c.stateCode);
  setMeta('meta[name="geo.placename"]',       'content', c.city + ', ' + c.state);
  setMeta('meta[name="geo.position"]',        'content', c.lat + ';' + c.lng);
  setMeta('meta[name="ICBM"]',                'content', c.lat + ', ' + c.lng);
  setMeta('meta[property="og:title"]',        'content', titleText);
  setMeta('meta[property="og:description"]',  'content', desc);
  setMeta('meta[property="og:url"]',          'content', canonical + '/');
  setMeta('meta[property="og:site_name"]',    'content', 'Accident Networks ' + c.city);
  setMeta('meta[name="twitter:title"]',       'content', titleText);
  setMeta('meta[name="twitter:description"]', 'content', desc);

  var yr = document.getElementById('footer-year');
  if (yr) yr.textContent = new Date().getFullYear();
  var fc = document.getElementById('footer-copy');
  if (fc) fc.innerHTML = '&copy; ' + new Date().getFullYear() +
    ' Accident Networks ' + c.city + '. A referral service, not a law firm.';

  // ── 6. Form → Google Sheets ────────────────────────────────────────────────
  var form      = document.getElementById('lead-form');
  var success   = document.getElementById('form-success');
  var submitBtn = document.getElementById('form-submit');

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var nameVal  = form.querySelector('[name="name"]').value.trim();
      var phoneVal = form.querySelector('[name="phone"]').value.trim();
      if (!nameVal || !phoneVal) { alert('Please enter your name and phone number.'); return; }

      submitBtn.disabled    = true;
      submitBtn.textContent = 'Sending…';

      var params = new URLSearchParams();
      new FormData(form).forEach(function (v, k) { params.append(k, v); });
      params.append('timestamp', new Date().toISOString());
      params.append('pageUrl',   window.location.href);

      fetch(FORM_ENDPOINT, {
        method: 'POST', mode: 'no-cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body:    params.toString()
      }).then(function () {
        form.style.display = 'none';
        if (success) success.classList.add('visible');
      }).catch(function () {
        form.style.display = 'none';
        if (success) success.classList.add('visible');
      });
    });
  }

  // ── 7. UI ──────────────────────────────────────────────────────────────────
  var header = document.getElementById('site-header');
  if (header) {
    window.addEventListener('scroll', function () {
      header.classList.toggle('scrolled', window.scrollY > 10);
    }, { passive: true });
  }

  var toggle = document.getElementById('nav-toggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var open = document.body.classList.toggle('mobile-nav-open');
      toggle.setAttribute('aria-expanded', String(open));
    });
  }

  document.querySelectorAll('[data-faq]').forEach(function (item) {
    var btn = item.querySelector('.faq-question');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var isOpen = item.classList.contains('open');
      document.querySelectorAll('[data-faq].open').forEach(function (o) { o.classList.remove('open'); });
      if (!isOpen) item.classList.add('open');
    });
  });

  if ('IntersectionObserver' in window) {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -32px 0px' });
    document.querySelectorAll('.reveal').forEach(function (el) { obs.observe(el); });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('visible'); });
  }

  // ── Utility ────────────────────────────────────────────────────────────────
  function escHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
}

// Listen for config-ready event (fired by inline loader after config is eval'd)
document.addEventListener('an:ready', AN_INIT);

// Safety net: if deferred script runs after event already fired
if (window.AN_CITY) AN_INIT();
