document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. HEADER SCROLL EFFECT ---
    const navbar = document.getElementById('navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    // --- 2. MOBILE MENU TOGGLE ---
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            const isOpen = navMenu.classList.toggle('open');
            menuToggle.classList.toggle('open');
            document.body.style.overflow = isOpen ? 'hidden' : ''; // Disable scrolling on body
        });

        // Close mobile menu when clicking a link
        const navLinks = navMenu.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('open');
                menuToggle.classList.remove('open');
                document.body.style.overflow = '';
            });
        });
    }

    // --- 3. UNIFIED SPA ROUTER (HASH-BASED) ---
    function router() {
        const hash = window.location.hash || '#accueil';
        
        // Parse subpaths/parameters if any, e.g., #article?id=1 or #contact?offre=complet
        let viewId = hash;
        let params = {};
        
        if (hash.includes('?')) {
            const parts = hash.split('?');
            viewId = parts[0];
            const paramStr = parts[1];
            paramStr.split('&').forEach(pair => {
                const [k, v] = pair.split('=');
                params[k] = decodeURIComponent(v);
            });
        }
        
        // Hide all page views
        const views = document.querySelectorAll('.page-view');
        views.forEach(v => {
            v.classList.remove('active');
        });
        
        // Show target view
        // Map hash to element ID: e.g., #accueil -> view-accueil
        const cleanViewId = viewId.substring(1);
        const targetId = 'view-' + cleanViewId;
        const targetView = document.getElementById(targetId);
        
        if (targetView) {
            targetView.classList.add('active');
            window.scrollTo({ top: 0, behavior: 'instant' });
        } else {
            // Fallback to home
            const homeView = document.getElementById('view-accueil');
            if (homeView) homeView.classList.add('active');
            window.location.hash = '#accueil';
            return;
        }
        
        // Update active navbar link
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.classList.remove('active');
            const link = item.querySelector('a');
            if (link) {
                const href = link.getAttribute('href');
                if (href === viewId || (viewId === '#accueil' && href === '#accueil')) {
                    item.classList.add('active');
                } else if (viewId.includes('article') && href === '#blog') {
                    // Highlight blog link when reading single article
                    item.classList.add('active');
                }
            }
        });

        // Close mobile menu if open
        if (navMenu && navMenu.classList.contains('open')) {
            navMenu.classList.remove('open');
            if (menuToggle) menuToggle.classList.remove('open');
            document.body.style.overflow = '';
        }

        // --- View Specific Hooks ---
        if (viewId === '#blog') {
            renderBlogList();
        } else if (viewId === '#article') {
            renderSingleArticle(params.id);
        } else if (viewId === '#blog-admin') {
            renderAdminList();
        } else if (viewId === '#secteurs') {
            const tab = params.tab || 'btp';
            activateSectorTab(tab);
        } else if (viewId === '#contact') {
            if (params.offre) {
                const subjectInput = document.getElementById('message');
                if (subjectInput) {
                    subjectInput.value = `Intéressé par l'offre : ${params.offre.toUpperCase()}. Merci de me recontacter pour lancer l'analyse commerciale.`;
                }
                const metierSelect = document.getElementById('metier');
                if (metierSelect && params.secteur) {
                    metierSelect.value = params.secteur;
                }
            }
        }
    }

    // Register router listeners
    window.addEventListener('hashchange', router);
    // Router run will happen after initializations below

    // --- 4. FAQ ACCORDIONS ---
    const faqItems = document.querySelectorAll('.faq-item');
    if (faqItems.length > 0) {
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            const answer = item.querySelector('.faq-answer');
            
            if (question && answer) {
                question.addEventListener('click', () => {
                    const isActive = item.classList.contains('active');
                    
                    // Close all other open items
                    faqItems.forEach(otherItem => {
                        otherItem.classList.remove('active');
                        const otherAnswer = otherItem.querySelector('.faq-answer');
                        if (otherAnswer) otherAnswer.style.maxHeight = null;
                    });
                    
                    if (!isActive) {
                        item.classList.add('active');
                        answer.style.maxHeight = answer.scrollHeight + 'px';
                    }
                });
            }
        });
    }

    // --- 5. FAQ LIVE SEARCH ---
    const faqSearchInput = document.getElementById('faq-search');
    if (faqSearchInput) {
        faqSearchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            faqItems.forEach(item => {
                const questionText = item.querySelector('.faq-question span').textContent.toLowerCase();
                const answerText = item.querySelector('.faq-answer-content').textContent.toLowerCase();
                
                if (questionText.includes(query) || answerText.includes(query)) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    }

    // --- 6. SECTOR TABS ---
    const sectorTabButtons = document.querySelectorAll('.sector-tab-btn');
    const sectorSections = document.querySelectorAll('.sector-detail-section');
    
    function activateSectorTab(sectorId) {
        let found = false;
        sectorTabButtons.forEach(btn => {
            if (btn.getAttribute('data-sector') === sectorId) {
                btn.classList.add('active');
                found = true;
            } else {
                btn.classList.remove('active');
            }
        });

        sectorSections.forEach(section => {
            if (section.getAttribute('id') === sectorId) {
                section.classList.add('active');
            } else {
                section.classList.remove('active');
            }
        });

        // If invalid ID, activate first tab
        if (!found && sectorTabButtons.length > 0) {
            sectorTabButtons[0].classList.add('active');
            sectorSections[0].classList.add('active');
        }
    }

    if (sectorTabButtons.length > 0 && sectorSections.length > 0) {
        sectorTabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetSector = btn.getAttribute('data-sector');
                activateSectorTab(targetSector);
                // Update URL hash parameter without triggering a full route change
                history.replaceState(null, null, `#secteurs?tab=${targetSector}`);
            });
        });
    }

    // --- 7. TELEPHONE SLOT SCHEDULER SIMULATION ---
    const slotBtns = document.querySelectorAll('.time-slot-btn');
    const selectedSlotInput = document.getElementById('selected-timeslot');
    if (slotBtns.length > 0) {
        slotBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                slotBtns.forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                if (selectedSlotInput) {
                    selectedSlotInput.value = btn.getAttribute('data-time');
                }
            });
        });
    }

    // --- 8. CONTACT FORM SUBMISSION WITH ANTI-SPAM (Honeypot + Math Captcha) ---
    const contactForm = document.getElementById('contact-form');
    const captchaQuestion = document.getElementById('captcha-question');
    const captchaAnswerInput = document.getElementById('captcha-answer');
    let num1 = 0, num2 = 0, correctAnswer = 0;

    function generateCaptcha() {
        if (captchaQuestion) {
            num1 = Math.floor(Math.random() * 10) + 1;
            num2 = Math.floor(Math.random() * 10) + 1;
            correctAnswer = num1 + num2;
            captchaQuestion.textContent = `${num1} + ${num2} =`;
            if (captchaAnswerInput) captchaAnswerInput.value = '';
        }
    }

    generateCaptcha();

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Spam prevention 1: Honeypot check
            const honeypot = document.getElementById('honeypot').value;
            if (honeypot) {
                console.warn('Spam détection : HoneyPot rempli.');
                return; // Silently reject
            }

            // Spam prevention 2: Captcha check
            const userAnswer = parseInt(captchaAnswerInput.value, 10);
            if (userAnswer !== correctAnswer) {
                alert('Erreur de validation anti-spam. Veuillez recalculer la somme.');
                generateCaptcha();
                return;
            }

            // If passed, simulate success
            const successToast = document.getElementById('success-toast');
            if (successToast) {
                successToast.classList.add('show');
                setTimeout(() => {
                    successToast.classList.remove('show');
                }, 5000);
            }

            // Reset form
            contactForm.reset();
            slotBtns.forEach(b => b.classList.remove('selected'));
            if (selectedSlotInput) selectedSlotInput.value = '';
            generateCaptcha();
            
            // Redirect to home after successful submit
            setTimeout(() => {
                window.location.hash = '#accueil';
            }, 1500);
        });
    }

    // --- 9. COOKIE CONSENT BANNER ---
    const cookieBanner = document.getElementById('cookie-banner');
    const acceptBtn = document.getElementById('cookie-accept');
    const denyBtn = document.getElementById('cookie-deny');

    if (cookieBanner && acceptBtn && denyBtn) {
        const consent = localStorage.getItem('cookie-consent');
        if (!consent) {
            setTimeout(() => {
                cookieBanner.classList.add('show');
            }, 1000);
        }

        acceptBtn.addEventListener('click', () => {
            localStorage.setItem('cookie-consent', 'accepted');
            cookieBanner.classList.remove('show');
        });

        denyBtn.addEventListener('click', () => {
            localStorage.setItem('cookie-consent', 'denied');
            cookieBanner.classList.remove('show');
        });
    }

    // --- 10. CMS BLOG LOCAL STORAGE INITIALIZATION & RENDERING ---
    const DEFAULT_ARTICLES = [
        {
            id: 1,
            title: "Comment optimiser votre mémoire technique BTP en 2026 ?",
            category: "btp",
            categoryLabel: "BTP & Travaux",
            excerpt: "Le mémoire technique représente souvent 60% de la note globale. Découvrez les critères incontournables des acheteurs publics pour faire sortir votre dossier du lot.",
            content: "Le mémoire technique BTP ne doit plus être un document standardisé ou une simple fiche de l'entreprise. En 2026, les maîtres d'ouvrages publics accordent une importance capitale à l'environnement, à l'organisation du chantier et à la sécurité.\n\nPour optimiser votre mémoire technique :\n1. Personnalisez l'offre en citant nommément le projet et ses contraintes environnementales spécifiques.\n2. Structurez un plan aligné sur les critères du Règlement de Consultation (RC).\n3. Valorisez votre politique RSE avec des actions réelles de recyclage des déchets de chantier.\n4. Intégrez des fiches méthodologiques claires et des CV valorisant vos conducteurs de travaux.",
            date: "15 Mai 2026",
            author: "Asmae Azib",
            image: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=600&q=80",
            readTime: "5 min"
        },
        {
            id: 2,
            title: "Sécurité privée : décryptage des nouveaux critères de notation",
            category: "securite",
            categoryLabel: "Sécurité",
            excerpt: "Entre exigences CNAPS, gestion opérationnelle des agents et clauses RSE, la commande publique en sécurité s'est fortement durcie. Voici comment vous y adapter.",
            content: "Les donneurs d'ordres publics imposent désormais des critères stricts pour l'attribution des marchés de gardiennage et de sécurité privée. Il ne suffit plus de proposer un tarif bas pour l'emporter.\n\nPrincipaux axes à développer :\n- La réactivité opérationnelle : démontrez comment vous gérez le remplacement d'un agent absent en moins de deux heures.\n- La conformité CNAPS et les agréments à jour de chaque collaborateur.\n- La politique sociale : l'acheteur public est particulièrement sensible aux conditions de travail et à la rémunération des agents de sécurité afin d'éviter la sous-traitance non déclarée.",
            date: "02 Juin 2026",
            author: "Asmae Azib",
            image: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=600&q=80",
            readTime: "6 min"
        },
        {
            id: 3,
            title: "Marchés publics de nettoyage : valoriser vos engagements éco-responsables",
            category: "nettoyage",
            categoryLabel: "Nettoyage",
            excerpt: "L'achat public vert est devenu la règle. Découvrez comment valoriser l'utilisation de produits éco-labellisés et l'organisation du travail en journée dans vos offres.",
            content: "L'intégration des clauses environnementales dans la commande publique de services de nettoyage est une obligation légale stricte. Votre mémoire technique doit refléter cette réalité.\n\nNos recommandations pour gagner des points :\n- Présentez des certificats prouvant l'usage de produits éco-certifiés (Écolabel européen).\n- Mettez en avant le travail en journée (qui évite les coupures et favorise le bien-être social des agents).\n- Proposez des plans de formation internes pour les agents de nettoyage sur la gestion raisonnée de l'eau et de l'énergie lors des prestations.",
            date: "08 Juin 2026",
            author: "Asmae Azib",
            image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&q=80",
            readTime: "4 min"
        }
    ];

    // Initialize blog posts if empty in localStorage
    if (!localStorage.getItem('asmart_blog_posts')) {
        localStorage.setItem('asmart_blog_posts', JSON.stringify(DEFAULT_ARTICLES));
    }

    // Load and render posts on blog list
    const blogListContainer = document.getElementById('blog-posts-container');
    function renderBlogList() {
        if (!blogListContainer) return;
        const posts = JSON.parse(localStorage.getItem('asmart_blog_posts')) || [];
        blogListContainer.innerHTML = '';
        
        if (posts.length === 0) {
            blogListContainer.innerHTML = '<p style="grid-column: span 3; text-align: center; color: var(--text-muted);">Aucun article disponible pour le moment.</p>';
            return;
        }

        posts.forEach(post => {
            const card = document.createElement('article');
            card.className = 'blog-card';
            card.innerHTML = `
                <div class="blog-img-wrapper">
                    <span class="blog-card-tag">${post.categoryLabel || post.category}</span>
                    <img src="${post.image || 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&q=80'}" alt="${post.title}" class="blog-card-img">
                </div>
                <div class="blog-card-body">
                    <div class="blog-card-meta">
                        <span><i class="fa-regular fa-calendar"></i> ${post.date}</span>
                        <span><i class="fa-regular fa-clock"></i> ${post.readTime || '5 min'}</span>
                    </div>
                    <h3 class="blog-card-title">${post.title}</h3>
                    <p class="blog-card-excerpt">${post.excerpt}</p>
                    <a href="#article?id=${post.id}" class="blog-card-link">Lire l'article <i class="fa-solid fa-arrow-right"></i></a>
                </div>
            `;
            blogListContainer.appendChild(card);
        });
    }

    // Load and render single article
    function renderSingleArticle(idStr) {
        const articleContainer = document.getElementById('single-article-content');
        if (!articleContainer) return;

        const articleId = parseInt(idStr, 10);
        const posts = JSON.parse(localStorage.getItem('asmart_blog_posts')) || [];
        const post = posts.find(p => p.id === articleId);

        if (post) {
            // Header Content
            const categoryHeader = document.getElementById('article-category');
            const titleHeader = document.getElementById('article-title');
            const metaHeader = document.getElementById('article-meta');
            const coverImg = document.getElementById('article-cover-img');

            if (categoryHeader) categoryHeader.textContent = post.categoryLabel || post.category;
            if (titleHeader) titleHeader.textContent = post.title;
            if (metaHeader) {
                metaHeader.innerHTML = `
                    <span><i class="fa-regular fa-calendar"></i> ${post.date}</span>
                    <span><i class="fa-regular fa-user"></i> Par ${post.author}</span>
                    <span><i class="fa-regular fa-clock"></i> ${post.readTime || '5 min'} de lecture</span>
                `;
            }
            if (coverImg) coverImg.src = post.image || 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&q=80';

            // Convert double newlines to paragraphs in content
            const contentHtml = post.content.split('\n\n').map(p => {
                if (p.startsWith('1.') || p.startsWith('-')) {
                    const items = p.split('\n').map(li => `<li>${li.replace(/^(\d+\.|\-)\s*/, '')}</li>`).join('');
                    return `<ul>${items}</ul>`;
                }
                return `<p>${p.replace(/\n/g, '<br>')}</p>`;
            }).join('');
            
            articleContainer.innerHTML = contentHtml;

            // Related posts
            const relatedContainer = document.getElementById('related-articles');
            if (relatedContainer) {
                relatedContainer.innerHTML = '';
                const related = posts.filter(p => p.id !== post.id).slice(0, 2);
                related.forEach(rp => {
                    const rCard = document.createElement('div');
                    rCard.style.marginBottom = '2rem';
                    rCard.innerHTML = `
                        <h4 style="font-size: 1.05rem; margin-bottom: 0.5rem;"><a href="#article?id=${rp.id}" style="color: var(--primary); font-weight: 700;">${rp.title}</a></h4>
                        <p style="font-size: 0.85rem; color: var(--text-muted);">${rp.date}</p>
                    `;
                    relatedContainer.appendChild(rCard);
                });
            }

        } else {
            articleContainer.innerHTML = '<p>Article introuvable. <a href="#blog">Retourner au blog</a></p>';
        }
    }

    // --- 11. CMS ADMIN PANEL FOR LOCAL STORAGE BLOG ---
    const adminForm = document.getElementById('admin-post-form');
    const adminList = document.getElementById('admin-posts-list');
    const editPostIdInput = document.getElementById('edit-post-id');

    if (adminForm) {
        adminForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const posts = JSON.parse(localStorage.getItem('asmart_blog_posts')) || [];
            const editId = editPostIdInput.value;
            
            const title = document.getElementById('post-title').value;
            const category = document.getElementById('post-category').value;
            const excerpt = document.getElementById('post-excerpt').value;
            const content = document.getElementById('post-content').value;
            const image = document.getElementById('post-image').value || 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&q=80';
            const readTime = document.getElementById('post-readtime').value || '5 min';
            
            const labels = {
                btp: 'BTP & Travaux',
                securite: 'Sécurité',
                nettoyage: 'Nettoyage',
                divers: 'Conseils généraux'
            };

            const categoryLabel = labels[category] || 'Conseil';

            if (editId) {
                // Edit existing post
                const index = posts.findIndex(p => p.id === parseInt(editId, 10));
                if (index !== -1) {
                    posts[index].title = title;
                    posts[index].category = category;
                    posts[index].categoryLabel = categoryLabel;
                    posts[index].excerpt = excerpt;
                    posts[index].content = content;
                    posts[index].image = image;
                    posts[index].readTime = readTime;
                }
                editPostIdInput.value = '';
                document.getElementById('admin-submit-btn').textContent = 'Créer l\'article';
            } else {
                // Create new post
                const newId = posts.length > 0 ? Math.max(...posts.map(p => p.id)) + 1 : 1;
                const dateOptions = { day: 'numeric', month: 'long', year: 'numeric' };
                const today = new Date().toLocaleDateString('fr-FR', dateOptions);

                const newPost = {
                    id: newId,
                    title,
                    category,
                    categoryLabel,
                    excerpt,
                    content,
                    date: today,
                    author: "Asmae Azib",
                    image,
                    readTime
                };
                posts.unshift(newPost);
            }

            localStorage.setItem('asmart_blog_posts', JSON.stringify(posts));
            adminForm.reset();
            renderAdminList();
            alert('Article enregistré avec succès !');
        });
    }

    function renderAdminList() {
        if (!adminList) return;
        const posts = JSON.parse(localStorage.getItem('asmart_blog_posts')) || [];
        adminList.innerHTML = '';

        if (posts.length === 0) {
            adminList.innerHTML = '<p style="color: var(--text-muted);">Aucun article créé pour le moment.</p>';
            return;
        }

        posts.forEach(post => {
            const li = document.createElement('li');
            li.className = 'admin-article-item';
            li.innerHTML = `
                <span class="admin-item-title">${post.title} (${post.categoryLabel || post.category})</span>
                <div class="admin-item-actions">
                    <button class="admin-btn-action admin-btn-edit" data-id="${post.id}" title="Modifier"><i class="fa-solid fa-pen"></i></button>
                    <button class="admin-btn-action admin-btn-delete" data-id="${post.id}" title="Supprimer"><i class="fa-solid fa-trash"></i></button>
                </div>
            `;
            adminList.appendChild(li);
        });

        // Add action listeners for edits
        adminList.querySelectorAll('.admin-btn-edit').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.getAttribute('data-id'), 10);
                const posts = JSON.parse(localStorage.getItem('asmart_blog_posts')) || [];
                const post = posts.find(p => p.id === id);

                if (post) {
                    document.getElementById('post-title').value = post.title;
                    document.getElementById('post-category').value = post.category;
                    document.getElementById('post-excerpt').value = post.excerpt;
                    document.getElementById('post-content').value = post.content;
                    document.getElementById('post-image').value = post.image;
                    document.getElementById('post-readtime').value = post.readTime;
                    
                    editPostIdInput.value = post.id;
                    document.getElementById('admin-submit-btn').innerHTML = 'Mettre à jour l\'article <i class="fa-solid fa-floppy-disk"></i>';
                    window.scrollTo({ top: adminForm.offsetTop - 120, behavior: 'smooth' });
                }
            });
        });

        // Add action listeners for deletes
        adminList.querySelectorAll('.admin-btn-delete').forEach(btn => {
            btn.addEventListener('click', () => {
                if (confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
                    const id = parseInt(btn.getAttribute('data-id'), 10);
                    let posts = JSON.parse(localStorage.getItem('asmart_blog_posts')) || [];
                    posts = posts.filter(p => p.id !== id);
                    localStorage.setItem('asmart_blog_posts', JSON.stringify(posts));
                    renderAdminList();
                }
            });
        });
    }

    // --- 12. RUN INITIAL ROUTER CALL ---
    router();
});
