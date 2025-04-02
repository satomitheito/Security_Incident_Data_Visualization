const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.6 });
  
  const mapElement = document.querySelector('.map-reveal');
  observer.observe(mapElement);