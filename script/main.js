window.addEventListener('scroll', () => {
  const frame2 = document.querySelector('.frame2');
  const frame1 = document.querySelector('.frame1');
  const scrollY = window.scrollY;

  if (scrollY > 50) {
    frame1.classList.remove('active');
    frame2.classList.add('active');
  } else {
    frame1.classList.add('active');
    frame2.classList.remove('active');
  }
});

// Intersection Observer for scroll-based animations
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      if (entry.target.classList.contains('region-focus')) {
        // Trigger zoom effect
        document.querySelector('#map-container').style.transform = 'scale(2)';
        // Show region labels with delay
        setTimeout(() => {
          document.querySelectorAll('.region-highlight').forEach(highlight => {
            highlight.style.opacity = '1';
          });
        }, 1000);
      }
    } else {
      if (entry.target.classList.contains('region-focus')) {
        // Reset zoom when scrolling away
        document.querySelector('#map-container').style.transform = 'scale(1)';
        // Hide region labels
        document.querySelectorAll('.region-highlight').forEach(highlight => {
          highlight.style.opacity = '0';
        });
      }
    }
  });
}, {
  threshold: 0.5
});

// Observe the region focus section
document.addEventListener('DOMContentLoaded', () => {
  const regionFocus = document.querySelector('.region-focus');
  if (regionFocus) {
    observer.observe(regionFocus);
  }
});