# BookMyAppointment

A modern appointment booking platform where businesses can register and customers can book appointments. Built with React, Tailwind CSS, and Python Flask.

## Features

- **Business Management**: Dashboard, calendar view, appointment history, and profile management
- **Customer Booking**: Public booking pages for each business
- **Real-time Updates**: Automatic data refresh and manual refresh capabilities
- **Responsive Design**: Clean, light theme with Tailwind CSS
- **Authentication**: Secure business login system

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS
- **Backend**: Python Flask
- **Data Storage**: JSON files (with Supabase integration planned)
- **Icons**: Lucide React

## Prerequisites

- Node.js (v16 or higher)
- Python 3.8 or higher
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd OrderAgain
   ```

2. **Install frontend dependencies**
   ```bash
   cd order
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd backend
   pip install flask flask-cors
   ```

4. **Initialize sample data**
   ```bash
   cd backend
   python3 init_sample_data.py
   ```

## Running the Application

### Start the Backend Server

1. **Navigate to the backend directory**
   ```bash
   cd backend
   ```

2. **Run the Flask server**
   ```bash
   python3 app.py
   ```
   
   The backend will start on `http://localhost:5000`

### Start the Frontend Development Server

1. **Open a new terminal and navigate to the frontend directory**
   ```bash
   cd order
   ```

2. **Start the development server**
   ```bash
   npm run dev
   ```
   
   The frontend will start on `http://localhost:5173`

## Usage

### Business Management

1. **Access the business login page**: `http://localhost:5173/manage/login`
2. **Login with demo credentials**:
   - Email: `elegant@example.com`
   - Password: `password123`
3. **Navigate through tabs**:
   - **Dashboard**: Overview of appointments and business stats
   - **Calendar**: Visual calendar view of appointments
   - **History**: Analytics and appointment history with charts
   - **Profile**: Edit business details and services

### Customer Booking

1. **Access a business's public booking page**: `http://localhost:5173/elegant-hair-salon`
2. **Book appointments** by selecting services, dates, and times
3. **View appointment confirmations**

## Project Structure

```
OrderAgain/
├── order/                    # Frontend React application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── App.jsx         # Main application
│   ├── package.json
│   └── vite.config.js
├── backend/                 # Python Flask backend
│   ├── app.py              # Main Flask application
│   ├── routes/             # API route blueprints
│   ├── data/               # JSON data files
│   └── init_sample_data.py # Sample data initialization
└── README.md
```

## API Endpoints

### Businesses
- `GET /api/businesses` - Get all businesses
- `POST /api/businesses/register` - Register new business
- `POST /api/businesses/login` - Business login
- `PUT /api/businesses/:id` - Update business profile
- `DELETE /api/businesses/:id` - Delete business

### Appointments
- `GET /api/appointments/:business_id` - Get business appointments
- `POST /api/appointments/` - Create new appointment
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Delete appointment

## Development

### Frontend Development
- **Hot reload**: Changes are automatically reflected in the browser
- **Tailwind CSS**: Utility-first CSS framework
- **Component structure**: Modular React components

### Backend Development
- **Flask blueprints**: Organized route structure
- **JSON storage**: Simple file-based data persistence
- **CORS enabled**: Cross-origin requests allowed

## Sample Data

The application comes with sample data for testing:

- **Business**: Elegant Hair Salon (`elegant@example.com` / `password123`)
- **Appointments**: Various appointments across different months
- **Services**: Haircut, Styling, Coloring, etc.

## Future Enhancements

- [ ] Supabase database integration
- [ ] Email notifications
- [ ] Payment processing
- [ ] Advanced analytics
- [ ] Multi-language support

## Troubleshooting

### Common Issues

1. **Port already in use**: Change the port in `vite.config.js` or use a different port for Flask
2. **Python not found**: Use `python3` instead of `python`
3. **CORS errors**: Ensure the Flask server is running and CORS is properly configured
4. **Data not loading**: Check that `init_sample_data.py` was run successfully

### Debug Mode

- **Frontend**: Check browser console for React errors
- **Backend**: Flask debug mode shows detailed error messages

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
