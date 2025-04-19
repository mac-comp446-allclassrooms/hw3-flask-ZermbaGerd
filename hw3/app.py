from flask import Flask, redirect, render_template, request
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import Integer, String
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
import json

# Initialize Flask App
app = Flask(__name__)

# Configure Database
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///thereviews.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# Initialize SQLAlchemy with Declarative Base
class Base(DeclarativeBase):
    pass

db = SQLAlchemy(model_class=Base)
db.init_app(app)

# Define the Review model using `Mapped` and `mapped_column`
class Review(db.Model):
    __tablename__ = "thereviews"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(60), nullable=False)
    text: Mapped[str] = mapped_column(String, nullable=False)
    rating: Mapped[int] = mapped_column(Integer, nullable=False)

    def __init__(self, title: str, text: str, rating: int):
        self.title = title
        self.text = text
        self.rating = rating

    # converts a review to JSON
    def toJSON(self):
        # logic from here: https://stackoverflow.com/a/15538391
        # and also from here: https://www.w3schools.com/python/ref_string_format.asp
        jsonVersion = """{{ "id":{id}, "title":"{title}", "text":"{text}", "rating":{rating} }}""".format(id=self.id, title=self.title,text=self.text,rating=self.rating)
        return jsonVersion

# DATABASE UTILITY CLASS
class Database:
    def __init__(self):
        pass

    def get(self, review_id: int = None):
        """Retrieve all reviews or a specific review by ID."""
        if review_id:
            return db.session.get(Review, review_id)
        return db.session.query(Review).all()

    def create(self, title: str, text: str, rating: int):
        """Create a new review."""
        new_review = Review(title=title, text=text, rating=rating)
        db.session.add(new_review)
        db.session.commit()

    def update(self, review_id: int, title: str, text: str, rating: int):
        """Update an existing review."""
        review = self.get(review_id)
        if review:
            review.title = title
            review.text = text
            review.rating = rating
            db.session.commit()

    def delete(self, review_id: int):
        """Delete a review."""
        review = self.get(review_id)
        if review:
            db.session.delete(review)
            db.session.commit()

db_manager = Database()  # Create a database manager instance

# Initialize database with sample data
@app.before_request
def setup():
    with app.app_context():
        db.create_all()
        if not db_manager.get():  # If database is empty, add a sample entry
            db_manager.create("Mr. Pumpkin Man", "This is a pretty good movie", 4)
            db_manager.create("Mr. Apple Man", "This movie really rocks", 5)
            db_manager.create("Mr. Tomato Man", "This is the worst movie I've ever seen", 1)
            print("Database initialized with sample data!")

# Reset the database
@app.route('/reset-db', methods=['GET', 'POST'])
def reset_db():
    with app.app_context():
        db.drop_all()
        db.create_all()
        print("Database reset: success!")
    return "Database has been reset!", 200


# ROUTES

# routes to the index page
@app.route('/')
def index_page():
    indexPage = render_template('index.html')
    return indexPage

# routes to the review editing page
@app.route('/edit/<id>')
def edit_page(id):
    editPage = render_template('edit.html', id=id)
    return editPage

# returns JSON collection of every review
@app.route('/get_all_reviews')
def get_all_reviews():
    reviews = db_manager.get()
    # i do some weird manual text-control json stuff here. just trust it works
    jsonVersion = "{"
    for i in range(len(reviews)):
        jsonVersion += """ "{number}" : {review},""".format(number=i, review=reviews[i].toJSON()) # the {number} here is just to keep track of different reviews
    jsonVersion = jsonVersion[:-1]  # get rid of final comma
    jsonVersion += "}"

    return jsonVersion

# returns the JSON version of a specific review
@app.route('/get_review/<id>')
def get_specific_review(id):
    review = db_manager.get(id)
    return review.toJSON(), 200

# delete the movie with the given id
@app.route('/delete/<id>')
def delete_review(id):
    db_manager.delete(id)
    return 'Deleted', 200

# receives post requests to edit reviews
# after a successful request, routes back to main page
@app.route('/edit', methods=["POST"])
def edit_review():
    print("priting dict now")
    print(request.form.to_dict())
    # from https://www.geeksforgeeks.org/retrieving-html-from-data-using-flask/
    id = int(request.form.get("id"))
    title = request.form.get("title")
    review = request.form.get("review")
    rating = int(request.form.get("rating"))

    db_manager.update(id, title, review, rating)
    
    # then we redirect: https://stackoverflow.com/a/14343957
    return redirect("/", code=302)

# receives post requests to create reviews
# after a successful request, routes back to main page
@app.route('/create', methods=["POST"])
def create_review():
    # https://www.geeksforgeeks.org/retrieving-html-from-data-using-flask/
    title = request.form.get("title")
    review = request.form.get("review")
    rating = int(request.form.get("rating"))

    db_manager.create(title, review, rating)

    # then we redirect: https://stackoverflow.com/a/14343957
    return redirect("/", code=302)

@app.route("/inspect/<id>")
def inspect_review(id):
    inspectPage = render_template('inspect.html', id=id)
    return inspectPage

  
# RUN THE FLASK APP
if __name__ == "__main__":
    with app.app_context():
        db.create_all()  # Ensure DB is created before running the app
    app.run(debug=True)
