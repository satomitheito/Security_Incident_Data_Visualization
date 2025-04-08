class RolesBarGraph {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.error(`Container with ID ${containerId} not found`);
      return;
    }
  }

  render() {
    const template = `
      <div class="roles-graph-section">
        <div class="container">
          <p class="graph-title">Victims by Organization Type</p>
          <div class="filter-container">
            <select id="roles-country-select" class="country-dropdown">
              <option value="All">All Countries</option>
            </select>
          </div>
          <div class="graph-container" id="roles-comparison-graph"></div>
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
      
      // Store data by country
      const countryData = {};
      const uniqueCountries = new Set(['All']);
      
      for (let i = 0; i < parsedData.length; i++) {
        const row = parsedData[i];
        
        // Get country value
        const country = row["Country"]?.trim();
        
        if (country && country !== '') {
          uniqueCountries.add(country);
          
          if (!countryData[country]) {
            countryData[country] = {
              UN: 0,
              INGO: 0,
              ICRC: 0,
              'NRCS and IFRC': 0,
              NNGO: 0,
              Other: 0
            };
          }
          
          // Find columns for different organization types
          for (const key in row) {
            if (key.includes("UN")) countryData[country].UN += parseInt(row[key]) || 0;
            if (key.includes("INGO") && !key.includes("NNGO")) countryData[country].INGO += parseInt(row[key]) || 0;
            if (key.includes("ICRC")) countryData[country].ICRC += parseInt(row[key]) || 0;
            if (key.includes("NRCS") || key.includes("IFRC")) countryData[country]['NRCS and IFRC'] += parseInt(row[key]) || 0;
            if (key.includes("NNGO")) countryData[country].NNGO += parseInt(row[key]) || 0;
            if (key.includes("Other")) countryData[country].Other += parseInt(row[key]) || 0;
          }
        }
      }
      
      // Calculate totals for 'All' countries
      countryData['All'] = {
        UN: Object.values(countryData).reduce((sum, data) => sum + data.UN, 0),
        INGO: Object.values(countryData).reduce((sum, data) => sum + data.INGO, 0),
        ICRC: Object.values(countryData).reduce((sum, data) => sum + data.ICRC, 0),
        'NRCS and IFRC': Object.values(countryData).reduce((sum, data) => sum + data['NRCS and IFRC'], 0),
        NNGO: Object.values(countryData).reduce((sum, data) => sum + data.NNGO, 0),
        Other: Object.values(countryData).reduce((sum, data) => sum + data.Other, 0)
      };
      
      // Sort countries alphabetically, keeping 'All' at the top
      const sortedCountries = Array.from(uniqueCountries).sort((a, b) => {
        if (a === 'All') return -1;
        if (b === 'All') return 1;
        return a.localeCompare(b);
      });
      
      this.updateCountryDropdown(sortedCountries);
      
      return countryData;
    } catch (error) {
      console.error('Error processing CSV data:', error);
      return null;
    }
  }

  updateCountryDropdown(countries) {
    const dropdown = document.getElementById('roles-country-select');
    if (!dropdown) return;
    
    dropdown.innerHTML = '';
    countries.forEach(country => {
      const option = document.createElement('option');
      option.value = country;
      option.textContent = country === 'All' ? 'All Countries' : country;
      dropdown.appendChild(option);
    });
    
    dropdown.addEventListener('change', (e) => this.updateGraph(e.target.value));
  }

  async initGraph() {
    this.graphContainer = document.getElementById('roles-comparison-graph');
    if (!this.graphContainer || !window.Plotly) {
      console.error('Graph container or Plotly not found');
      return;
    }
    
    this.data = await this.processData();
    if (!this.data) {
      this.graphContainer.innerHTML = '<p>No data available</p>';
      return;
    }
    
    this.updateGraph('All');
  }

  updateGraph(country) {
    if (!this.data || !this.data[country]) return;
    
    const countryData = this.data[country];
    const trace = {
      x: Object.keys(countryData),
      y: Object.values(countryData),
      type: 'bar',
      marker: {
        color: [
          '#4169E1', // UN - Royal Blue
          '#32CD32', // INGO - Lime Green
          '#FF0000', // ICRC - Red
          '#FFD700', // NRCS and IFRC - Gold
          '#9370DB', // NNGO - Medium Purple
          '#808080'  // Other - Gray
        ],
        line: {
          width: 0  // Remove the border by setting width to 0
        }
      }
    };
    
    const layout = {
      autosize: true,
      xaxis: {
        color: 'white',
        titlefont: { color: 'white', family: 'Libre Franklin', weight: 600 },
        tickfont: { color: 'white', family: 'Libre Franklin', size: 14, weight: 600 },
        showgrid: false,
        tickangle: 0,  // Keep x-axis labels angled
        automargin: true
      },
      yaxis: {
        title: 'Number of Victims',
        color: 'white',
        titlefont: { color: 'white', family: 'Libre Franklin', weight: 600 },
        tickfont: { color: 'white', family: 'Libre Franklin', size: 14, weight: 600 },
        showgrid: false,
        range: [0, Math.max(...Object.values(countryData)) * 1.1],
        automargin: true,
        tickangle: 0  // Set y-axis labels to straight (0 degrees)
      },
      margin: {
        t: 30,
        r: 80,
        b: 150,  // Increased bottom margin for labels
        l: 330,  // Increased left margin for y-axis labels
        pad: 4
      },
      plot_bgcolor: '#8A9A5B',
      paper_bgcolor: '#8A9A5B',
      height: 500,
      bargap: 0.3,
      showlegend: false
    };
    
    const config = {
      responsive: true,
      displayModeBar: false,
      displaylogo: false,
      modeBarButtonsToRemove: ['zoom2d', 'pan2d', 'select2d', 'lasso2d', 'zoomIn2d', 'zoomOut2d', 'autoScale2d'],
      toImageButtonOptions: {
        format: 'png',
        filename: 'roles_chart',
        height: 500,
        width: 700,
        scale: 2
      }
    };
    
    Plotly.newPlot(this.graphContainer, [trace], layout, config);
  }
}

// Export the component for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RolesBarGraph;
}