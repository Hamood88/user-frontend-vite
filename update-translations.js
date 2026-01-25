const fs = require('fs');
const path = require('path');

// Define the new legal pages content for each language
const legalContent = {
  fr: { // French
    privacyPolicy: {
      title: "Politique de confidentialité",
      intro: "Moondala ne vend pas vos données personnelles. Nous gagnons de l'argent grâce aux transactions et services — pas grâce à la publicité qui exploite les données des utilisateurs.",
      section1Title: "1) Ce que nous collect ons",
      section1Content: ["Informations de compte : nom, e-mail, téléphone (si vous l'ajoutez), pays, détails de profil de base.", "Activité de l'application : actions comme suivis, j'aime, commentaires, messages, parrainages (pour prévenir la fraude).", "Informations d'achat et de transaction : commandes, état des paiements, historique des remboursements/retours.", "Données d'appareil et journaux : adresse IP, type de navigateur/appareil, erreurs d'application, journaux de sécurité."],
      section2Title: "2) Comment nous utilisons vos données",
      section2Content: ["Pour créer et sécuriser votre compte (connexion, prévention de la fraude, détection des abus).", "Pour traiter les commandes, retours, remboursements et support client.", "Pour alimenter les fonctionnalités principales du produit (fil d'actualité, messagerie, pages de boutiques, parrainages).", "Pour améliorer la fiabilité et les performances (journaux de plantage, correction de bugs, analyses)."],
      section3Title: "3) Ce que nous ne faisons PAS",
      section3Content: ["Nous ne vendons pas vos données personnelles.", "Nous n'autorisons pas les annonceurs tiers à vous cibler en utilisant vos données de profil privées."],
      section4Title: "4) Partage",
      section4Intro: "Nous pouvons partager des données limitées uniquement lorsque cela est nécessaire pour exécuter le service, telles que :",
      section4Content: ["Processeurs de paiement (pour finaliser les transactions).", "Fournisseurs d'infrastructure (hébergement, base de données, envoi d'e-mails/SMS).", "Légal (si requis par la loi, ou pour protéger les utilisateurs et prévenir la fraude)."],
      section5Title: "5) Cookies et analyses",
      section5Content: "Nous pouvons utiliser des cookies/stockage local pour les sessions de connexion et des analyses de base pour améliorer l'application. Vous pouvez restreindre les cookies dans votre navigateur, mais certaines fonctionnalités peuvent ne pas fonctionner.",
      section6Title: "6) Vos choix",
      section6Content: ["Mettez à jour votre profil depuis les Paramètres.", "Demandez la suppression du compte (supprime ou anonymise les données lorsque possible).", "Contrôlez les fonctionnalités de confidentialité (visibilité du profil, qui peut vous envoyer des messages) si disponibles dans vos Paramètres."],
      section7Title: "7) Sécurité des données",
      section7Content: "Nous utilisons des pratiques de sécurité raisonnables (cryptage en transit, contrôles d'accès, surveillance), mais aucun système n'est sécurisé à 100%.",
      section8Title: "8) Contact",
      section8Content: "Ajoutez un e-mail de support lorsque prêt (exemple : support@moondala.one)."
    },
    termsOfService: {
      title: "Conditions d'utilisation",
      intro: "En utilisant Moondala, vous acceptez de suivre ces Conditions. Si vous n'êtes pas d'accord, n'utilisez pas l'application.",
      section1Title: "1) Comptes",
      section1Content: ["Vous devez fournir des informations exactes et garder votre compte sécurisé.", "Vous êtes responsable de l'activité sous votre compte.", "Nous pouvons suspendre les comptes impliqués dans la fraude, l'abus ou les violations de règles."],
      section2Title: "2) Ce que vous ne pouvez pas faire",
      section2Content: ["Arnaques, usurpation d'identité, fraude ou comportement de parrainage trompeur.", "Harcèlement, haine, menaces ou contenu illégal.", "Essayer d'exploiter des bugs ou de faire de l'ingénierie inverse de la plateforme."],
      section3Title: "3) Fraude et abus",
      section3Intro: "Nous avons une tolérance zéro pour la fraude et l'abus. Vous serez banni si vous :",
      section3Content: ["Créez des comptes en double ou faux pour obtenir des récompenses ou manipuler les parrainages.", "Exécutez des 'fermes de parrainage' utilisant des bots, scripts ou création automatisée de comptes.", "Vendez, achetez, échangez ou partagez des codes de parrainage ou comptes pour profit.", "Utilisez Moondala pour promouvoir des schémas de parrainage concurrents de manière spam.", "Volez le contenu, code, marque de Moondala ou usurpez l'identité de Moondala.", "Tentez de manipuler le suivi des parrainages, systèmes de commandes ou calculs de récompenses."],
      section4Title: "4) Transactions",
      section4Content: ["Les commandes, retours et remboursements suivent notre Politique de remboursement.", "Certains articles peuvent être non remboursables s'ils sont clairement étiquetés.", "Nous pouvons retenir ou inverser les récompenses lorsque des remboursements/rétrofacturations se produisent."],
      section5Title: "5) Récompenses de parrainage",
      section5Content: "Les récompenses sont régies par la Politique de parrainage et récompenses. Nous pouvons suspendre ou refuser les récompenses en cas de soupçon d'abus ou de faux comptes.",
      section6Title: "6) Contenu que vous publiez",
      section6Content: ["Vous possédez votre contenu, mais vous donnez à Moondala la permission de l'afficher dans l'application.", "Ne publiez pas de contenu sur lequel vous n'avez pas de droits."],
      section7Title: "7) Suspension et résiliation",
      section7Intro: "Nous nous réservons le droit de suspendre ou bannir définitivement les comptes qui :",
      section7Content: ["Violent ces Conditions, en particulier les dispositions de fraude et d'abus.", "S'engagent dans un comportement nuisant à d'autres utilisateurs ou à la plateforme.", "Sont impliqués dans des violations répétées de règles ou ignorent les avertissements."],
      section7Note: "Les utilisateurs bannis perdent toutes les récompenses en attente et peuvent être bloqués de la création de nouveaux comptes.",
      section8Title: "8) Changements de service",
      section8Content: "Nous pouvons mettre à jour les fonctionnalités, frais et politiques à mesure que Moondala se développe. Nous mettrons à jour la date 'Dernière mise à jour'.",
      section9Title: "9) Responsabilité",
      section9Content: "Moondala est fourni 'tel quel'. Dans toute la mesure permise par la loi, nous ne sommes pas responsables des dommages indirects (perte de profits, perte de données, etc.).",
      section10Title: "10) Contact",
      section10Content: "Le contact de support sera listé ici (exemple : support@moondala.one)."
    },
    communityGuidelines: {
      title: "Directives de la communauté",
      intro: "Moondala est le commerce social — gardez-le sûr, honnête et respectueux.",
      allowedTitle: "Autorisé",
      allowedContent: ["Discussions réelles sur les produits, avis, commentaires honnêtes.", "Partager des codes de parrainage de manière véridique (pas de tromperie).", "Désaccord respectueux."],
      notAllowedTitle: "Non autorisé",
      notAllowedContent: ["Arnaques, faux cadeaux ou affirmations trompeuses de 'gains garantis'.", "Harcèlement, discours de haine, menaces ou intimidation.", "Articles/services illégaux ou instructions pour faire le mal.", "Spam (publication de masse, liens répétitifs, comportement de bot)."],
      enforcementTitle: "Application",
      enforcementContent: ["Nous pouvons supprimer du contenu ou restreindre des fonctionnalités.", "Les violations graves ou répétées peuvent entraîner une suspension ou un bannissement permanent."],
      reportingTitle: "Signalement",
      reportingContent: "Si vous voyez un abus, signalez-le dans l'application (ou par e-mail de support lorsqu'ajouté)."
    },
    refundPolicy: {
      title: "Politique de retour et remboursement",
      intro: "Cette politique décrit les règles standard de retour/remboursement. Les boutiques peuvent avoir des règles supplémentaires affichées sur la page du produit.",
      section1Title: "1) Fenêtre de retour",
      section1Content: ["Fenêtre de retour typique : 7–30 jours (dépend de la boutique et de la catégorie de produit).", "Certains articles peuvent être non retournables (affiché avant l'achat)."],
      section2Title: "2) Méthode de remboursement",
      section2Content: ["Les remboursements retournent au mode de paiement d'origine lorsque possible.", "Si vous avez utilisé des crédits/portefeuille Moondala, les remboursements peuvent retourner au portefeuille."],
      section3Title: "3) Expédition et état",
      section3Content: ["Les articles doivent être retournés en état d'origine sauf s'ils sont endommagés/défectueux.", "La responsabilité de l'expédition de retour peut dépendre de la raison (défaut vs changement d'avis)."],
      section4Title: "4) Fraude et abus",
      section4Content: "Nous pouvons refuser les remboursements pour abus, comportement suspect répété ou violations de politique.",
      section5Title: "5) Récompenses de parrainage",
      section5Content: "Si une commande est remboursée, les récompenses de parrainage associées peuvent être inversées."
    }
  },
  // Add more languages here...
  // Due to length, I'll create a comprehensive Node script
};

// Function to update a translation file
function updateTranslationFile(lang, content) {
  const filePath = path.join(__dirname, 'public', 'locales', lang, 'translation.json');
  
  try {
    const existing = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    // Ensure legal.pages exists
    if (!existing.legal) existing.legal = {};
    if (!existing.legal.pages) existing.legal.pages = {};
    
    // Merge new content
    existing.legal.pages = {
      ...existing.legal.pages,
      ...content
    };
    
    // Write back
    fs.writeFileSync(filePath, JSON.stringify(existing, null, 2) + '\n', 'utf8');
    console.log(`✓ Updated ${lang}`);
    return true;
  } catch (error) {
    console.error(`✗ Failed to update ${lang}:`, error.message);
    return false;
  }
}

// Update French
if (legalContent.fr) {
  updateTranslationFile('fr', legalContent.fr);
}

console.log('\nNote: This script includes only French. Other languages need to be added to the legalContent object.');
