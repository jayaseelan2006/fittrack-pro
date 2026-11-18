
FOODS = [
    # 1. Breakfast
    ("Idli", "Breakfast", 146, 4.5, 30, 0.7),
    ("Plain Dosa", "Breakfast", 168, 4, 29, 3.7),
    ("Masala Dosa", "Breakfast", 200, 4, 30, 7),
    ("Rava Dosa", "Breakfast", 190, 4, 30, 6),
    ("Uttapam", "Breakfast", 180, 5, 28, 5),
    ("Ven Pongal", "Breakfast", 150, 4, 23, 4.5),
    ("Upma", "Breakfast", 130, 3.5, 22, 3),
    ("Appam", "Breakfast", 120, 2, 25, 1),
    ("Puttu", "Breakfast", 170, 3, 36, 1),
    ("Idiyappam", "Breakfast", 130, 2, 29, 0.5),
    ("Adai", "Breakfast", 220, 10, 30, 7),
    ("Pesarattu", "Breakfast", 160, 7, 25, 3),
    ("Poori", "Breakfast", 330, 6, 40, 17),
    ("Medu Vada", "Breakfast", 290, 7, 30, 16),
    ("Poha", "Breakfast", 130, 2.5, 25, 3),
    ("Dhokla", "Breakfast", 160, 7, 25, 3),

    # 2. Rice and Grains
    ("White Rice Cooked", "Rice and Grains", 130, 2.7, 28, 0.3),
    ("Brown Rice Cooked", "Rice and Grains", 123, 2.7, 25.6, 1),
    ("Basmati Rice Cooked", "Rice and Grains", 121, 3, 25, 0.4),
    ("Red Rice Cooked", "Rice and Grains", 120, 2.5, 25, 1),
    ("Lemon Rice", "Rice and Grains", 180, 3, 30, 5),
    ("Curd Rice", "Rice and Grains", 120, 3, 20, 3),
    ("Tomato Rice", "Rice and Grains", 160, 3, 27, 4),
    ("Vegetable Biryani", "Rice and Grains", 160, 3.5, 25, 5),
    ("Chicken Biryani", "Rice and Grains", 180, 10, 22, 6),
    ("Mutton Biryani", "Rice and Grains", 200, 10, 22, 8),
    ("Jeera Rice", "Rice and Grains", 150, 3, 27, 3),
    ("Quinoa Cooked", "Rice and Grains", 120, 4.4, 21.3, 1.9),
    ("Millet Cooked", "Rice and Grains", 119, 3.5, 23, 1),

    # 3. Indian Meals
    ("Chapati", "Indian Meals", 297, 9, 46, 7),
    ("Plain Parotta", "Indian Meals", 320, 6, 45, 13),
    ("Sambar", "Indian Meals", 65, 3, 9, 2),
    ("Rasam", "Indian Meals", 30, 1.5, 4, 0.8),
    ("Dal", "Indian Meals", 116, 9, 20, 0.4),
    ("Rajma Curry", "Indian Meals", 125, 7, 18, 3),
    ("Chole Masala", "Indian Meals", 150, 7, 20, 5),
    ("Palak Paneer", "Indian Meals", 160, 8, 8, 10),
    ("Paneer Butter Masala", "Indian Meals", 220, 9, 12, 15),
    ("Vegetable Kurma", "Indian Meals", 130, 3, 12, 8),
    ("Chicken Curry", "Indian Meals", 170, 15, 5, 10),
    ("Fish Curry", "Indian Meals", 130, 12, 4, 7),
    ("Potato Masala", "Indian Meals", 130, 2, 20, 4),
    ("Coconut Chutney", "Indian Meals", 250, 3, 10, 23),
    ("Tomato Chutney", "Indian Meals", 80, 2, 10, 3),
    ("Mint Chutney", "Indian Meals", 70, 2, 10, 2),

    # 4. Protein
    ("Whole Egg Boiled", "Protein", 155, 13, 1.1, 11),
    ("Whole Egg Raw", "Protein", 143, 12.6, 0.7, 9.5),
    ("Egg White", "Protein", 52, 10.9, 0.7, 0.2),
    ("Chicken Breast Cooked", "Protein", 165, 31, 0, 3.6),
    ("Chicken Breast Raw", "Protein", 120, 22.5, 0, 2.6),
    ("Chicken Leg Cooked", "Protein", 209, 26, 0, 11),
    ("Mutton Cooked", "Protein", 250, 25, 0, 17),
    ("Fish Cooked", "Protein", 140, 24, 0, 4),
    ("Salmon Cooked", "Protein", 206, 22, 0, 12),
    ("Tuna", "Protein", 132, 29, 0, 1),
    ("Prawns Cooked", "Protein", 99, 24, 0.2, 0.3),

    # 5. Vegetarian Protein
    ("Paneer", "Vegetarian Protein", 265, 18, 1.2, 20),
    ("Tofu", "Vegetarian Protein", 76, 8, 1.9, 4.8),
    ("Soya Chunks Dry", "Vegetarian Protein", 345, 52, 33, 0.5),
    ("Soya Chunks Cooked", "Vegetarian Protein", 120, 18, 10, 1),
    ("Boiled Chickpeas", "Vegetarian Protein", 164, 8.9, 27.4, 2.6),
    ("Boiled Rajma", "Vegetarian Protein", 127, 8.7, 22.8, 0.5),
    ("Boiled Green Gram", "Vegetarian Protein", 105, 7, 19, 0.4),
    ("Boiled Black Chana", "Vegetarian Protein", 164, 8.9, 27, 2.6),
    ("Green Peas", "Vegetarian Protein", 81, 5.4, 14.5, 0.4),
    ("Peanut", "Vegetarian Protein", 567, 25.8, 16.1, 49.2),

    # 6. Fruits
    ("Banana", "Fruits", 89, 1.1, 22.8, 0.3),
    ("Apple", "Fruits", 52, 0.3, 13.8, 0.2),
    ("Orange", "Fruits", 47, 0.9, 11.8, 0.1),
    ("Mango", "Fruits", 60, 0.8, 15, 0.4),
    ("Papaya", "Fruits", 43, 0.5, 11, 0.3),
    ("Guava", "Fruits", 68, 2.6, 14.3, 1),
    ("Grapes", "Fruits", 69, 0.7, 18.1, 0.2),
    ("Watermelon", "Fruits", 30, 0.6, 7.6, 0.2),
    ("Pineapple", "Fruits", 50, 0.5, 13.1, 0.1),
    ("Pomegranate", "Fruits", 83, 1.7, 18.7, 1.2),
    ("Avocado", "Fruits", 160, 2, 8.5, 14.7),
    ("Kiwi", "Fruits", 61, 1.1, 14.7, 0.5),
    ("Dates", "Fruits", 282, 2.5, 75, 0.4),

    # 7. Vegetables
    ("Carrot", "Vegetables", 41, 0.9, 9.6, 0.2),
    ("Broccoli", "Vegetables", 34, 2.8, 6.6, 0.4),
    ("Spinach", "Vegetables", 23, 2.9, 3.6, 0.4),
    ("Tomato", "Vegetables", 18, 0.9, 3.9, 0.2),
    ("Onion", "Vegetables", 40, 1.1, 9.3, 0.1),
    ("Potato Boiled", "Vegetables", 87, 1.9, 20.1, 0.1),
    ("Cucumber", "Vegetables", 15, 0.7, 3.6, 0.1),
    ("Beetroot", "Vegetables", 43, 1.6, 9.6, 0.2),
    ("Green Beans", "Vegetables", 31, 1.8, 7, 0.1),
    ("Cabbage", "Vegetables", 25, 1.3, 5.8, 0.1),
    ("Cauliflower", "Vegetables", 25, 1.9, 5, 0.3),
    ("Sweet Potato", "Vegetables", 86, 1.6, 20.1, 0.1),
    ("Mushroom", "Vegetables", 22, 3.1, 3.3, 0.3),

    # 8. Dairy
    ("Milk Whole", "Dairy", 61, 3.2, 4.8, 3.3),
    ("Milk Skimmed", "Dairy", 34, 3.4, 5, 0.1),
    ("Curd", "Dairy", 98, 3.5, 4.7, 5),
    ("Greek Yogurt", "Dairy", 59, 10, 3.6, 0.4),
    ("Paneer Low Fat", "Dairy", 150, 20, 3, 7),
    ("Cheese Cheddar", "Dairy", 402, 25, 1.3, 33),
    ("Butter", "Dairy", 717, 0.9, 0.1, 81),
    ("Ghee", "Dairy", 900, 0, 0, 100),
    ("Buttermilk", "Dairy", 40, 3.3, 4.8, 1),
    ("Mozzarella Cheese", "Dairy", 280, 28, 3, 17),

    # 9. Nuts and Seeds
    ("Almonds", "Nuts and Seeds", 579, 21.2, 21.6, 49.9),
    ("Cashews", "Nuts and Seeds", 553, 18.2, 30.2, 43.9),
    ("Walnuts", "Nuts and Seeds", 654, 15.2, 13.7, 65.2),
    ("Pistachios", "Nuts and Seeds", 562, 20.2, 27.2, 45.3),
    ("Chia Seeds", "Nuts and Seeds", 486, 16.5, 42.1, 30.7),
    ("Flax Seeds", "Nuts and Seeds", 534, 18.3, 28.9, 42.2),
    ("Pumpkin Seeds", "Nuts and Seeds", 559, 30.2, 10.7, 49.1),
    ("Sunflower Seeds", "Nuts and Seeds", 584, 20.8, 20, 51.5),

    # 10. International Foods
    ("Oats Dry", "International Foods", 389, 16.9, 66.3, 6.9),
    ("Whole Wheat Bread", "International Foods", 247, 13, 41, 4.2),
    ("White Bread", "International Foods", 266, 8, 49, 3.2),
    ("Pasta Cooked", "International Foods", 158, 5.8, 30.9, 0.9),
    ("Peanut Butter", "International Foods", 588, 25, 20, 50),
    ("Cornflakes", "International Foods", 357, 7.5, 84, 0.4),
    ("Pancake", "International Foods", 227, 6, 28, 10),
    ("Pizza Cheese", "International Foods", 266, 11, 33, 10),
    ("Burger", "International Foods", 250, 12, 30, 9),
    ("Noodles Cooked", "International Foods", 138, 4.5, 25, 2),
    ("Dark Chocolate", "International Foods", 546, 4.9, 61, 31),

    # 11. Snacks
    ("Sundal", "Snacks", 150, 8, 22, 3),
    ("Roasted Chana", "Snacks", 369, 22, 58, 6),
    ("Popcorn Air Popped", "Snacks", 387, 13, 78, 4.5),
    ("Boiled Corn", "Snacks", 96, 3.4, 21, 1.5),
    ("Samosa", "Snacks", 308, 6, 32, 18),
    ("French Fries", "Snacks", 312, 3.4, 41, 15),
    ("Potato Chips", "Snacks", 536, 7, 53, 35),

    # 12. Sweets and Desserts
    ("Gulab Jamun", "Sweets and Desserts", 320, 5, 50, 12),
    ("Laddu", "Sweets and Desserts", 450, 8, 55, 22),
    ("Payasam", "Sweets and Desserts", 150, 4, 25, 4),
    ("Halwa", "Sweets and Desserts", 300, 3, 45, 12),
    ("Ice Cream", "Sweets and Desserts", 207, 3.5, 24, 11),
    ("Cake", "Sweets and Desserts", 350, 5, 50, 15),
]

from decimal import Decimal

from app.database.session import get_db
from app.models.nutrition import Food


def seed_foods():
    db = next(get_db())
    inserted = 0

    try:
        for name, category, calories, protein, carbs, fat in FOODS:

            existing = db.query(Food).filter(
                Food.user_id.is_(None),
                Food.name == name
            ).first()

            if existing:
                continue

            food = Food(
                user_id=None,
                name=name,
                category=category,
                calories_per_100g=Decimal(str(calories)),
                protein_per_100g=Decimal(str(protein)),
                carbs_per_100g=Decimal(str(carbs)),
                fat_per_100g=Decimal(str(fat)),
                is_custom=False
            )

            db.add(food)
            inserted += 1

        db.commit()
        print(f"Successfully inserted {inserted} foods!")

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    seed_foods()
