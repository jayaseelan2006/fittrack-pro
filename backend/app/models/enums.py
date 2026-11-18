import enum


class MealType(str, enum.Enum):
    breakfast = "breakfast"
    lunch = "lunch"
    dinner = "dinner"
    snacks = "snacks"


class MuscleGroup(str, enum.Enum):
    chest = "chest"
    back = "back"
    shoulders = "shoulders"
    biceps = "biceps"
    triceps = "triceps"
    legs = "legs"
    abs = "abs"
    cardio = "cardio"


class WorkoutStatus(str, enum.Enum):
    planned = "planned"
    in_progress = "in_progress"
    completed = "completed"


class GoalType(str, enum.Enum):
    weight = "weight"
    protein = "protein"
    calories = "calories"
    workout = "workout"


class GoalStatus(str, enum.Enum):
    active = "active"
    completed = "completed"
    cancelled = "cancelled"


class RecordType(str, enum.Enum):
    max_weight = "max_weight"
    max_reps = "max_reps"
    max_volume = "max_volume"


class Gender(str, enum.Enum):
    male = "male"
    female = "female"
    other = "other"


class FitnessGoal(str, enum.Enum):
    muscle_gain = "muscle_gain"
    weight_gain = "weight_gain"
    fat_loss = "fat_loss"
    maintenance = "maintenance"
