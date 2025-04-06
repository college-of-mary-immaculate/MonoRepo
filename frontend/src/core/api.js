class ApiClient {
  constructor() {
    this.apiServer = 'http://localhost:3000/v1';
    this.MAX_RETRIES = 3;
    this.retryCount = 0;
  }

  async post(endpoint, data, headers = {}) {
    const url = `${this.apiServer}/${endpoint}`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      this.retryCount = 0;
      return await response.json();
    } catch (error) {
      console.error(`Error in request to ${url}:`, error);

      if (this.retryCount < this.MAX_RETRIES) {
        this.retryCount++;
        
        console.log(`Retrying request (${this.retryCount}/${this.MAX_RETRIES})...`);
        return new Promise(resolve => setTimeout(() => {
          resolve(this.post(endpoint, data, headers));
        }, 1000));
      } else {
        console.error(`Maximum retries (${this.MAX_RETRIES}) reached. Giving up.`);
        this.retryCount = 0;
        throw error;
      }
    }
  }
  
  async get(endpoint, headers = {}) {
    const url = `${this.apiServer}/${endpoint}`;
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      this.retryCount = 0;
      return await response.json();
    } catch (error) {
      console.error(`Error in request to ${url}:`, error);

      if (this.retryCount < this.MAX_RETRIES) {
        this.retryCount++;
        
        console.log(`Retrying request (${this.retryCount}/${this.MAX_RETRIES})...`);
        return new Promise(resolve => setTimeout(() => {
          resolve(this.get(endpoint, headers));
        }, 1000));
      } else {
        console.error(`Maximum retries (${this.MAX_RETRIES}) reached. Giving up.`);
        this.retryCount = 0;
        throw error;
      }
    }
  }
  
  async delete(endpoint, headers = {}) {
    const url = `${this.apiServer}/${endpoint}`;
    
    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      this.retryCount = 0;
      return await response.json();
    } catch (error) {
      console.error(`Error in request to ${url}:`, error);

      if (this.retryCount < this.MAX_RETRIES) {
        this.retryCount++;
        
        console.log(`Retrying request (${this.retryCount}/${this.MAX_RETRIES})...`);
        return new Promise(resolve => setTimeout(() => {
          resolve(this.delete(endpoint, headers));
        }, 1000));
      } else {
        console.error(`Maximum retries (${this.MAX_RETRIES}) reached. Giving up.`);
        this.retryCount = 0;
        throw error;
      }
    }
  }
}

export default new ApiClient(); 