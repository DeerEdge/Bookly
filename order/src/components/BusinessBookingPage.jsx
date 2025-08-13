import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import apiService from '../services/api';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/** Utils */
const toLocalYYYYMMDD = (d) => {
  const dt = new Date(d);
  const yyyy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, '0');
  const dd = String(dt.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};
const buildSlots = (startHHMM, endHHMM, minutes = 60) => {
  const [sh, sm] = startHHMM.split(':').map(Number);
  const [eh, em] = endHHMM.split(':').map(Number);
  const slots = [];
  const start = new Date(2000, 0, 1, sh, sm, 0, 0);
  const end = new Date(2000, 0, 1, eh, em, 0, 0);
  const cur = new Date(start);
  while (cur < end) {
    slots.push(`${String(cur.getHours()).padStart(2, '0')}:${String(cur.getMinutes()).padStart(2, '0')}`);
    cur.setMinutes(cur.getMinutes() + minutes);
  }
  return slots;
};

// New function to use real business availability
const buildSlotsFromAvailability = (availableSlots) => {
  // availableSlots is already an array of "HH:MM" strings from the API
  return availableSlots || [];
};
const fmt12h = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return new Date(2000, 0, 1, h, m).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

/** Day Calendar (updated to use real business hours) */
const DayCalendar = ({
  date,
  onChangeDate,
  bookings,
  selectedTime,
  onSelectTime,
  businessId,
  availableSlots = [],
  loading = false,
}) => {
  // Use available slots from API instead of hardcoded hours
  const slots = useMemo(() => buildSlotsFromAvailability(availableSlots), [availableSlots]);

  // Normalize booked times to "HH:MM" (this is now handled by the API, but keep for backward compatibility)
  const booked = useMemo(
    () =>
      (bookings || [])
        .map((b) => (b.time || b.appointment_time || '').slice(0, 5))
        .filter(Boolean),
    [bookings]
  );

  const isToday = date.toDateString() === new Date().toDateString();

  const goDay = (delta) => {
    const next = new Date(date);
    next.setDate(next.getDate() + delta);
    onChangeDate(next);
  };

  const isPastSlot = (hhmm) => {
    if (!isToday) return false;
    const [h, m] = hhmm.split(':').map(Number);
    const slotDT = new Date(date);
    slotDT.setHours(h, m, 0, 0);
    return slotDT < new Date();
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 w-full">
      {/* Navigation */}
      <div className="mb-6 flex justify-between items-center">
        <button
          onClick={() => goDay(-1)}
          className="text-gray-400 hover:text-gray-600 transition-all duration-200 p-2 rounded-lg hover:bg-gray-25 border-0 bg-transparent"
          aria-label="Previous day"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="text-center">
          <div className="text-sm text-gray-500">
            {date.toLocaleDateString('en-US', { weekday: 'long' })}
          </div>
          <h2 className="text-xl font-light text-gray-900">
            {date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </h2>
        </div>

        <button
          onClick={() => goDay(1)}
          className="text-gray-400 hover:text-gray-600 transition-all duration-200 p-2 rounded-lg hover:bg-gray-25 border-0 bg-transparent"
          aria-label="Next day"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="mb-4 flex items-center justify-center gap-2">
        <button
          onClick={() => onChangeDate(new Date())}
          className="px-3 py-1.5 text-xs rounded-md border border-gray-200 hover:bg-gray-50 text-gray-700"
        >
          Today
        </button>
        <input
          type="date"
          className="px-2 py-1.5 text-xs rounded-md border border-gray-200"
          value={toLocalYYYYMMDD(date)}
          onChange={(e) => onChangeDate(new Date(e.target.value))}
          min={toLocalYYYYMMDD(new Date())}
        />
      </div>

      {/* Time slots */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {loading ? (
          // Loading state
          Array.from({ length: 8 }, (_, i) => (
            <div
              key={i}
              className="px-3 py-2 rounded-lg border border-gray-200 bg-gray-100 animate-pulse"
            >
              <div className="h-4 bg-gray-300 rounded"></div>
            </div>
          ))
        ) : slots.length === 0 ? (
          // No slots available
          <div className="col-span-full text-center py-8">
            <p className="text-gray-500 text-sm">No available times for this date</p>
          </div>
        ) : (
          // Available slots (already filtered by API)
          slots.map((hhmm) => {
            const past = isPastSlot(hhmm);
            const disabled = past; // API already filters out booked slots
            const selected = selectedTime === hhmm;

            return (
              <button
                key={hhmm}
                type="button"
                disabled={disabled}
                onClick={() => onSelectTime(hhmm)}
                className={[
                  'px-3 py-2 rounded-lg border text-sm transition-colors',
                  disabled
                    ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                    : selected
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-800 border-gray-200 hover:border-blue-300 hover:bg-blue-25',
                ].join(' ')}
                title={past ? 'Past time' : 'Available'}
              >
                {fmt12h(hhmm)}
              </button>
            );
          })
        )}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-center space-x-6 text-xs text-gray-400 font-light">
          <div className="flex items-center space-x-2">
            <span className="inline-block w-3 h-3 rounded border border-gray-300"></span>
            <span>Available</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="inline-block w-3 h-3 rounded bg-gray-100 border border-gray-200"></span>
            <span>Booked / Past</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="inline-block w-3 h-3 rounded bg-blue-500 border border-blue-500"></span>
            <span>Selected</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/** Main Page */
const BusinessBookingPage = ({ businesses, onBookAppointment }) => {
  const { businessSlug } = useParams();

  // Config - now using real business hours from API

  const [business, setBusiness] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [selectedTime, setSelectedTime] = useState('');

  const [customerInfo, setCustomerInfo] = useState({ name: '', email: '', phone: '' });
  const [sendEmailConfirmation, setSendEmailConfirmation] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [showQRPopup, setShowQRPopup] = useState(false);

  const [bookings, setBookings] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const apiDate = useMemo(() => toLocalYYYYMMDD(selectedDate), [selectedDate]);

  // Normalize times for display
  const formatTime = (time) =>
    new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

  useEffect(() => {
    const loadBusiness = async () => {
      try {
        setLoading(true);
        setError(null);
        const businessData = await apiService.getBusinessBySlug(businessSlug);
        setBusiness(businessData);

        if (businessData?.id) {
          try {
            const servicesData = await apiService.getBusinessServices(businessData.id);
            setServices(servicesData);
          } catch {
            setServices([]);
          }
        }
      } catch {
        setError('Business not found');
      } finally {
        setLoading(false);
      }
    };
    loadBusiness();
  }, [businessSlug]);

  useEffect(() => {
    const fetchBookings = async () => {
      if (business?.id && apiDate) {
        try {
          const bookingsData = await apiService.getBookingsForBusiness(business.id, apiDate);
          setBookings(Array.isArray(bookingsData) ? bookingsData : []);
        } catch {
          setBookings([]);
        }
      } else {
        setBookings([]);
      }
    };
    fetchBookings();
  }, [business?.id, apiDate]);

  // Load available slots from business hours API
  useEffect(() => {
    const fetchAvailableSlots = async () => {
      if (business?.id && apiDate) {
        try {
          setSlotsLoading(true);
          console.log('🔍 Loading available slots for:', business.id, apiDate);
          const availabilityData = await apiService.getAvailableSlots(business.id, apiDate);
          console.log('✅ Available slots:', availabilityData);
          setAvailableSlots(availabilityData.available_slots || []);
        } catch (error) {
          console.error('❌ Failed to load available slots:', error);
          setAvailableSlots([]);
        } finally {
          setSlotsLoading(false);
        }
      } else {
        setAvailableSlots([]);
      }
    };
    fetchAvailableSlots();
  }, [business?.id, apiDate]);

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    if (!selectedService || !apiDate || !selectedTime) {
      alert('Please choose a service, date, and time.');
      return;
    }
    if (!customerInfo.name || !customerInfo.email) {
      alert('Please provide your name and email.');
      return;
    }

    try {
      setSubmitting(true);
      setBookingSuccess(false);

      const appointment = {
        business_id: business.id,
        business_name: business.name,
        service_name: selectedService.name,
        service_price: selectedService.price,
        date: apiDate,
        time: selectedTime,
        customer_name: customerInfo.name,
        customer_email: customerInfo.email,
        customer_phone: customerInfo.phone,
        send_email_confirmation: sendEmailConfirmation,
        status: 'confirmed',
      };

      await onBookAppointment(appointment);
      setBookingSuccess(true);

      // refresh bookings and available slots so the slot becomes unavailable
      try {
        const [refreshedBookings, refreshedAvailability] = await Promise.all([
          apiService.getBookingsForBusiness(business.id, apiDate),
          apiService.getAvailableSlots(business.id, apiDate)
        ]);
        setBookings(Array.isArray(refreshedBookings) ? refreshedBookings : []);
        setAvailableSlots(refreshedAvailability.available_slots || []);
      } catch {}

      // reset fields (keep date)
      setSelectedService(null);
      setSelectedTime('');
      setCustomerInfo({ name: '', email: '', phone: '' });
      setSendEmailConfirmation(true);

      setTimeout(() => setBookingSuccess(false), 2200);
    } catch (err) {
      alert(`Failed to book appointment: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-25 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 font-light">Loading business...</p>
        </div>
      </div>
    );
  }

  if (error || !business) {
    return <Navigate to="/manage/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header (kept) */}
        <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-light text-gray-900 mb-2">{business.name}</h1>
              <p className="text-gray-600 mb-4">{business.description}</p>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>{business.category}</span>
                {business.address && <span>{business.address}</span>}
                {business.phone && <span>{business.phone}</span>}
              </div>
            </div>

            {/* Share button modal is optional — keep if you use it */}
            {false && (
              <button
                onClick={() => setShowQRPopup(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-light flex items-center space-x-2"
              >
                Share
              </button>
            )}
          </div>
        </div>

        {/* Booking */}
        <div className="bg-white rounded-lg border border-gray-200 p-10">
          <h2 className="text-2xl font-light text-gray-900 mb-8 text-center">Book Your Appointment</h2>

          {bookingSuccess && (
            <div className="mb-6 p-4 bg-green-25 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-green-800 font-light">Appointment booked successfully! You will receive a confirmation email shortly.</p>
              </div>
            </div>
          )}

          <div className="flex flex-col md:flex-row gap-10">
            {/* Day calendar (left) */}
            <div className="md:w-1/2">
              <DayCalendar
                date={selectedDate}
                onChangeDate={(d) => { setSelectedDate(d); setSelectedTime(''); }}
                bookings={bookings}
                selectedTime={selectedTime}
                onSelectTime={setSelectedTime}
                businessId={business?.id}
                availableSlots={availableSlots}
                loading={slotsLoading}
              />
            </div>

            {/* Bookings list + form (right) */}
            <div className="md:w-1/2">
              {/* Bookings for selected day */}
              <div className="mb-6">
                <h3 className="text-lg font-light text-gray-900 mb-2">Bookings for {apiDate}</h3>
                {bookings.length > 0 ? (
                  <ul className="divide-y divide-gray-200">
                    {bookings
                      .slice()
                      .sort((a, b) => String(a.time).localeCompare(String(b.time)))
                      .map((b) => (
                        <li key={b.id || `${b.time}-${b.customer_name}`} className="py-2 flex justify-between items-center">
                          <span className="text-sm text-gray-700">
                            {formatTime((b.time || '').slice(0, 5))} — {b.customer_name}
                          </span>
                          <span className="text-xs text-gray-500">{b.service_name}</span>
                        </li>
                      ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No bookings for this day.</p>
                )}
              </div>

              {/* Booking form (no manual date/time inputs) */}
              <form onSubmit={handleBookAppointment} className="space-y-6">
                {/* Service Selection */}
                <div>
                  <label className="block text-sm font-light text-gray-700 mb-3">Select Service</label>
                  {services.length > 0 ? (
                    <div className="grid gap-3">
                      {services.map((service) => (
                        <button
                          key={service.id}
                          type="button"
                          onClick={() => setSelectedService(service)}
                          className={`p-5 rounded-xl border-2 text-left transition-colors duration-150 shadow-sm
                            ${selectedService?.id === service.id
                              ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-300 font-semibold text-blue-900'
                              : 'border-gray-200 hover:border-blue-300 hover:bg-blue-25'
                            }`}
                          style={{ boxShadow: selectedService?.id === service.id ? '0 4px 24px 0 rgba(59,130,246,0.10)' : undefined }}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className={`text-base ${selectedService?.id === service.id ? 'font-semibold' : 'font-light'} text-gray-900`}>
                                {service.name}
                              </h4>
                              <p className="text-xs text-gray-500">{service.duration} minutes</p>
                            </div>
                            <span className={`text-lg ${selectedService?.id === service.id ? 'font-semibold text-blue-700' : 'font-light text-gray-900'}`}>
                              ${service.price}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>No services available at this time.</p>
                      <p className="text-sm">Please contact the business directly.</p>
                    </div>
                  )}
                </div>

                {/* Readouts only */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-light text-gray-600 mb-2">Date</label>
                    <div className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm text-gray-700">
                      {apiDate}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-light text-gray-600 mb-2">Time</label>
                    <div className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm text-gray-700">
                      {selectedTime ? fmt12h(selectedTime) : '—'}
                    </div>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-light text-gray-600 mb-2">Name *</label>
                    <input
                      type="text"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-400 focus:border-blue-400 text-sm font-light"
                      placeholder="Your full name"
                      disabled={submitting}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-light text-gray-600 mb-2">Email *</label>
                    <input
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-400 focus:border-blue-400 text-sm font-light"
                      placeholder="your@email.com"
                      disabled={submitting}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-light text-gray-600 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-400 focus:border-blue-400 text-sm font-light"
                      placeholder="(555) 123-4567"
                      disabled={submitting}
                    />
                  </div>
                </div>

                {/* Email Confirmation */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="sendEmailConfirmation"
                    checked={sendEmailConfirmation}
                    onChange={(e) => setSendEmailConfirmation(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    disabled={submitting}
                  />
                  <label htmlFor="sendEmailConfirmation" className="ml-2 block text-sm text-gray-700 font-light">
                    Send me my appointment details via email
                  </label>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={!selectedService || !apiDate || !selectedTime || submitting}
                  className={`w-full py-3 px-4 rounded-lg font-light transition-colors text-sm ${
                    selectedService && apiDate && selectedTime && !submitting
                      ? 'bg-blue-500 hover:bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {submitting ? 'Booking Appointment...' : 'Book Appointment'}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Optional QR modal */}
        {showQRPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              {/* Your QR content here */}
              <button onClick={() => setShowQRPopup(false)} className="mt-4 w-full py-2 border rounded-lg">
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessBookingPage;