const fs = require('fs');
const path = require('path');

// Liste des noms de fichiers manquants
const missingImages = [
  'work-stress.jpg',
  'group-walking.jpg',
  'walking-brain.jpg',
  'morning-running.jpg',
  'stress-reduction.jpg',
  'save-money.jpg'
];

// S'assurer que le dossier existe
const postsDir = path.join(__dirname, '../public/images/posts');
if (!fs.existsSync(postsDir)) {
  fs.mkdirSync(postsDir, { recursive: true });
}

// Créer des images de base 1x1 pixel
missingImages.forEach(imageName => {
  // Copier l'image existante comme base
  try {
    const sourcePath = path.join(postsDir, 'montagneverte.jpg');
    const targetPath = path.join(postsDir, imageName);
    
    // Vérifier si l'image source existe
    if (fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, targetPath);
      console.log(`✅ Créé l'image ${imageName}`);
    } else {
      console.error(`❌ Image source non trouvée: ${sourcePath}`);
    }
  } catch (error) {
    console.error(`❌ Erreur lors de la création de ${imageName}:`, error);
  }
});

console.log('✅ Toutes les images de remplacement ont été créées!');
