(function () {
  const c = window.INVITATION;
  const $ = (id) => document.getElementById(id);
  const txt = (id, v) => { $(id).textContent = v; };
  const el = (tag, cls, t) => { const e = document.createElement(tag); if (cls) e.className = cls; if (t != null) e.textContent = t; return e; };
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Mode léger : ?lite=1 pour le forcer, ?lite=0 pour l'interdire. Sinon : détecté automatiquement.
  const qs = new URLSearchParams(location.search);
  let lite = qs.get("lite") === "1";
  const forceFull = qs.get("lite") === "0";
  if (!lite && !forceFull) {
    const mem = navigator.deviceMemory, cores = navigator.hardwareConcurrency;
    if ((mem && mem <= 2) || (cores && cores <= 2)) lite = true;   // téléphone d'entrée de gamme
  }
  const finePointer = window.matchMedia("(hover:hover) and (pointer:fine)").matches;

  /* ================= CONTENU (lu dans config.js) ================= */
  const noms = c.prenom1 + " & " + c.prenom2;
  document.title = "Invitation — " + noms;
  txt("names", noms);
  txt("cardNames", noms);
  txt("cardDate", c.dateTexte);
  txt("seal", c.prenom1.charAt(0).toUpperCase() + "&" + c.prenom2.charAt(0).toUpperCase());
  txt("heroDate", c.dateTexte + " · " + c.ville);
  txt("heroPhrase", c.phraseAccueil);
  txt("hashtag", c.hashtag || "");

  // Photo du couple (si le fichier est absent, le dégradé terracotta reste)
  if (c.photo) {
    const img = new Image();
    img.onload = () => { $("heroPhoto").style.backgroundImage = "url('" + c.photo + "')"; };
    img.src = c.photo;
  }

  // Invité nommé : ?invite=Mme-Kouassi  (tiret ou _ = espace, deux tirets -- = vrai tiret)
  let invite = "";
  try {
    const brut = new URLSearchParams(location.search).get("invite") || "";
    invite = brut.slice(0, 60).replace(/--/g, "\u0001").replace(/[-_]+/g, " ").replace(/\u0001/g, "-")
      .replace(/[<>"&]/g, "").trim()
      .replace(/(^|[\s-])(\S)/g, (m, a, b) => a + b.toUpperCase());
  } catch (e) {}
  if (invite) { txt("guestName", invite); $("guestName").hidden = false; }

  // Histoire
  c.histoire.forEach((h) => {
    const d = el("div", "t-item");
    d.append(el("b", "", h.date), el("h3", "", h.titre), el("p", "", h.texte));
    $("timeline").appendChild(d);
  });

  // Programme
  c.programme.forEach((p) => {
    const li = el("li"), d = el("div");
    d.append(el("h3", "", p.titre), el("p", "", p.detail));
    li.append(el("b", "", p.heure), d);
    $("program").appendChild(li);
  });

  // Lieu + carte
  txt("placeName", c.lieu.nom);
  txt("placeAddr", c.lieu.adresse + ", " + c.lieu.ville);
  const q = encodeURIComponent(c.lieu.rechercheMaps);
  $("mapFrame").src = "https://www.google.com/maps?q=" + q + "&output=embed";
  $("itineraire").href = "https://www.google.com/maps/dir/?api=1&destination=" + q;

  // Tenue
  txt("tenueText", c.tenue.texte);
  c.tenue.couleurs.forEach((k) => {
    const d = el("div", "sw"), i = el("i");
    i.style.background = k.hex;
    d.append(i, el("span", "", k.nom));
    $("swatches").appendChild(d);
  });

  // Confirmation WhatsApp (le nom de l'invité est pré-rempli s'il est dans le lien)
  txt("rsvpText", "Merci de répondre avant le " + c.rsvp.dateLimite + ".");
  $("rsvpBtn").href = "https://wa.me/" + c.rsvp.whatsapp + "?text=" + encodeURIComponent(
    c.rsvp.message.replace("{prenom1}", c.prenom1).replace("{prenom2}", c.prenom2) + invite);

  // Compte à rebours + message du jour J
  const target = new Date(c.dateISO).getTime();
  function tick() {
    const now = new Date();
    const estJourJ = now.toDateString() === new Date(target).toDateString();
    if (estJourJ || now.getTime() >= target) {
      $("countdown").innerHTML = '<p class="cd-msg"></p>';
      $("countdown").firstChild.textContent = estJourJ ? "C’est aujourd’hui !" : "Merci d’avoir partagé ce jour avec nous";
      return;
    }
    let r = target - now.getTime();
    const j = Math.floor(r / 864e5); r %= 864e5;
    const h = Math.floor(r / 36e5); r %= 36e5;
    const m = Math.floor(r / 6e4), s = Math.floor((r % 6e4) / 1e3);
    const cell = (v, l) => '<div class="cd"><b>' + String(v).padStart(2, "0") + "</b><span>" + l + "</span></div>";
    $("countdown").innerHTML = cell(j, "Jours") + cell(h, "Heures") + cell(m, "Min") + cell(s, "Sec");
  }
  tick(); setInterval(tick, 1000);

  /* ================= ENVELOPPE : tout suit le défilement =================
     0 – 32 %  : le rabat se soulève
     26 – 60 % : la carte glisse hors de l'enveloppe
     58 – 100 %: on entre dans la carte, et le papier arrive
     En remontant, tout se rejoue à l'envers. */
  const scene = $("scene"), hand = $("hand"), shadow = $("shadow"), zoom = $("zoom");
  const flap = $("envFlap"), card = $("envCard"), seal = $("seal"), hint = $("hint");
  const site = $("site"), paper = $("paper"), gapEl = $("gap"), skip = $("skip");
  const sm = (t) => t * t * (3 - 2 * t);
  let LEN = 1, P = 0, Pt = 0;
  let tx = 0, ty = 0, cx = 0, cy = 0, lastMove = 0, lmx = 50, lmy = 30, raf = 0;

  const isLite = () => document.documentElement.classList.contains("lite");
  function measure() { if (isLite()) return; LEN = Math.max(300, Math.round(window.innerHeight * 2.2)); gapEl.style.height = LEN + "px"; readScroll(); }
  function readScroll() { Pt = clamp(window.scrollY / LEN, 0, 1); }

  function aim(nx, ny) {
    ty = (nx - 0.5) * 46;          // gauche / droite
    tx = (0.5 - ny) * 32;          // haut / bas
    lmx = 50 + (nx - 0.5) * 90;    // reflet de lumière
    lmy = 50 + (ny - 0.5) * 90;
    lastMove = performance.now();
  }
  if (!reduce) {
    window.addEventListener("pointermove", (e) => aim(e.clientX / innerWidth, e.clientY / innerHeight), { passive: true });
    // Téléphone : l'enveloppe suit aussi l'inclinaison du téléphone (Android)
    window.addEventListener("deviceorientation", (e) => {
      if (e.gamma == null || performance.now() - lastMove < 1200) return;
      ty = clamp(e.gamma, -30, 30) * 0.9;
      tx = clamp((e.beta || 50) - 50, -25, 25) * -0.6;
      lmx = 50 + ty * 1.6; lmy = 50 - tx * 1.6;
    }, { passive: true });
  }

  // Si le téléphone est trop lent (moins de 24 images/seconde), on passe automatiquement en mode léger
  const probe = { done: lite || forceFull, t0: 0, n: 0 };
  document.addEventListener("visibilitychange", () => { probe.done = true; });
  function goLite() {
    document.documentElement.classList.add("lite");
    cancelAnimationFrame(raf);
    site.inert = false;
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }

  function frame(t) {
    raf = requestAnimationFrame(frame);
    if (!probe.done) {
      if (!probe.t0) { if (t > 900) { probe.t0 = t; probe.n = 0; } }
      else if (++probe.n && t - probe.t0 > 1300) {
        probe.done = true;
        if (probe.n / ((t - probe.t0) / 1000) < 24 && window.scrollY < LEN * 0.1) { goLite(); return; }
      }
    }
    // le défilement est lissé : l'ouverture a un peu d'inertie, comme un vrai papier
    P = reduce ? Pt : P + (Pt - P) * 0.16;
    if (Math.abs(Pt - P) < 0.0004) P = Pt;

    const f = clamp(P / 0.32, 0, 1), k = clamp((P - 0.26) / 0.34, 0, 1), z = clamp((P - 0.58) / 0.42, 0, 1);
    const ef = sm(f), ek = sm(k), ez = sm(z);
    const o = 1 - sm(clamp((z - 0.08) / 0.8, 0, 1));
    site.inert = P < 0.6;
    skip.classList.toggle("on", P < 0.45);
    if (o <= 0.001) { scene.style.visibility = "hidden"; return; }
    scene.style.visibility = "visible";
    scene.style.opacity = o.toFixed(3);

    flap.style.transform = "translateZ(" + (8 - 7 * ef).toFixed(2) + "px) rotateX(" + (180 * ef).toFixed(2) + "deg)";
    card.style.transform = "translateZ(" + (2 + ek).toFixed(2) + "px) translateY(" + (-78 * ek).toFixed(2) + "%)";
    seal.style.opacity = (1 - clamp(f * 5, 0, 1)).toFixed(3);
    hint.style.opacity = (1 - clamp(P * 9, 0, 1)).toFixed(3);
    zoom.style.transform = reduce ? "" : "scale(" + (1 + 1.9 * ez).toFixed(3) + ")";

    // inclinaison à la souris, qui s'efface peu à peu : la carte se présente de face
    const idle = t - lastMove > 2600;
    const face = sm(clamp(P / 0.5, 0, 1));
    const gx = reduce ? 0 : ((idle ? Math.cos(t / 1900) * 3 : tx) * (1 - face) - 5 * face);
    const gy = reduce ? 0 : ((idle ? Math.sin(t / 1500) * 5 : ty) * (1 - face));
    cx += (gx - cx) * 0.08; cy += (gy - cy) * 0.08;
    hand.style.transform = "rotateX(" + cx.toFixed(2) + "deg) rotateY(" + cy.toFixed(2) + "deg)";
    hand.style.setProperty("--mx", (idle ? 50 + cy * 3 : lmx).toFixed(1) + "%");
    hand.style.setProperty("--my", (idle ? 30 - cx * 3 : lmy).toFixed(1) + "%");
    shadow.style.transform = "translateX(" + (-cy * 1.6).toFixed(1) + "px) scaleX(" + (1 - Math.abs(cy) / 160).toFixed(3) + ")";
  }

  let lastW = window.innerWidth;
  window.addEventListener("scroll", readScroll, { passive: true });
  window.addEventListener("resize", () => {
    if (window.innerWidth !== lastW) { lastW = window.innerWidth; measure(); }  // ignore la barre d'adresse mobile
  });
  skip.addEventListener("click", () => {            // saute l'animation : on arrive directement sur le site
    window.scrollTo({ top: LEN, left: 0, behavior: "instant" });
    readScroll(); P = Pt;
  });
  if (lite) goLite();
  else { measure(); P = Pt; raf = requestAnimationFrame(frame); }

  /* ================= LE PAPIER SE DÉPLIE EN DÉFILANT =================
     Chaque bloc est « plié » vers l'arrière quand il arrive en bas de l'écran,
     puis se met à plat progressivement pendant qu'on fait défiler. */
  let secs = [], tickPending = false;
  const ease = (t) => t * t * (3 - 2 * t);
  function foldUpdate() {
    tickPending = false;
    if (document.documentElement.classList.contains("lite")) return;
    const vh = window.innerHeight;
    secs.forEach((s) => {
      const top = s.getBoundingClientRect().top;
      const u = ease(clamp((vh * 0.95 - top) / (vh * 0.5), 0, 1));
      s.style.setProperty("--u", u.toFixed(3));
    });
  }
  function watchSections() {
    secs = Array.prototype.slice.call(document.querySelectorAll(".sec"));
    if (reduce) return;
    const ask = () => { if (!tickPending) { tickPending = true; requestAnimationFrame(foldUpdate); } };
    window.addEventListener("scroll", ask, { passive: true });
    window.addEventListener("resize", ask);
    foldUpdate();
  }
  watchSections();

  /* Sur ordinateur : légère profondeur et reflet quand on bouge le curseur sur le papier */
  if (finePointer && !reduce) {
    let pf = 0, px = 0, py = 0, cX = 0, cY = 0;
    window.addEventListener("pointermove", (e) => {
      px = e.clientX; py = e.clientY;
      if (pf) return;
      pf = requestAnimationFrame(() => {
        pf = 0;
        const r = paper.getBoundingClientRect();
        paper.style.setProperty("--lx", (px - r.left) + "px");
        paper.style.setProperty("--ly", (py - r.top) + "px");
        paper.style.setProperty("--px", ((px / innerWidth - 0.5) * 2).toFixed(3));
        paper.style.setProperty("--py", ((py / innerHeight - 0.5) * 2).toFixed(3));
      });
    }, { passive: true });
  }
})();
