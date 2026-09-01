/* ========================================
   aShell You - Website JavaScript
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize all components
    initNavigation();
    initTypingAnimation();
    initScrollAnimations();
    initCarousel();
    initSmoothScroll();
    initGitHubStats();
});

/* ========================================
   Navigation
   ======================================== */
function initNavigation() {
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Navbar scroll effect
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
    });

    // Mobile menu toggle
    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close menu on link click
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // Close menu on outside click
    document.addEventListener('click', (e) => {
        if (!navbar.contains(e.target) && navMenu.classList.contains('active')) {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });
}

/* ========================================
   Typing Animation
   ======================================== */
function initTypingAnimation() {
    const typingElement = document.querySelector('.typing-text');
    const phrases = [
        'Execute ADB Commands on Your Device',
        'No PC Required',
        'Material You Design',
        'Powered by Shizuku',
        'Control Devices via OTG',
        'Wireless Debugging Support'
    ];

    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let isPaused = false;

    function type() {
        const currentPhrase = phrases[phraseIndex];

        if (isPaused) {
            setTimeout(type, 100);
            return;
        }

        if (isDeleting) {
            typingElement.textContent = currentPhrase.substring(0, charIndex - 1);
            charIndex--;
        } else {
            typingElement.textContent = currentPhrase.substring(0, charIndex + 1);
            charIndex++;
        }

        let typeSpeed = isDeleting ? 30 : 50;

        if (!isDeleting && charIndex === currentPhrase.length) {
            isPaused = true;
            setTimeout(() => {
                isPaused = false;
                isDeleting = true;
            }, 2000);
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
        }

        setTimeout(type, typeSpeed);
    }

    // Start typing animation
    setTimeout(type, 1000);
}

/* ========================================
   Scroll Animations
   ======================================== */
function initScrollAnimations() {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // Observe feature cards
    document.querySelectorAll('.feature-card').forEach(card => {
        observer.observe(card);
    });

    // Observe other animated elements
    document.querySelectorAll('.fade-in').forEach(el => {
        observer.observe(el);
    });

    // Observe sections for header animations
    document.querySelectorAll('.section-header').forEach(header => {
        header.classList.add('fade-in');
        observer.observe(header);
    });

    // Observe requirement cards
    document.querySelectorAll('.requirement-card').forEach((card, index) => {
        card.classList.add('fade-in');
        card.style.transitionDelay = `${index * 100}ms`;
        observer.observe(card);
    });

    // Observe download cards
    document.querySelectorAll('.download-card').forEach((card, index) => {
        card.classList.add('fade-in');
        card.style.transitionDelay = `${index * 100}ms`;
        observer.observe(card);
    });

    // Observe community cards
    document.querySelectorAll('.community-card').forEach((card, index) => {
        card.classList.add('fade-in');
        card.style.transitionDelay = `${index * 100}ms`;
        observer.observe(card);
    });
}

/* ========================================
   Screenshot Carousel
   ======================================== */
function initCarousel() {
    const trackContainer = document.querySelector('.carousel-track-container');
    const track = document.getElementById('carousel-track');
    const slides = track.querySelectorAll('.carousel-slide');
    const prevBtn = document.getElementById('carousel-prev');
    const nextBtn = document.getElementById('carousel-next');
    const dotsContainer = document.getElementById('carousel-dots');

    let currentPage = 0;
    let slidesPerPage = 1;
    let totalPages = 1;
    let autoplayInterval;
    let isHovered = false;

    // Calculate how many slides can fit without cropping
    function calculateSlidesPerPage() {
        if (slides.length === 0) return 1;

        // Get actual container width using getBoundingClientRect for accuracy
        const containerRect = trackContainer.getBoundingClientRect();
        const containerWidth = containerRect.width;

        const slide = slides[0];
        const phoneFrame = slide.querySelector('.phone-frame');

        // Get the actual rendered width of the phone frame
        let slideWidth;
        if (phoneFrame) {
            const frameRect = phoneFrame.getBoundingClientRect();
            slideWidth = frameRect.width;
        } else {
            slideWidth = slide.getBoundingClientRect().width;
        }

        // Gap between slides - matches CSS var(--space-lg) = 24px, but on mobile it's 16px
        const computedStyle = window.getComputedStyle(track);
        const gap = parseFloat(computedStyle.gap) || 24;

        if (slideWidth === 0) return 1; // Safety check

        // Calculate how many FULL slides can fit
        // Formula: n slides need (n * slideWidth) + ((n - 1) * gap) <= containerWidth
        // Solving for n: n <= (containerWidth + gap) / (slideWidth + gap)
        const maxSlides = Math.floor((containerWidth + gap) / (slideWidth + gap));

        return Math.max(1, Math.min(maxSlides, slides.length));
    }

    // Create dots based on total pages
    function createDots() {
        dotsContainer.innerHTML = '';

        for (let i = 0; i < totalPages; i++) {
            const dot = document.createElement('button');
            dot.classList.add('carousel-dot');
            if (i === 0) dot.classList.add('active');
            dot.setAttribute('aria-label', `Go to page ${i + 1}`);
            dot.addEventListener('click', () => goToPage(i));
            dotsContainer.appendChild(dot);
        }
    }

    // Get the actual slide width (just the phone frame, no gap)
    function getSlideWidth() {
        if (slides.length === 0) return 0;
        const slide = slides[0];
        const phoneFrame = slide.querySelector('.phone-frame');
        if (phoneFrame) {
            return phoneFrame.getBoundingClientRect().width;
        }
        return slide.getBoundingClientRect().width;
    }

    // Get the gap between slides
    function getGap() {
        const computedStyle = window.getComputedStyle(track);
        return parseFloat(computedStyle.gap) || 24;
    }

    // Update carousel position and dots
    function updateCarousel() {
        const slideWidth = getSlideWidth();
        const gap = getGap();

        // Each page shows slidesPerPage slides
        // The offset for page n is: n * slidesPerPage * (slideWidth + gap)
        const offset = currentPage * slidesPerPage * (slideWidth + gap);

        track.style.transform = `translateX(-${offset}px)`;

        // Update dots
        const dots = dotsContainer.querySelectorAll('.carousel-dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentPage);
        });

        // Update button states (optional visual feedback)
        prevBtn.style.opacity = currentPage === 0 ? '0.5' : '1';
        nextBtn.style.opacity = currentPage === totalPages - 1 ? '0.5' : '1';
    }

    // Navigate to next page
    function nextPage() {
        currentPage = currentPage >= totalPages - 1 ? 0 : currentPage + 1;
        updateCarousel();
    }

    // Navigate to previous page
    function prevPage() {
        currentPage = currentPage <= 0 ? totalPages - 1 : currentPage - 1;
        updateCarousel();
    }

    // Go to specific page
    function goToPage(pageIndex) {
        currentPage = Math.max(0, Math.min(pageIndex, totalPages - 1));
        updateCarousel();
    }

    // Recalculate layout
    function recalculateLayout() {
        // First, reset any explicit width so we can measure the natural container size
        trackContainer.style.maxWidth = '';

        slidesPerPage = calculateSlidesPerPage();
        totalPages = Math.ceil(slides.length / slidesPerPage);

        // Now set an explicit max-width on the container to fit exactly slidesPerPage slides
        const slideWidth = getSlideWidth();
        const gap = getGap();

        // The width needed for slidesPerPage slides: (slidesPerPage * slideWidth) + ((slidesPerPage - 1) * gap)
        const exactWidth = (slidesPerPage * slideWidth) + ((slidesPerPage - 1) * gap);
        trackContainer.style.maxWidth = `${exactWidth}px`;

        // Make sure current page is valid
        if (currentPage >= totalPages) {
            currentPage = totalPages - 1;
        }
        if (currentPage < 0) {
            currentPage = 0;
        }

        createDots();
        updateCarousel();

        console.log('Carousel recalculated:', { slidesPerPage, totalPages, slideWidth, gap, exactWidth });
    }

    // Autoplay functions
    function startAutoplay() {
        stopAutoplay();
        autoplayInterval = setInterval(() => {
            if (!isHovered) {
                nextPage();
            }
        }, 4000);
    }

    function stopAutoplay() {
        if (autoplayInterval) {
            clearInterval(autoplayInterval);
        }
    }

    // Event listeners
    prevBtn.addEventListener('click', () => {
        prevPage();
        startAutoplay();
    });

    nextBtn.addEventListener('click', () => {
        nextPage();
        startAutoplay();
    });

    track.addEventListener('mouseenter', () => {
        isHovered = true;
    });

    track.addEventListener('mouseleave', () => {
        isHovered = false;
    });

    // Handle resize with debounce
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            recalculateLayout();
        }, 150);
    });

    // Touch support for swipe
    let touchStartX = 0;
    let touchEndX = 0;

    track.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    track.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });

    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                nextPage();
            } else {
                prevPage();
            }
            startAutoplay();
        }
    }

    // Initialize after images load to get correct dimensions
    function initAfterImagesLoad() {
        const images = track.querySelectorAll('img');
        let loadedCount = 0;
        const totalImages = images.length;

        if (totalImages === 0) {
            recalculateLayout();
            startAutoplay();
            return;
        }

        images.forEach(img => {
            if (img.complete) {
                loadedCount++;
                if (loadedCount === totalImages) {
                    recalculateLayout();
                    startAutoplay();
                }
            } else {
                img.addEventListener('load', () => {
                    loadedCount++;
                    if (loadedCount === totalImages) {
                        recalculateLayout();
                        startAutoplay();
                    }
                });
                img.addEventListener('error', () => {
                    loadedCount++;
                    if (loadedCount === totalImages) {
                        recalculateLayout();
                        startAutoplay();
                    }
                });
            }
        });

        // Fallback: initialize anyway after a timeout
        setTimeout(() => {
            if (totalPages === 1) {
                recalculateLayout();
                startAutoplay();
            }
        }, 2000);
    }

    initAfterImagesLoad();
}

/* ========================================
   GitHub Stats
   ======================================== */
function initGitHubStats() {
    const REPO_OWNER = 'DP-Hridayan';
    const REPO_NAME = 'aShellYou';

    const starsElement = document.getElementById('github-stars');
    const downloadsElement = document.getElementById('github-downloads');
    const contributorsElement = document.getElementById('github-contributors');
    const versionElement = document.getElementById('latest-version');

    // Helper function to format stars (with 1 decimal place)
    function formatStars(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    // Helper function to format downloads (whole numbers)
    function formatDownloads(num) {
        if (num >= 1000000) {
            return Math.round(num / 1000000) + 'M+';
        } else if (num >= 1000) {
            return Math.round(num / 1000) + 'K+';
        }
        return num.toString();
    }

    // Fetch repository info (stars)
    async function fetchRepoInfo() {
        try {
            const response = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`);
            if (!response.ok) throw new Error('Failed to fetch repo info');
            const data = await response.json();
            return data.stargazers_count;
        } catch (error) {
            console.error('Error fetching repo info:', error);
            return null;
        }
    }

    // Fetch all releases and calculate total downloads
    async function fetchTotalDownloads() {
        try {
            let totalDownloads = 0;
            let page = 1;
            let hasMore = true;

            while (hasMore) {
                const response = await fetch(
                    `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/releases?per_page=100&page=${page}`
                );
                if (!response.ok) throw new Error('Failed to fetch releases');
                const releases = await response.json();

                if (releases.length === 0) {
                    hasMore = false;
                } else {
                    releases.forEach(release => {
                        release.assets.forEach(asset => {
                            totalDownloads += asset.download_count;
                        });
                    });
                    page++;
                    // If we got less than 100 results, we've reached the end
                    if (releases.length < 100) {
                        hasMore = false;
                    }
                }
            }

            return totalDownloads;
        } catch (error) {
            console.error('Error fetching downloads:', error);
            return null;
        }
    }

    // Fetch contributors count
    async function fetchContributorsCount() {
        try {
            const response = await fetch(
                `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contributors?per_page=1`
            );
            if (!response.ok) throw new Error('Failed to fetch contributors');

            // Get total count from Link header
            const linkHeader = response.headers.get('Link');
            if (linkHeader) {
                const match = linkHeader.match(/page=(\d+)>; rel="last"/);
                if (match) {
                    return parseInt(match[1], 10);
                }
            }

            // If no pagination, count from response
            const contributors = await response.json();
            return contributors.length;
        } catch (error) {
            console.error('Error fetching contributors:', error);
            return null;
        }
    }

    // Fetch latest release version
    async function fetchLatestVersion() {
        try {
            const response = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/releases/latest`);
            if (!response.ok) throw new Error('Failed to fetch latest release');
            const data = await response.json();
            return data.tag_name;
        } catch (error) {
            console.error('Error fetching latest version:', error);
            return null;
        }
    }

    // Update UI with fetched stats
    async function updateStats() {
        const [stars, downloads, contributors, latestVersion] = await Promise.all([
            fetchRepoInfo(),
            fetchTotalDownloads(),
            fetchContributorsCount(),
            fetchLatestVersion()
        ]);

        if (stars !== null && starsElement) {
            starsElement.textContent = formatStars(stars);
        }

        if (downloads !== null && downloadsElement) {
            downloadsElement.textContent = formatDownloads(downloads);
        }

        if (contributors !== null && contributorsElement) {
            contributorsElement.textContent = contributors.toString();
        }

        if (latestVersion !== null && versionElement) {
            versionElement.textContent = latestVersion;
        }
    }

    // Fetch and update stats
    updateStats();
}

/* ========================================
   Smooth Scroll
   ======================================== */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));

            if (target) {
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/* ========================================
   Parallax Effects (Optional Enhancement)
   ======================================== */
function initParallax() {
    const orbs = document.querySelectorAll('.gradient-orb');

    window.addEventListener('mousemove', (e) => {
        const mouseX = e.clientX / window.innerWidth - 0.5;
        const mouseY = e.clientY / window.innerHeight - 0.5;

        orbs.forEach((orb, index) => {
            const speed = (index + 1) * 20;
            const x = mouseX * speed;
            const y = mouseY * speed;

            orb.style.transform = `translate(${x}px, ${y}px)`;
        });
    });
}

/* ========================================
   Hero Screenshot Rotation
   ======================================== */
function initHeroScreenshotRotation() {
    const heroScreenshot = document.getElementById('hero-screenshot');
    const screenshots = [
        'https://raw.githubusercontent.com/DP-Hridayan/aShellYou/master/fastlane/metadata/android/en-US/images/phoneScreenshots/01.jpeg',
        'https://raw.githubusercontent.com/DP-Hridayan/aShellYou/master/fastlane/metadata/android/en-US/images/phoneScreenshots/02.jpeg',
        'https://raw.githubusercontent.com/DP-Hridayan/aShellYou/master/fastlane/metadata/android/en-US/images/phoneScreenshots/03.jpeg',
        'https://raw.githubusercontent.com/DP-Hridayan/aShellYou/master/fastlane/metadata/android/en-US/images/phoneScreenshots/04.jpeg',
        'https://raw.githubusercontent.com/DP-Hridayan/aShellYou/master/fastlane/metadata/android/en-US/images/phoneScreenshots/05.jpeg'
    ];

    let currentIndex = 0;

    setInterval(() => {
        currentIndex = (currentIndex + 1) % screenshots.length;
        heroScreenshot.style.opacity = '0';

        setTimeout(() => {
            heroScreenshot.src = screenshots[currentIndex];
            heroScreenshot.style.opacity = '1';
        }, 300);
    }, 4000);

    // Add transition for fade effect
    heroScreenshot.style.transition = 'opacity 0.3s ease';
}

// Initialize hero screenshot rotation after page load
window.addEventListener('load', () => {
    initHeroScreenshotRotation();
    initParallax();
});
