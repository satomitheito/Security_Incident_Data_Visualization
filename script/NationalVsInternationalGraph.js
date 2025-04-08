class NationalVsInternationalGraph {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.error(`Container with ID ${containerId} not found`);
      return;
    }
    
    // Store data and state
    this.years = [];
    this.nationalIncidents = [];
    this.internationalIncidents = [];
    this.graphContainer = null;
    this.isInitialized = false;
  }

  render() {
    const template = `
      <div class="national-international-graph-section">
        <div class="container">
          <p class="graph-title">National vs International Incidents By Year</p>
          <div class="graph-container" id="comparison-graph"></div>
        </div>
      </div>
    `;
    
    this.container.innerHTML = template;
    this.initGraph();
  }

  async processData() {
    try {
      const response = await fetch('data/security_incidents.csv');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const csvData = await response.text();
      
      // Use Papa Parse instead of custom parsing
      const parsedData = Papa.parse(csvData, {
        header: true,
        skipEmptyLines: true
      }).data;
 
      const yearlyData = {};
      
      // Process each row in the parsed data
      for (let i = 0; i < parsedData.length; i++) {
        const row = parsedData[i];
        
        // Find the columns that contain our target data
        let yearValue = null;
        let nationalsValue = 0;
        let internationalsValue = 0;
        
        // Identify the columns for year and the two metrics
        for (const key in row) {
          if (key.includes("Year")) {
            yearValue = row[key];
          }
          if (key.includes("Total nationals")) {
            nationalsValue = parseInt(row[key]) || 0;
          }
          if (key.includes("Total internationals")) {
            internationalsValue = parseInt(row[key]) || 0;
          }
        }
        
        const year = parseInt(yearValue);
        
        if (!isNaN(year) && year <= 2024) {
          if (!yearlyData[year]) {
            yearlyData[year] = { nationals: 0, internationals: 0 };
          }
          yearlyData[year].nationals += nationalsValue;
          yearlyData[year].internationals += internationalsValue;
        }
      }
      
      
      this.years = Object.keys(yearlyData).map(Number).sort((a, b) => a - b);
      this.nationalIncidents = this.years.map(year => yearlyData[year].nationals);
      this.internationalIncidents = this.years.map(year => yearlyData[year].internationals);
      
      return {
        years: this.years,
        national: this.nationalIncidents,
        international: this.internationalIncidents
      };
    } catch (error) {
      console.error('Error processing CSV data:', error);
      return { years: [], national: [], international: [] };
    }
  }

  async initGraph() {
    this.graphContainer = document.getElementById('comparison-graph');
    if (!this.graphContainer || !window.Plotly) {
      console.error('Graph container or Plotly not found');
      return;
    }
    
    try {
      const { years, national, international } = await this.processData();
      
      if (years.length === 0) {
        this.graphContainer.innerHTML = '<p>No data available</p>';
        return;
      }
      
      const nationalTrace = {
        x: years,
        y: national,
        type: 'scatter',
        mode: 'lines+markers',
        name: 'National',
        marker: { size: 8, color: '#ffffff' },
        line: { width: 3, color: '#ffffff' },
        hovertemplate: '%{x} - %{y} national incidents<extra></extra>'
      };
      
      const internationalTrace = {
        x: years,
        y: international,
        type: 'scatter',
        mode: 'lines+markers',
        name: 'International',
        marker: { size: 8, color: '#ffd700' },
        line: { width: 3, color: '#ffd700' },
        hovertemplate: '%{x} - %{y} international incidents<extra></extra>'
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
          zeroline: false,
          tickangle: -45
        },
        yaxis: {
          title: 'Number of Incidents',
          range: [0, Math.max(...national, ...international) * 1.1],
          color: 'white',
          titlefont: { color: 'white', family: 'Libre Franklin' },
          tickfont: { color: 'white', family: 'Libre Franklin' },
          showgrid: false,
          zeroline: false
        },
        showlegend: true,
        legend: {
          font: { color: 'white', family: 'Libre Franklin' },
          bgcolor: 'transparent'
        },
        hovermode: 'closest',
        margin: { t: 50, r: 50, b: 100, l: 120, pad: 10 },
        autosize: true,
        height: 450,
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
        ]
      };
      
      Plotly.newPlot(this.graphContainer, [nationalTrace, internationalTrace], layout, config);
      this.isInitialized = true;
      
    } catch (error) {
      console.error('Error rendering graph:', error);
      this.graphContainer.innerHTML = '<p>Error loading graph data: ' + error.message + '</p>';
    }
  }
}

// Export the component for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NationalVsInternationalGraph;
}
