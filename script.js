(function () {
  const c = window.INVITATION;
  const $ = (id) => document.getElementById(id);
  const initiales = c.prenom1[0] + "&" + c.prenom2[0];

  // Titre de l'onglet + textes principaux
  document.title = c.prenom1 + " & " + c.prenom2 + " — Invitation de mariage";
  $("cardNames").innerHTML = c.prenom1 + "<br>&amp;<br>" + c.prenom2;
  $("seal").textContent = initiales;
  $("names").innerHTML = c.prenom1 + "<span>&amp;</span>" + c.prenom2;
  $("heroDate").textContent = c.dateTexte + " · " + c.ville;
  $("heroPhrase").textContent = c.phraseAccueil;
  $("hashtag").textContent = c.hashtag;

  // Photo (si elle n'existe pas, le dégradé terracotta reste visible)
  const img = new Image();
  img.onload = () => ($("heroPhoto").style.backgroundImage = "url('" + c.photo + "')");
  img.src = c.photo;

  // Histoire
  $("timeline").innerHTML = c.histoire.map(h =>
    `<div class="t-item"><b>${h.date}</b><h3>${h.titre}</h3><p>${h.texte}</p></div>`).join("");

  // Programme
  $("program").innerHTML = c.programme.map(p =>
    `<li><time>${p.heure}</time><div><h3>${p.titre}</h3><p>${p.detail}</p></div></li>`).join("");

  // Lieu
  $("placeName").textContent = c.lieu.nom;
  $("placeAddr").textContent = c.lieu.adresse + ", " + c.lieu.ville;
  const q = encodeURIComponent(c.lieu.rechercheMaps);
  $("mapFrame").src = "https://www.google.com/maps?q=" + q + "&output=embed";
  $("itineraire").href = "https://www.google.com/maps/dir/?api=1&destination=" + q;

  // Tenue
  $("tenueText").textContent = c.tenue.texte;
  $("swatches").innerHTML = c.tenue.couleurs.map(k =>
    `<div class="sw"><i style="background:${k.hex}"></i><span>${k.nom}</span></div>`).join("");

  // Confirmation par WhatsApp
  $("rsvpText").textContent = "Merci de répondre avant le " + c.rsvp.dateLimite + ".";
  $("rsvpBtn").href = "https://wa.me/" + c.rsvp.whatsapp + "?text=" + encodeURIComponent(c.rsvp.message);

  // Compte à rebours
  const target = new Date(c.dateISO).getTime();
  function tick() {
    let d = Math.max(0, target - Date.now());
    const j = Math.floor(d / 864e5); d %= 864e5;
    const h = Math.floor(d / 36e5); d %= 36e5;
    const m = Math.floor(d / 6e4), s = Math.floor((d % 6e4) / 1e3);
    const cell = (v, l) => `<div class="cd"><b>${String(v).padStart(2, "0")}</b><span>${l}</span></div>`;
    $("countdown").innerHTML = cell(j, "Jours") + cell(h, "Heures") + cell(m, "Minutes") + cell(s, "Secondes");
  }
  tick(); setInterval(tick, 1000);

  // Animations au défilement
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("visible"); io.unobserve(e.target); } });
  }, { threshold: .15 });
  function watch() { document.querySelectorAll(".reveal,.t-item,.program li,.sw").forEach(el => io.observe(el)); }

  // Ouverture de l'enveloppe
  $("openBtn").addEventListener("click", () => {
    $("openBtn").disabled = true;
    $("openBtn").style.opacity = 0;
    $("envelope").classList.add("open");
    setTimeout(() => {
      $("intro").classList.add("done");
      document.body.classList.remove("locked");
      $("site").removeAttribute("aria-hidden");
      document.querySelector(".hero").classList.add("in");
      watch();
    }, 2200);
  });
})();
