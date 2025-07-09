let slideIndex = 1;
showSlides(slideIndex);

// Next/previous controls
function plusSlides(n) {
  showSlides(slideIndex += n);
}

// Thumbnail image controls
function currentSlide(n) {
  showSlides(slideIndex = n);
}

function showSlides(n) {
  let i;
  let slides = document.getElementsByClassName("carousel-slide");
  let dots = document.getElementsByClassName("dot");

  if (slides.length === 0) { // No slides, do nothing
    return;
  }

  if (n > slides.length) {slideIndex = 1}
  if (n < 1) {slideIndex = slides.length}

  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
  }
  for (i = 0; i < dots.length; i++) {
    dots[i].className = dots[i].className.replace(" active", "");
  }

  slides[slideIndex-1].style.display = "block";
  if (dots.length > 0) {
    dots[slideIndex-1].className += " active";
  }
}

// Automatic slideshow (optional - uncomment to enable)
/*
let autoSlideIndex = 0;
autoShowSlides();

function autoShowSlides() {
  let i;
  let slides = document.getElementsByClassName("carousel-slide");
  let dots = document.getElementsByClassName("dot");
  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
  }
  autoSlideIndex++;
  if (autoSlideIndex > slides.length) {autoSlideIndex = 1}
  for (i = 0; i < dots.length; i++) {
    dots[i].className = dots[i].className.replace(" active", "");
  }
  slides[autoSlideIndex-1].style.display = "block";
  if (dots.length > 0) {
    dots[autoSlideIndex-1].className += " active";
  }
  setTimeout(autoShowSlides, 3000); // Change image every 3 seconds
}
*/

// Ensure the first slide is shown on page load if there are slides
document.addEventListener('DOMContentLoaded', function() {
    // Check if slides exist before trying to show them
    if (document.getElementsByClassName("carousel-slide").length > 0) {
        showSlides(slideIndex);
    }
});
