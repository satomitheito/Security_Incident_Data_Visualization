d3.csv("../data/security_incidents.csv").then(data => {
    const incidentsByCountry = {};
    const sageGreenCountries = {};
  
    // Group by country name and set all countries to sage green except Sudan
    data.forEach(d => {
      if (d["Country"]) {
        const country = d["Country"];
        // Only count incidents for Sudan
        if (country === "Sudan") {
          incidentsByCountry[country] = (incidentsByCountry[country] || 0) + 1;
        }
        // Set all other countries to 1 for sage green
        sageGreenCountries[country] = 1;
      }
    });

    // Delete Sudan from sageGreenCountries to prevent overlap
    delete sageGreenCountries["Sudan"];
    
    // Create arrays for both datasets
    const sudanData = [{
      type: 'choropleth',
      locationmode: 'country names',
      locations: Object.keys(incidentsByCountry),
      z: Object.values(incidentsByCountry),
      text: Object.keys(incidentsByCountry).map(country => `${country}: ${incidentsByCountry[country]} incidents`),
      colorscale: [
        [0, '#ffebe6'],    // Lightest red
        [0.2, '#ffb3b3'],  // Light red
        [0.4, '#ff8080'],  // Medium-light red
        [0.6, '#ff4d4d'],  // Medium red
        [0.8, '#ff1a1a'],  // Medium-dark red
        [1, '#cc0000']     // Darkest red
      ],
      showscale: false,
      marker: {
        line: {
          color: '#999999',
          width: 1.5
        }
      },
      hovertemplate: 
        "<b style='font-size: 16px; color: #000000; background-color: rgba(255,255,255,0.9)'>%{location}</b><br>" +
        "<span style='font-size: 14px; background-color: rgba(255,255,255,0.9)'>Incidents: <b>%{z}</b></span>" +
        "<extra></extra>",
      zmin: 0
    }];

    const sageGreenData = [{
      type: 'choropleth',
      locationmode: 'country names',
      locations: Object.keys(sageGreenCountries),
      z: Object.values(sageGreenCountries),
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

    const plotData = [...sageGreenData, ...sudanData];  // Combine both datasets, Sudan on top
  
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
  