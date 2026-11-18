import os, datetime as dt
os.environ["DATABASE_URL"] = "sqlite:///:memory:"
from decimal import Decimal
from sqlalchemy import inspect
from app.database import Base, engine, SessionLocal
import app.models as m

Base.metadata.create_all(engine)
tables = sorted(inspect(engine).get_table_names())
print(len(tables), "tables:", tables)

db = SessionLocal()
u = m.User(email="a@b.com", password_hash="x")
u.profile = m.UserProfile(full_name="Test", height_cm=Decimal("175"))
db.add(u); db.flush()
f = m.Food(user_id=None, name="Chicken Breast", category="Meat", calories_per_100g=165,
           protein_per_100g=31, carbs_per_100g=0, fat_per_100g=Decimal("3.6"))
e = m.Exercise(name="Bench Press", muscle_group=m.MuscleGroup.chest, equipment="Barbell")
db.add_all([f, e]); db.flush()
w = m.Workout(user_id=u.id, name="Push", category=m.MuscleGroup.chest, workout_date=dt.date.today())
we = m.WorkoutExercise(exercise_id=e.id, order_index=1)
we.sets = [m.WorkoutSet(set_number=1, reps=10, weight_kg=20)]
w.exercises.append(we); db.add(w)
db.add(m.FoodLog(user_id=u.id, food_id=f.id, log_date=dt.date.today(), meal_type=m.MealType.lunch,
                 quantity_grams=100, calories=165, protein=31, carbs=0, fat=Decimal("3.6")))
db.commit()
print("workout->sets:", db.get(m.Workout, 1).exercises[0].sets[0].reps, "reps @", db.get(m.Workout,1).exercises[0].sets[0].weight_kg, "kg")
# cascade check
db.delete(db.get(m.User, 1)); db.commit()
print("after user delete -> workouts:", db.query(m.Workout).count(), "profiles:", db.query(m.UserProfile).count())
# unique constraint check
db.add(m.User(email="dup@b.com", password_hash="x")); db.commit()
try:
    db.add(m.User(email="dup@b.com", password_hash="x")); db.commit()
except Exception as ex:
    print("unique email enforced:", type(ex).__name__)
