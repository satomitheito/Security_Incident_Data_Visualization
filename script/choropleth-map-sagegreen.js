d3.csv("../data/security_incidents.csv").then(data => {
    const allCountries = {};
  
    // Set all countries to 1 for uniform sage green
    data.forEach(d => {
      if (d["Country"]) {
        const country = d["Country"];
        allCountries[country] = 1;  // Set value to 1 for all countries
      }
    });
    
    const plotData = [{
      type: 'choropleth',
      locationmode: 'country names',
      locations: Object.keys(allCountries),
      z: Object.values(allCountries),
      colorscale: [[0, '#8A9A5B'], [1, '#8A9A5B']], // Sage green for all countries
      showscale: false,
      marker: {
        line: {
          color: '#999999',
          width: 1.5
        }
      },
      hovertemplate: "<extra></extra>",  // Empty hover template
      zmin: 0
    }];
  
    const layout = {
      geo: {
        projection: { 
          type: 'equirectangular'
        },
        showland: true,
        showcoastlines: false,  // Remove coastlines
        landcolor: '#dedede',   // Light gray for uncovered areas
        showframe: false,
        showcountries: true,
        bgcolor: '#dedede',     // Light gray background
        margin: { t: 0, b: 0, l: 0, r: 0 },
        lataxis: {
          range: [-55, 80],
          fixedrange: true  // Prevent latitude dragging
        },
        lonaxis: {
          range: [-150, 180],
          fixedrange: true  // Prevent longitude dragging
        },
        dragmode: false  // Disable dragging
      },
      margin: { t: 0, b: 0, l: 0, r: 0, pad: 0 },
      paper_bgcolor: '#dedede',
      plot_bgcolor: '#dedede',
      showlegend: false,
      autosize: true,
      dragmode: false  // Disable dragging at layout level
    };
  
    Plotly.newPlot('map-container', plotData, layout, {
      responsive: true,
      displayModeBar: false,
      scrollZoom: false,
      dragmode: false,  // Disable dragging in config
      staticPlot: false  
    });
  });
  