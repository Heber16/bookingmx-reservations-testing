const CityGraph = require('./CityGraph');

/**
 * Class for visualizing the city graph
 */
class GraphVisualizer {
  constructor(graph) {
    if (!(graph instanceof CityGraph)) {
      throw new Error('The parameter must be an instance of CityGraph');
    }
    this.graph = graph;
  }

  /**
   * Generates data for nearby cities visualization
   * @param {string} cityId - ID of the central city
   * @param {number} maxResults - Maximum number of results (optional)
   * @returns {Object} Formatted data for visualization
   */
  generateNearbyCitiesData(cityId, maxResults = null) {
    if (!cityId) {
      throw new Error('City ID is required');
    }

    const city = this.graph.getCity(cityId);
    const nearbyCities = this.graph.getNearbyCities(cityId);

    // Limit results if specified
    const limitedCities = maxResults && maxResults > 0
      ? nearbyCities.slice(0, maxResults)
      : nearbyCities;

    return {
      center: {
        id: city.id,
        name: city.name,
        coordinates: {
          latitude: city.latitude,
          longitude: city.longitude
        },
        state: city.state
      },
      nearby: limitedCities.map(item => ({
        id: item.city.id,
        name: item.city.name,
        distance: item.distance,
        coordinates: {
          latitude: item.city.latitude,
          longitude: item.city.longitude
        },
        state: item.city.state
      })),
      totalCount: nearbyCities.length
    };
  }

  /**
   * Generates data for route visualization
   * @param {string} startCityId - Origin city ID
   * @param {string} endCityId - Destination city ID
   * @returns {Object} Route data for visualization
   */
  generateRouteData(startCityId, endCityId) {
    if (!startCityId || !endCityId) {
      throw new Error('Origin and destination city IDs are required');
    }

    const result = this.graph.findShortestPath(startCityId, endCityId);

    if (!result) {
      return {
        found: false,
        message: 'No route exists between the specified cities'
      };
    }

    return {
      found: true,
      origin: {
        id: result.path[0].id,
        name: result.path[0].name
      },
      destination: {
        id: result.path[result.path.length - 1].id,
        name: result.path[result.path.length - 1].name
      },
      path: result.path.map(city => ({
        id: city.id,
        name: city.name,
        coordinates: {
          latitude: city.latitude,
          longitude: city.longitude
        },
        state: city.state
      })),
      totalDistance: result.distance,
      stops: result.path.length - 2 // Exclude origin and destination
    };
  }

  /**
   * Generates data for a heatmap of connection density
   * @returns {Array} Array of cities with their number of connections
   */
  generateConnectionDensityData() {
    const cities = this.graph.getAllCities();

    if (cities.length === 0) {
      return [];
    }

    return cities.map(city => {
      const nearbyCities = this.graph.getNearbyCities(city.id);
      return {
        id: city.id,
        name: city.name,
        connections: nearbyCities.length,
        coordinates: {
          latitude: city.latitude,
          longitude: city.longitude
        }
      };
    }).sort((a, b) => b.connections - a.connections);
  }

  /**
   * Generates general graph statistics
   * @returns {Object} General statistics
   */
  generateGraphStatistics() {
    const cities = this.graph.getAllCities();

    if (cities.length === 0) {
      return {
        totalCities: 0,
        totalConnections: 0,
        averageConnections: 0,
        maxConnections: 0,
        minConnections: 0,
        mostConnectedCity: null
      };
    }

    const connectionCounts = cities.map(city =>
      this.graph.getNearbyCities(city.id).length
    );

    const totalConnections = this.graph.getConnectionCount();
    const maxConnections = Math.max(...connectionCounts);
    const minConnections = Math.min(...connectionCounts);
    const averageConnections = connectionCounts.reduce((a, b) => a + b, 0) / cities.length;

    // Find the city with the most connections
    let mostConnectedCity = null;
    let maxConnectionsCount = 0;

    for (const city of cities) {
      const count = this.graph.getNearbyCities(city.id).length;
      if (count > maxConnectionsCount) {
        maxConnectionsCount = count;
        mostConnectedCity = {
          id: city.id,
          name: city.name,
          connections: count
        };
      }
    }

    return {
      totalCities: cities.length,
      totalConnections: totalConnections,
      averageConnections: Math.round(averageConnections * 100) / 100,
      maxConnections: maxConnections,
      minConnections: minConnections,
      mostConnectedCity: mostConnectedCity
    };
  }

  /**
   * Formats data into an HTML table
   * @param {string} cityId - City ID
   * @returns {string} HTML table
   */
  generateHTMLTable(cityId) {
    if (!cityId) {
      throw new Error('City ID is required');
    }

    const data = this.generateNearbyCitiesData(cityId);

    if (data.nearby.length === 0) {
      return '<p>No nearby cities to display.</p>';
    }

    let html = '<table>\n';
    html += '  <thead>\n';
    html += '    <tr>\n';
    html += '      <th>City</th>\n';
    html += '      <th>State</th>\n';
    html += '      <th>Distance (km)</th>\n';
    html += '    </tr>\n';
    html += '  </thead>\n';
    html += '  <tbody>\n';

    for (const city of data.nearby) {
      html += '    <tr>\n';
      html += `      <td>${city.name}</td>\n`;
      html += `      <td>${city.state}</td>\n`;
      html += `      <td>${city.distance}</td>\n`;
      html += '    </tr>\n';
    }

    html += '  </tbody>\n';
    html += '</table>';

    return html;
  }

  /**
   * Validates that the graph data is consistent
   * @returns {Object} Validation result
   */
  validateGraphData() {
    const errors = [];
    const warnings = [];

    // Check that there are cities
    if (this.graph.getCityCount() === 0) {
      errors.push('The graph contains no cities');
      return { valid: false, errors, warnings };
    }

    // Check for cities without connections
    const cities = this.graph.getAllCities();
    for (const city of cities) {
      const nearbyCities = this.graph.getNearbyCities(city.id);
      if (nearbyCities.length === 0) {
        warnings.push(`City ${city.name} (${city.id}) has no connections`);
      }
    }

    // Check for asymmetric connections
    for (const city1 of cities) {
      const connections1 = this.graph.getNearbyCities(city1.id);
      for (const connection of connections1) {
        const city2 = connection.city;
        if (!this.graph.hasConnection(city2.id, city1.id)) {
          errors.push(`Asymmetric connection between ${city1.id} and ${city2.id}`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
}

module.exports = GraphVisualizer;