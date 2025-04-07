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
      locationmode: 'country names',
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

    // Create Sudan-focused data
    const sudanData = [{
      type: 'choropleth',
      locationmode: 'country names',
      locations: ['South Sudan'],
      z: [1],
      text: ['South Sudan'],
      colorscale: [[0, '#b300ff'], [1, '#b300ff']], // Bright purple for Sudan
      showscale: false,
      marker: {
        line: {
          color: '#999999',
          width: 1.5
        }
      },
      name: ''
    }];

    const syriaData = [{
      type: 'choropleth',
      locationmode: 'country names',
      locations: ['Syrian Arab Republic'],
      z: [1],
      text: ['Syrian Arab Republic'],
      colorscale: [[0, '#00b3ff'], [1, '#00b3ff']], 
      showscale: false,
      marker: {
        line: {
          color: '#999999',
          width: 1.5
        }
      },
      name: ''
    }];

    const somaliaData = [{
        type: 'choropleth',
        locationmode: 'country names',
        locations: ['Somalia'],
        z: [1],
        text: ['Somalia'],
        colorscale: [[0, '#ff6a00'], [1, '#ff6a00']], 
        showscale: false,
        marker: {
          line: {
            color: '#999999',
            width: 1.5
          }
        },
        name: ''
    }];
  
    const mainLayout = {
      geo: {
        projection: { 
          type: 'equirectangular'
        },
        showland: true,
        showcoastlines: true,
        landcolor: '#8A9A5B',
        showframe: false,
        showcountries: true,
        bgcolor: 'rgba(0,0,0,0)',
        margin: { t: 0, b: 0, l: 0, r: 0 },
        lataxis: {
          range: [-55, 80]
        },
        lonaxis: {
          range: [-180, 180]
        },
        dragmode: false  // Disable dragging on the geo component
      },
      margin: { t: 0, b: 0, l: 0, r: 0, pad: 0 },
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      showlegend: false,
      autosize: true,
      width: window.innerWidth,
      height: window.innerHeight,
      dragmode: false  // Disable dragging globally
    };

    // Create both maps initially
    Plotly.newPlot('map-container', plotData, mainLayout, {
      responsive: true,
      displayModeBar: false,
      scrollZoom: false,
      staticPlot: false // This will disable all interactions
    });

    // Create containers for all focus maps
    const sudanContainer = document.createElement('div');
    sudanContainer.id = 'sudan-map-container';
    sudanContainer.style.cssText = `
      display: none;
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100vh;
    `;
    document.getElementById('map-container').parentNode.appendChild(sudanContainer);

    const syriaContainer = document.createElement('div');
    syriaContainer.id = 'syria-map-container';
    syriaContainer.style.cssText = `
      display: none;
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100vh;
    `;
    document.getElementById('map-container').parentNode.appendChild(syriaContainer);

    const somaliaContainer = document.createElement('div');
    somaliaContainer.id = 'somalia-map-container';
    somaliaContainer.style.cssText = `
      display: none;
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100vh;
    `;
    document.getElementById('map-container').parentNode.appendChild(somaliaContainer);

    // Create info box
    const infoBox = document.createElement('div');
    infoBox.className = 'sudan-info-box';
    
    const textSections = [
      {
        title: "South Sudan",
        content: "In April 28th 2012, three internationals and one national working on a UN demining project were abducted by militia (dressed in SPLA uniforms) from Unity South Sudan, brought to Kahrtoum, and held until 20 May.",
        country: "sudan"
      },
      {
        title: "Syrian Arab Republic",
        content: "In March 6th 2025, one UN aid worker was shot and killed when caught in a crossfire in Jableh, driving to Latakia, Latakia governorate.",
        country: "syria"
      },
      {
        title: "Somalia",
        content: "In October 21st 2021, one NGO staff member was shot and killed by a militia member after refusing a food ration card the perpetrator was not entitled to.",
        country: "somalia"
      }
    ];

    // Set initial content
    infoBox.innerHTML = `
      <h2>${textSections[0].title}</h2>
      <p>${textSections[0].content}</p>
    `;
    document.getElementById('map-container').parentNode.appendChild(infoBox);

    // Create all focus maps with the same settings
    Plotly.newPlot('sudan-map-container', sudanData, mainLayout, {
      responsive: true,
      displayModeBar: false,
      scrollZoom: false,
      staticPlot: true
    });

    Plotly.newPlot('syria-map-container', syriaData, mainLayout, {
      responsive: true,
      displayModeBar: false,
      scrollZoom: false,
      staticPlot: true
    });

    Plotly.newPlot('somalia-map-container', somaliaData, mainLayout, {
      responsive: true,
      displayModeBar: false,
      scrollZoom: false,
      staticPlot: true
    });

    // Add scroll event listener to switch between maps
    window.addEventListener('scroll', () => {
      const highlightSection = document.querySelector('.highlight-section');
      if (!highlightSection) return;

      const rect = highlightSection.getBoundingClientRect();
      const isVisible = rect.top < window.innerHeight && rect.bottom >= 0;

      if (isVisible) {
        // Calculate which text section to show based on scroll position
        const sectionHeight = highlightSection.offsetHeight;
        const scrollPosition = Math.abs(rect.top);
        const sectionIndex = Math.min(
          Math.floor((scrollPosition / sectionHeight) * textSections.length),
          textSections.length - 1
        );

        // Update text content
        infoBox.innerHTML = `
          <h2>${textSections[sectionIndex].title}</h2>
          <p>${textSections[sectionIndex].content}</p>
        `;

        // Determine which map to show based on the current section
        const currentCountry = textSections[sectionIndex].country;
        
        // Update info box color based on country
        const colors = {
          'sudan': '#6d029c',
          'syria': '#00b3ff',
          'somalia': '#ff6a00'
        };
        infoBox.style.backgroundColor = colors[currentCountry];

        // Hide all maps first
        document.getElementById('map-container').style.display = 'none';
        document.getElementById('sudan-map-container').style.display = 'none';
        document.getElementById('syria-map-container').style.display = 'none';
        document.getElementById('somalia-map-container').style.display = 'none';
        
        // Show the appropriate map
        if (currentCountry === 'sudan') {
          document.getElementById('sudan-map-container').style.display = 'block';
        } else if (currentCountry === 'syria') {
          document.getElementById('syria-map-container').style.display = 'block';
        } else if (currentCountry === 'somalia') {
          document.getElementById('somalia-map-container').style.display = 'block';
        }

        // Update map data to disable interactions
        const noInteractionData = {
          hoverinfo: 'skip',
          hoverlabel: { bgcolor: 'transparent' },
          enableMouseEvents: false
        };
        
        if (currentCountry === 'sudan') {
          Plotly.update('sudan-map-container', noInteractionData, mainLayout);
        } else if (currentCountry === 'syria') {
          Plotly.update('syria-map-container', noInteractionData, mainLayout);
        } else if (currentCountry === 'somalia') {
          Plotly.update('somalia-map-container', noInteractionData, mainLayout);
        }
      } else {
        // Show main map when section is not visible
        document.getElementById('map-container').style.display = 'block';
        document.getElementById('sudan-map-container').style.display = 'none';
        document.getElementById('syria-map-container').style.display = 'none';
        document.getElementById('somalia-map-container').style.display = 'none';
      }
      
      // Toggle info box visibility
      infoBox.classList.toggle('visible', isVisible);
    });

    // Add window resize event listener to update map sizes
    window.addEventListener('resize', () => {
      const updateLayout = {
        width: window.innerWidth,
        height: window.innerHeight
      };
      Plotly.relayout('map-container', updateLayout);
      Plotly.relayout('sudan-map-container', updateLayout);
      Plotly.relayout('syria-map-container', updateLayout);
      Plotly.relayout('somalia-map-container', updateLayout);
    });
  });
  