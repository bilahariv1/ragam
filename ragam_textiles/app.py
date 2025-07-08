from flask import Flask, render_template, request, redirect, url_for, session, flash
import os
import json

app = Flask(__name__)
app.secret_key = os.urandom(24)  # For session management

# Hardcoded admin credentials (for simplicity)
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "password123"

# JSON file paths
PRODUCTS_FILE = 'products.json'
PAGES_CONTENT_FILE = 'pages_content.json'

# Helper functions for product data
def load_products():
    if not os.path.exists(PRODUCTS_FILE):
        return []
    try:
        with open(PRODUCTS_FILE, 'r') as f:
            return json.load(f)
    except (IOError, json.JSONDecodeError):
        return []

def save_products(products):
    try:
        with open(PRODUCTS_FILE, 'w') as f:
            json.dump(products, f, indent=4)
    except IOError:
        flash('Error saving product data.', 'danger')

# Helper functions for page content
def load_page_content():
    if not os.path.exists(PAGES_CONTENT_FILE):
        return {}
    try:
        with open(PAGES_CONTENT_FILE, 'r') as f:
            return json.load(f)
    except (IOError, json.JSONDecodeError):
        return {} # Return empty dict on error

def save_page_content(content):
    try:
        with open(PAGES_CONTENT_FILE, 'w') as f:
            json.dump(content, f, indent=4)
    except IOError:
        flash('Error saving page content.', 'danger')


@app.route('/')
def index():
    return render_template('index.html')

@app.route('/products')
def products():
    all_products = load_products()
    return render_template('products.html', products=all_products)

@app.route('/about')
def about():
    all_content = load_page_content()
    page_data = all_content.get('about', {"title": "About Us", "content": "Default About Us content."})
    return render_template('about.html', title=page_data.get('title'), content=page_data.get('content'))

@app.route('/contact')
def contact():
    all_content = load_page_content()
    page_data = all_content.get('contact', {"title": "Contact Us", "content": "Default Contact Us content."})
    return render_template('contact.html', title=page_data.get('title'), content=page_data.get('content'))

# Admin Routes
@app.route('/admin/login', methods=['GET', 'POST'])
def admin_login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        if username == ADMIN_USERNAME and password == ADMIN_PASSWORD:
            session['admin_logged_in'] = True
            flash('Login successful!', 'success')
            return redirect(url_for('admin_dashboard')) # We'll create admin_dashboard later
        else:
            flash('Invalid credentials. Please try again.', 'danger')
    return render_template('admin_login.html')

@app.route('/admin/logout')
def admin_logout():
    session.pop('admin_logged_in', None)
    flash('You have been logged out.', 'info')
    return redirect(url_for('admin_login'))

# Placeholder for admin dashboard - to be developed in next steps
@app.route('/admin/dashboard')
def admin_dashboard():
    if not session.get('admin_logged_in'):
        return redirect(url_for('admin_login'))
    return render_template('admin_dashboard.html')

# Decorator to protect admin routes
from functools import wraps

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not session.get('admin_logged_in'):
            flash('Please log in to access this page.', 'warning')
            return redirect(url_for('admin_login'))
        return f(*args, **kwargs)
    return decorated_function

# Product Management Routes
@app.route('/admin/products')
@admin_required
def admin_products():
    products = load_products()
    return render_template('admin_products.html', products=products)

@app.route('/admin/products/add', methods=['GET', 'POST'])
@admin_required
def admin_add_product():
    if request.method == 'POST':
        products = load_products()
        new_id = 1
        if products:
            new_id = max(p.get('id', 0) for p in products) + 1 # Ensure 'id' key exists or default to 0

        new_product = {
            'id': new_id,
            'name': request.form['name'],
            'description': request.form['description'],
            'price': float(request.form['price']),
            'image_url': request.form.get('image_url', '')
        }
        products.append(new_product)
        save_products(products)
        flash(f"Product '{new_product['name']}' added successfully!", 'success')
        return redirect(url_for('admin_products'))
    return render_template('admin_add_product.html')

@app.route('/admin/products/edit/<int:product_id>', methods=['GET', 'POST'])
@admin_required
def admin_edit_product(product_id):
    products = load_products()
    product = next((p for p in products if p.get('id') == product_id), None) # Ensure 'id' key exists

    if not product:
        flash('Product not found.', 'danger')
        return redirect(url_for('admin_products'))

    if request.method == 'POST':
        product['name'] = request.form['name']
        product['description'] = request.form['description']
        product['price'] = float(request.form['price'])
        product['image_url'] = request.form.get('image_url', product.get('image_url', '')) # Keep old if not provided
        save_products(products)
        flash(f"Product '{product['name']}' updated successfully!", 'success')
        return redirect(url_for('admin_products'))

    return render_template('admin_edit_product.html', product=product)

@app.route('/admin/products/delete/<int:product_id>', methods=['POST'])
@admin_required
def admin_delete_product(product_id):
    products = load_products()
    product_to_delete = next((p for p in products if p.get('id') == product_id), None)

    if not product_to_delete:
        flash('Product not found or already deleted.', 'danger')
    else:
        products = [p for p in products if p.get('id') != product_id]
        save_products(products)
        flash(f"Product '{product_to_delete['name']}' deleted successfully!", 'success')

    return redirect(url_for('admin_products'))

# Page Content Management Route
@app.route('/admin/pages/edit/<page_name>', methods=['GET', 'POST'])
@admin_required
def admin_edit_page_content(page_name):
    if page_name not in ['about', 'contact']:
        flash('Invalid page specified.', 'danger')
        return redirect(url_for('admin_dashboard'))

    all_content = load_page_content()
    page_content = all_content.get(page_name, {"title": "", "content": ""}) # Default if not found

    if request.method == 'POST':
        all_content[page_name] = {
            'title': request.form['title'],
            'content': request.form['content']
        }
        save_page_content(all_content)
        flash(f"Content for '{page_name.capitalize()}' page updated successfully!", 'success')
        return redirect(url_for('admin_dashboard'))

    return render_template('admin_edit_page.html', page_name=page_name, page_title=page_name.capitalize(), content=page_content)


if __name__ == '__main__':
    app.run(debug=True)
