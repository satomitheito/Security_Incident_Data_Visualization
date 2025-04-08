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
          <div class="graph-flex-container">
            <div class="graph-container" id="incidents-graph"></div>
            <div class="context-box" id="incident-context-box">
              <h3 class="context-title">Historical Context</h3>
              <div class="context-content">
                <p>Scroll through the timeline to see key events in humanitarian security.</p>
              </div>
            </div>
          </div>
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
      
      // Use Papa Parse instead of custom parsing
      const parsedData = Papa.parse(csvData, {
        header: true,
        skipEmptyLines: true
      }).data;
      
      const yearlyIncidents = {};
      
      // Process each row in the parsed data
      for (let i = 0; i < parsedData.length; i++) {
        const row = parsedData[i];
        // Find the year value - look for a field that might contain "Year"
        let yearValue = null;
        for (const key in row) {
          if (key.includes("Year")) {
            yearValue = row[key];
            break;
          }
        }
        
        const year = parseInt(yearValue);
        
        if (!isNaN(year) && year <= 2024) {
          yearlyIncidents[year] = (yearlyIncidents[year] || 0) + 1;
        }
      }
      
      const years = Object.keys(yearlyIncidents).map(Number).sort((a, b) => a - b);
      const incidents = years.map(year => yearlyIncidents[year]);
      
      this.fullYears = years;
      this.fullIncidents = incidents;
      
      // Define historical context for key years
      this.historicalContext = {
        2003: {
          title: "UN Baghdad Headquarters Bombing",
          keyDriver: "The bombing of the UN headquarters at the Canal Hotel in Baghdad (August 2003) was a watershed moment in humanitarian security. The attack killed the UN Special Representative in Iraq (Sérgio Vieira de Mello) and over 20 others, underscoring a new era in which aid workers and their offices became explicit targets.",
          context: "The U.S.-led invasion of Iraq in March 2003 triggered a surge in violence and instability. Humanitarian personnel found themselves on the front lines in a fluid insurgent environment with declining acceptance from armed groups."
        },
        2008: {
          title: "Increased Attacks in Afghanistan and Somalia",
          keyDriver: "Marked increases in attacks against aid workers in Afghanistan and Somalia, among other conflict-affected areas.",
          context: "The \"global war on terror\" was still in full swing, with Afghanistan seeing escalating Taliban attacks. Somalia's security environment deteriorated significantly following the Ethiopian intervention (2006–2009), leading to kidnappings and targeted killings of aid staff."
        },
        2013: {
          title: "Peak Violence in Multiple Regions",
          keyDriver: "Peak in recorded violent incidents against humanitarian workers in several theaters, including Syria, Afghanistan, and parts of East Africa.",
          context: "By 2013, the Syrian civil war was well underway. Aid workers delivering assistance in opposition-held or contested areas faced abductions, shelling, and crossfire incidents. Simultaneously, Afghanistan continued to experience high casualty rates among humanitarian staff."
        },
        2022: {
          title: "Ukraine Conflict and Global Emergencies",
          keyDriver: "Large-scale, high-intensity conflict in Ukraine and continued complex emergencies elsewhere.",
          context: "Russia's invasion of Ukraine in February 2022 set off a massive humanitarian response in an active warzone, where front lines shifted rapidly. Humanitarian workers in Ukraine faced threats from shelling, the dangers of operating close to major combat operations, and the logistical challenges of accessing communities under occupation or siege. Meanwhile, countries such as Yemen, Ethiopia (Tigray region), and Myanmar also continued to see high security risks for aid providers."
        }
      };
      
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
        margin: { t: 60, r: 60, b: 110, l: 90 },
        autosize: true,
        height: 450,
        dragmode: false,
        plot_bgcolor: '#8A9A5B',
        paper_bgcolor: '#8A9A5B',
        font: { color: 'white', family: 'Libre Franklin' },
        annotations: [],  // We'll populate this in updateGraph
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
      
      // Add event listener for clicking on annotations (stars)
      this.graphContainer.on('plotly_clickannotation', (eventData) => {
        // Extract year from the x coordinate of the clicked annotation
        const clickedYear = eventData.annotation.x;
        
        // Update context box for the clicked year
        if (this.historicalContext[clickedYear]) {
          this.updateContextBoxForYear(clickedYear);
        }
      });
      
      // Add some additional CSS for our new elements
      const style = document.createElement('style');
      style.textContent = `
        .graph-flex-container {
          display: flex;
          flex-direction: row;
          flex-wrap: wrap;
          gap: 20px;
          align-items: stretch;
          padding-right: 15px;
        }
        
        .graph-container {
          flex: 3;
          min-width: 300px;
        }
        
        .context-box {
          flex: 1;
          min-width: 250px;
          background-color: rgba(0, 0, 0, 0.7);
          border: 1px solid #FFD700;
          border-radius: 5px;
          padding: 20px;
          margin-right: 15px;
          color: white;
          height: auto;
          transition: all 0.3s ease;
          box-sizing: border-box;
        }
        
        .context-box.active {
          box-shadow: 0 0 10px #FFD700;
        }
        
        .context-title {
          margin-top: 0;
          color: #FFD700;
          border-bottom: 1px solid #FFD700;
          padding-bottom: 8px;
          font-family: 'Libre Franklin', sans-serif;
        }
        
        .context-content h4 {
          color: #FFD700;
          margin: 10px 0 5px;
          font-family: 'Libre Franklin', sans-serif;
        }
        
        .context-content p {
          margin: 0 0 10px;
          line-height: 1.4;
          font-family: 'Libre Franklin', sans-serif;
        }
      `;
      document.head.appendChild(style);
      
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
    
    // Get the most recent year shown on graph
    const currentYear = updatedX[updatedX.length - 1];
    
    // Update context box if it's a key year
    this.updateContextBox(currentYear);
    
    // Create annotations for key years
    const annotations = this.createKeyYearAnnotations(updatedX, updatedY);
    
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
    
    // Update annotations
    Plotly.relayout(this.graphContainer, {
      annotations: annotations
    });
  }
  
  updateContextBox(currentYear) {
    const contextBox = document.getElementById('incident-context-box');
    if (!contextBox) return;
    
    // Find the nearest key year less than or equal to current year
    const keyYears = Object.keys(this.historicalContext).map(Number).sort((a, b) => a - b);
    let relevantYear = null;
    
    for (let i = 0; i < keyYears.length; i++) {
      if (keyYears[i] <= currentYear) {
        relevantYear = keyYears[i];
      } else {
        break;
      }
    }
    
    if (relevantYear && this.historicalContext[relevantYear]) {
      this.updateContextBoxForYear(relevantYear);
    } else {
      contextBox.innerHTML = `
        <h3 class="context-title">Historical Context</h3>
        <div class="context-content">
          <p>Scroll through the timeline to see key events in humanitarian security.</p>
        </div>
      `;
      contextBox.classList.remove('active');
    }
  }
  
  // New method to update context box for a specific year
  updateContextBoxForYear(year) {
    const contextBox = document.getElementById('incident-context-box');
    if (!contextBox || !this.historicalContext[year]) return;
    
    const context = this.historicalContext[year];
    contextBox.innerHTML = `
      <h3 class="context-title">${year}: ${context.title}</h3>
      <div class="context-content">
        <h4>Key Driver</h4>
        <p>${context.keyDriver}</p>
        <h4>Context</h4>
        <p>${context.context}</p>
      </div>
    `;
    contextBox.classList.add('active');
    
    // Add a visual highlight effect when clicking a star
    contextBox.classList.add('highlight');
    setTimeout(() => {
      contextBox.classList.remove('highlight');
    }, 500);
  }
  
  createKeyYearAnnotations(visibleYears, visibleIncidents) {
    const annotations = [];
    
    // Only add annotations for key years that are currently visible
    Object.keys(this.historicalContext).forEach(year => {
      const numYear = parseInt(year);
      const yearIndex = visibleYears.indexOf(numYear);
      
      if (yearIndex !== -1) {
        annotations.push({
          x: numYear,
          y: visibleIncidents[yearIndex],
          xref: 'x',
          yref: 'y',
          text: '★',
          showarrow: true,
          arrowhead: 2,
          arrowsize: 1,
          arrowwidth: 2,
          arrowcolor: '#FFD700',
          font: {
            color: '#FFD700',
            size: 16
          },
          align: 'center',
          bgcolor: 'rgba(0,0,0,0.7)',
          bordercolor: '#FFD700',
          borderwidth: 1,
          borderpad: 4,
          opacity: 0.8,
          clicktoshow: false, // Ensure clicking doesn't toggle visibility
          captureevents: true // Ensure clicks are captured
        });
      }
    });
    
    return annotations;
  }
  
  enableScrollHijacking() {
    if (!this.isScrollHijacked) {
      this.scrollPosition = window.scrollY;
      window.addEventListener('wheel', this.handleWheel, { passive: false });
      document.body.classList.add('scroll-hijacked');
      this.isScrollHijacked = true;
    }
  }
  
  disableScrollHijacking() {
    if (this.isScrollHijacked) {
      window.removeEventListener('wheel', this.handleWheel);
      document.body.classList.remove('scroll-hijacked');
      this.isScrollHijacked = false;
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