const City = require('../src/City');

describe('City', () => {
  // ==================== Construction Tests ====================

  describe('Constructor', () => {
    test('should create a valid city with all parameters', () => {
      const city = new City('cdmx', 'Mexico City', 19.4326, -99.1332, 'CDMX');

      expect(city.id).toBe('cdmx');
      expect(city.name).toBe('Mexico City');
      expect(city.latitude).toBe(19.4326);
      expect(city.longitude).toBe(-99.1332);
      expect(city.state).toBe('CDMX');
    });

    test('should trim whitespace from the name', () => {
      const city = new City('mty', '  Monterrey  ', 25.6866, -100.3161, 'Nuevo León');
      expect(city.name).toBe('Monterrey');
    });

    test('should handle empty state', () => {
      const city = new City('city1', 'City 1', 20.0, -100.0, '');
      expect(city.state).toBe('');
    });

    test('should throw an error if ID is empty', () => {
      expect(() => {
        new City('', 'City', 20.0, -100.0, 'State');
      }).toThrow('The city ID is required and must be a string');
    });

    test('should throw an error if ID is not a string', () => {
      expect(() => {
        new City(123, 'City', 20.0, -100.0, 'State');
      }).toThrow('The city ID is required and must be a string');
    });

    test('should throw an error if name is empty', () => {
      expect(() => {
        new City('id1', '', 20.0, -100.0, 'State');
      }).toThrow('The city name is required and must be a string');
    });

    test('should throw an error if name is not a string', () => {
      expect(() => {
        new City('id1', 123, 20.0, -100.0, 'State');
      }).toThrow('The city name is required and must be a string');
    });

    test('should throw an error if latitude is less than -90', () => {
      expect(() => {
        new City('id1', 'City', -91, -100.0, 'State');
      }).toThrow('The latitude must be a number between -90 and 90');
    });

    test('should throw an error if latitude is greater than 90', () => {
      expect(() => {
        new City('id1', 'City', 91, -100.0, 'State');
      }).toThrow('The latitude must be a number between -90 and 90');
    });

    test('should throw an error if longitude is less than -180', () => {
      expect(() => {
        new City('id1', 'City', 20.0, -181, 'State');
      }).toThrow('The length must be a number between -180 and 180');
    });

    test('should throw an error if longitude is greater than 180', () => {
      expect(() => {
        new City('id1', 'City', 20.0, 181, 'State');
      }).toThrow('The length must be a number between -180 and 180');
    });

    test('should accept latitude at boundary values (-90 and 90)', () => {
      const city1 = new City('south', 'South Pole', -90, 0, 'Antarctica');
      const city2 = new City('north', 'North Pole', 90, 0, 'Arctic');

      expect(city1.latitude).toBe(-90);
      expect(city2.latitude).toBe(90);
    });

    test('should accept longitude at boundary values (-180 and 180)', () => {
      const city1 = new City('west', 'West City', 0, -180, 'Country');
      const city2 = new City('east', 'East City', 0, 180, 'Country');

      expect(city1.longitude).toBe(-180);
      expect(city2.longitude).toBe(180);
    });
  });

  // ==================== Distance Tests ====================

  describe('distanceTo', () => {
    test('should correctly calculate distance between two cities', () => {
      const cdmx = new City('cdmx', 'CDMX', 19.4326, -99.1332, 'CDMX');
      const monterrey = new City('mty', 'Monterrey', 25.6866, -100.3161, 'NL');

      const distance = cdmx.distanceTo(monterrey);

      // Approximate distance between CDMX and Monterrey is ~912 km
      expect(distance).toBeGreaterThan(700);
      expect(distance).toBeLessThan(710);
    });

    test('should return 0 km for the same location', () => {
      const city1 = new City('id1', 'City A', 20.0, -100.0, 'State');
      const city2 = new City('id2', 'City B', 20.0, -100.0, 'State');

      const distance = city1.distanceTo(city2);
      expect(distance).toBe(0);
    });

    test('should throw an error if the parameter is not an instance of City', () => {
      const city = new City('id1', 'City', 20.0, -100.0, 'State');

      expect(() => {
        city.distanceTo({ latitude: 20.0, longitude: -100.0 });
      }).toThrow('The parameter must be an instance of City');
    });

    test('should calculate symmetric distance (A to B = B to A)', () => {
      const city1 = new City('id1', 'City A', 19.0, -99.0, 'State');
      const city2 = new City('id2', 'City B', 20.0, -100.0, 'State');

      const distance1to2 = city1.distanceTo(city2);
      const distance2to1 = city2.distanceTo(city1);

      expect(distance1to2).toBe(distance2to1);
    });

    test('should round distance to 2 decimals', () => {
      const city1 = new City('id1', 'City A', 19.123456, -99.123456, 'State');
      const city2 = new City('id2', 'City B', 19.654321, -99.654321, 'State');

      const distance = city1.distanceTo(city2);

      // Check it has at most 2 decimal places
      expect(distance.toString().split('.')[1]?.length || 0).toBeLessThanOrEqual(2);
    });
  });

  // ==================== Serialization Tests ====================

  describe('toJSON', () => {
    test('should convert the city to a JSON object', () => {
      const city = new City('cdmx', 'CDMX', 19.4326, -99.1332, 'CDMX');
      const json = city.toJSON();

      expect(json).toEqual({
        id: 'cdmx',
        name: 'CDMX',
        latitude: 19.4326,
        longitude: -99.1332,
        state: 'CDMX'
      });
    });

    test('should include all fields in JSON', () => {
      const city = new City('id', 'Name', 10.0, -50.0, 'State');
      const json = city.toJSON();

      expect(json).toHaveProperty('id');
      expect(json).toHaveProperty('name');
      expect(json).toHaveProperty('latitude');
      expect(json).toHaveProperty('longitude');
      expect(json).toHaveProperty('state');
    });
  });

  describe('fromJSON', () => {
    test('should create a city from a JSON object', () => {
      const json = {
        id: 'mty',
        name: 'Monterrey',
        latitude: 25.6866,
        longitude: -100.3161,
        state: 'Nuevo León'
      };

      const city = City.fromJSON(json);

      expect(city).toBeInstanceOf(City);
      expect(city.id).toBe('mty');
      expect(city.name).toBe('Monterrey');
      expect(city.latitude).toBe(25.6866);
      expect(city.longitude).toBe(-100.3161);
      expect(city.state).toBe('Nuevo León');
    });

    test('should throw an error if JSON is null', () => {
      expect(() => {
        City.fromJSON(null);
      }).toThrow('JSON must be a valid object');
    });

    test('should throw an error if JSON is not an object', () => {
      expect(() => {
        City.fromJSON('not an object');
      }).toThrow('JSON must be a valid object');
    });

    test('should throw an error if JSON has invalid data', () => {
      const json = {
        id: 'id',
        name: 'City',
        latitude: 'not a number',
        longitude: -100.0,
        state: 'State'
      };

      expect(() => {
        City.fromJSON(json);
      }).toThrow();
    });
  });

  // ==================== Comparison Tests ====================

  describe('equals', () => {
    test('should return true for cities with the same ID', () => {
      const city1 = new City('id1', 'City A', 20.0, -100.0, 'State');
      const city2 = new City('id1', 'City B', 25.0, -105.0, 'Another State');

      expect(city1.equals(city2)).toBe(true);
    });

    test('should return false for cities with different IDs', () => {
      const city1 = new City('id1', 'City', 20.0, -100.0, 'State');
      const city2 = new City('id2', 'City', 20.0, -100.0, 'State');

      expect(city1.equals(city2)).toBe(false);
    });

    test('should return false if parameter is not an instance of City', () => {
      const city = new City('id1', 'City', 20.0, -100.0, 'State');

      expect(city.equals({ id: 'id1' })).toBe(false);
      expect(city.equals(null)).toBe(false);
      expect(city.equals(undefined)).toBe(false);
    });
  });

  // ==================== toString Tests ====================

  describe('toString', () => {
    test('should return a string representation of the city', () => {
      const city = new City('cdmx', 'CDMX', 19.4326, -99.1332, 'CDMX');
      const str = city.toString();

      expect(str).toContain('CDMX');
      expect(str).toContain('19.4326');
      expect(str).toContain('-99.1332');
    });

    test('should include all relevant data', () => {
      const city = new City('id', 'Test City', 10.5, -50.5, 'Test State');
      const str = city.toString();

      expect(str).toContain('Test City');
      expect(str).toContain('Test State');
      expect(str).toContain('10.5');
      expect(str).toContain('-50.5');
    });
  });

  // ==================== Edge Case Tests ====================

  describe('Edge Cases', () => {
    test('should handle names with special characters', () => {
      const city = new City('id', 'São Paulo', 0, 0, 'Brazil');
      expect(city.name).toBe('São Paulo');
    });

    test('should handle coordinates with many decimals', () => {
      const city = new City('id', 'City', 19.123456789, -99.987654321, 'State');
      expect(city.latitude).toBe(19.123456789);
      expect(city.longitude).toBe(-99.987654321);
    });

    test('should handle coordinates at 0,0 (Null Island)', () => {
      const city = new City('null_island', 'Null Island', 0, 0, 'Ocean');
      expect(city.latitude).toBe(0);
      expect(city.longitude).toBe(0);
    });

    test('should handle undefined state', () => {
      const city = new City('id', 'City', 20.0, -100.0);
      expect(city.state).toBe('');
    });
  });
});