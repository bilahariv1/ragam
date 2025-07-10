// Ragam Textiles - New Carousel Component JavaScript
// Version 1.0.0

class RagamCarousel {
    constructor(carouselElement, config = {}) {
        this.carouselElement = carouselElement;
        this.config = {
            // Default configuration options
            initialSlide: 0,
            slidesToShow: 1, // For basic logic, we'll assume 1 for now. Advanced logic later.
            slidesToScroll: 1,
            infiniteLoop: true,
            // Selectors - can be overridden if HTML structure changes
            trackSelector: '.carousel-track',
            slideSelector: '.carousel-slide',
            prevButtonSelector: '.prev-btn',
            nextButtonSelector: '.next-btn',
            indicatorContainerSelector: '.carousel-indicators',
            indicatorSelector: '.indicator',
            activeIndicatorClass: 'active',
            // Merge user config
            ...config
        };

        this.track = this.carouselElement.querySelector(this.config.trackSelector);
        this.slides = Array.from(this.track.children);
        this.prevButton = this.carouselElement.querySelector(this.config.prevButtonSelector);
        this.nextButton = this.carouselElement.querySelector(this.config.nextButtonSelector);
        this.indicatorsContainer = this.carouselElement.querySelector(this.config.indicatorContainerSelector);
        this.indicators = this.indicatorsContainer ? Array.from(this.indicatorsContainer.children) : [];

        this.currentIndex = this.config.initialSlide;
        this.slideCount = this.slides.length;
        this.isAnimating = false; // Simple flag to prevent animation spam

        if (!this.track || this.slideCount === 0) {
            console.warn("Carousel track or slides not found for:", this.carouselElement);
            return;
        }

        this.init();
    }

    init() {
        this.updateSlidePosition();
        this.updateIndicators();
        this.bindEvents();
        // Initial setup for infinite loop (cloning) might be done here later
    }

    bindEvents() {
        if (this.prevButton) {
            this.prevButton.addEventListener('click', () => this.prevSlide());
        }
        if (this.nextButton) {
            this.nextButton.addEventListener('click', () => this.nextSlide());
        }
        if (this.indicatorsContainer) {
            this.indicators.forEach((indicator, index) => {
                indicator.addEventListener('click', () => this.goToSlide(index));
            });
        }
        // Transition end event to reset isAnimating flag
        this.track.addEventListener('transitionend', () => {
            this.isAnimating = false;
            // Handle infinite loop post-transition (e.g., jump from clone to real slide)
            // This will be more complex with actual cloning for infinite loop
        });
    }

    nextSlide() {
        if (this.isAnimating) return;
        this.isAnimating = true;

        if (this.currentIndex < this.slideCount - 1) {
            this.currentIndex++;
        } else {
            if (this.config.infiniteLoop) {
                this.currentIndex = 0; // Simple loop for now, real infinite needs cloning or more complex logic
            } else {
                this.isAnimating = false; // No more slides
                return;
            }
        }
        this.updateCarouselState();
    }

    prevSlide() {
        if (this.isAnimating) return;
        this.isAnimating = true;

        if (this.currentIndex > 0) {
            this.currentIndex--;
        } else {
            if (this.config.infiniteLoop) {
                this.currentIndex = this.slideCount - 1; // Simple loop
            } else {
                this.isAnimating = false; // No more slides
                return;
            }
        }
        this.updateCarouselState();
    }

    goToSlide(index) {
        if (this.isAnimating || index < 0 || index >= this.slideCount || index === this.currentIndex) {
            if (index === this.currentIndex) this.isAnimating = false;
            return;
        }
        this.isAnimating = true;
        this.currentIndex = index;
        this.updateCarouselState();
    }

    updateCarouselState() {
        this.updateSlidePosition();
        this.updateIndicators();
        // Any other state updates (ARIA attributes etc.) will go here
    }

    updateSlidePosition() {
        // For now, assumes each slide is 100% width of the wrapper
        const newX = -this.currentIndex * 100; // Percentage based
        this.track.style.transform = `translateX(${newX}%)`;
    }

    updateIndicators() {
        if (!this.indicatorsContainer || this.indicators.length === 0) return;
        this.indicators.forEach((indicator, index) => {
            if (index === this.currentIndex) {
                indicator.classList.add(this.config.activeIndicatorClass);
                indicator.setAttribute('aria-current', 'true'); // Accessibility
            } else {
                indicator.classList.remove(this.config.activeIndicatorClass);
                indicator.removeAttribute('aria-current');
            }
        });
    }

    // Methods for advanced features (autoPlay, responsive, touch, etc.) will be added later
}

// Auto-initialize carousels on the page
document.addEventListener('DOMContentLoaded', () => {
    const carouselElements = document.querySelectorAll('.carousel-container');
    carouselElements.forEach(el => {
        // Example: Parse config from data attributes if needed later
        // const config = JSON.parse(el.dataset.carouselConfig || '{}');
        new RagamCarousel(el, {
            // Example: you could pass slide specific config here too
            // For now, using default or component-wide config.
        });
    });
    console.log(`Initialized ${carouselElements.length} RagamCarousel(s)`);
});
