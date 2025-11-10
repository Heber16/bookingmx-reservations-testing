const City = require('../src/City');
const CityGraph = require('../src/CityGraph');

describe('CityGraph', () => {
  let graph;
  let cdmx, monterrey, guadalajara, puebla;

  beforeEach(() => {
    graph = new CityGraph();

    // Create sample cities
    cdmx = new City('cdmx', 'Mexico City', 19.4326, -99.1332, 'CDMX');
    monterrey = new City('mty', 'Monterrey', 25.6866, -100.3161, 'Nuevo León');
    guadalajara = new City('gdl', 'Guadalajara', 20.6597, -103.3496, 'Jalisco');
    puebla = new City('pue', 'Puebla', 19.0414, -98.2063, 'Puebla');
  });

  // ==================== Add Cities Tests ====================

  describe('addCity', () => {
    test('should add a city successfully', () => {
      graph.addCity(cdmx);

      expect(graph.getCityCount()).toBe(1);
      expect(graph.getCity('cdmx')).toBe(cdmx);
    });

    test('should add multiple cities', () => {
      graph.addCity(cdmx);
      graph.addCity(monterrey);
      graph.addCity(guadalajara);

      expect(graph.getCityCount()).toBe(3);
    });

    test('should throw an error if parameter is not an instance of City', () => {
      expect(() => {
        graph.addCity({ name: 'City' });
      }).toThrow('The parameter must be an instance of City');
    });

    test('should throw an error if city already exists', () => {
      graph.addCity(cdmx);

      expect(() => {
        graph.addCity(cdmx);
      }).toThrow('City with ID cdmx already exists in the graph');
    });

    test('should initialize empty connections for a new city', () => {
      graph.addCity(cdmx);
      const nearby = graph.getNearbyCities('cdmx');

      expect(nearby).toEqual([]);
    });
  });

  // ==================== Add Connections Tests ====================

  describe('addConnection', () => {
    beforeEach(() => {
      graph.addCity(cdmx);
      graph.addCity(monterrey);
    });

    test('should add a bidirectional connection', () => {
      graph.addConnection('cdmx', 'mty', 900);

      expect(graph.hasConnection('cdmx', 'mty')).toBe(true);
      expect(graph.hasConnection('mty', 'cdmx')).toBe(true);
    });

    test('should calculate distance automatically if not provided', () => {
      graph.addConnection('cdmx', 'mty');

      const distance = graph.getDistance('cdmx', 'mty');
      expect(distance).toBeGreaterThan(700);
      expect(distance).toBeLessThan(710);
    });

    test('should use the provided distance', () => {
      graph.addConnection('cdmx', 'mty', 1000);

      const distance = graph.getDistance('cdmx', 'mty');
      expect(distance).toBe(1000);
    });

    test('should throw error if first city does not exist', () => {
      expect(() => {
        graph.addConnection('invalid', 'mty', 100);
      }).toThrow('City with ID invalid does not exist in the graph');
    });

    test('should throw error if second city does not exist', () => {
      expect(() => {
        graph.addConnection('cdmx', 'invalid', 100);
      }).toThrow('City with ID invalid does not exist in the graph');
    });

    test('should throw error when connecting a city to itself', () => {
      expect(() => {
        graph.addConnection('cdmx', 'cdmx', 100);
      }).toThrow('A city cannot be connected to itself');
    });

    test('should throw error if distance is 0', () => {
      expect(() => {
        graph.addConnection('cdmx', 'mty', 0);
      }).toThrow('Distance must be greater than 0');
    });

    test('should throw error if distance is negative', () => {
      expect(() => {
        graph.addConnection('cdmx', 'mty', -100);
      }).toThrow('Distance must be greater than 0');
    });
  });

  // ==================== Nearby Cities Tests ====================

  describe('getNearbyCities', () => {
    beforeEach(() => {
      graph.addCity(cdmx);
      graph.addCity(monterrey);
      graph.addCity(guadalajara);
      graph.addCity(puebla);

      graph.addConnection('cdmx', 'mty', 900);
      graph.addConnection('cdmx', 'gdl', 540);
      graph.addConnection('cdmx', 'pue', 130);
    });

    test('should return all connected cities', () => {
      const nearby = graph.getNearbyCities('cdmx');
      expect(nearby).toHaveLength(3);
    });

    test('should order by distance (closest first)', () => {
      const nearby = graph.getNearbyCities('cdmx');
      expect(nearby[0].distance).toBeLessThan(nearby[1].distance);
      expect(nearby[1].distance).toBeLessThan(nearby[2].distance);
    });

    test('should include city and distance info', () => {
      const nearby = graph.getNearbyCities('cdmx');
      nearby.forEach(item => {
        expect(item).toHaveProperty('city');
        expect(item).toHaveProperty('distance');
        expect(item.city).toBeInstanceOf(City);
        expect(typeof item.distance).toBe('number');
      });
    });

    test('should return an empty array if city has no connections', () => {
      const isolated = new City('isolated', 'Isolated', 0, 0, 'State');
      graph.addCity(isolated);
      const nearby = graph.getNearbyCities('isolated');
      expect(nearby).toEqual([]);
    });

    test('should throw error if ID is empty', () => {
      expect(() => {
        graph.getNearbyCities('');
      }).toThrow('City ID must be a valid string');
    });

    test('should throw error if ID is not a string', () => {
      expect(() => {
        graph.getNearbyCities(123);
      }).toThrow('City ID must be a valid string');
    });

    test('should throw error if city does not exist', () => {
      expect(() => {
        graph.getNearbyCities('nonexistent');
      }).toThrow('City with ID nonexistent does not exist in the graph');
    });
  });

  // ==================== Cities Within Radius Tests ====================

  describe('getNearbyCitiesWithinRadius', () => {
    beforeEach(() => {
      graph.addCity(cdmx);
      graph.addCity(monterrey);
      graph.addCity(guadalajara);
      graph.addCity(puebla);

      graph.addConnection('cdmx', 'mty', 900);
      graph.addConnection('cdmx', 'gdl', 540);
      graph.addConnection('cdmx', 'pue', 130);
    });

    test('should return only cities within the given radius', () => {
      const nearby = graph.getNearbyCitiesWithinRadius('cdmx', 200);
      expect(nearby).toHaveLength(1);
      expect(nearby[0].city.id).toBe('pue');
    });

    test('should return empty array if no cities are within radius', () => {
      const nearby = graph.getNearbyCitiesWithinRadius('cdmx', 50);
      expect(nearby).toEqual([]);
    });

    test('should include cities exactly on the boundary', () => {
      const nearby = graph.getNearbyCitiesWithinRadius('cdmx', 130);
      expect(nearby).toHaveLength(1);
      expect(nearby[0].distance).toBe(130);
    });

    test('should throw error if max distance is not a number', () => {
      expect(() => {
        graph.getNearbyCitiesWithinRadius('cdmx', 'not a number');
      }).toThrow('Maximum distance must be a positive number');
    });

    test('should throw error if max distance is negative', () => {
      expect(() => {
        graph.getNearbyCitiesWithinRadius('cdmx', -100);
      }).toThrow('Maximum distance must be a positive number');
    });

    test('should throw error if max distance is zero', () => {
      expect(() => {
        graph.getNearbyCitiesWithinRadius('cdmx', 0);
      }).toThrow('Maximum distance must be a positive number');
    });
  });

  // ==================== Shortest Path (Dijkstra) Tests ====================

  describe('findShortestPath', () => {
    beforeEach(() => {
      graph.addCity(cdmx);
      graph.addCity(monterrey);
      graph.addCity(guadalajara);
      graph.addCity(puebla);

      graph.addConnection('cdmx', 'pue', 130);
      graph.addConnection('cdmx', 'gdl', 540);
      graph.addConnection('pue', 'mty', 850);
      graph.addConnection('gdl', 'mty', 740);
    });

    test('should find direct route between two cities', () => {
      const result = graph.findShortestPath('cdmx', 'pue');
      expect(result).not.toBeNull();
      expect(result.path).toHaveLength(2);
      expect(result.path[0].id).toBe('cdmx');
      expect(result.path[1].id).toBe('pue');
      expect(result.distance).toBe(130);
    });

    test('should find shortest indirect route', () => {
      const result = graph.findShortestPath('cdmx', 'mty');
      expect(result).not.toBeNull();
      expect(result.path.length).toBeGreaterThan(2);
    });

    test('should return 0 distance for the same city', () => {
      const result = graph.findShortestPath('cdmx', 'cdmx');
      expect(result.path).toHaveLength(1);
      expect(result.distance).toBe(0);
    });

    test('should return null if no route exists', () => {
      const isolated = new City('isolated', 'Isolated', 0, 0, 'State');
      graph.addCity(isolated);
      const result = graph.findShortestPath('cdmx', 'isolated');
      expect(result).toBeNull();
    });

    test('should throw error if source city does not exist', () => {
      expect(() => {
        graph.findShortestPath('nonexistent', 'mty');
      }).toThrow('Starting city nonexistent does not exist');
    });

    test('should throw error if destination city does not exist', () => {
      expect(() => {
        graph.findShortestPath('cdmx', 'nonexistent');
      }).toThrow('Destination city nonexistent does not exist');
    });

    test('path should be sequential (each city pair connected)', () => {
      const result = graph.findShortestPath('cdmx', 'mty');
      if (result && result.path.length > 1) {
        for (let i = 0; i < result.path.length - 1; i++) {
          const city1 = result.path[i];
          const city2 = result.path[i + 1];
          expect(graph.hasConnection(city1.id, city2.id)).toBe(true);
        }
      }
    });
  });

  // ==================== Utility Methods ====================

  describe('Utility Methods', () => {
    beforeEach(() => {
      graph.addCity(cdmx);
      graph.addCity(monterrey);
      graph.addConnection('cdmx', 'mty', 900);
    });

    test('getCity should return the correct city', () => {
      const city = graph.getCity('cdmx');
      expect(city).toBe(cdmx);
    });

    test('getCity should throw if city does not exist', () => {
      expect(() => {
        graph.getCity('nonexistent');
      }).toThrow('City with ID nonexistent does not exist');
    });

    test('hasConnection should return true for connected cities', () => {
      expect(graph.hasConnection('cdmx', 'mty')).toBe(true);
      expect(graph.hasConnection('mty', 'cdmx')).toBe(true);
    });

    test('hasConnection should return false for unconnected cities', () => {
      graph.addCity(guadalajara);
      expect(graph.hasConnection('cdmx', 'gdl')).toBe(false);
    });

    test('hasConnection should return false if either city does not exist', () => {
      expect(graph.hasConnection('cdmx', 'nonexistent')).toBe(false);
      expect(graph.hasConnection('nonexistent', 'cdmx')).toBe(false);
    });

    test('getDistance should return correct distance', () => {
      const distance = graph.getDistance('cdmx', 'mty');
      expect(distance).toBe(900);
    });

    test('getDistance should be symmetric', () => {
      const d1 = graph.getDistance('cdmx', 'mty');
      const d2 = graph.getDistance('mty', 'cdmx');
      expect(d1).toBe(d2);
    });

    test('getDistance should throw if there is no connection', () => {
      graph.addCity(guadalajara);
      expect(() => {
        graph.getDistance('cdmx', 'gdl');
      }).toThrow('No connection exists between cdmx and gdl');
    });

    test('getCityCount should return correct number', () => {
      expect(graph.getCityCount()).toBe(2);
      graph.addCity(guadalajara);
      expect(graph.getCityCount()).toBe(3);
    });

    test('getConnectionCount should return correct number of connections', () => {
      expect(graph.getConnectionCount()).toBe(1);
      graph.addCity(guadalajara);
      graph.addConnection('cdmx', 'gdl', 540);
      expect(graph.getConnectionCount()).toBe(2);
    });

    test('getAllCities should return all cities', () => {
      const cities = graph.getAllCities();
      expect(cities).toHaveLength(2);
      expect(cities).toContain(cdmx);
      expect(cities).toContain(monterrey);
    });

    test('clear should remove all cities and connections', () => {
      graph.clear();
      expect(graph.getCityCount()).toBe(0);
      expect(graph.getConnectionCount()).toBe(0);
    });
  });

  // ==================== Serialization Tests ====================

  describe('Serialization', () => {
    beforeEach(() => {
      graph.addCity(cdmx);
      graph.addCity(monterrey);
      graph.addCity(guadalajara);
      graph.addConnection('cdmx', 'mty', 900);
      graph.addConnection('cdmx', 'gdl', 540);
    });

    test('toJSON should export graph correctly', () => {
      const json = graph.toJSON();
      expect(json).toHaveProperty('cities');
      expect(json).toHaveProperty('connections');
      expect(Array.isArray(json.cities)).toBe(true);
      expect(Array.isArray(json.connections)).toBe(true);
    });

    test('toJSON should include all cities', () => {
      const json = graph.toJSON();
      expect(json.cities).toHaveLength(3);
    });

    test('toJSON should include all connections (no duplicates)', () => {
      const json = graph.toJSON();
      expect(json.connections).toHaveLength(2);
    });

    test('fromJSON should import graph correctly', () => {
      const json = graph.toJSON();
      const newGraph = CityGraph.fromJSON(json);
      expect(newGraph.getCityCount()).toBe(3);
      expect(newGraph.getConnectionCount()).toBe(2);
    });

    test('fromJSON should throw if JSON is invalid', () => {
      expect(() => {
        CityGraph.fromJSON(null);
      }).toThrow('JSON must be a valid object');
    });

    test('fromJSON should throw if cities array is missing', () => {
      expect(() => {
        CityGraph.fromJSON({ connections: [] });
      }).toThrow('The JSON must contain a "cities" array');
    });

    test('fromJSON should throw if connections array is missing', () => {
      expect(() => {
        CityGraph.fromJSON({ cities: [] });
      }).toThrow('The JSON must contain a "connections" array');
    });

    test('exported and imported graph should be equivalent', () => {
      const json1 = graph.toJSON();
      const newGraph = CityGraph.fromJSON(json1);
      const json2 = newGraph.toJSON();
      expect(json2.cities).toHaveLength(json1.cities.length);
      expect(json2.connections).toHaveLength(json1.connections.length);
    });
  });

  // ==================== Edge Cases ====================

  describe('Edge Cases', () => {
    test('should handle empty graph', () => {
      expect(graph.getCityCount()).toBe(0);
      expect(graph.getConnectionCount()).toBe(0);
      expect(graph.getAllCities()).toEqual([]);
    });

    test('should handle city with no connections', () => {
      graph.addCity(cdmx);
      const nearby = graph.getNearbyCities('cdmx');
      expect(nearby).toEqual([]);
    });

    test('should handle multiple connections correctly', () => {
      graph.addCity(cdmx);
      graph.addCity(monterrey);
      graph.addCity(guadalajara);
      graph.addCity(puebla);

      graph.addConnection('cdmx', 'mty', 900);
      graph.addConnection('cdmx', 'gdl', 540);
      graph.addConnection('cdmx', 'pue', 130);
      graph.addConnection('mty', 'gdl', 740);

      expect(graph.getNearbyCities('cdmx')).toHaveLength(3);
      expect(graph.getNearbyCities('mty')).toHaveLength(2);
    });

    test('should handle very large distances', () => {
      graph.addCity(cdmx);
      graph.addCity(monterrey);
      graph.addConnection('cdmx', 'mty', 999999);
      expect(graph.getDistance('cdmx', 'mty')).toBe(999999);
    });

    test('should handle decimal distances', () => {
      graph.addCity(cdmx);
      graph.addCity(monterrey);
      graph.addConnection('cdmx', 'mty', 912.45);
      expect(graph.getDistance('cdmx', 'mty')).toBe(912.45);
    });
  });
});
