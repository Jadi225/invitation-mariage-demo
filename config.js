/* ============================================================
   MODIFIE UNIQUEMENT CE FICHIER pour personnaliser l'invitation.
   Tout le reste (index.html, style.css, script.js) ne change pas.
   ============================================================ */
window.INVITATION = {
  prenom1: "Awa",
  prenom2: "Koffi",

  // Date et heure de la cérémonie (format AAAA-MM-JJTHH:MM:SS)
  dateISO: "2027-03-20T10:00:00",
  dateTexte: "Samedi 20 mars 2027",
  ville: "Abidjan, Côte d'Ivoire",

  // Photo du couple : mets ta photo dans le dossier "photos" (ex : couple.jpg)
  photo: "photos/couple.jpg",

  phraseAccueil: "Nous avons la joie de vous convier à célébrer notre union.",

  histoire: [
    { date: "2019", titre: "La rencontre", texte: "Un sourire, une conversation qui ne s'arrête plus. Tout a commencé comme ça." },
    { date: "2023", titre: "La demande", texte: "Un soir tout simple, une question, et un grand « oui » sans hésiter." },
    { date: "2027", titre: "Le mariage", texte: "Deux familles, une même joie. Nous voulons la partager avec vous." }
  ],

  programme: [
    { heure: "10h00", titre: "Accueil des invités", detail: "Installation et rafraîchissements" },
    { heure: "11h00", titre: "Cérémonie traditionnelle", detail: "Dot et bénédictions des familles" },
    { heure: "12h00", titre: "Repas", detail: "Déjeuner partagé avec les familles et les invités" },
    { heure: "14h00", titre: "Cérémonie civile", detail: "Échange des vœux" },
    { heure: "15h30", titre: "Photos, musique et danse", detail: "Place à la fête" },
    { heure: "17h00", titre: "Fin de la journée", detail: "Remerciements et au revoir" }
  ],

  lieu: {
    nom: "Salle des Fêtes Les Jardins",
    adresse: "Boulevard des Jardins, Cocody",
    ville: "Abidjan",
    // Ce texte est recherché sur Google Maps : mets le nom exact du lieu + la ville
    rechercheMaps: "Sofitel Abidjan Hôtel Ivoire"
  },

  tenue: {
    texte: "Élégance africaine. Nous serons ravis de vous voir dans ces couleurs.",
    couleurs: [
      { nom: "Crème", hex: "#efe3cf" },
      { nom: "Terracotta", hex: "#b5533c" },
      { nom: "Brun profond", hex: "#3b1d1a" }
    ]
  },

  rsvp: {
    // Numéro WhatsApp avec indicatif, sans + ni espaces (Côte d'Ivoire = 225)
    whatsapp: "2250757887372",
    dateLimite: "10 février 2027",
    // {prenom1} et {prenom2} sont remplacés automatiquement par les prénoms des mariés.
    // L'invité écrit son nom à la fin du message avant de l'envoyer.
    message: "Bonjour {prenom1} et {prenom2}, je confirme ma présence à votre mariage. Nom : "
  },

  hashtag: "#AwaEtKoffi2027",

  // Musique de fond (mets ton fichier MP3 dans le dossier "audio").
  // Mets activee: false pour la désactiver.
  musique: { fichier: "audio/musique.mp3", volume: 0.5, activee: true }
};
