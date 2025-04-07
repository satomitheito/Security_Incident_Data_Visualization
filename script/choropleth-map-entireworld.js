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
      colorscale: 'Reds',
      marker: {
        line: {
          color: 'black',
          width: 0.5
        }
      },
      hovertemplate: "<b>%{text}</b><br>Incidents: %{z}<extra></extra>"
    }];
  
    const layout = {
      geo: {
        projection: { type: 'equirectangular' },
        showland: true,
        showcoastlines: true,
        landcolor: '#ffffff',
        showframe: false
      },
      margin: { t: 0, b: 0, l: 0, r: 0 },
      paper_bgcolor: '#DEDEDE',
      plot_bgcolor: '#DEDEDE',
      showlegend: false
    };
  
    Plotly.newPlot('map-container', plotData, layout, {
      responsive: true
    });
  });
  