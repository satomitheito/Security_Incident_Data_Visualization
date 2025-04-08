class WordCloud {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.error(`Container with ID ${containerId} not found`);
      return;
    }
  }

  render() {
    const template = `
      <div class="word-cloud-section">
        <div class="container">
          <p class="graph-title">Common Words in Incident Descriptions</p>
          <div class="graph-container" id="word-cloud"></div>
        </div>
      </div>
    `;
    
    this.container.innerHTML = template;
    this.initWordCloud();
  }

  async processData() {
    try {
      const response = await fetch('data/security_incidents.csv');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const csvData = await response.text();
      
      // Use Papa Parse instead of custom parsing
      const parsedData = Papa.parse(csvData, {
        header: true,
        skipEmptyLines: true
      }).data;
      
      // Process all descriptions
      const words = {};
      const stopWords = new Set([
        'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 
        'to', 'for', 'of', 'with', 'by', 'was', 'that', 'as',
        'this', 'also', 'other', 'along', 'were', 'who', 'their',
        'they', 'from', 'after', 'when', 'while'
      ]);
      
      for (let i = 0; i < parsedData.length; i++) {
        const row = parsedData[i];
        
        // Find the description field - any column containing 'details'
        let description = '';
        for (const key in row) {
          if (key.toLowerCase().includes('details')) {
            description = row[key];
            break;
          }
        }
        
        if (description) {
          const wordList = description.toLowerCase()
            .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()'"]/g, '') // Added quotes to remove
            .split(' ')
            .filter(word => 
              word.length > 2 && 
              !stopWords.has(word) && 
              !parseInt(word) // Remove numbers
            );
            
          wordList.forEach(word => {
            words[word] = (words[word] || 0) + 1;
          });
        }
      }
      
      // Convert to array of objects for d3-cloud
      return Object.entries(words)
        .map(([text, size]) => ({ text, size }))
        .sort((a, b) => b.size - a.size)
        .slice(0, 100); // Take top 100 words
    } catch (error) {
      console.error('Error processing CSV data:', error);
      return [];
    }
  }

  async initWordCloud() {
    // Remove fixed width/height and make it responsive
    const container = document.querySelector('#word-cloud');
    const width = container.clientWidth;
    const height = container.clientHeight || 400; // fallback height if container height is 0
    
    try {
      const words = await this.processData();
      
      if (words.length === 0) {
        this.container.innerHTML = '<p>No data available</p>';
        return;
      }

      // Scale word sizes
      const maxSize = Math.max(...words.map(w => w.size));
      const minSize = Math.min(...words.map(w => w.size));
      const fontSize = d3.scaleLinear()
        .domain([minSize, maxSize])
        .range([14, 60]);

      // Create cloud layout with fixed seed
      const layout = d3.layout.cloud()
        .size([width, height])
        .words(words.map(d => ({
          ...d,
          size: fontSize(d.size)
        })))
        .padding(5)
        .rotate(() => 0) // No rotation for better readability
        .font('Libre Franklin')
        .fontSize(d => d.size)
        .random(() => 0.5) // Add fixed seed value
        .on('end', draw.bind(this));

      layout.start();

      function draw(words) {
        // Clear previous content
        d3.select('#word-cloud').html('');

        // Create SVG
        const svg = d3.select('#word-cloud')
          .append('svg')
          .attr('width', '100%')
          .attr('height', '100%')
          .attr('viewBox', `0 0 ${width} ${height}`)
          .style('background-color', '#DEDEDE')
          .style('display', 'block');

        // Add words
        svg.append('g')
          .attr('transform', `translate(${width/2},${height/2})`)
          .selectAll('text')
          .data(words)
          .enter().append('text')
          .style('font-size', d => `${d.size}px`)
          .style('font-family', 'Libre Franklin, sans-serif')
          .style('fill', (d, i) => {
            // Create a more colorful palette
            const colors = [
              '#FF6B6B', // coral red
              '#4ECDC4', // turquoise
              '#45B7D1', // sky blue
              '#96CEB4', // sage green
              '#9B59B6', // purple
              '#3498DB', // blue
              '#FF9F43', // orange
              '#26A69A', // teal
              '#5D4037', // brown
              '#5C6BC0'  // indigo
            ];
            // Use the index to cycle through colors
            return colors[i % colors.length];
          })
          .attr('text-anchor', 'middle')
          .attr('transform', d => `translate(${d.x},${d.y})`)
          .text(d => d.text)
          .append('title')
          .text(d => `${d.text}: ${d.size} occurrences`);
      }

    } catch (error) {
      console.error('Error creating word cloud:', error);
      this.container.innerHTML = '<p>Error creating word cloud</p>';
    }
  }
}

// Export the component
if (typeof module !== 'undefined' && module.exports) {
  module.exports = WordCloud;
} 