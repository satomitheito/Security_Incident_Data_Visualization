class LocationChart {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.error(`Container with ID ${containerId} not found`);
      return;
    }
  }

  render() {
    const template = `
      <div class="location-chart-section">
        <div class="container">
          <p class="graph-title">Most Common Incident Locations</p>
          <div class="graph-container" id="location-comparison-graph"></div>
        </div>
      </div>
    `;
    
    this.container.innerHTML = template;
    this.initGraph();
  }

  async processData() {
    try {
      const response = await fetch('data/security_incidents.csv');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const csvData = await response.text();
      
      const parsedData = Papa.parse(csvData, {
        header: true,
        skipEmptyLines: true
      }).data;
      
      // Count frequency of each location
      const locationCounts = {};
      
      parsedData.forEach(row => {
        const location = row.Location?.trim() || 'Unknown';
        locationCounts[location] = (locationCounts[location] || 0) + 1;
      });
      
      // Convert to array and sort by frequency
      return Object.entries(locationCounts)
        .map(([location, count]) => ({ location, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 15); // Take top 15 locations
    } catch (error) {
      console.error('Error processing CSV data:', error);
      return null;
    }
  }

  async initGraph() {
    this.graphContainer = document.getElementById('location-comparison-graph');
    if (!this.graphContainer || !window.Plotly) {
      console.error('Graph container or Plotly not found');
      return;
    }
    
    const data = await this.processData();
    if (!data) {
      this.graphContainer.innerHTML = '<p>No data available</p>';
      return;
    }

    const trace = {
      x: data.map(d => d.count),
      y: data.map(d => d.location),
      type: 'bar',
      orientation: 'h',
      marker: {
        color: '#4ECDC4',
        line: {
          width: 0
        }
      }
    };
    
    const layout = {
      autosize: true,
      xaxis: {
        title: 'Number of Incidents',
        color: 'white',
        titlefont: { color: 'white', family: 'Libre Franklin', weight: 600 },
        tickfont: { color: 'white', family: 'Libre Franklin', size: 14, weight: 600 },
        showgrid: false,
        automargin: true
      },
      yaxis: {
        color: 'white',
        titlefont: { color: 'white', family: 'Libre Franklin', weight: 600 },
        tickfont: { color: 'white', family: 'Libre Franklin', size: 14, weight: 600 },
        showgrid: false,
        automargin: true
      },
      margin: {
        t: 30,
        r: 30,
        b: 50,
        l: 200,
        pad: 4
      },
      plot_bgcolor: '#8A9A5B',
      paper_bgcolor: '#8A9A5B',
      height: 600,
      bargap: 0.2,
      showlegend: false
    };
    
    const config = {
      responsive: true,
      displayModeBar: false,
      displaylogo: false
    };
    
    Plotly.newPlot(this.graphContainer, [trace], layout, config);
  }
}

// Export the component
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LocationChart;
} 