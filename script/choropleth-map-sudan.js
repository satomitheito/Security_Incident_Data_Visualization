d3.csv("../data/security_incidents.csv").then(data => {
    const incidentsByCountry = {};
  
    // Group by country name
    data.forEach(d => {
      if (d["Country"]) {
        const country = d["Country"];
        incidentsByCountry[country] = (incidentsByCountry[country] || 0) + 1;
      }
    });
  
    // Prepare data for Plotly
    const locations = Object.keys(incidentsByCountry);
    const zValues = Object.values(incidentsByCountry);
    const textValues = locations.map((country, i) => `${country}: ${zValues[i]} incidents`);
  
    const plotData = [{
      type: 'choropleth',
      locationmode: 'country names', // ← same as your Python code
      locations: locations,
      z: zValues,
      text: textValues,
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
        "<b style='font-size: 16px; color: #ffffff; background-color: rgba(255,255,255,0.9)'>%{location}</b><br>" +
        "<span style='font-size: 14px; background-color: rgba(255,255,255,0.9)'>Incidents: <b>%{z}</b></span>" +
        "<extra></extra>",
      zmin: 0
    }];
  
    const layout = {
      geo: {
        projection: { 
          type: 'equirectangular'
        },
        showland: true,
        showcoastlines: false,  // Remove coastlines
        landcolor: '#8A9A5B',   // Changed from #ffffff to #dedede
        showframe: false,
        showcountries: true,
        bgcolor: '#dedede',     // Changed from rgba(0,0,0,0) to #dedede
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
  