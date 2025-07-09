from flask import Flask, render_template, request, redirect, url_for, session, flash
from flask_sqlalchemy import SQLAlchemy
import os

app = Flask(__name__)
# Use a fixed secret key for session management
app.secret_key = "your_super_secret_and_random_key_here"  # CHANGE THIS IN PRODUCTION!
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///ragam_textiles.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False # silence the warning
db = SQLAlchemy(app)
print("Ragam Textiles Flask app initialized.");
# Hardcoded admin credentials (for simplicity)
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "password123"

# Database Models
class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    price = db.Column(db.Float, nullable=False)
    image_url = db.Column(db.String(200), nullable=True)

    def __repr__(self):
        return f'<Product {self.name}>'

class PageContent(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    page_name = db.Column(db.String(50), unique=True, nullable=False) # 'about', 'contact'
    title = db.Column(db.String(100), nullable=False)
    content = db.Column(db.Text, nullable=False)

    def __repr__(self):
        return f'<PageContent {self.page_name}>'

class CarouselSlide(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    image_url = db.Column(db.String(255), nullable=False)
    caption = db.Column(db.Text, nullable=True)
    order = db.Column(db.Integer, default=0) # Lower numbers appear first
    is_active = db.Column(db.Boolean, default=True)

    def __repr__(self):
        return f'<CarouselSlide {self.id} - {self.caption[:20]}>'


# Old JSON file paths and import json can be removed now or after this step.

@app.route('/')
def index():
    active_slides = CarouselSlide.query.filter_by(is_active=True).order_by(CarouselSlide.order).all()
    return render_template('index.html', slides=active_slides)

@app.route('/products')
def products():
    all_products = Product.query.all()
    return render_template('products.html', products=all_products)

@app.route('/about')
def about():
    page_data = PageContent.query.filter_by(page_name='about').first()
    print('page_data')
    print(page_data)
    if page_data:
        return render_template('about.html', title=page_data.title, content=page_data.content)
    else:
        # Provide default content if not found in DB (e.g., after initial DB setup)
        return render_template('about.html', title="About Us", content="Default About Us content. Please edit in admin.")

@app.route('/contact')
def contact():
    page_data = PageContent.query.filter_by(page_name='contact').first()
    if page_data:
        return render_template('contact.html', title=page_data.title, content=page_data.content)
    else:
        return render_template('contact.html', title="Contact Us", content="Default Contact Us content. Please edit in admin.")

# Admin Routes
@app.route('/admin/login', methods=['GET', 'POST'])
def admin_login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        print('in login page')
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
    all_products = Product.query.all()
    return render_template('admin_products.html', products=all_products)

@app.route('/admin/products/add', methods=['GET', 'POST'])
@admin_required
def admin_add_product():
    if request.method == 'POST':
        name = request.form['name']
        description = request.form['description']
        price = float(request.form['price'])
        image_url = request.form.get('image_url', None) # Default to None if empty

        new_product = Product(
            name=name,
            description=description,
            price=price,
            image_url=image_url
        )
        db.session.add(new_product)
        db.session.commit()
        flash(f"Product '{new_product.name}' added successfully!", 'success')
        return redirect(url_for('admin_products'))
    return render_template('admin_add_product.html')

@app.route('/admin/products/edit/<int:product_id>', methods=['GET', 'POST'])
@admin_required
def admin_edit_product(product_id):
    product = Product.query.get_or_404(product_id)

    if request.method == 'POST':
        product.name = request.form['name']
        product.description = request.form['description']
        product.price = float(request.form['price'])
        product.image_url = request.form.get('image_url', product.image_url) # Keep old if not provided, or set to None
        if not product.image_url: # Handle empty string from form to store as NULL
            product.image_url = None

        db.session.commit()
        flash(f"Product '{product.name}' updated successfully!", 'success')
        return redirect(url_for('admin_products'))

    return render_template('admin_edit_product.html', product=product)

@app.route('/admin/products/delete/<int:product_id>', methods=['POST'])
@admin_required
def admin_delete_product(product_id):
    product_to_delete = Product.query.get_or_404(product_id)

    product_name = product_to_delete.name # Get name before deleting for the flash message
    db.session.delete(product_to_delete)
    db.session.commit()
    flash(f"Product '{product_name}' deleted successfully!", 'success')

    return redirect(url_for('admin_products'))

# Page Content Management Route
@app.route('/admin/pages/edit/<page_name>', methods=['GET', 'POST'])
@admin_required
def admin_edit_page_content(page_name):
    if page_name not in ['about', 'contact']:
        flash('Invalid page specified.', 'danger')
        return redirect(url_for('admin_dashboard'))

    page_content_entry = PageContent.query.filter_by(page_name=page_name).first()

    if request.method == 'POST':
        title = request.form['title']
        content = request.form['content']

        if page_content_entry:
            page_content_entry.title = title
            page_content_entry.content = content
        else:
            # Create new entry if it doesn't exist
            page_content_entry = PageContent(page_name=page_name, title=title, content=content)
            db.session.add(page_content_entry)

        db.session.commit()
        flash(f"Content for '{page_name.capitalize()}' page updated successfully!", 'success')
        return redirect(url_for('admin_dashboard'))

    # For GET request, prepare content for the template
    current_data = {"title": "", "content": ""} # Default for new page
    if page_content_entry:
        current_data['title'] = page_content_entry.title
        current_data['content'] = page_content_entry.content

    return render_template('admin_edit_page.html', page_name=page_name, page_title=page_name.capitalize(), content=current_data)

def init_db():
    """Initializes the database and creates tables."""
    with app.app_context():
        db.create_all()
    print("Database initialized and tables created.")

if __name__ == '__main__':
    # To initialize the database, you would typically run this from a Flask shell
    # or a dedicated script. For example:
    # from app import init_db
    # init_db()
    #
    # Or, you can add a Flask CLI command:
    # @app.cli.command("init-db")
    # def init_db_command():
    #     init_db()
    #     click.echo("Initialized the database.")

# Carousel Admin Routes
UPLOAD_FOLDER_CAROUSEL = 'ragam_textiles/static/uploads/carousel_images'
ALLOWED_EXTENSIONS_CAROUSEL = {'png', 'jpg', 'jpeg', 'gif'}
app.config['UPLOAD_FOLDER_CAROUSEL'] = UPLOAD_FOLDER_CAROUSEL

def allowed_file_carousel(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS_CAROUSEL

@app.route('/admin/carousel')
@admin_required
def admin_carousel():
    slides = CarouselSlide.query.order_by(CarouselSlide.order).all()
    return render_template('admin_carousel.html', slides=slides)

@app.route('/admin/carousel/add', methods=['GET', 'POST'])
@admin_required
def admin_add_carousel_slide():
    if request.method == 'POST':
        caption = request.form.get('caption')
        order = int(request.form.get('order', 0))
        is_active = 'is_active' in request.form

        if 'image' not in request.files:
            flash('No image file part', 'danger')
            return redirect(request.url)
        file = request.files['image']
        if file.filename == '':
            flash('No selected file', 'danger')
            return redirect(request.url)

        if file and allowed_file_carousel(file.filename):
            filename = file.filename # In a real app, use secure_filename
            # Ensure the upload folder exists (though we created it with bash earlier)
            os.makedirs(app.config['UPLOAD_FOLDER_CAROUSEL'], exist_ok=True)
            image_path = os.path.join(app.config['UPLOAD_FOLDER_CAROUSEL'], filename)
            file.save(image_path)
            image_url = url_for('static', filename=f'uploads/carousel_images/{filename}')

            new_slide = CarouselSlide(
                image_url=image_url,
                caption=caption,
                order=order,
                is_active=is_active
            )
            db.session.add(new_slide)
            db.session.commit()
            flash('Carousel slide added successfully!', 'success')
            return redirect(url_for('admin_carousel'))
        else:
            flash('Invalid image file type.', 'danger')

    return render_template('admin_carousel_form.html', form_action='add', slide=None)

@app.route('/admin/carousel/edit/<int:slide_id>', methods=['GET', 'POST'])
@admin_required
def admin_edit_carousel_slide(slide_id):
    slide = CarouselSlide.query.get_or_404(slide_id)
    if request.method == 'POST':
        slide.caption = request.form.get('caption')
        slide.order = int(request.form.get('order', slide.order))
        slide.is_active = 'is_active' in request.form

        if 'image' in request.files:
            file = request.files['image']
            if file and file.filename != '' and allowed_file_carousel(file.filename):
                # Optionally, delete old image file
                # if slide.image_url:
                #     try:
                #         old_image_path_segment = slide.image_url.replace(url_for('static', filename=''), '')
                #         old_image_full_path = os.path.join(app.static_folder, old_image_path_segment)
                #         if os.path.exists(old_image_full_path):
                #             os.remove(old_image_full_path)
                #     except Exception as e:
                #         flash(f'Could not delete old image: {e}', 'warning')

                filename = file.filename # Use secure_filename in production
                os.makedirs(app.config['UPLOAD_FOLDER_CAROUSEL'], exist_ok=True)
                image_path = os.path.join(app.config['UPLOAD_FOLDER_CAROUSEL'], filename)
                file.save(image_path)
                slide.image_url = url_for('static', filename=f'uploads/carousel_images/{filename}')
            elif file.filename != '': # If a file was selected but not allowed
                flash('Invalid image file type. Image not changed.', 'warning')


        db.session.commit()
        flash('Carousel slide updated successfully!', 'success')
        return redirect(url_for('admin_carousel'))

    return render_template('admin_carousel_form.html', form_action='edit', slide=slide)

@app.route('/admin/carousel/delete/<int:slide_id>', methods=['POST'])
@admin_required
def admin_delete_carousel_slide(slide_id):
    slide = CarouselSlide.query.get_or_404(slide_id)

    # Optional: Delete the image file from the server
    # try:
    #     if slide.image_url:
    #         image_path_segment = slide.image_url.replace(url_for('static', filename=''), '')
    #         image_full_path = os.path.join(app.static_folder, image_path_segment)
    #         if os.path.exists(image_full_path):
    #             os.remove(image_full_path)
    # except Exception as e:
    #     flash(f'Could not delete image file: {e}. Slide record deleted.', 'warning')
    # else:
    #     flash('Image file also deleted.', 'info')


    db.session.delete(slide)
    db.session.commit()
    flash('Carousel slide deleted successfully!', 'success')
    return redirect(url_for('admin_carousel'))

    app.run(debug=True)
