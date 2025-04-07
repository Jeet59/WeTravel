# WeTravel Mumbai

A web application that provides comprehensive travel assistance for Mumbai, India.

## Features

- **Authentication System**: Login and signup functionality
- **Interactive Maps**: Explore Mumbai neighborhoods using Google Maps
- **Chat Assistant**: AI-powered chat for travel recommendations
- **Neighborhood Guides**: Detailed information about Mumbai's popular areas

## Environment Setup

### API Keys

The application requires two API keys to function properly:
1. Google Maps API Key
2. DeepInfra API Key for the LLM chat functionality

### Setting Up Environment Variables

1. Create a `.env` file in the root directory with the following content:
   ```
   GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   DEEPINFRA_API_KEY=your_deepinfra_api_key
   ```

2. Replace the placeholder values with your actual API keys.

### Getting API Keys

- **Google Maps API Key**: Obtain from the [Google Cloud Console](https://console.cloud.google.com/)
- **DeepInfra API Key**: Get from the [DeepInfra Dashboard](https://deepinfra.com/)

## Installation

1. Clone the repository
2. Create and configure the `.env` file as described above
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the application:
   ```bash
   uvicorn main:app --reload
   ```

## Usage

- Access the application at `http://localhost:8000/`
- Log in with the default credentials:
  - Email: demo@example.com
  - Password: password
- Or sign up with your own credentials

## Development

- Backend: FastAPI with Python
- Frontend: HTML, CSS, JavaScript
- API Integration: Google Maps, DeepInfra LLM 