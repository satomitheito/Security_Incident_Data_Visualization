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