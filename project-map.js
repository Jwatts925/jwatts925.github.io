(() => {
  'use strict';
  const data = window.portfolioProjectMap;
  const figure = document.querySelector('.project-location-map');
  if (!data || !figure) return;
  // Fit the opening model overview beneath the actual sticky navigation height.
  const header = document.querySelector('.site-header');
  if (header) new ResizeObserver(() => {
    document.documentElement.style.setProperty('--models-header-height', `${header.getBoundingClientRect().height}px`);
  }).observe(header);
  const select = document.getElementById('map-project-select');
  const detail = document.getElementById('map-project-detail');
  const ns = 'http://www.w3.org/2000/svg';
  const companies = { ww: 'Walters & Wolf', cs: 'C/S Erectors' };
  let selected = null;
  const node = (tag, attrs = {}, text) => {
    const el = document.createElementNS(ns, tag);
    for (const [key, value] of Object.entries(attrs)) el.setAttribute(key, value);
    if (text !== undefined) el.textContent = text;
    return el;
  };
  const mercatorY = lat => Math.log(Math.tan(Math.PI / 4 + lat * Math.PI / 360));
  function projection(bounds, width, height) {
    const [west, south, east, north] = bounds;
    const dx = (east - west) * Math.PI / 180, top = mercatorY(north), dy = top - mercatorY(south);
    const scale = Math.min((width - 30) / dx, (height - 30) / dy);
    const ox = (width - scale * dx) / 2, oy = (height - scale * dy) / 2;
    return (lng, lat) => [ox + (lng - west) * Math.PI / 180 * scale, oy + (top - mercatorY(lat)) * scale];
  }
  const path = (rings, project, closed) => rings.map(ring => ring.map((p, i) => {
    const [x, y] = project(p[0], p[1]); return `${i ? 'L' : 'M'}${x.toFixed(2)},${y.toFixed(2)}`;
  }).join('') + (closed ? 'Z' : '')).join('');
  const cityLabels = {
    bay: [ ['Santa Rosa', -122.73, 38.51, 'middle'], ['San Francisco', -122.57, 37.79, 'end'], ['Berkeley', -122.19, 37.91, 'start'], ['Oakland', -122.15, 37.78, 'start'], ['Brentwood', -121.55, 37.96, 'middle'], ['Pleasanton', -121.76, 37.72, 'start'], ['San Jose', -121.75, 37.30, 'start'], ['Santa Cruz', -122.05, 36.92, 'middle'] ],
    west: [ ['Reno', -119.25, 39.6, 'start'], ['Roseville', -122.05, 39.0, 'end'], ['Las Vegas', -114.15, 36.15, 'end'], ['Los Angeles', -119.0, 34.1, 'end'], ['San Diego', -116.8, 32.45, 'end'] ]
  };
  function spreadMarkers(points, width, height) {
    const gap = width < 210 ? 19 : 21;
    points.forEach((p, i) => { p.x = p.ax + Math.cos(i * 2.4) * .7; p.y = p.ay + Math.sin(i * 2.4) * .7; });
    for (let pass = 0; pass < 240; pass++) {
      for (const p of points) { p.x += (p.ax - p.x) * .015; p.y += (p.ay - p.y) * .015; }
      for (let i = 0; i < points.length; i++) for (let j = i + 1; j < points.length; j++) {
        const a = points[i], b = points[j]; let dx = a.x - b.x, dy = a.y - b.y;
        const distance = Math.hypot(dx, dy) || .01;
        if (distance < gap) { const f = (gap - distance) / distance * .51; a.x += dx * f; a.y += dy * f; b.x -= dx * f; b.y -= dy * f; }
      }
      points.forEach(p => { p.x = Math.max(12, Math.min(width - 12, p.x)); p.y = Math.max(12, Math.min(height - 12, p.y)); });
    }
    return points;
  }
  function showProject(slug) {
    const p = data.projects.find(project => project.slug === slug);
    if (!p) return;
    selected = slug; select.value = slug;
    figure.querySelectorAll('.map-marker').forEach(marker => marker.classList.toggle('is-selected', marker.dataset.slug === slug));
    detail.replaceChildren();
    const add = (cls, text) => { const el = document.createElement('p'); el.className = cls; el.textContent = text; detail.append(el); };
    add('map-detail-company', companies[p.company]); add('map-detail-name', p.name); add('map-detail-location', p.location);
    add('map-detail-precision', p.precision === 'city' ? 'City location · exact site unconfirmed' : p.precision === 'campus' ? 'Campus location · approximate' : 'Project site · approximate');
    const links = document.createElement('div'); links.className = 'map-detail-links';
    const view = document.createElement('a'); view.href = `#map-project-${slug}`; view.textContent = 'View project ↗';
    view.addEventListener('click', event => {
      const project = [...document.querySelectorAll('.project-index-item')].find(item => item.querySelector('.project-index-title')?.textContent === p.name);
      if (!project) return;
      event.preventDefault(); project.id = `map-project-${slug}`; project.classList.add('is-map-target');
      const company = project.closest('.project-company-group');
      if (!company.classList.contains('is-open')) company.querySelector('.project-company-trigger').click();
      if (!project.classList.contains('is-open')) project.querySelector('.project-index-trigger').click();
      project.querySelector('.project-index-trigger').focus({ preventScroll: true });
    });
    const reference = document.createElement('a'); reference.href = p.source; reference.textContent = 'Location reference'; reference.target = '_blank'; reference.rel = 'noopener noreferrer';
    links.append(view, reference); detail.append(links);
  }
  for (const [company, name] of Object.entries(companies)) {
    const group = document.createElement('optgroup'); group.label = name;
    data.projects.filter(p => p.company === company).forEach(p => { const option = document.createElement('option'); option.value = p.slug; option.textContent = p.name; group.append(option); });
    select.append(group);
  }
  select.addEventListener('change', () => { if (select.value) showProject(select.value); });
  function draw(container) {
    const region = container.dataset.projectMap, map = data.maps[region];
    const width = container.clientWidth, height = container.clientHeight;
    if (!width || !height) return;
    const project = projection(map.bounds, width, height);
    const svg = node('svg', { viewBox: `0 0 ${width} ${height}`, 'aria-label': region === 'bay' ? 'Bay Area project locations' : 'Project locations beyond the Bay Area', role: 'group' });
    svg.append(node('path', { d: path(map.land, project, true), class: 'map-land', 'fill-rule': 'evenodd' }));
    svg.append(node('path', { d: path(map.coast, project, false), class: 'map-coast' }));
    if (map.states.length) svg.append(node('path', { d: path(map.states, project, false), class: 'map-state-line' }));
    if (region === 'west') {
      const a = project(-123.04, 38.57), b = project(-121.24, 36.90);
      svg.append(node('rect', { x: a[0], y: a[1], width: b[0] - a[0], height: b[1] - a[1], class: 'map-locator' }));
      svg.append(node('text', { x: a[0] - 4, y: (a[1] + b[1]) / 2, 'text-anchor': 'end', class: 'map-locator-label' }, 'Bay Area'));
    } else {
      const p = project(-122.92, 37.52);
      svg.append(node('text', { x: p[0], y: p[1], transform: `rotate(-70 ${p[0]} ${p[1]})`, class: 'map-water-label', 'text-anchor': 'middle' }, 'PACIFIC OCEAN'));
    }
    const markers = spreadMarkers(data.projects.filter(p => p.region === region).map(p => { const [ax, ay] = project(p.lng, p.lat); return { ...p, ax, ay }; }), width, height);
    for (const p of markers) {
      if (Math.hypot(p.x - p.ax, p.y - p.ay) > 3) {
        svg.append(node('path', { d: `M${p.ax},${p.ay}L${p.x},${p.y}`, class: 'map-leader' }));
        svg.append(node('circle', { cx: p.ax, cy: p.ay, r: 1.4, class: 'map-true-location' }));
      }
    }
    for (const p of markers) {
      const marker = node('a', { href: '#project-map-title', class: `map-marker${p.precision === 'city' ? ' is-city' : ''}${selected === p.slug ? ' is-selected' : ''}`, 'data-slug': p.slug, 'data-company': p.company, 'aria-label': `${p.name}, ${companies[p.company]}, ${p.location}${p.precision === 'city' ? ', city-level location' : ''}`, transform: `translate(${p.x.toFixed(2)} ${p.y.toFixed(2)})` });
      marker.append(node('title', {}, `${p.name}\n${companies[p.company]}\n${p.location}`));
      marker.append(node('circle', { r: 10, class: 'map-hit-area' }));
      marker.append(node('circle', { r: 10.5, class: 'map-focus-ring' }));
      marker.append(p.company === 'ww' ? node('circle', { r: 6.5, class: 'map-point' }) : node('path', { d: 'M0,-7.5L7.5,0L0,7.5L-7.5,0Z', class: 'map-point' }));
      marker.addEventListener('click', e => { e.preventDefault(); showProject(p.slug); });
      marker.addEventListener('focus', () => showProject(p.slug));
      svg.append(marker);
    }
    for (const [name, lng, lat, anchor] of cityLabels[region]) {
      const p = project(lng, lat);
      // Labels remain inside even the narrow regional overview on phones.
      const x = Math.max(4, Math.min(width - 4, p[0]));
      svg.append(node('text', { x, y: p[1], 'text-anchor': anchor, class: 'map-place-label' }, name));
    }
    container.replaceChildren(svg);
    const placed = [];
    // Move city labels away from the markers, including in narrow phone layouts.
    for (const label of svg.querySelectorAll('.map-place-label, .map-locator-label')) {
      const box = label.getBBox(), x = Number(label.getAttribute('x')), y = Number(label.getAttribute('y'));
      const candidates = [[0, 0]];
      for (const distance of [12, 24, 36, 48, 60]) for (const [dx, dy] of [[0,-1],[0,1],[-1,0],[1,0],[-1,-1],[1,-1],[-1,1],[1,1]]) candidates.push([dx * distance, dy * distance]);
      let best;
      for (const [dx, dy] of candidates) {
        const r = { left: box.x + dx, right: box.x + box.width + dx, top: box.y + dy, bottom: box.y + box.height + dy };
        let score = Math.hypot(dx, dy);
        score += 100 * (Math.max(0, 3 - r.left) + Math.max(0, r.right - width + 3) + Math.max(0, 3 - r.top) + Math.max(0, r.bottom - height + 3));
        for (const p of markers) if (p.x + 10 > r.left && p.x - 10 < r.right && p.y + 10 > r.top && p.y - 10 < r.bottom) score += 1000;
        for (const other of placed) if (r.left < other.right + 3 && r.right > other.left - 3 && r.top < other.bottom + 3 && r.bottom > other.top - 3) score += 500;
        if (!best || score < best.score) best = { dx, dy, r, score };
      }
      label.setAttribute('x', x + best.dx); label.setAttribute('y', y + best.dy); placed.push(best.r);
    }
  }
  const drawings = [...figure.querySelectorAll('[data-project-map]')];
  let frame;
  const render = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(() => drawings.forEach(draw)); };
  new ResizeObserver(render).observe(figure);
  if (document.fonts) document.fonts.ready.then(render);
  render();
})();
