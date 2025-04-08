d3.csv("../data/security_incidents.csv").then(data => {
    // Organize data by year and country
    const incidentsByYearAndCountry = {};
    const killedByYearAndCountry = {};
    const affectedByYearAndCountry = {};
    const availableYears = new Set();
    
    // Group by year and country name
    data.forEach(d => {
      if (d["Country"] && d["Year"]) {
        const country = d["Country"];
        const year = parseInt(d["Year"]);
        
        if (!isNaN(year)) {
          availableYears.add(year);
          
          // Initialize year objects if they don't exist
          if (!incidentsByYearAndCountry[year]) {
            incidentsByYearAndCountry[year] = {};
            killedByYearAndCountry[year] = {};
            affectedByYearAndCountry[year] = {};
          }
          
          // Count incidents by year and country
          incidentsByYearAndCountry[year][country] = (incidentsByYearAndCountry[year][country] || 0) + 1;
          
          // Sum up total killed by year and country
          const killed = parseInt(d["Total killed"]) || 0;
          killedByYearAndCountry[year][country] = (killedByYearAndCountry[year][country] || 0) + killed;
          
          // Sum up total affected by year and country
          const affected = parseInt(d["Total affected"]) || 0;
          affectedByYearAndCountry[year][country] = (affectedByYearAndCountry[year][country] || 0) + affected;
        }
      }
    });
    
    // Create aggregate data (all years) for initial view
    const incidentsByCountry = {};
    const killedByCountry = {};
    const affectedByCountry = {};
  
    // Aggregate data across all years
    Object.values(incidentsByYearAndCountry).forEach(yearData => {
      Object.entries(yearData).forEach(([country, count]) => {
        incidentsByCountry[country] = (incidentsByCountry[country] || 0) + count;
      });
    });
    
    Object.values(killedByYearAndCountry).forEach(yearData => {
      Object.entries(yearData).forEach(([country, count]) => {
        killedByCountry[country] = (killedByCountry[country] || 0) + count;
      });
    });
    
    Object.values(affectedByYearAndCountry).forEach(yearData => {
      Object.entries(yearData).forEach(([country, count]) => {
        affectedByCountry[country] = (affectedByCountry[country] || 0) + count;
      });
    });
    
    // Sort years chronologically
    const yearsList = Array.from(availableYears).sort((a, b) => a - b);
    let selectedYear = null; // No year filter initially (show all data)
    
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

    // Create year slider
    const createYearSlider = () => {
      const timelineContainer = document.createElement('div');
      timelineContainer.id = 'timeline-container';
      timelineContainer.style.cssText = `
        position: absolute;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        width: 70%;
        background-color: rgba(0, 0, 0, 0.5);
        color: white;
        padding: 8px 12px;
        border-radius: 8px;
        font-family: sans-serif;
        opacity: 0;
        transition: opacity 0.6s ease;
        z-index: 1000;
        display: flex;
        flex-direction: column;
        align-items: center;
        backdrop-filter: blur(3px);
        border: 1px solid rgba(255, 255, 255, 0.2);
      `;
      
      const sliderLabel = document.createElement('div');
      sliderLabel.style.cssText = `
        font-size: 14px;
        margin-bottom: 6px;
        font-weight: bold;
        width: 100%;
        display: flex;
        justify-content: space-between;
      `;
      
      const minYearLabel = document.createElement('span');
      minYearLabel.textContent = '1997';
      minYearLabel.style.cssText = `
        opacity: 0.7;
        font-size: 12px;
      `;
      
      const yearDisplay = document.createElement('span');
      yearDisplay.id = 'year-display';
      yearDisplay.textContent = 'All Years (1997-2024)';
      yearDisplay.style.cssText = `
        color: #ffcc00;
        font-size: 16px;
      `;
      
      const maxYearLabel = document.createElement('span');
      maxYearLabel.textContent = '2024';
      maxYearLabel.style.cssText = `
        opacity: 0.7;
        font-size: 12px;
      `;
      
      sliderLabel.appendChild(minYearLabel);
      sliderLabel.appendChild(yearDisplay);
      sliderLabel.appendChild(maxYearLabel);
      
      const sliderContainer = document.createElement('div');
      sliderContainer.style.cssText = `
        width: 100%;
        display: flex;
        align-items: center;
      `;
      
      const slider = document.createElement('input');
      slider.type = 'range';
      slider.min = 1997;
      slider.max = 2024;
      slider.step = 1;
      slider.value = 0; // Special value for "all years"
      slider.style.cssText = `
        width: 100%;
        margin: 0 10px;
        cursor: pointer;
        height: 4px;
        -webkit-appearance: none;
        appearance: none;
        background: rgba(255, 255, 255, 0.4);
        border-radius: 2px;
        outline: none;
      `;
      
      // Add custom styles for the slider thumb
      const thumbStyles = `
        slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #ffcc00;
          cursor: pointer;
        }
        
        slider::-moz-range-thumb {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #ffcc00;
          cursor: pointer;
          border: none;
        }
      `;
      
      // Add style element to document
      const styleElement = document.createElement('style');
      styleElement.textContent = thumbStyles.replace(/slider/g, '#' + slider.id);
      document.head.appendChild(styleElement);
      
      // Give slider an ID for the custom styles
      slider.id = 'year-slider';
      
      const resetButton = document.createElement('button');
      resetButton.textContent = 'All';
      resetButton.style.cssText = `
        background-color: rgba(85, 85, 85, 0.7);
        color: white;
        border: none;
        border-radius: 4px;
        padding: 3px 8px;
        font-size: 12px;
        cursor: pointer;
        margin-left: 10px;
        transition: background-color 0.3s;
      `;
      resetButton.onmouseover = () => { resetButton.style.backgroundColor = 'rgba(120, 120, 120, 0.7)'; };
      resetButton.onmouseout = () => { resetButton.style.backgroundColor = 'rgba(85, 85, 85, 0.7)'; };
      
      sliderContainer.appendChild(slider);
      sliderContainer.appendChild(resetButton);
      
      timelineContainer.appendChild(sliderLabel);
      timelineContainer.appendChild(sliderContainer);
      
      document.getElementById('map-container').parentNode.appendChild(timelineContainer);
      
      // Add event listener to slider
      slider.addEventListener('input', (e) => {
        const year = parseInt(e.target.value);
        yearDisplay.textContent = year;
        updateMapForYear(year);
      });
      
      // Add event listener to reset button
      resetButton.addEventListener('click', () => {
        slider.value = 0;
        yearDisplay.textContent = 'All Years (1997-2024)';
        updateMapForYear(null);
      });
      
      return timelineContainer;
    };
    
    // Function to update map data for a specific year
    const updateMapForYear = (year) => {
      selectedYear = year;
      
      // If null (all years), use the aggregated data
      if (year === null) {
        Plotly.restyle('map-container', {
          locations: [locations],
          z: [zValues],
          text: [textValues],
          customdata: [locations.map((country, i) => ({
            killed: killedByCountry[country] || 0,
            affected: affectedByCountry[country] || 0
          }))]
        });
        return;
      }
      
      // Get data for the selected year
      const yearData = incidentsByYearAndCountry[year] || {};
      const yearKilledData = killedByYearAndCountry[year] || {};
      const yearAffectedData = affectedByYearAndCountry[year] || {};
      
      // Prepare data for the selected year
      const yearLocations = Object.keys(yearData);
      const yearZValues = yearLocations.map(country => yearData[country] || 0);
      const yearKilledValues = yearLocations.map(country => yearKilledData[country] || 0);
      const yearAffectedValues = yearLocations.map(country => yearAffectedData[country] || 0);
      const yearTextValues = yearLocations.map((country, i) => 
        `${country}: ${yearZValues[i]} incidents, ${yearKilledValues[i]} killed, ${yearAffectedValues[i]} affected`
      );
      
      // Update the plot with the year-specific data
      Plotly.restyle('map-container', {
        locations: [yearLocations],
        z: [yearZValues],
        text: [yearTextValues],
        customdata: [yearLocations.map((country, i) => ({
          killed: yearKilledValues[i],
          affected: yearAffectedValues[i]
        }))]
      });
    };
    
    // Create the year slider UI
    const timelineSlider = createYearSlider();

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
        landcolor: '#fffafa',
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
          0.30,  // Show main map until 25% scrolled
          0.50,   // Show Sudan from 25% to 50%
          0.70   // Show Syria from 50% to 75%, Somalia after 75%
        ];
        
        // Create or show hover hint when scroll is between 0.05 and 0.35
        let hoverHint = document.getElementById('hover-hint');
        if (!hoverHint) {
          hoverHint = document.createElement('div');
          hoverHint.id = 'hover-hint';
          hoverHint.innerHTML = 'Hover over countries to see incident details';
          hoverHint.style.cssText = `
            position: absolute;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background-color: rgba(0, 0, 0, 0.7);
            color: white;
            padding: 10px 15px;
            border-radius: 5px;
            font-size: 16px;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.6s ease;
            z-index: 1000;
          `;
          document.getElementById('map-container').parentNode.appendChild(hoverHint);
        }
        
        // Show or hide the hint based on scroll position
        if (normalizedScroll >= 0.02 && normalizedScroll < 0.30) {
          hoverHint.style.opacity = '1';
          timelineSlider.style.opacity = '1';
        } else {
          hoverHint.style.opacity = '0';
          timelineSlider.style.opacity = '0';
        }
        
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
        
        // Hide timeline slider
        timelineSlider.style.opacity = '0';
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
  