const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    console.log('API Request:', {
      url,
      method: config.method || 'GET',
      body: config.body,
      headers: config.headers
    });

    try {
      const response = await fetch(url, config);
      console.log('API Response:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url
      });
      
      const data = await response.json();
      console.log('API Response Data:', data);
      
      if (!response.ok) {
        console.error('API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          data: data
        });
        throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      return data;
    } catch (error) {
      console.error('API Request Failed:', {
        url,
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  // Business endpoints
  async getAllBusinesses() {
    return this.request('/businesses');
  }

  async getBusinessBySlug(slug) {
    return this.request(`/businesses/slug/${slug}`);
  }

  async getBusiness(businessId) {
    return this.request(`/businesses/${businessId}`);
  }

  async registerBusiness(businessData) {
    return this.request('/businesses/register', {
      method: 'POST',
      body: JSON.stringify(businessData),
    });
  }

  async loginBusiness(email, password) {
    return this.request('/businesses/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async updateBusiness(businessId, updates) {
    return this.request(`/businesses/${businessId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteBusiness(businessId) {
    return this.request(`/businesses/${businessId}`, {
      method: 'DELETE',
    });
  }

  // Service endpoints
  async getBusinessServices(businessId) {
    return this.request(`/services/business/${businessId}`);
  }

  async getService(serviceId) {
    return this.request(`/services/${serviceId}`);
  }

  async createService(serviceData) {
    return this.request('/services', {
      method: 'POST',
      body: JSON.stringify(serviceData),
    });
  }

  async updateService(serviceId, updates) {
    return this.request(`/services/${serviceId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteService(serviceId) {
    return this.request(`/services/${serviceId}`, {
      method: 'DELETE',
    });
  }

  // Appointment endpoints
  async getBusinessAppointments(businessId) {
    return this.request(`/appointments/business/${businessId}`);
  }

  async getAppointment(appointmentId, businessId) {
    return this.request(`/appointments/${appointmentId}?business_id=${businessId}`);
  }

  async createAppointment(appointmentData) {
    console.log('Creating appointment:', appointmentData);
    return this.request('/appointments/', {
      method: 'POST',
      body: JSON.stringify(appointmentData),
    });
  }

  async updateAppointment(appointmentId, businessId, updates) {
    return this.request(`/appointments/${appointmentId}?business_id=${businessId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteAppointment(appointmentId, businessId) {
    return this.request(`/appointments/${appointmentId}?business_id=${businessId}`, {
      method: 'DELETE',
    });
  }

  async getAppointmentsByRange(businessId, startDate, endDate) {
    const params = new URLSearchParams({
      start_date: startDate,
      end_date: endDate,
    });
    return this.request(`/appointments/business/${businessId}/range?${params}`);
  }

  // Business Hours endpoints
  async getBusinessHours(businessId) {
    return this.request(`/business-hours/business/${businessId}`);
  }

  async updateBusinessHours(businessId, hoursData) {
    return this.request(`/business-hours/business/${businessId}`, {
      method: 'PUT',
      body: JSON.stringify(hoursData),
    });
  }

  async updateSingleDayHours(businessId, dayName, dayData) {
    return this.request(`/business-hours/business/${businessId}/day/${dayName}`, {
      method: 'PUT',
      body: JSON.stringify(dayData),
    });
  }

  async getAvailableTimeSlots(businessId) {
    return this.request(`/business-hours/business/${businessId}/available-slots`);
  }

  async deleteBusinessHours(businessId) {
    return this.request(`/business-hours/business/${businessId}`, {
      method: 'DELETE',
    });
  }

  // Closed Dates endpoints
  async getClosedDates(businessId) {
    return this.request(`/closed-dates/business/${businessId}`);
  }

  async addClosedDate(businessId, date, reason = '') {
    return this.request(`/closed-dates/business/${businessId}`, {
      method: 'POST',
      body: JSON.stringify({ date, reason }),
    });
  }

  async removeClosedDate(businessId, date) {
    return this.request(`/closed-dates/business/${businessId}/date/${date}`, {
      method: 'DELETE',
    });
  }

  async updateClosedDatesBulk(businessId, closedDates) {
    return this.request(`/closed-dates/business/${businessId}/bulk`, {
      method: 'PUT',
      body: JSON.stringify({ closed_dates: closedDates }),
    });
  }

  async checkIfClosed(businessId, date) {
    return this.request(`/closed-dates/business/${businessId}/check/${date}`);
  }

  // Availability endpoints
  async getAvailableSlots(businessId, date) {
    return this.request(`/availability/business/${businessId}/date/${date}`);
  }

  async getAvailableSlotsRange(businessId, startDate, endDate) {
    const params = new URLSearchParams({
      start_date: startDate,
      end_date: endDate,
    });
    return this.request(`/availability/business/${businessId}/range?${params}`);
  }

  async getBusinessAvailabilitySummary(businessId) {
    return this.request(`/availability/business/${businessId}/summary`);
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }
}

export default new ApiService(); 