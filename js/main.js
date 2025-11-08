document.addEventListener('DOMContentLoaded', ()=> {
  // year
  const y = new Date().getFullYear();
  const elYear = document.getElementById('year');
  if(elYear) elYear.textContent = y;

  // mobile nav toggle
  const navInner = document.querySelector('.nav-inner');
  const btn = document.querySelector('.nav-toggle');
  btn && btn.addEventListener('click', ()=>{
    if(!navInner) return;
    navInner.style.display = navInner.style.display === 'flex' ? '' : 'flex';
  });

  // smooth scroll for anchors
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click', (e)=>{
      const href = a.getAttribute('href');
      if(href && href.length>1){
        e.preventDefault();
        const target = document.querySelector(href);
        if(target) target.scrollIntoView({behavior:'smooth', block:'start'});
      }
    });
  });

  // project buttons -> open detail page
  document.querySelectorAll('.project-btn').forEach(btn=>{
    btn.addEventListener('click', ()=> {
      const href = btn.getAttribute('data-href');
      if(href) window.location.href = href;
    });
  });

  // certificates -> open an image viewer page (or a lightbox)
  document.querySelectorAll('.cert-btn').forEach(b=>{
    b.addEventListener('click', ()=>{
      const src = b.getAttribute('data-src');
      if(!src) return;
      // open a simple viewer page with querystring
      window.open(`certificates/viewer.html?img=${encodeURIComponent(src)}`, '_blank');
    });
  });

  // contact form demo (replace with a real backend later)
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');
  if(form){
    form.addEventListener('submit', (e)=>{
      e.preventDefault();
      if(status) status.textContent = 'Sending message... (demo)';
      // basic validation
      const fm = new FormData(form);
      if(!fm.get('name') || !fm.get('email') || !fm.get('message')){
        if(status) status.textContent = 'Please fill name, email and message.';
        return;
      }
      setTimeout(()=> {
        if(status) status.textContent = 'Message sent (demo). Replace with Formspree/EmailJS for real delivery.';
        form.reset();
      }, 900);
    });
  }

  // SKILLS: build progress rows and animate on intersection
  const skillsChips = document.getElementById('skillsChips');
  const skillsProgress = document.getElementById('skillsProgress');
  if(skillsChips && skillsProgress){
    const chips = Array.from(skillsChips.querySelectorAll('.skill-chip'));
    chips.forEach(chip=>{
      const label = chip.textContent.trim();
      const prog = chip.getAttribute('data-prog') || '60';
      const row = document.createElement('div');
      row.className = 'skill-row';
      row.innerHTML = `<div class="label">${label}</div><div class="bar"><span style="width:0%"></span></div>`;
      skillsProgress.appendChild(row);

      // click chip to highlight and set width (optional quick action)
      chip.addEventListener('click', ()=> {
        const spans = skillsProgress.querySelectorAll('.bar > span');
        const i = chips.indexOf(chip);
        spans.forEach((s, idx)=> s.style.width = idx === i ? prog + '%' : s.style.width);
        // scroll into view
        skillsProgress.scrollIntoView({behavior:'smooth', block:'start'});
      });
    });

    const obs = new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          skillsProgress.querySelectorAll('.bar > span').forEach((span, i)=>{
            const prog = chips[i].getAttribute('data-prog') || 60;
            setTimeout(()=> span.style.width = prog + '%', i*110);
          });
          obs.disconnect();
        }
      });
    }, {threshold:0.25});
    obs.observe(skillsChips);
  }
});

// ---------- Skills interactions (chips, filter, search, animations) ----------
(function skillsModule(){
  const chips = Array.from(document.querySelectorAll('.skill-chip'));
  const cards = Array.from(document.querySelectorAll('.skill-card'));
  const filters = Array.from(document.querySelectorAll('.filter-btn'));
  const search = document.getElementById('skillSearch');

  // helper: show/hide cards by predicate
  function filterCardsBy(fn){
    cards.forEach(c => {
      const show = fn(c);
      c.style.display = show ? '' : 'none';
      if(show) c.classList.add('appear'); else c.classList.remove('appear');
    });
  }

  // chip click: highlight chip and focus that card
  chips.forEach(chip=>{
    chip.addEventListener('click', ()=>{
      chips.forEach(ch => ch.classList.remove('active'));
      chip.classList.add('active');
      const name = chip.getAttribute('data-skill');
      filterCardsBy(c => c.dataset.name.toLowerCase() === name.toLowerCase());
      // scroll to grid
      const grid = document.getElementById('skillsGrid');
      if(grid) grid.scrollIntoView({behavior:'smooth', block:'start'});
    });
  });

  // filter buttons (category)
  filters.forEach(f => {
    f.addEventListener('click', ()=>{
      filters.forEach(x => x.classList.remove('active'));
      f.classList.add('active');
      const category = f.getAttribute('data-filter');
      if(category === 'all'){
        filterCardsBy(()=>true);
      } else {
        filterCardsBy(c => (c.dataset.cat || '').toLowerCase().split(',').includes(category));
      }
    });
  });

  // search input (live)
  if(search){
    search.addEventListener('input', ()=>{
      const q = search.value.trim().toLowerCase();
      if(!q) {
        // if empty - respect active filter
        const active = filters.find(x=>x.classList.contains('active'));
        if(active && active.dataset.filter !== 'all'){
          const category = active.dataset.filter;
          filterCardsBy(c => (c.dataset.cat || '').toLowerCase().split(',').includes(category));
        } else filterCardsBy(()=>true);
        return;
      }
      filterCardsBy(c => c.dataset.name.toLowerCase().includes(q) || (c.dataset.cat||'').toLowerCase().includes(q));
    });
  }

  // initial appear animation (stagger)
  setTimeout(()=>{
    cards.forEach((c, i)=> setTimeout(()=> c.classList.add('appear'), i*80));
  }, 180);
})();
