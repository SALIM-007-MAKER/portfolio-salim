/*
 * Coordonnées et options du portfolio.
 * Un champ laissé vide ('') n'est tout simplement pas affiché sur le site.
 */
window.SITE_CONFIG = {
  email: '',          // adresse publique, ex. 'prenom.nom@domaine.com'
  whatsapp: '',       // numéro au format international, ex. '+227 00 00 00 00'
  linkedin: '',       // URL complète du profil, commençant par https://
  availability: '',   // ex. 'Ouvert aux stages et missions freelance'

  // CV : déposez le PDF dans assets/ puis indiquez ex. 'assets/cv-salim-zabeirou.pdf'.
  // Le bouton n'apparaît que si le fichier existe réellement.
  cv: '',

  // Envoi du formulaire : mettre 'contact.php' APRÈS avoir créé contact-config.php
  // (voir README.md). Vide = envoi désactivé, et le site le dit clairement.
  formEndpoint: ''
};
