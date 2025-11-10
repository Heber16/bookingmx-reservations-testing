/**
 * Class that represents a city in the graph
 */
class City {
  /**
   * @param {string} id - Unique city identifier
   * @param {string} name - City name
   * @param {number} latitude - City latitude
   * @param {number} longitude - City length
   * @param {string} state - City status
   */
  constructor(id, name, latitude, longitude, state) {
    if (!id || typeof id !== 'string') {
      throw new Error('The city ID is required and must be a string');
    }
    if (!name || typeof name !== 'string') {
      throw new Error('The city name is required and must be a string');
    }
    if (typeof latitude !== 'number' || latitude < -90 || latitude > 90) {
      throw new Error('The latitude must be a number between -90 and 90');
    }
    if (typeof longitude !== 'number' || longitude < -180 || longitude > 180) {
      throw new Error('The length must be a number between -180 and 180');
    }

    this.id = id;
    this.name = name.trim();
    this.latitude = latitude;
    this.longitude = longitude;
    this.state = state ? state.trim() : '';
  }

  /**
   * Calculate the distance in kilometers to another city using the Haversine formula
   * @param {City} otherCity - The other city
   * @returns {number} Distance in kilometers
   */
  distanceTo(otherCity) {
    if (!(otherCity instanceof City)) {
      throw new Error('The parameter must be an instance of City');
    }

    const R = 6371; // Radius of the Earth in km
    const dLat = this._toRadians(otherCity.latitude - this.latitude);
    const dLon = this._toRadians(otherCity.longitude - this.longitude);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this._toRadians(this.latitude)) *
              Math.cos(this._toRadians(otherCity.latitude)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Convert degrees to radians
   * @private
   */
  _toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  /**
   * Convert the city into a simple object
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      latitude: this.latitude,
      longitude: this.longitude,
      state: this.state
    };
  }

  /**
   * Create a city from an object
   */
  static fromJSON(json) {
    if (!json || typeof json !== 'object') {
      throw new Error('The JSON must be a valid object');
    }
    return new City(json.id, json.name, json.latitude, json.longitude, json.state);
  }

  /**
   * Compare if two cities are the same
   */
  equals(otherCity) {
    if (!(otherCity instanceof City)) {
      return false;
    }
    return this.id === otherCity.id;
  }

  toString() {
    return `${this.name}, ${this.state} (${this.latitude}, ${this.longitude})`;
  }
}

module.exports = City;