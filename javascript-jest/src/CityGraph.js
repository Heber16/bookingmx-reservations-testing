const City = require('./City');

/**
 * Class representing a graph of cities with their connections and distances
 */
class CityGraph {
  constructor() {
    this.cities = new Map(); // Map<cityId, City>
    this.connections = new Map(); // Map<cityId, Map<cityId, distance>>
  }

  /**
   * Adds a city to the graph
   * @param {City} city - The city to add
   */
  addCity(city) {
    if (!(city instanceof City)) {
      throw new Error('The parameter must be an instance of City');
    }

    if (this.cities.has(city.id)) {
      throw new Error(`City with ID ${city.id} already exists in the graph`);
    }

    this.cities.set(city.id, city);
    this.connections.set(city.id, new Map());
  }

  /**
   * Adds a bidirectional connection between two cities
   * @param {string} cityId1 - ID of the first city
   * @param {string} cityId2 - ID of the second city
   * @param {number} distance - Distance between the cities (optional, calculated automatically)
   */
  addConnection(cityId1, cityId2, distance = null) {
    if (!this.cities.has(cityId1)) {
      throw new Error(`City with ID ${cityId1} does not exist in the graph`);
    }
    if (!this.cities.has(cityId2)) {
      throw new Error(`City with ID ${cityId2} does not exist in the graph`);
    }
    if (cityId1 === cityId2) {
      throw new Error('A city cannot be connected to itself');
    }

    const city1 = this.cities.get(cityId1);
    const city2 = this.cities.get(cityId2);

    // If distance is not provided, calculate it automatically
    const finalDistance = distance !== null ? distance : city1.distanceTo(city2);

    if (finalDistance <= 0) {
      throw new Error('Distance must be greater than 0');
    }

    // Bidirectional connection
    this.connections.get(cityId1).set(cityId2, finalDistance);
    this.connections.get(cityId2).set(cityId1, finalDistance);
  }

  /**
   * Gets all nearby cities connected to a given city
   * @param {string} cityId - ID of the city
   * @returns {Array<{city: City, distance: number}>} Array of nearby cities with distances
   */
  getNearbyCities(cityId) {
    if (!cityId || typeof cityId !== 'string') {
      throw new Error('City ID must be a valid string');
    }

    if (!this.cities.has(cityId)) {
      throw new Error(`City with ID ${cityId} does not exist in the graph`);
    }

    const nearbyConnections = this.connections.get(cityId);
    const nearbyCities = [];

    for (const [connectedCityId, distance] of nearbyConnections.entries()) {
      nearbyCities.push({
        city: this.cities.get(connectedCityId),
        distance: distance
      });
    }

    // Sort by distance (closest first)
    nearbyCities.sort((a, b) => a.distance - b.distance);

    return nearbyCities;
  }

  /**
   * Gets nearby cities within a specific radius
   * @param {string} cityId - ID of the city
   * @param {number} maxDistance - Maximum distance in km
   * @returns {Array<{city: City, distance: number}>}
   */
  getNearbyCitiesWithinRadius(cityId, maxDistance) {
    if (!cityId || typeof cityId !== 'string') {
      throw new Error('City ID must be a valid string');
    }

    if (typeof maxDistance !== 'number' || maxDistance <= 0) {
      throw new Error('Maximum distance must be a positive number');
    }

    const allNearby = this.getNearbyCities(cityId);
    return allNearby.filter(item => item.distance <= maxDistance);
  }

  /**
   * Finds the shortest path between two cities using Dijkstra's algorithm
   * @param {string} startCityId - ID of the starting city
   * @param {string} endCityId - ID of the destination city
   * @returns {Object} {path: Array<City>, distance: number}
   */
  findShortestPath(startCityId, endCityId) {
    if (!this.cities.has(startCityId)) {
      throw new Error(`Starting city ${startCityId} does not exist`);
    }
    if (!this.cities.has(endCityId)) {
      throw new Error(`Destination city ${endCityId} does not exist`);
    }
    if (startCityId === endCityId) {
      return {
        path: [this.cities.get(startCityId)],
        distance: 0
      };
    }

    const distances = new Map();
    const previous = new Map();
    const unvisited = new Set(this.cities.keys());

    // Initialize distances
    for (const cityId of this.cities.keys()) {
      distances.set(cityId, cityId === startCityId ? 0 : Infinity);
      previous.set(cityId, null);
    }

    while (unvisited.size > 0) {
      // Find the unvisited city with the smallest distance
      let currentCityId = null;
      let minDistance = Infinity;

      for (const cityId of unvisited) {
        if (distances.get(cityId) < minDistance) {
          minDistance = distances.get(cityId);
          currentCityId = cityId;
        }
      }

      if (currentCityId === null || minDistance === Infinity) {
        // No path found
        return null;
      }

      if (currentCityId === endCityId) {
        break;
      }

      unvisited.delete(currentCityId);

      // Update neighbor distances
      const neighbors = this.connections.get(currentCityId);
      for (const [neighborId, distance] of neighbors.entries()) {
        if (unvisited.has(neighborId)) {
          const newDistance = distances.get(currentCityId) + distance;
          if (newDistance < distances.get(neighborId)) {
            distances.set(neighborId, newDistance);
            previous.set(neighborId, currentCityId);
          }
        }
      }
    }

    // Reconstruct the path
    if (distances.get(endCityId) === Infinity) {
      return null; // No path
    }

    const path = [];
    let currentId = endCityId;

    while (currentId !== null) {
      path.unshift(this.cities.get(currentId));
      currentId = previous.get(currentId);
    }

    return {
      path: path,
      distance: Math.round(distances.get(endCityId) * 100) / 100
    };
  }

  /**
   * Gets a city by its ID
   */
  getCity(cityId) {
    if (!this.cities.has(cityId)) {
      throw new Error(`City with ID ${cityId} does not exist`);
    }
    return this.cities.get(cityId);
  }

  /**
   * Checks if there is a connection between two cities
   */
  hasConnection(cityId1, cityId2) {
    if (!this.cities.has(cityId1) || !this.cities.has(cityId2)) {
      return false;
    }
    return this.connections.get(cityId1).has(cityId2);
  }

  /**
   * Gets the distance between two connected cities
   */
  getDistance(cityId1, cityId2) {
    if (!this.hasConnection(cityId1, cityId2)) {
      throw new Error(`No connection exists between ${cityId1} and ${cityId2}`);
    }
    return this.connections.get(cityId1).get(cityId2);
  }

  /**
   * Gets the total number of cities in the graph
   */
  getCityCount() {
    return this.cities.size;
  }

  /**
   * Gets the total number of connections (edges)
   */
  getConnectionCount() {
    let count = 0;
    for (const connections of this.connections.values()) {
      count += connections.size;
    }
    return count / 2; // Divide by 2 because connections are bidirectional
  }

  /**
   * Clears the graph
   */
  clear() {
    this.cities.clear();
    this.connections.clear();
  }

  /**
   * Gets all cities
   */
  getAllCities() {
    return Array.from(this.cities.values());
  }

  /**
   * Exports the graph to JSON
   */
  toJSON() {
    const citiesArray = Array.from(this.cities.values()).map(city => city.toJSON());
    const connectionsArray = [];

    const processedConnections = new Set();

    for (const [cityId1, connections] of this.connections.entries()) {
      for (const [cityId2, distance] of connections.entries()) {
        const connectionKey = [cityId1, cityId2].sort().join('-');
        if (!processedConnections.has(connectionKey)) {
          connectionsArray.push({
            from: cityId1,
            to: cityId2,
            distance: distance
          });
          processedConnections.add(connectionKey);
        }
      }
    }

    return {
      cities: citiesArray,
      connections: connectionsArray
    };
  }

  /**
   * Imports a graph from JSON
   */
  static fromJSON(json) {
    if (!json || typeof json !== 'object') {
      throw new Error('The JSON must be a valid object');
    }

    if (!Array.isArray(json.cities)) {
      throw new Error('The JSON must contain a "cities" array');
    }

    if (!Array.isArray(json.connections)) {
      throw new Error('The JSON must contain a "connections" array');
    }

    const graph = new CityGraph();

    // Add cities
    for (const cityData of json.cities) {
      const city = City.fromJSON(cityData);
      graph.addCity(city);
    }

    // Add connections
    for (const connection of json.connections) {
      graph.addConnection(connection.from, connection.to, connection.distance);
    }

    return graph;
  }
}

module.exports = CityGraph;