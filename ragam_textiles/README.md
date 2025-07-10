# Ragam Textiles Web Application

A Flask-based web application for Ragam Textiles, an online store for exquisite fabrics.

## Technology Stack

*   **Backend:**
    *   Framework: Python Flask
    *   Database ORM: Flask-SQLAlchemy
    *   WSGI Server: Gunicorn (for deployment)
*   **Frontend:**
    *   Templating: Jinja2 (server-side rendering with Flask)
    *   Styling: Custom CSS
    *   Client-side Scripting: Vanilla JavaScript
*   **Database:**
    *   Type: SQLite
    *   File: `ragam_textiles.db` (located in the `ragam_textiles/instance/` directory)
*   **Search Functionality:**
    *   Currently, the application lists all products. A dedicated search feature is not yet implemented.
*   **Hosting:**
    *   The application is configured for deployment on platforms like Heroku using Gunicorn.

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
4.  **Initialize the Database (first time setup):**
    The application now uses an SQLite database. To create the database file (`ragam_textiles.db`) and the necessary tables, you need to initialize it. You can do this from a Python or Flask shell:
    ```python
    # Open a Python shell in your project directory (after activating the venv)
    # python
    >>> from ragam_textiles.app import app, init_db
    >>> init_db()
    # This will create ragam_textiles.db and print a confirmation message.
    # Alternatively, if you set up a Flask CLI command as suggested in app.py comments:
    # flask init-db
    ```
    This step only needs to be performed once. It also seeds default content for the About and Contact pages if they don't exist.
    The database file `ragam_textiles.db` will be created in the `ragam_textiles/instance/` directory.

### Running the Application

1.  Ensure your virtual environment is activated and the database has been initialized (see step 4 above).
2.  Run the Flask development server:
    ```bash
    python app.py
    ```
3.  Open your web browser and navigate to `http://127.0.0.1:5000/`.

## Data Storage Details

The application uses **SQLite** as its database, managed via **Flask-SQLAlchemy**. The database file, `ragam_textiles.db`, is located in the `ragam_textiles/instance/` directory. It stores:
*   Product information (name, description, price, image URL).
*   Content for editable pages (About, Contact).
*   Carousel slide information.

This is a change from a previous JSON-based storage system.

## Deployment Details

The application is prepared for deployment on platforms like **Heroku**.
*   It includes `gunicorn` in `requirements.txt` as the WSGI HTTP server.
*   A `Procfile` is present, typically containing a command like `web: gunicorn app:app` to instruct the hosting platform how to run the application.

## To Do / Future Enhancements

*   **Search:** Implement product search functionality.
*   Enhance database models (e.g., add categories for products, user accounts, order history).
*   Develop individual product detail pages.
*   Implement robust user authentication and authorization (beyond the current hardcoded admin).
*   Implement a shopping cart and checkout functionality.
*   Flesh out the About and Contact pages with more detailed actual content.
*   Improve UI/UX, possibly incorporating a frontend framework or more advanced CSS.
```
