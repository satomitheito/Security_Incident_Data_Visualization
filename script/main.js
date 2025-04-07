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

document.addEventListener('DOMContentLoaded', () => {
  // Initialize the Incident Graph component
  const totalIncidentGraph = new TotalIncidentGraph('total-incident-graph');
  totalIncidentGraph.render();

  // Initialize the National vs International Graph component
  const comparisonGraph = new NationalVsInternationalGraph('national-vs-international-graph');
  comparisonGraph.render();

  const genderGraph = new GenderComparisonGraph('gender-graph');
  genderGraph.render();

  const rolesGraph = new RolesBarGraph('roles-graph');
  rolesGraph.render();

  const wordCloud = new WordCloud('word-cloud-container');
  wordCloud.render();
}); 