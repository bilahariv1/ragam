# Ragam Textiles Web Application

A Flask-based web application for Ragam Textiles, an online store for exquisite fabrics.

## Features

*   **Home Page:** Welcomes users to Ragam Textiles.
*   **Products Page:** (Placeholder) Will display available fabric products.
*   **About Page:** (Placeholder) Will provide information about Ragam Textiles.
*   **Contact Page:** (Placeholder) Will offer ways to get in touch.

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
