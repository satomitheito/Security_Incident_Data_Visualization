// Total Incident Graph Component

class TotalIncidentGraph {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.error(`Container with ID ${containerId} not found`);
      return;
    }
    
    // Store data and state
    this.fullYears = [];
    this.fullIncidents = [];
    this.currentVisibleYears = 1;
    this.graphContainer = null;
    this.isInitialized = false;
    
    // Scroll state
    this.isScrollHijacked = false;
    this.scrollProgress = 0;
    
    // Bind methods
    this.handleWheel = this.handleWheel.bind(this);
    this.enableScrollHijacking = this.enableScrollHijacking.bind(this);
    this.disableScrollHijacking = this.disableScrollHijacking.bind(this);
  }

  render() {
    const template = `
      <div class="total-incident-graph-section">
        <div class="container">
          <p class="graph-title">Total Incidents By Year</p>
          <div class="graph-container" id="incidents-graph"></div>
        </div>
      </div>
    `;
    
    this.container.innerHTML = template;
    this.initGraph();
    this.setupScrollObserver();
  }

  async processData() {
    try {
      const response = await fetch('/data/security_incidents.csv');
      const csvData = await response.text();
      
      const rows = csvData.split('\n');
      const headers = rows[0].split(',');
      const yearIndex = headers.findIndex(header => header.includes("Year"));
      
      const yearlyIncidents = {};
      
      for (let i = 1; i < rows.length; i++) {
        if (!rows[i].trim()) continue;
        
        const columns = rows[i].split(',');
        const year = parseInt(columns[yearIndex]);
        
        if (!isNaN(year) && year <= 2024) {
          yearlyIncidents[year] = (yearlyIncidents[year] || 0) + 1;
        }
      }
      
      const years = Object.keys(yearlyIncidents).map(Number).sort((a, b) => a - b);
      const incidents = years.map(year => yearlyIncidents[year]);
      
      this.fullYears = years;
      this.fullIncidents = incidents;
      
      return { years, incidents };
    } catch (error) {
      console.error('Error processing CSV data:', error);
      return { years: [], incidents: [] };
    }
  }

  async initGraph() {
    this.graphContainer = document.getElementById('incidents-graph');
    if (!this.graphContainer) {
      console.error('Graph container not found');
      return;
    }
    
    if (!window.Plotly) {
      console.error('Plotly not loaded');
      this.graphContainer.innerHTML = '<p>Graph library not available. Please refresh the page.</p>';
      return;
    }
    
    try {
      const { years, incidents } = await this.processData();
      
      if (years.length === 0) {
        this.graphContainer.innerHTML = '<p>No data available</p>';
        return;
      }
      
      const initialTrace = {
        x: [years[0]],
        y: [incidents[0]],
        type: 'scatter',
        mode: 'lines+markers',
        marker: { size: 8, color: '#ffffff' },
        line: { width: 3, color: '#ffffff' },
        fill: 'tozeroy',
        fillcolor: 'rgba(255, 255, 255, 0.2)',
        hovertemplate: '%{x} - %{y} incidents<extra></extra>'
      };
      
      const layout = {
        xaxis: {
          title: 'Year',
          tickmode: 'linear',
          tick0: Math.min(...years),
          dtick: 1,
          range: [Math.min(...years), 2024],
          color: 'white',
          titlefont: { color: 'white', family: 'Libre Franklin' },
          tickfont: { color: 'white', family: 'Libre Franklin' },
          showgrid: false,
          zeroline: false
        },
        yaxis: {
          title: 'Number of Incidents',
          range: [0, Math.max(...incidents) * 1.1],
          color: 'white',
          titlefont: { color: 'white', family: 'Libre Franklin' },
          tickfont: { color: 'white', family: 'Libre Franklin' },
          showgrid: false,
          zeroline: false
        },
        hovermode: 'closest',
        margin: { t: 50, r: 50, b: 100, l: 80 },
        autosize: true,
        height: 450,
        dragmode: false,
        plot_bgcolor: '#8A9A5B',
        paper_bgcolor: '#8A9A5B',
        font: { color: 'white', family: 'Libre Franklin' }
      };
      
      const config = {
        responsive: true,
        displayModeBar: true,
        displaylogo: false,
        modeBarButtonsToRemove: [
          'lasso2d', 'select2d', 'zoom2d', 'pan2d', 
          'zoomIn2d', 'zoomOut2d', 'autoScale2d', 'resetScale2d'
        ],
        scrollZoom: false,
        doubleClick: false
      };
      
      Plotly.newPlot(this.graphContainer, [initialTrace], layout, config);
      this.isInitialized = true;
      
    } catch (error) {
      console.error('Error rendering graph:', error);
      this.graphContainer.innerHTML = '<p>Error loading graph data: ' + error.message + '</p>';
    }
  }

  updateGraph(visibleYears) {
    if (!this.isInitialized || visibleYears < 1) return;
    
    visibleYears = Math.min(visibleYears, this.fullYears.length);
    if (visibleYears === this.currentVisibleYears) return;
    
    this.currentVisibleYears = visibleYears;
    
    const updatedX = this.fullYears.slice(0, visibleYears);
    const updatedY = this.fullIncidents.slice(0, visibleYears);
    
    Plotly.animate(this.graphContainer, {
      data: [{ 
        x: updatedX, 
        y: updatedY,
        hovertemplate: '%{x} - %{y} incidents<extra></extra>'
      }]
    }, {
      transition: { duration: 30, easing: 'cubic-out' },
      frame: { duration: 30 }
    });
  }
  
  enableScrollHijacking() {
    if (!this.isScrollHijacked) {
      this.scrollPosition = window.scrollY;
      window.addEventListener('wheel', this.handleWheel, { passive: false });
      document.body.classList.add('scroll-hijacked');
      this.isScrollHijacked = true;
      console.log("Scroll hijacking enabled");
    }
  }
  
  disableScrollHijacking() {
    if (this.isScrollHijacked) {
      window.removeEventListener('wheel', this.handleWheel);
      document.body.classList.remove('scroll-hijacked');
      this.isScrollHijacked = false;
      console.log("Scroll hijacking disabled");
    }
  }
  
  handleWheel(event) {
    event.preventDefault();
    
    const scrollSensitivity = 0.005;
    const minScrollThreshold = 5;
    
    if (Math.abs(event.deltaY) < minScrollThreshold) return;
    
    const isAtStart = this.scrollProgress <= 0 && event.deltaY < 0;
    const isAtEnd = this.scrollProgress >= 1 && event.deltaY > 0;
    
    if (isAtStart || isAtEnd) {
      this.disableScrollHijacking();
      return;
    }
    
    this.scrollProgress = event.deltaY > 0
      ? Math.min(1, this.scrollProgress + scrollSensitivity)
      : Math.max(0, this.scrollProgress - scrollSensitivity);
    
    const yearsToShow = Math.max(1, Math.ceil(this.scrollProgress * this.fullYears.length));
    this.updateGraph(yearsToShow);
  }

  setupScrollObserver() {
    if (!this.graphContainer) return;
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.target === this.graphContainer) {
          const rect = entry.boundingClientRect;
          const windowHeight = window.innerHeight;
          const graphCenter = rect.top + (rect.height / 2);
          const viewportCenter = windowHeight / 2;
          const centerThreshold = 10;
          const isInExactMiddle = Math.abs(graphCenter - viewportCenter) < centerThreshold;
          const isAtStart = this.scrollProgress <= 0 && this.lastScrollY - window.scrollY > 0;
          const isAtEnd = this.scrollProgress >= 1 && this.lastScrollY - window.scrollY < 0;
          const visibleRatio = entry.intersectionRatio;
          
          if (visibleRatio >= 1 && !isInExactMiddle && !this.isScrollHijacked && !isAtStart && !isAtEnd) {
            const scrollSpeed = Math.abs(this.lastScrollY - window.scrollY) || 0;
            if (scrollSpeed > 10) {
              const targetScrollPosition = window.scrollY + (graphCenter - viewportCenter);
              
              window.scrollTo({
                top: targetScrollPosition,
                behavior: 'smooth'
              });
              
              document.body.style.overflow = 'hidden';
              setTimeout(() => {
                document.body.style.overflow = '';
                if (!this.isScrollHijacked) {
                  this.enableScrollHijacking();
                }
              }, 500);
            }
          }
          
          this.lastScrollY = window.scrollY;
        }
      });
    }, {
      threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
      rootMargin: "0px"
    });
    
    this.lastScrollY = window.scrollY;
    
    window.addEventListener('scroll', () => {}, { passive: true });
    observer.observe(this.graphContainer);
  }
}

// Export the component for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TotalIncidentGraph;
}