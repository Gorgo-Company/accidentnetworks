/**
 * ACCIDENT NETWORKS — geo.js
 * Detects visitor location and redirects to nearest city subdomain.
 *
 * Strategy (in order):
 *   1. IP geolocation (silent, no prompt) via ipapi.co — free, 1000 req/day
 *   2. GPS (browser prompt) if IP lookup fails or returns no match
 *   3. City picker UI if both fail or user denies GPS
 *
 * Drop this on accidentnetworks.com root index along with the hub page.
 * It fires before the hub content renders — if a match is found the user
 * never sees the hub at all, they land directly on their city page.
 */

(function () {
  'use strict';

  // ── City network — id must match /configs/[id].js ──────────────────────────
  var CITIES = [
    { id: 'birmingham',    city: 'Birmingham',    state: 'AL', lat: 33.5186,  lng: -86.8104  },
    { id: 'anchorage',     city: 'Anchorage',     state: 'AK', lat: 61.2181,  lng: -149.9003 },
    { id: 'phoenix',       city: 'Phoenix',       state: 'AZ', lat: 33.4484,  lng: -112.0740 },
    { id: 'little-rock',   city: 'Little Rock',   state: 'AR', lat: 34.7465,  lng: -92.2896  },
    { id: 'los-angeles',   city: 'Los Angeles',   state: 'CA', lat: 34.0522,  lng: -118.2437 },
    { id: 'denver',        city: 'Denver',        state: 'CO', lat: 39.7392,  lng: -104.9903 },
    { id: 'bridgeport',    city: 'Bridgeport',    state: 'CT', lat: 41.1865,  lng: -73.1952  },
    { id: 'wilmington',    city: 'Wilmington',    state: 'DE', lat: 39.7447,  lng: -75.5484  },
    { id: 'tampa',         city: 'Tampa',         state: 'FL', lat: 27.9506,  lng: -82.4572  },
    { id: 'atlanta',       city: 'Atlanta',       state: 'GA', lat: 33.7490,  lng: -84.3880  },
    { id: 'honolulu',      city: 'Honolulu',      state: 'HI', lat: 21.3069,  lng: -157.8583 },
    { id: 'boise',         city: 'Boise',         state: 'ID', lat: 43.6150,  lng: -116.2023 },
    { id: 'chicago',       city: 'Chicago',       state: 'IL', lat: 41.8781,  lng: -87.6298  },
    { id: 'indianapolis',  city: 'Indianapolis',  state: 'IN', lat: 39.7684,  lng: -86.1581  },
    { id: 'des-moines',    city: 'Des Moines',    state: 'IA', lat: 41.5868,  lng: -93.6250  },
    { id: 'wichita',       city: 'Wichita',       state: 'KS', lat: 37.6872,  lng: -97.3301  },
    { id: 'louisville',    city: 'Louisville',    state: 'KY', lat: 38.2527,  lng: -85.7585  },
    { id: 'new-orleans',   city: 'New Orleans',   state: 'LA', lat: 29.9511,  lng: -90.0715  },
    { id: 'portland-me',   city: 'Portland',      state: 'ME', lat: 43.6591,  lng: -70.2568  },
    { id: 'baltimore',     city: 'Baltimore',     state: 'MD', lat: 39.2904,  lng: -76.6122  },
    { id: 'boston',        city: 'Boston',        state: 'MA', lat: 42.3601,  lng: -71.0589  },
    { id: 'detroit',       city: 'Detroit',       state: 'MI', lat: 42.3314,  lng: -83.0458  },
    { id: 'minneapolis',   city: 'Minneapolis',   state: 'MN', lat: 44.9778,  lng: -93.2650  },
    { id: 'jackson',       city: 'Jackson',       state: 'MS', lat: 32.2988,  lng: -90.1848  },
    { id: 'kansas-city',   city: 'Kansas City',   state: 'MO', lat: 39.0997,  lng: -94.5786  },
    { id: 'billings',      city: 'Billings',      state: 'MT', lat: 45.7833,  lng: -108.5007 },
    { id: 'omaha',         city: 'Omaha',         state: 'NE', lat: 41.2565,  lng: -95.9345  },
    { id: 'las-vegas',     city: 'Las Vegas',     state: 'NV', lat: 36.1699,  lng: -115.1398 },
    { id: 'manchester',    city: 'Manchester',    state: 'NH', lat: 42.9956,  lng: -71.4548  },
    { id: 'newark',        city: 'Newark',        state: 'NJ', lat: 40.7357,  lng: -74.1724  },
    { id: 'albuquerque',   city: 'Albuquerque',   state: 'NM', lat: 35.0844,  lng: -106.6504 },
    { id: 'new-york',      city: 'New York City', state: 'NY', lat: 40.7128,  lng: -74.0060  },
    { id: 'charlotte',     city: 'Charlotte',     state: 'NC', lat: 35.2271,  lng: -80.8431  },
    { id: 'fargo',         city: 'Fargo',         state: 'ND', lat: 46.8772,  lng: -96.7898  },
    { id: 'columbus',      city: 'Columbus',      state: 'OH', lat: 39.9612,  lng: -82.9988  },
    { id: 'oklahoma-city', city: 'Oklahoma City', state: 'OK', lat: 35.4676,  lng: -97.5164  },
    { id: 'portland-or',   city: 'Portland',      state: 'OR', lat: 45.5051,  lng: -122.6750 },
    { id: 'philadelphia',  city: 'Philadelphia',  state: 'PA', lat: 39.9526,  lng: -75.1652  },
    { id: 'providence',    city: 'Providence',    state: 'RI', lat: 41.8240,  lng: -71.4128  },
    { id: 'columbia',      city: 'Columbia',      state: 'SC', lat: 34.0007,  lng: -81.0348  },
    { id: 'sioux-falls',   city: 'Sioux Falls',   state: 'SD', lat: 43.5446,  lng: -96.7311  },
    { id: 'memphis',       city: 'Memphis',       state: 'TN', lat: 35.1495,  lng: -90.0490  },
    { id: 'houston',       city: 'Houston',       state: 'TX', lat: 29.7604,  lng: -95.3698  },
    { id: 'salt-lake-city',city: 'Salt Lake City',state: 'UT', lat: 40.7608,  lng: -111.8910 },
    { id: 'burlington',    city: 'Burlington',    state: 'VT', lat: 44.4759,  lng: -73.2121  },
    { id: 'virginia-beach',city: 'Virginia Beach',state: 'VA', lat: 36.8529,  lng: -75.9780  },
    { id: 'seattle',       city: 'Seattle',       state: 'WA', lat: 47.6062,  lng: -122.3321 },
    { id: 'charleston',    city: 'Charleston',    state: 'WV', lat: 38.3498,  lng: -81.6326  },
    { id: 'milwaukee',     city: 'Milwaukee',     state: 'WI', lat: 43.0389,  lng: -87.9065  },
    { id: 'cheyenne',      city: 'Cheyenne',      state: 'WY', lat: 41.1400,  lng: -104.8197 }
  ];

  // ── Build state → city map for fast IP-based lookup ────────────────────────
  var STATE_MAP = {};
  CITIES.forEach(function (c) { STATE_MAP[c.state] = c; });

  // ── Haversine distance in miles ────────────────────────────────────────────
  function distanceMiles(lat1, lng1, lat2, lng2) {
    var R  = 3958.8; // Earth radius in miles
    var dL = (lat2 - lat1) * Math.PI / 180;
    var dG = (lng2 - lng1) * Math.PI / 180;
    var a  = Math.sin(dL / 2) * Math.sin(dL / 2) +
             Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
             Math.sin(dG / 2) * Math.sin(dG / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  // ── Find nearest city by coordinates ──────────────────────────────────────
  function nearestCity(lat, lng) {
    var best = null, bestDist = Infinity;
    CITIES.forEach(function (c) {
      var d = distanceMiles(lat, lng, c.lat, c.lng);
      if (d < bestDist) { bestDist = d; best = c; }
    });
    return { city: best, miles: Math.round(bestDist) };
  }

  // ── Redirect to city subdomain ─────────────────────────────────────────────
  function redirectTo(cityId) {
    var target = 'https://' + cityId + '.accidentnetworks.com';
    // Dev/staging override — if on localhost or file://, go to ?city= instead
    if (window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.protocol === 'file:') {
      target = window.location.origin + window.location.pathname + '?city=' + cityId;
    }
    window.location.replace(target);
  }

  // ── Session cache — avoid re-detecting on back navigation ─────────────────
  function getCached() {
    try { return sessionStorage.getItem('an_city'); } catch(e) { return null; }
  }
  function setCache(id) {
    try { sessionStorage.setItem('an_city', id); } catch(e) {}
  }

  var cached = getCached();
  if (cached) { redirectTo(cached); return; }

  // ── Show loading state in hub UI while detecting ───────────────────────────
  var statusEl = document.getElementById('geo-status');
  function setStatus(msg) {
    if (statusEl) statusEl.textContent = msg;
  }

  // ── Step 1: IP Geolocation (silent, no permission needed) ─────────────────
  setStatus('Finding your location…');

  var IP_TIMEOUT = 4000; // 4 seconds max wait for IP lookup
  var ipDone = false;

  var ipTimer = setTimeout(function () {
    if (!ipDone) { ipDone = true; tryGPS(); }
  }, IP_TIMEOUT);

  fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout ? AbortSignal.timeout(3500) : undefined })
    .then(function (r) { return r.json(); })
    .then(function (data) {
      if (ipDone) return;
      ipDone = true;
      clearTimeout(ipTimer);

      var stateCode = data.region_code; // e.g. "FL", "TX"
      var ipLat     = parseFloat(data.latitude);
      var ipLng     = parseFloat(data.longitude);

      // Try state match first (exact)
      var stateMatch = STATE_MAP[stateCode];
      if (stateMatch) {
        setCache(stateMatch.id);
        setStatus('Connecting you to ' + stateMatch.city + '…');
        setTimeout(function () { redirectTo(stateMatch.id); }, 600);
        return;
      }

      // If state not matched but we have coordinates, use nearest
      if (!isNaN(ipLat) && !isNaN(ipLng)) {
        var result = nearestCity(ipLat, ipLng);
        setCache(result.city.id);
        setStatus('Connecting you to ' + result.city.city + '…');
        setTimeout(function () { redirectTo(result.city.id); }, 600);
        return;
      }

      // IP gave us nothing useful — try GPS
      tryGPS();
    })
    .catch(function () {
      if (!ipDone) { ipDone = true; clearTimeout(ipTimer); tryGPS(); }
    });

  // ── Step 2: GPS (browser permission prompt) ───────────────────────────────
  function tryGPS() {
    if (!navigator.geolocation) { showPicker(); return; }

    setStatus('Allow location access for your local helpline…');

    navigator.geolocation.getCurrentPosition(
      function (pos) {
        var result = nearestCity(pos.coords.latitude, pos.coords.longitude);
        setCache(result.city.id);
        setStatus('Connecting you to ' + result.city.city + '…');
        setTimeout(function () { redirectTo(result.city.id); }, 600);
      },
      function () {
        // Denied or failed
        showPicker();
      },
      { timeout: 8000, maximumAge: 300000 }
    );
  }

  // ── Step 3: City picker (fallback UI) ────────────────────────────────────
  function showPicker() {
    setStatus('');
    var picker = document.getElementById('geo-picker');
    if (picker) {
      picker.style.display = 'block';
      picker.addEventListener('change', function () {
        if (picker.value) {
          setCache(picker.value);
          redirectTo(picker.value);
        }
      });
    }
    // Also show the full state grid if it exists
    var grid = document.getElementById('state-grid');
    if (grid) grid.style.display = 'grid';
  }

})();
