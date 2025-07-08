# Ragam Textiles Web Application

A Flask-based web application for Ragam Textiles, an online store for exquisite fabrics.

## Features

*   **Home Page:** Welcomes users to Ragam Textiles.
*   **Products Page:** Displays available fabric products. Product listings are managed via the admin panel.
*   **About Page:** Provides information about Ragam Textiles. Content is editable via the admin panel.
*   **Contact Page:** Offers ways to get in touch. Content is editable via the admin panel.
*   **Admin Section:** A password-protected area for managing products and site content.

## Admin Functionality

The application now includes an admin panel with the following capabilities:

*   **Login/Logout:** Secure access to admin features.
*   **Product Management:**
    *   Add new products (name, description, price, image URL).
    *   Edit existing products.
    *   Delete products.
*   **Content Management:**
    *   Edit the title and content of the "About Us" page.
    *   Edit the title and content of the "Contact Us" page.

### Accessing the Admin Panel

1.  Navigate to `/admin/login` in your browser (e.g., `http://127.0.0.1:5000/admin/login`).
2.  Use the following default credentials:
    *   **Username:** `admin`
    *   **Password:** `password123`

    *Note: These credentials are hardcoded in `app.py` and should be changed for a production environment.*

## Getting Started

### Prerequisites

*   Python 3.x
*   pip (Python package installer)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository_url>
    cd ragam_textiles
    ```
2.  **Create and activate a virtual environment (recommended):**
    ```bash
    python -m venv venv
    # On Windows
    # venv\\Scripts\\activate
    # On macOS/Linux
    # source venv/bin/activate
    ```
3.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

### Running the Application

1.  Ensure your virtual environment is activated.
2.  Run the Flask development server:
    ```bash
    python app.py
    ```
3.  Open your web browser and navigate to `http://127.0.0.1:5000/`.

## Deployment

This application includes a `Procfile` and `gunicorn` in its requirements, making it suitable for deployment on platforms like Heroku.

The `Procfile` likely contains:
```
web: gunicorn app:app
```

## To Do / Future Enhancements

*   Implement a database for products and categories.
*   Develop the product listing and individual product detail pages.
*   Add user authentication and accounts.
*   Implement a shopping cart and checkout functionality.
*   Flesh out the About and Contact pages with actual content.
*   Improve styling and user interface.
```
