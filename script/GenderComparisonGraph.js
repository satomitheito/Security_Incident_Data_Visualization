class GenderComparisonGraph {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.error(`Container with ID ${containerId} not found`);
      return;
    }
    this.countries = ['All'];
    this.data = null;
  }

  render() {
    const template = `
      <div class="gender-comparison-section">
        <div class="container">
          <p class="graph-title">Total Victims by Gender</p>
          <div class="filter-container">
            <select id="country-select" class="country-dropdown">
              <option value="All">All Countries</option>
            </select>
          </div>
          <div class="graph-container" id="gender-comparison-graph"></div>
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
      
      const rows = csvData.split('\n');
      const headers = rows[0].split(',');
      
      // Find relevant column indices
      const countryIndex = headers.findIndex(h => h === "Country");
      const maleIndex = headers.findIndex(h => h.includes("Gender Male"));
      const femaleIndex = headers.findIndex(h => h.includes("Gender Female"));
      const unknownIndex = headers.findIndex(h => h.includes("Gender Unknown"));
      
      // Store data by country
      const countryData = {};
      const uniqueCountries = new Set(['All']);
      
      // Skip header row
      for (let i = 1; i < rows.length; i++) {
        const columns = rows[i].split(',');
        if (columns.length < Math.max(countryIndex, maleIndex, femaleIndex, unknownIndex)) continue;
        
        const country = columns[countryIndex]?.replace(/['"]+/g, '').trim();
        if (country && country !== '') {
          uniqueCountries.add(country);
          
          if (!countryData[country]) {
            countryData[country] = {
              males: 0,
              females: 0,
              unknown: 0
            };
          }
          
          countryData[country].males += parseInt(columns[maleIndex]) || 0;
          countryData[country].females += parseInt(columns[femaleIndex]) || 0;
          countryData[country].unknown += parseInt(columns[unknownIndex]) || 0;
        }
      }
      
      // Calculate totals for 'All' countries
      countryData['All'] = {
        males: Object.values(countryData).reduce((sum, data) => sum + data.males, 0),
        females: Object.values(countryData).reduce((sum, data) => sum + data.females, 0),
        unknown: Object.values(countryData).reduce((sum, data) => sum + data.unknown, 0)
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
    const dropdown = document.getElementById('country-select');
    if (!dropdown) return;
    
    dropdown.innerHTML = ''; // Clear existing options
    
    // Add countries to dropdown
    countries.forEach(country => {
      const option = document.createElement('option');
      option.value = country;
      option.textContent = country === 'All' ? 'All Countries' : country;
      dropdown.appendChild(option);
    });
    
    // Add event listener for dropdown changes
    dropdown.addEventListener('change', (e) => this.updateGraph(e.target.value));
  }

  async initGraph() {
    this.graphContainer = document.getElementById('gender-comparison-graph');
    if (!this.graphContainer || !window.Plotly) {
      console.error('Graph container or Plotly not found');
      return;
    }
    
    // Process data and store it
    this.data = await this.processData();
    if (!this.data) {
      this.graphContainer.innerHTML = '<p>No data available</p>';
      return;
    }
    
    // Initial graph with 'All' countries
    this.updateGraph('All');

    // Add resize observer for the container
    const resizeObserver = new ResizeObserver(() => {
      this.updateGraph(document.getElementById('country-select').value);
    });
    resizeObserver.observe(this.graphContainer);
  }

  updateGraph(country) {
    if (!this.data || !this.data[country]) return;
    
    const countryData = this.data[country];
    const trace = {
      x: ['Gender Male', 'Gender Female', 'Gender Unknown'],
      y: [countryData.males, countryData.females, countryData.unknown],
      type: 'bar',
      marker: {
        color: ['skyblue', 'lightpink', 'gray'],
        line: {
          color: ['skyblue', 'lightpink', 'gray'],
          width: 1
        }
      }
    };
    
    const containerWidth = this.graphContainer.clientWidth;
    
    // Calculate responsive margins based on container width
    const leftMargin = Math.min(150, containerWidth * 0.1); // Further reduced from 200px to 150px and from 15% to 10%
    const rightMargin = Math.min(80, containerWidth * 0.1);
    
    const layout = {
      xaxis: {
        color: 'white',
        titlefont: { color: 'white', family: 'Libre Franklin', weight: 600 },
        tickfont: { color: 'white', family: 'Libre Franklin', size: 14, weight: 600 },
        showgrid: false,
        automargin: true
      },
      yaxis: {
        title: 'Number of Victims',
        color: 'white',
        titlefont: { color: 'white', family: 'Libre Franklin', weight: 600 },
        tickfont: { color: 'white', family: 'Libre Franklin', size: 14, weight: 600 },
        showgrid: false,
        range: [0, Math.max(...trace.y) * 1.1],
        automargin: true // Enable automatic margin adjustment
      },
      margin: {
        t: 30,
        r: rightMargin,
        b: 150,
        l: leftMargin,
        pad: 10,
        autoexpand: true // Allow margins to expand if needed
      },
      plot_bgcolor: 'rgba(138, 154, 91, 1)',
      paper_bgcolor: 'rgba(138, 154, 91, 1)',
      height: 500,
      width: containerWidth,
      bargap: 0.3,
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

// Add some CSS for the dropdown
const style = document.createElement('style');
style.textContent = `
  .filter-container {
    margin: 20px 0;
    text-align: right;
    padding-right: 50px;
    width: 200px;
    float: right;
  }
  
  .country-dropdown {
    padding: 8px 12px;
    font-size: 16px;
    border-color: #ffd700;
    border-radius: 4px;
    background-color: rgba(138, 154, 91, 1);
    color: white;
    cursor: pointer;
    font-family: 'Libre Franklin', sans-serif;
    width: 180px;
  }
  
  .country-dropdown:focus {
    outline: none;
    border-color: #ffd700;
  }
  
  .country-dropdown option {
    background-color: rgba(138, 154, 91, 1);
    color: white;
  }
`;
document.head.appendChild(style);

// Export the component for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GenderComparisonGraph;
} 