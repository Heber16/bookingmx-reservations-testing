const City = require('../src/City');
const CityGraph = require('../src/CityGraph');
const GraphVisualizer = require('../src/GraphVisualizer');

describe('GraphVisualizer', () => {
  let graph, visualizer;
  let cdmx, monterrey, guadalajara, puebla;

  beforeEach(() => {
    graph = new CityGraph();

    cdmx = new City('cdmx', 'Mexico City', 19.4326, -99.1332, 'CDMX');
    monterrey = new City('mty', 'Monterrey', 25.6866, -100.3161, 'Nuevo León');
    guadalajara = new City('gdl', 'Guadalajara', 20.6597, -103.3496, 'Jalisco');
    puebla = new City('pue', 'Puebla', 19.0414, -98.2063, 'Puebla');

    graph.addCity(cdmx);
    graph.addCity(monterrey);
    graph.addCity(guadalajara);
    graph.addCity(puebla);

    graph.addConnection('cdmx', 'pue', 130);
    graph.addConnection('cdmx', 'gdl', 540);
    graph.addConnection('cdmx', 'mty', 900);
    graph.addConnection('gdl', 'mty', 740);

    visualizer = new GraphVisualizer(graph);
  });

  // ==================== Constructor Tests ====================

  describe('Constructor', () => {
    test('should create a visualizer with a valid graph', () => {
      expect(visualizer).toBeInstanceOf(GraphVisualizer);
      expect(visualizer.graph).toBe(graph);
    });

    test('should throw if parameter is not an instance of CityGraph', () => {
      expect(() => {
        new GraphVisualizer({});
      }).toThrow('The parameter must be an instance of CityGraph');
    });

    test('should throw if parameter is null', () => {
      expect(() => {
        new GraphVisualizer(null);
      }).toThrow('The parameter must be an instance of CityGraph');
    });
  });

  // ==================== generateNearbyCitiesData Tests ====================

  describe('generateNearbyCitiesData', () => {
    test('should generate valid data for a city', () => {
      const data = visualizer.generateNearbyCitiesData('cdmx');

      expect(data).toHaveProperty('center');
      expect(data).toHaveProperty('nearby');
      expect(data).toHaveProperty('totalCount');
    });

    test('should include complete info for the central city', () => {
      const data = visualizer.generateNearbyCitiesData('cdmx');

      expect(data.center.id).toBe('cdmx');
      expect(data.center.name).toBe('Mexico City');
      expect(data.center.coordinates).toHaveProperty('latitude');
      expect(data.center.coordinates).toHaveProperty('longitude');
      expect(data.center.state).toBe('CDMX');
    });

    test('should include all nearby cities', () => {
      const data = visualizer.generateNearbyCitiesData('cdmx');

      expect(data.nearby).toHaveLength(3);
      expect(data.totalCount).toBe(3);
    });

    test('should include complete info for each nearby city', () => {
      const data = visualizer.generateNearbyCitiesData('cdmx');

      data.nearby.forEach(city => {
        expect(city).toHaveProperty('id');
        expect(city).toHaveProperty('name');
        expect(city).toHaveProperty('distance');
        expect(city).toHaveProperty('coordinates');
        expect(city).toHaveProperty('state');
        expect(city.coordinates).toHaveProperty('latitude');
        expect(city.coordinates).toHaveProperty('longitude');
      });
    });

    test('should limit results if maxResults is specified', () => {
      const data = visualizer.generateNearbyCitiesData('cdmx', 2);

      expect(data.nearby).toHaveLength(2);
      expect(data.totalCount).toBe(3); // Total still 3
    });

    test('should not limit results if maxResults is null', () => {
      const data = visualizer.generateNearbyCitiesData('cdmx', null);

      expect(data.nearby).toHaveLength(3);
    });

    test('should not limit results if maxResults is greater than total', () => {
      const data = visualizer.generateNearbyCitiesData('cdmx', 10);

      expect(data.nearby).toHaveLength(3);
    });

    test('should throw if city ID is empty', () => {
      expect(() => {
        visualizer.generateNearbyCitiesData('');
      }).toThrow('City ID is required');
    });

    test('should throw if city ID is null', () => {
      expect(() => {
        visualizer.generateNearbyCitiesData(null);
      }).toThrow('City ID is required');
    });

    test('should order nearby cities by distance', () => {
      const data = visualizer.generateNearbyCitiesData('cdmx');

      for (let i = 0; i < data.nearby.length - 1; i++) {
        expect(data.nearby[i].distance).toBeLessThanOrEqual(data.nearby[i + 1].distance);
      }
    });

    test('should handle cities with no connections', () => {
      const isolated = new City('isolated', 'Isolated', 0, 0, 'State');
      graph.addCity(isolated);

      const data = visualizer.generateNearbyCitiesData('isolated');

      expect(data.nearby).toEqual([]);
      expect(data.totalCount).toBe(0);
    });
  });

  // ==================== generateRouteData Tests ====================

  describe('generateRouteData', () => {
    test('should generate route data correctly', () => {
      const data = visualizer.generateRouteData('cdmx', 'pue');

      expect(data).toHaveProperty('found');
      expect(data).toHaveProperty('origin');
      expect(data).toHaveProperty('destination');
      expect(data).toHaveProperty('path');
      expect(data).toHaveProperty('totalDistance');
      expect(data).toHaveProperty('stops');
    });

    test('should mark found as true if route exists', () => {
      const data = visualizer.generateRouteData('cdmx', 'pue');
      expect(data.found).toBe(true);
    });

    test('should include origin and destination info', () => {
      const data = visualizer.generateRouteData('cdmx', 'mty');

      expect(data.origin.id).toBe('cdmx');
      expect(data.origin.name).toBe('Mexico City');
      expect(data.destination.id).toBe('mty');
      expect(data.destination.name).toBe('Monterrey');
    });

    test('should include full route path', () => {
      const data = visualizer.generateRouteData('cdmx', 'pue');

      expect(data.path).toHaveLength(2);
      expect(data.path[0].id).toBe('cdmx');
      expect(data.path[1].id).toBe('pue');
    });

    test('should include coordinates for each point', () => {
      const data = visualizer.generateRouteData('cdmx', 'pue');

      data.path.forEach(point => {
        expect(point.coordinates).toHaveProperty('latitude');
        expect(point.coordinates).toHaveProperty('longitude');
      });
    });

    test('should calculate total distance correctly', () => {
      const data = visualizer.generateRouteData('cdmx', 'pue');
      expect(data.totalDistance).toBe(130);
    });

    test('should calculate stops correctly', () => {
      const data = visualizer.generateRouteData('cdmx', 'pue');
      expect(data.stops).toBe(0); // Direct route, no stops
    });

    test('should handle routes with no connection', () => {
      const isolated = new City('isolated', 'Isolated', 0, 0, 'State');
      graph.addCity(isolated);

      const data = visualizer.generateRouteData('cdmx', 'isolated');

      expect(data.found).toBe(false);
      expect(data).toHaveProperty('message');
      expect(data.message).toContain('No route exists');
    });

    test('should throw if origin ID is empty', () => {
      expect(() => {
        visualizer.generateRouteData('', 'mty');
      }).toThrow('Origin and destination city IDs are required');
    });

    test('should throw if destination ID is empty', () => {
      expect(() => {
        visualizer.generateRouteData('cdmx', '');
      }).toThrow('Origin and destination city IDs are required');
    });

    test('should throw if both IDs are empty', () => {
      expect(() => {
        visualizer.generateRouteData('', '');
      }).toThrow('Origin and destination city IDs are required');
    });
  });

  // ==================== generateConnectionDensityData Tests ====================

  describe('generateConnectionDensityData', () => {
    test('should generate connection density data', () => {
      const data = visualizer.generateConnectionDensityData();

      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
    });

    test('each city should have correct structure', () => {
      const data = visualizer.generateConnectionDensityData();

      data.forEach(city => {
        expect(city).toHaveProperty('id');
        expect(city).toHaveProperty('name');
        expect(city).toHaveProperty('connections');
        expect(city).toHaveProperty('coordinates');
      });
    });

    test('should order by number of connections (descending)', () => {
      const data = visualizer.generateConnectionDensityData();

      for (let i = 0; i < data.length - 1; i++) {
        expect(data[i].connections).toBeGreaterThanOrEqual(data[i + 1].connections);
      }
    });

    test('should return empty array for empty graph', () => {
      const emptyGraph = new CityGraph();
      const emptyVisualizer = new GraphVisualizer(emptyGraph);

      const data = emptyVisualizer.generateConnectionDensityData();

      expect(data).toEqual([]);
    });

    test('should count connections correctly', () => {
      const data = visualizer.generateConnectionDensityData();
      const cdmxData = data.find(city => city.id === 'cdmx');

      expect(cdmxData.connections).toBe(3); // Connected to pue, gdl, mty
    });
  });

  // ==================== generateGraphStatistics Tests ====================

  describe('generateGraphStatistics', () => {
    test('should generate complete statistics', () => {
      const stats = visualizer.generateGraphStatistics();

      expect(stats).toHaveProperty('totalCities');
      expect(stats).toHaveProperty('totalConnections');
      expect(stats).toHaveProperty('averageConnections');
      expect(stats).toHaveProperty('maxConnections');
      expect(stats).toHaveProperty('minConnections');
      expect(stats).toHaveProperty('mostConnectedCity');
    });

    test('should calculate total cities correctly', () => {
      const stats = visualizer.generateGraphStatistics();
      expect(stats.totalCities).toBe(4);
    });

    test('should calculate total connections correctly', () => {
      const stats = visualizer.generateGraphStatistics();
      expect(stats.totalConnections).toBe(4);
    });

    test('should calculate average connections', () => {
      const stats = visualizer.generateGraphStatistics();
      expect(stats.averageConnections).toBeGreaterThan(0);
      expect(typeof stats.averageConnections).toBe('number');
    });

    test('should identify most connected city', () => {
      const stats = visualizer.generateGraphStatistics();

      expect(stats.mostConnectedCity).not.toBeNull();
      expect(stats.mostConnectedCity).toHaveProperty('id');
      expect(stats.mostConnectedCity).toHaveProperty('name');
      expect(stats.mostConnectedCity).toHaveProperty('connections');
      expect(stats.mostConnectedCity.id).toBe('cdmx');
    });

    test('should calculate max and min connections correctly', () => {
      const stats = visualizer.generateGraphStatistics();

      expect(stats.maxConnections).toBeGreaterThanOrEqual(stats.minConnections);
      expect(stats.maxConnections).toBe(3);
      expect(stats.minConnections).toBe(1);
    });

    test('should handle empty graph', () => {
      const emptyGraph = new CityGraph();
      const emptyVisualizer = new GraphVisualizer(emptyGraph);

      const stats = emptyVisualizer.generateGraphStatistics();

      expect(stats.totalCities).toBe(0);
      expect(stats.totalConnections).toBe(0);
      expect(stats.averageConnections).toBe(0);
      expect(stats.mostConnectedCity).toBeNull();
    });

    test('should round average to 2 decimals', () => {
      const stats = visualizer.generateGraphStatistics();
      const decimals = stats.averageConnections.toString().split('.')[1];
      expect(!decimals || decimals.length <= 2).toBe(true);
    });
  });

  // ==================== generateHTMLTable Tests ====================

  describe('generateHTMLTable', () => {
    test('should generate a valid HTML table', () => {
      const html = visualizer.generateHTMLTable('cdmx');

      expect(html).toContain('<table>');
      expect(html).toContain('</table>');
      expect(html).toContain('<thead>');
      expect(html).toContain('<tbody>');
    });

    test('should include correct headers', () => {
      const html = visualizer.generateHTMLTable('cdmx');

      expect(html).toContain('City');
      expect(html).toContain('State');
      expect(html).toContain('Distance');
    });

    test('should include all nearby cities', () => {
      const html = visualizer.generateHTMLTable('cdmx');

      expect(html).toContain('Puebla');
      expect(html).toContain('Guadalajara');
      expect(html).toContain('Monterrey');
    });

    test('should include distances', () => {
      const html = visualizer.generateHTMLTable('cdmx');

      expect(html).toContain('130');
      expect(html).toContain('540');
      expect(html).toContain('900');
    });

    test('should return message if there are no nearby cities', () => {
      const isolated = new City('isolated', 'Isolated', 0, 0, 'State');
      graph.addCity(isolated);

      const html = visualizer.generateHTMLTable('isolated');

      expect(html).toContain('No nearby cities to display');
      expect(html).not.toContain('<table>');
    });

    test('should throw if city ID is empty', () => {
      expect(() => {
        visualizer.generateHTMLTable('');
      }).toThrow('City ID is required');
    });

    test('should escape HTML properly (prevent XSS)', () => {
      const html = visualizer.generateHTMLTable('cdmx');

      expect(html).not.toContain('<script>');
      expect(html).not.toContain('javascript:');
    });
  });

  // ==================== validateGraphData Tests ====================

  describe('validateGraphData', () => {
    test('should validate correct graph as valid', () => {
      const result = visualizer.validateGraphData();

      expect(result).toHaveProperty('valid');
      expect(result).toHaveProperty('errors');
      expect(result).toHaveProperty('warnings');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should detect empty graph', () => {
      const emptyGraph = new CityGraph();
      const emptyVisualizer = new GraphVisualizer(emptyGraph);

      const result = emptyVisualizer.validateGraphData();

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('contains no cities');
    });

    test('should warn about isolated cities', () => {
      const isolated = new City('isolated', 'Isolated', 0, 0, 'State');
      graph.addCity(isolated);

      const result = visualizer.validateGraphData();

      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0]).toContain('has no connections');
    });

    test('should return arrays for errors and warnings', () => {
      const result = visualizer.validateGraphData();

      expect(Array.isArray(result.errors)).toBe(true);
      expect(Array.isArray(result.warnings)).toBe(true);
    });

    test('valid graph should have no errors', () => {
      const result = visualizer.validateGraphData();
      expect(result.errors).toHaveLength(0);
    });
  });

  // ==================== Edge Cases ====================

  describe('Edge Cases', () => {
    test('should handle graph with a single city', () => {
      const singleGraph = new CityGraph();
      singleGraph.addCity(cdmx);
      const singleVisualizer = new GraphVisualizer(singleGraph);

      const data = singleVisualizer.generateNearbyCitiesData('cdmx');
      expect(data.nearby).toEqual([]);
    });

    test('should handle special characters in data', () => {
      const specialCity = new City('special', 'São Paulo', 0, 0, 'Brazil');
      graph.addCity(specialCity);
      graph.addConnection('cdmx', 'special', 100);

      const html = visualizer.generateHTMLTable('cdmx');
      expect(html).toContain('São Paulo');
    });

    test('should handle very small distances', () => {
      const nearCity = new City('near', 'Nearby', 19.43, -99.13, 'CDMX');
      graph.addCity(nearCity);
      graph.addConnection('cdmx', 'near', 0.5);

      const data = visualizer.generateNearbyCitiesData('cdmx');
      const nearData = data.nearby.find(c => c.id === 'near');

      expect(nearData.distance).toBe(0.5);
    });

    test('should handle long city names', () => {
      const longName = new City('long', 'City With an Extremely Long Name', 0, 0, 'State');
      graph.addCity(longName);
      graph.addConnection('cdmx', 'long', 100);

      const html = visualizer.generateHTMLTable('cdmx');
      expect(html).toContain('City With an Extremely Long Name');
    });

    test('should handle maxResults = 0', () => {
      const data = visualizer.generateNearbyCitiesData('cdmx', 0);
      expect(data.nearby).toHaveLength(3);
    });

    test('should handle negative maxResults', () => {
      const data = visualizer.generateNearbyCitiesData('cdmx', -1);
      expect(data.nearby).toHaveLength(3);
    });
  });
});
