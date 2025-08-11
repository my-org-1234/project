from flask import Flask, render_template, request, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import json

app = Flask(__name__)
app.secret_key = 'secret123'

# DB Setup
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///orders.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Menu
menu = {
    "Full Tea": 20,
    "Half Tea": 10,
    "Espresso": 80,
    "Americano": 90,
    "Cold Coffee": 100,
    "Filter Coffee": 70,
    "Green Tea": 60,
    "Masala Chai": 50,
    "Lemon Tea": 50,
    "Hot Chocolate": 150,
    "Milkshake - Vanilla": 120,
    "Milkshake - Chocolate": 130,
    "Milkshake - Strawberry": 130,
    "Chocolate Muffin": 60,
    "Blueberry Muffin": 70,
    "Veg Sandwich": 100,
    "Cheese Sandwich": 110,
    "Paneer Sandwich": 120,
    "Club Sandwich": 140,
    "Veg Puff": 40,
    "Paneer Puff": 50,
    "French Fries": 90,
    "Peri Peri Fries": 100,
    "Garlic Bread": 80,
    "Cheesy Garlic Bread": 100,
    "Pasta - White Sauce": 150,
    "Pasta - Red Sauce": 140,
    "Pizza - Paneer Tikka": 230,
    "Veg Burger": 90,
    "Cheese Burger": 110,
    "Paneer Burger": 120,
    "Tandoori Burger": 130,
    "Oreo Shake": 140,
    "KitKat Shake": 140,
    "Bottled Water": 20
}

# Order Model
class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    time = db.Column(db.String(50))
    items_json = db.Column(db.Text)
    total = db.Column(db.Float)

    def get_items(self):
        return json.loads(self.items_json)

with app.app_context():
    db.create_all()

@app.route('/')
def home():
    return render_template('home.html')

@app.route('/menu')
def show_menu():
    return render_template('menu.html', menu=menu)

@app.route('/order', methods=['GET', 'POST'])
def take_order():
    if request.method == 'POST':
        order = {}
        for item in menu:
            qty = request.form.get(item)
            if qty and qty.isdigit() and int(qty) > 0:
                order[item] = int(qty)

        if order:
            item_totals = {}
            total = 0
            for item, qty in order.items():
                item_total = qty * menu[item]
                item_totals[item] = item_total
                total += item_total

            tax = total * 0.10
            grand_total = total + tax

            order_record = Order(
                time=datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                items_json=json.dumps(order),
                total=grand_total
            )
            db.session.add(order_record)
            db.session.commit()

            return render_template(
                'bill.html',
                order=order,
                item_totals=item_totals,
                total=total,
                tax=tax,
                grand_total=grand_total,
                menu=menu
            )
        else:
            return redirect(url_for('take_order'))

    return render_template('order.html', menu=menu)

@app.route('/history')
def view_history():
    orders = Order.query.order_by(Order.id.desc()).all()
    return render_template('history.html', history=orders)

if __name__ == '__main__':
    app.run(debug=True)
