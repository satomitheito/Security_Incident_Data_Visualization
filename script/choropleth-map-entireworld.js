// Load the CSV data
d3.csv("data/security_incidents.csv").then(incidentData => {
    const incidentsByCountry = {};

    incidentData.forEach(d => {
        if (d["Country Code"]) {
            incidentsByCountry[d["Country Code"]] = (incidentsByCountry[d["Country Code"]] || 0) + 1;
        }
    });

    const data = [{
        type: 'choropleth',
        locationmode: 'ISO-3',
        locations: Object.keys(incidentsByCountry),
        z: Object.values(incidentsByCountry),
        text: Object.entries(incidentsByCountry).map(([code, count]) => `${code}: ${count} incidents`),
        colorscale: 'Reds',
        showscale: false,
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
          projection: {
            type: 'equirectangular' // ✅ 2D flat world map
          },
          showcoastlines: true,
          showland: true,
          landcolor: '#ffffff',       // Base color (choropleth fills over this)
          oceancolor: '#DEDEDE',
          lakecolor: '#DEDEDE',
          showocean: true,
          bgcolor: '#DEDEDE',
          showframe: false,
          lataxis: { range: [-60, 90] } // ✅ Remove Antarctica
        },
        paper_bgcolor: '#DEDEDE',
        plot_bgcolor: '#DEDEDE',
        margin: { t: 0, b: 0, l: 0, r: 0 },
        height: window.innerHeight,
        width: window.innerWidth,
        showlegend: false
    };
      

    Plotly.newPlot('map-container', data, layout, {
        responsive: true,
        scrollZoom: true,     // ✅ allows zooming with scroll/trackpad
        displayModeBar: false,
        staticPlot: true,    // ❌ don’t freeze the whole plot
        dragmode: false       
    });
    // Auto-resize on window resize
    window.addEventListener('resize', () => {
        Plotly.relayout('map-container', {
            width: window.innerWidth,
            height: window.innerHeight
        });
    });
});
