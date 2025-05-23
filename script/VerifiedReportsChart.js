class VerifiedReportsMap {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.error(`Container with ID ${containerId} not found`);
      return;
    }
  }

  render() {
    const template = `
      <div class="verified-reports-section">
        <div class="container">
          <p class="map-title">Verification Rates by Country</p>
          <div class="map-container" id="verified-reports-map"></div>
        </div>
      </div>
    `;
    
    this.container.innerHTML = template;
    this.initMap();
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
      
      for (let i = 0; i < parsedData.length; i++) {
        const row = parsedData[i];
        
        // Get country value
        const country = row["Country"]?.trim();
        
        if (country && country !== '') {
          if (!countryData[country]) {
            countryData[country] = {
              verified: 0,
              total: 0
            };
          }
          
          // Find 'Verified' and 'Total' columns
          let verified = 0;
          let total = 0;
          
          for (const key in row) {
            if (key === "Verified") {
              verified = parseInt(row[key]) || 0;
            }
            if (key === "Total") {
              total = parseInt(row[key]) || 0;
            }
          }
          
          countryData[country].verified += verified;
          countryData[country].total += total;
        }
      }
      
      // Calculate percentages
      const percentages = {};
      Object.entries(countryData).forEach(([country, data]) => {
        percentages[country] = (data.verified / data.total * 100) || 0;
      });
      
      return percentages;
    } catch (error) {
      console.error('Error processing CSV data:', error);
      return null;
    }
  }

  async initMap() {
    this.mapContainer = document.getElementById('verified-reports-map');
    if (!this.mapContainer || !window.Plotly) {
      console.error('Map container or Plotly not found');
      return;
    }
    
    const data = await this.processData();
    if (!data) {
      this.mapContainer.innerHTML = '<p>No data available</p>';
      return;
    }

    const countries = Object.keys(data);
    const values = Object.values(data);
    
    const trace = {
      type: 'choropleth',
      locationmode: 'country names',
      locations: countries,
      z: values,
      text: countries.map(country => `${country}<br>${data[country].toFixed(1)}% Verified`),
      colorscale: [
        [0, '#ffe5e5'],
        [0.5, '#ff4d4d'],
        [1, '#800000']
      ],
      colorbar: {
        title: 'Verification Rate (%)',
        thickness: 20,
        len: 0.5,
        y: 0.5,
        tickfont: { color: 'white' },
        titlefont: { color: 'white' }
      },
      zmin: 0,
      zmax: 100,
      hoverinfor: 'location+z+text'
    };
    
    const layout = {
      geo: {
        showframe: false,
        showcoastlines: true,
        projection: {
          type: 'equirectangular'
        },
        bgcolor: 'rgba(138, 154, 91, 1)'
      },
      margin: {
        t: 0,
        b: 0,
        l: 0,
        r: 0
      },
      paper_bgcolor: 'rgba(138, 154, 91, 1)',
      plot_bgcolor: 'rgba(138, 154, 91, 1)',
      height: 600,
      width: null // This will make it responsive
    };
    
    const config = {
      responsive: true,
      displayModeBar: false,
      displaylogo: false
    };
    
    Plotly.newPlot(this.mapContainer, [trace], layout, config);
  }
}

// Export the component
if (typeof module !== 'undefined' && module.exports) {
  module.exports = VerifiedReportsMap;
} 