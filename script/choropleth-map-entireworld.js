d3.csv("../data/security_incidents.csv").then(data => {
    const incidentsByCountry = {};
    const killedByCountry = {};
    const affectedByCountry = {};
  
    // Group by country name
    data.forEach(d => {
      if (d["Country"]) {
        const country = d["Country"];
        incidentsByCountry[country] = (incidentsByCountry[country] || 0) + 1;
        
        // Sum up total killed
        const killed = parseInt(d["Total killed"]) || 0;
        killedByCountry[country] = (killedByCountry[country] || 0) + killed;
        
        // Sum up total affected
        const affected = parseInt(d["Total affected"]) || 0;
        affectedByCountry[country] = (affectedByCountry[country] || 0) + affected;
      }
    });
  
    // Prepare data for Plotly
    const locations = Object.keys(incidentsByCountry);
    const zValues = Object.values(incidentsByCountry);
    const killedValues = locations.map(country => killedByCountry[country] || 0);
    const affectedValues = locations.map(country => affectedByCountry[country] || 0);
    const textValues = locations.map((country, i) => 
      `${country}: ${zValues[i]} incidents, ${killedValues[i]} killed, ${affectedValues[i]} affected`
    );
  
    const plotData = [{
      type: 'choropleth',
      locationmode: 'country names',
      locations: locations,
      z: zValues,
      text: textValues,
      customdata: locations.map((country, i) => ({
        killed: killedValues[i],
        affected: affectedValues[i]
      })),
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
        "<span style='font-size: 14px; background-color: rgba(255,255,255,0.9)'>Incidents: <b>%{z}</b></span><br>" +
        "<span style='font-size: 14px; background-color: rgba(255,255,255,0.9)'>Deaths: <b>%{customdata.killed}</b></span><br>" +
        "<span style='font-size: 14px; background-color: rgba(255,255,255,0.9)'>Personnel affected: <b>%{customdata.affected}</b></span>" +
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
        bgcolor: '#dedede',
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
      paper_bgcolor: '#dedede',
      plot_bgcolor: '#dedede',
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
        // Calculate normalized position within the viewable area (0 to 1)
        // When element first enters view from bottom: normalized = 0
        // When element is about to exit view from top: normalized = 1
        const totalHeight = highlightSection.offsetHeight;
        const viewportHeight = window.innerHeight;
        
        // Calculate how much of the section has been scrolled past
        // This will be negative when the section is below viewport, then 0 to totalHeight as we scroll through
        const scrolledPast = viewportHeight - rect.top;
        
        // Normalize to 0-1 range based on how far through the section we've scrolled
        const normalizedScroll = Math.max(0, Math.min(1, scrolledPast / (totalHeight + viewportHeight)));
        
        // Define thresholds for each country
        const thresholds = [
          0.35,  // Show main map until 25% scrolled
          0.55,   // Show Sudan from 25% to 50%
          0.7   // Show Syria from 50% to 75%, Somalia after 75%
        ];
        
        // Determine which section to show
        let sectionIndex = 0;
        let currentCountry = '';
        
        if (normalizedScroll < thresholds[0]) {
          // Show main map
          document.getElementById('map-container').style.display = 'block';
          document.getElementById('sudan-map-container').style.display = 'none';
          document.getElementById('syria-map-container').style.display = 'none';
          document.getElementById('somalia-map-container').style.display = 'none';
          infoBox.classList.remove('visible');
          return;
        } else if (normalizedScroll < thresholds[1]) {
          sectionIndex = 0; // Sudan
          currentCountry = 'sudan';
        } else if (normalizedScroll < thresholds[2]) {
          sectionIndex = 1; // Syria
          currentCountry = 'syria';
        } else {
          sectionIndex = 2; // Somalia
          currentCountry = 'somalia';
        }

        // Update text content
        infoBox.innerHTML = `
          <h2>${textSections[sectionIndex].title}</h2>
          <p>${textSections[sectionIndex].content}</p>
        `;

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

        // Show info box
        infoBox.classList.add('visible');
      } else {
        // Show main map when section is not visible
        document.getElementById('map-container').style.display = 'block';
        document.getElementById('sudan-map-container').style.display = 'none';
        document.getElementById('syria-map-container').style.display = 'none';
        document.getElementById('somalia-map-container').style.display = 'none';
        
        // Hide info box
        infoBox.classList.remove('visible');
      }
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
  