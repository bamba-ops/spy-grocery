# Spy Grocery Frontend

This project is a frontend application for a grocery comparison service built with Vue 3, Pinia, and Axios. The application provides features for listing product prices from stores and finding the cheapest product based on user queries.

## Features
- List product prices by store.
- Find the cheapest product for a specified query.
- Vue 3, Pinia, and Axios based structure.

## Project Structure
The project is structured into several key components:

### API Layer
- `DataAPISource.js`: Handles communication with the backend API using Axios.

### Services
- `CheapestService.js`: Fetches the cheapest product price.
- `ListingService.js`: Fetches product prices for a specific store.

### State Management
- `MainModel.js`: Manages the application's state using Pinia.

### Views
- `LoadingListing.vue`: Loading component for product listings.
- `LoadingCheapest.vue`: Loading component for cheapest product results.
- `Error.vue`: Displays error messages.
- `CheapestView.vue`: View for displaying the cheapest product result.
- `ListingView.vue`: View for displaying product listings.

### Configuration
- `index.js`: Configures Vue Router.
- `main.js`: Initializes the Vue application and integrates Pinia and the router.

## Installation
Ensure you have Node.js and npm installed.

```bash
# Clone the repository
git clone <repository-url>
cd spy-grocery-frontend

# Install dependencies
npm install

# Run the development server
npm run dev
```

## API Integration
The application interacts with a backend API located at `http://127.0.0.1:8000/api/v1`.
- **Best Price:** `POST /product/price`
- **Prices by Store:** `GET /prices/store/{STORE_ID}`

## Usage
1. Access the homepage to view product listings.
2. Navigate to `/cheapest` to find the cheapest product based on a query.

## Technologies Used
- Vue 3
- Pinia
- Axios

## License
This project is licensed under the MIT License.

