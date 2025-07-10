document.addEventListener('DOMContentLoaded', () => {
    const defaultConfig = {
        autoPlay: true,
        autoPlayInterval: 3000,
        pauseOnHover: true,
        infiniteLoop: true,
        showIndicators: true,
        showArrows: true,
        slidesToShow: 1, // Default for mobile
        slidesToScroll: 1,
        responsive: [
            { breakpoint: 1440, slidesToShow: 4 }, // Large Desktop
            { breakpoint: 1024, slidesToShow: 3 }, // Desktop
            { breakpoint: 768, slidesToShow: 2 }   // Tablet
        ]
    };

    // Allow overriding config via a global variable or data attributes on the carousel container
    const carouselConfig = window.carouselConfig ? { ...defaultConfig, ...window.carouselConfig } : defaultConfig;

    const carouselContainer = document.querySelector('.carousel-container');
    if (!carouselContainer) {
        console.warn('Carousel container not found. Carousel will not be initialized.');
        return;
    }

    const track = carouselContainer.querySelector('.carousel-track');
    const slides = Array.from(track.children);
    const liveRegion = carouselContainer.querySelector('.carousel-liveregion');
    const prevButton = carouselContainer.querySelector('.prev-btn');
    const nextButton = carouselContainer.querySelector('.next-btn');
    const indicatorsContainer = carouselContainer.querySelector('.carousel-indicators');
    let indicators = [];
    if (indicatorsContainer) { // Check if indicatorsContainer exists
        indicators = Array.from(indicatorsContainer.children);
    }


    if (!track || slides.length === 0) {
        console.warn('Carousel track or slides not found. Carousel will not be initialized.');
        if (indicatorsContainer) indicatorsContainer.style.display = 'none';
        if (prevButton) prevButton.style.display = 'none';
        if (nextButton) nextButton.style.display = 'none';
        return;
    }

    let currentIndex = 0;
    let currentSlidesToShow = getSlidesToShow();
    let autoPlayTimer;
    let isHovering = false;
    let isFocused = false; // Track focus within carousel

    function getSlidesToShow() {
        let newSlidesToShow = carouselConfig.slidesToShow; // Base default
        // Ensure responsive settings are sorted from largest to smallest breakpoint
        const sortedResponsive = carouselConfig.responsive.sort((a, b) => b.breakpoint - a.breakpoint);
        for (const setting of sortedResponsive) {
            if (window.innerWidth >= setting.breakpoint) {
                newSlidesToShow = setting.slidesToShow;
                break;
            }
        }
        // If newSlidesToShow is greater than actual slides, adjust
        return Math.min(newSlidesToShow, slides.length > 0 ? slides.length : 1); // Avoid division by zero if no slides
    }

    function updateCarouselLayout() {
        currentSlidesToShow = getSlidesToShow();
        if (slides.length === 0 || currentSlidesToShow === 0) return; // Avoid division by zero

        const slideWidthPercentage = 100 / currentSlidesToShow;
        slides.forEach(slide => {
            slide.style.minWidth = `${slideWidthPercentage}%`;
            slide.style.maxWidth = `${slideWidthPercentage}%`;
        });
        // Recalculate transform based on potentially new currentIndex and currentSlidesToShow
        moveToSlide(currentIndex, false); // false indicates not a user interaction, so don't reset autoplay unnecessarily
        updateIndicators();
        updateArrowVisibility();
    }

    function updateArrowVisibility() {
        if (!carouselConfig.showArrows) {
            if(prevButton) prevButton.style.display = 'none';
            if(nextButton) nextButton.style.display = 'none';
            return;
        } else {
            if(prevButton) prevButton.style.display = 'block';
            if(nextButton) nextButton.style.display = 'block';
        }

        if (!carouselConfig.infiniteLoop) {
            if(prevButton) prevButton.disabled = currentIndex === 0;
            if(nextButton) nextButton.disabled = currentIndex >= slides.length - currentSlidesToShow;
        } else {
            if(prevButton) prevButton.disabled = false;
            if(nextButton) nextButton.disabled = false;
        }
        // Hide arrows if all slides are visible
        if (slides.length <= currentSlidesToShow) {
            if(prevButton) prevButton.style.display = 'none';
            if(nextButton) nextButton.style.display = 'none';
        }
    }

    function moveToSlide(index, userInitiated = true) {
        if (slides.length === 0 || currentSlidesToShow === 0) return;

        const maxPossibleIndex = Math.max(0, slides.length - currentSlidesToShow);

        if (carouselConfig.infiniteLoop) {
            if (index < 0) {
                currentIndex = (slides.length + index) % slides.length;
                // If this new index would cause overflow with slidesToShow, clamp it
                if (currentIndex > maxPossibleIndex) {
                     currentIndex = maxPossibleIndex; // Go to the last possible "page"
                }
            } else if (index > maxPossibleIndex) { // Trying to go beyond the last "page"
                currentIndex = index % slides.length; // Wrap around
                 // If after wrapping, it's still too far (e.g. 1 slide, slidesToShow 3, new index 1 % 1 = 0)
                if (currentIndex + currentSlidesToShow > slides.length && currentIndex > 0) {
                    currentIndex = 0; // Go to the first slide
                } else if (currentIndex > maxPossibleIndex) { // Still beyond after wrap
                    currentIndex = 0;
                }

            } else {
                currentIndex = index;
            }
        } else { // Not infinite loop
            currentIndex = Math.max(0, Math.min(index, maxPossibleIndex));
        }

        track.style.transform = `translateX(-${currentIndex * (100 / currentSlidesToShow)}%)`;
        updateIndicators();
        updateArrowVisibility();
        announceSlideChange();
        if (userInitiated) {
            resetAutoPlay();
        }
    }

    function announceSlideChange() {
        if (!liveRegion) return;
        // Announce the first visible slide's information, or a general "group" message
        let announcement = "";
        if (slides.length > 0 && currentIndex < slides.length) {
            const firstVisibleSlide = slides[currentIndex];
            const imgAlt = firstVisibleSlide.querySelector('img')?.alt;
            const caption = firstVisibleSlide.querySelector('.carousel-caption-text')?.textContent;

            if (caption) {
                announcement = `Showing item: ${caption}`;
            } else if (imgAlt) {
                announcement = `Showing item: ${imgAlt}`;
            } else {
                announcement = `Showing slide group starting with item ${currentIndex + 1}`;
            }
        } else {
            announcement = `Slide ${currentIndex + 1} of ${slides.length - currentSlidesToShow +1 } shown`;
        }
        liveRegion.textContent = announcement;
    }

    function updateIndicators() {
        if (!carouselConfig.showIndicators || !indicatorsContainer || indicators.length === 0) {
            if (indicatorsContainer) indicatorsContainer.style.display = 'none';
            return;
        }

        // Determine number of "pages" for indicators
        const numPages = slides.length > currentSlidesToShow ? (slides.length - currentSlidesToShow + 1) : 1;

        // Ensure indicators match number of pages
        if (indicators.length !== numPages) {
            indicatorsContainer.innerHTML = ''; // Clear existing
            indicators = [];
            for (let i = 0; i < numPages; i++) {
                const button = document.createElement('button');
                button.classList.add('indicator');
                button.setAttribute('aria-label', `Go to slide group ${i + 1}`);
                button.addEventListener('click', () => moveToSlide(i));
                indicatorsContainer.appendChild(button);
                indicators.push(button);
            }
        }

        if (numPages <= 1) {
            indicatorsContainer.style.display = 'none';
            return;
        }
        indicatorsContainer.style.display = 'flex';

        indicators.forEach((indicator, i) => {
            if (i === currentIndex) {
                indicator.classList.add('active');
                indicator.setAttribute('aria-current', 'true');
            } else {
                indicator.classList.remove('active');
                indicator.removeAttribute('aria-current');
            }
        });
    }

    function startAutoPlay() {
        if (!carouselConfig.autoPlay || isHovering || isFocused || slides.length <= currentSlidesToShow) return;
        stopAutoPlay();
        autoPlayTimer = setInterval(() => {
            moveToSlide(currentIndex + carouselConfig.slidesToScroll);
        }, carouselConfig.autoPlayInterval);
    }

    function stopAutoPlay() {
        clearInterval(autoPlayTimer);
    }

    function resetAutoPlay() {
        stopAutoPlay();
        startAutoPlay();
    }

    // Event Listeners
    if (nextButton) {
        nextButton.addEventListener('click', () => {
            moveToSlide(currentIndex + carouselConfig.slidesToScroll);
        });
    }

    if (prevButton) {
        prevButton.addEventListener('click', () => {
            moveToSlide(currentIndex - carouselConfig.slidesToScroll);
        });
    }

    // Dynamic indicators are created in updateIndicators, event listeners added there.

    if (carouselConfig.pauseOnHover) {
        carouselContainer.addEventListener('mouseenter', () => {
            isHovering = true;
            stopAutoPlay();
        });
        carouselContainer.addEventListener('mouseleave', () => {
            isHovering = false;
            if (!isFocused) startAutoPlay(); // Only resume if not also focused
        });
    }
    // Pause autoplay when any element inside the carousel receives focus
    carouselContainer.addEventListener('focusin', () => {
        isFocused = true;
        stopAutoPlay();
    });

    // Resume autoplay when focus moves out of the carousel
    carouselContainer.addEventListener('focusout', (e) => {
        // Check if the new focused element is still within the carousel
        if (!carouselContainer.contains(e.relatedTarget)) {
            isFocused = false;
            if (!isHovering) startAutoPlay(); // Only resume if not also hovering
        }
    });


    // Keyboard Navigation for arrows and container
    const focusableElements = [prevButton, nextButton, indicatorsContainer, carouselContainer];
    focusableElements.forEach(el => {
        if (el) { // Ensure element exists
            el.addEventListener('keydown', (e) => {
                let handled = false;
                if (e.key === 'ArrowRight') {
                    moveToSlide(currentIndex + carouselConfig.slidesToScroll);
                    handled = true;
                } else if (e.key === 'ArrowLeft') {
                    moveToSlide(currentIndex - carouselConfig.slidesToScroll);
                    handled = true;
                }
                // Allow tabbing through indicators
                if (e.key === 'Tab' && indicatorsContainer && indicatorsContainer.contains(e.target)) {
                    // Default tab behavior is fine for indicators
                    return;
                }

                if (handled) {
                    e.preventDefault();
                }
            });
        }
    });
    // Make carousel container focusable if not already (for overall keyboard nav context)
    if (!carouselContainer.hasAttribute('tabindex') && slides.length > 0) {
        carouselContainer.setAttribute('tabindex', '0');
        // Style for focus on container (optional)
        carouselContainer.style.outline = 'none'; // Remove default outline if using custom focus on children
    }


    // Touch/Swipe Support
    let touchStartX = 0;
    let touchEndX = 0;
    const swipeThreshold = 50;

    track.addEventListener('touchstart', (e) => { // Listen on track for better slide interaction
        touchStartX = e.changedTouches[0].screenX;
        stopAutoPlay();
    }, { passive: true });

    track.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
        if (!isHovering && !isFocused) startAutoPlay();
    }, { passive: true });

    function handleSwipe() {
        if (Math.abs(touchEndX - touchStartX) < swipeThreshold) return;
        if (touchEndX < touchStartX) {
            moveToSlide(currentIndex + carouselConfig.slidesToScroll);
        } else if (touchEndX > touchStartX) {
            moveToSlide(currentIndex - carouselConfig.slidesToScroll);
        }
    }

    // Initial Setup
    updateCarouselLayout(); // Set initial slide widths, position, and indicators
    startAutoPlay();

    // Responsive adjustments
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            const oldSlidesToShow = currentSlidesToShow;
            updateCarouselLayout();
            // If the number of slides to show changes, we might need to adjust currentIndex
            if (oldSlidesToShow !== currentSlidesToShow) {
                 // Try to keep the same general area visible, adjust current index if it's now out of bounds
                 currentIndex = Math.min(currentIndex, Math.max(0, slides.length - currentSlidesToShow));
                 moveToSlide(currentIndex, false); // Re-align based on new slidesToShow & index
            }
            resetAutoPlay();
        }, 250);
    });
});
