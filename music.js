/* Musique de fond : démarre au 1er clic de l'invité (« Ouvrir notre invitation »),
   avec un bouton pour la couper. Si le fichier est absent, rien ne s'affiche. */
(function () {
  const cfg = (window.INVITATION && window.INVITATION.musique) || {};
  if (cfg.activee === false) return;

  const audio = new Audio(cfg.fichier || "audio/musique.mp3");
  audio.loop = true;
  audio.volume = cfg.volume != null ? cfg.volume : 0.5;
  audio.preload = "auto";

  const ON  = '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4z"/></svg>';
  const OFF = '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true"><path d="M3 9v6h4l5 5V4L7 9H3zm13.6 3 2.4-2.4-1.4-1.4-2.4 2.4-2.4-2.4-1.4 1.4 2.4 2.4-2.4 2.4 1.4 1.4 2.4-2.4 2.4 2.4 1.4-1.4-2.4-2.4z"/></svg>';

  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "btn-musique";
  btn.hidden = true;
  document.body.appendChild(btn);

  let coupeParInvite = false;
  // Le défilement ne compte pas comme un geste : on propose le bouton son dès que le fichier est prêt
  audio.addEventListener("canplay", () => { btn.hidden = false; maj(); }, { once: true });

  function maj() {
    const joue = !audio.paused;
    btn.innerHTML = joue ? ON : OFF;
    btn.classList.toggle("joue", joue);
    btn.setAttribute("aria-label", joue ? "Couper la musique" : "Activer la musique");
    btn.setAttribute("aria-pressed", String(joue));
  }

  function demarrer() {
    if (coupeParInvite) return;
    audio.play().then(() => { btn.hidden = false; maj(); }).catch(() => {});
  }
  document.addEventListener("click", demarrer, { once: true });
document.addEventListener("touchend", demarrer, { once: true });

  btn.addEventListener("click", () => {
    if (audio.paused) { coupeParInvite = false; audio.play().catch(() => {}); }
    else { coupeParInvite = true; audio.pause(); }
    maj();
  });

  // Pause quand l'invité quitte l'onglet ou verrouille son téléphone
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) audio.pause();
    else if (!coupeParInvite && !btn.hidden) audio.play().catch(() => {});
    maj();
  });
})();
