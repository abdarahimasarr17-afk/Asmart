// --- Intégration du CMS Sanity ---
const PROJECT_ID = 'pfhlan2b';
const DATASET = 'production';
const API_VERSION = 'v2024-08-18'; // Date de l'API

// Requêtes pour récupérer les différentes sections
const heroQuery = encodeURIComponent('*[_type == "hero"][0]');
const methodQuery = encodeURIComponent('*[_type == "method"][0]');

const heroUrl = `https://${PROJECT_ID}.api.sanity.io/${API_VERSION}/data/query/${DATASET}?query=${heroQuery}`;
const methodUrl = `https://${PROJECT_ID}.api.sanity.io/${API_VERSION}/data/query/${DATASET}?query=${methodQuery}`;

// Fonction pour charger et appliquer les données de Sanity
async function loadCmsData() {
    try {
        // Chargement de la section Hero (Accueil)
        const heroResponse = await fetch(heroUrl);
        const heroDataRaw = await heroResponse.json();
        
        if (heroDataRaw && heroDataRaw.result) {
            const heroData = heroDataRaw.result;
            
            if (heroData.title) {
                const titleElement = document.querySelector('[data-cms="hero-title"]');
                // On utilise innerHTML pour garder les sauts de ligne éventuels (<br>)
                if (titleElement) titleElement.innerHTML = heroData.title; 
            }
            if (heroData.description) {
                const descElement = document.querySelector('[data-cms="hero-description"]');
                if (descElement) descElement.textContent = heroData.description;
            }
            if (heroData.heroImage && heroData.heroImage.asset && heroData.heroImage.asset._ref) {
                // Création de l'URL de l'image Sanity
                const ref = heroData.heroImage.asset._ref;
                // Exemple _ref: image-Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x3000-jpg
                const parts = ref.split('-');
                const imageUrl = `https://cdn.sanity.io/images/${PROJECT_ID}/${DATASET}/${parts[1]}-${parts[2]}.${parts[3]}`;
                
                const heroSection = document.querySelector('#hero-accueil');
                if (heroSection) {
                    heroSection.style.backgroundImage = `url(${imageUrl})`;
                    heroSection.style.backgroundSize = 'cover';
                    heroSection.style.backgroundPosition = 'center';
                }
            }
        }
    } catch (error) {
        console.error("Erreur CMS : Impossible de charger les données", error);
    }
}

// Lancer le chargement une fois que la page est prête
document.addEventListener('DOMContentLoaded', loadCmsData);
