"""
generate_dataset.py
-------------------
Generates a synthetic training dataset for the Lufyco outfit recommendation model.

Each row represents an (item_type, occasion, weather, mood) combination
and is labelled 1 (compatible) or 0 (incompatible) based on fashion rules.

Output: outfit_dataset.csv
"""

import csv
import random
import itertools
import os

# ---------------------------------------------------------------------------
# Vocabulary
# ---------------------------------------------------------------------------
CLOTHING_TYPES = [
    'Shirt', 'T-Shirt', 'Blouse', 'Hoodie', 'Sweater', 'Jacket', 'Coat',
    'Jeans', 'Pants', 'Shorts', 'Skirt', 'Dress',
    'Casual Shoes', 'Sports Shoes', 'Heels', 'Boots', 'Sandals',
]

OCCASIONS = ['Office', 'Party', 'Wedding', 'Date', 'Casual']

WEATHER_CONDITIONS = ['Sunny', 'Cloudy', 'Rainy', 'Snow', 'Clear']

MOODS = ['Professional', 'Romantic', 'Relaxed', 'Bold', 'Happy']

# ---------------------------------------------------------------------------
# Compatibility Rule Engine  (encodes current outfitService.js logic)
# ---------------------------------------------------------------------------
FORMAL_TOPS    = {'Shirt', 'Blouse'}
CASUAL_TOPS    = {'T-Shirt', 'Hoodie'}
WARM_ITEMS     = {'Hoodie', 'Sweater', 'Jacket', 'Coat', 'Boots'}
LIGHT_ITEMS    = {'T-Shirt', 'Shorts', 'Skirt', 'Dress', 'Sandals', 'Casual Shoes'}
FORMAL_BOTTOMS = {'Pants', 'Skirt'}
CASUAL_BOTTOMS = {'Shorts', 'Jeans'}
FORMAL_SHOES   = {'Heels', 'Boots'}
CASUAL_SHOES   = {'Casual Shoes', 'Sports Shoes', 'Sandals'}

FABRIC_GROUPS = {
    'top': ['Shirt', 'T-Shirt', 'Blouse', 'Hoodie', 'Sweater', 'Jacket', 'Coat', 'Dress'],
    'bottom': ['Jeans', 'Pants', 'Shorts', 'Skirt'],
    'shoes': ['Casual Shoes', 'Sports Shoes', 'Heels', 'Boots', 'Sandals'],
}


def get_item_group(item_type):
    for group, items in FABRIC_GROUPS.items():
        if item_type in items:
            return group
    return 'top'


def compatibility_score(top, bottom, shoes, occasion, weather_condition, temp_c, mood):
    """
    Returns a compatibility score 0.0–1.0 based on fashion rules.
    This encodes domain knowledge that the neural network will learn.
    """
    score = 0.5  # neutral start

    # ---- OCCASION rules ----
    if occasion == 'Office':
        # Formal tops are good
        if top in FORMAL_TOPS:       score += 0.25
        if top in CASUAL_TOPS:       score -= 0.30   # hoodie/tshirt at office = bad
        # Formal bottoms are good
        if bottom in FORMAL_BOTTOMS: score += 0.20
        if bottom == 'Shorts':       score -= 0.35   # shorts at office = very bad
        # Shoes
        if shoes in FORMAL_SHOES:    score += 0.15
        if shoes == 'Sports Shoes':  score -= 0.20
        # Mood alignment
        if mood == 'Professional':   score += 0.10
        if mood == 'Relaxed':        score -= 0.10

    elif occasion == 'Party':
        if top in CASUAL_TOPS:       score += 0.10
        if top == 'Dress':           score += 0.20
        if bottom == 'Shorts':       score -= 0.05
        if shoes == 'Heels':         score += 0.20
        if mood == 'Bold':           score += 0.15
        if mood == 'Happy':          score += 0.10
        if mood == 'Professional':   score -= 0.10

    elif occasion == 'Wedding':
        if top in FORMAL_TOPS:       score += 0.30
        if top in CASUAL_TOPS:       score -= 0.40
        if bottom in FORMAL_BOTTOMS: score += 0.20
        if bottom == 'Shorts':       score -= 0.45
        if shoes in FORMAL_SHOES:    score += 0.25
        if shoes == 'Sports Shoes':  score -= 0.35
        if mood == 'Romantic':       score += 0.15

    elif occasion == 'Date':
        if top == 'Dress':           score += 0.20
        if top in FORMAL_TOPS:       score += 0.10
        if shoes == 'Heels':         score += 0.15
        if mood == 'Romantic':       score += 0.20
        if mood == 'Bold':           score += 0.10

    elif occasion == 'Casual':
        if top in CASUAL_TOPS:       score += 0.20
        if bottom in CASUAL_BOTTOMS: score += 0.15
        if shoes in CASUAL_SHOES:    score += 0.10
        if mood == 'Relaxed':        score += 0.15
        if mood == 'Happy':          score += 0.10
        if mood == 'Professional':   score -= 0.10

    # ---- WEATHER rules ----
    is_hot  = temp_c > 28 or weather_condition in ('Sunny', 'Clear')
    is_cold = temp_c < 15 or weather_condition in ('Snow', 'Rainy')

    if is_hot:
        if top in WARM_ITEMS:    score -= 0.25
        if bottom == 'Shorts':   score += 0.10
        if shoes == 'Sandals':   score += 0.10
    if is_cold:
        if top in WARM_ITEMS:    score += 0.20
        if bottom == 'Shorts':   score -= 0.20
        if shoes == 'Boots':     score += 0.15
        if shoes == 'Sandals':   score -= 0.15

    # Clamp to [0, 1]
    return max(0.0, min(1.0, score))


# ---------------------------------------------------------------------------
# Dataset Generation
# ---------------------------------------------------------------------------
def generate_dataset(n_samples=12000, output_file='outfit_dataset.csv'):
    rows = []
    header = [
        'top', 'bottom', 'shoes',
        'occasion', 'weather_condition', 'temp_c', 'mood',
        'score', 'label'
    ]

    # Use all combinations first, then random sampling for the remainder
    combos = list(itertools.product(
        FABRIC_GROUPS['top'],
        FABRIC_GROUPS['bottom'],
        FABRIC_GROUPS['shoes'],
        OCCASIONS,
        WEATHER_CONDITIONS,
        MOODS,
    ))

    # All explicit combos
    for (top, bottom, shoes, occasion, weather_condition, mood) in combos:
        temp_c = random.uniform(5, 40)
        score = compatibility_score(top, bottom, shoes, occasion, weather_condition, temp_c, mood)
        label = 1 if score >= 0.55 else 0
        rows.append([top, bottom, shoes, occasion, weather_condition, round(temp_c, 1), mood,
                     round(score, 3), label])

    # Add noise / random samples to reach n_samples
    while len(rows) < n_samples:
        top       = random.choice(FABRIC_GROUPS['top'])
        bottom    = random.choice(FABRIC_GROUPS['bottom'])
        shoes     = random.choice(FABRIC_GROUPS['shoes'])
        occasion  = random.choice(OCCASIONS)
        weather   = random.choice(WEATHER_CONDITIONS)
        mood      = random.choice(MOODS)
        temp_c    = random.uniform(5, 40)
        score     = compatibility_score(top, bottom, shoes, occasion, weather, temp_c, mood)
        label     = 1 if score >= 0.55 else 0
        rows.append([top, bottom, shoes, occasion, weather, round(temp_c, 1), mood,
                     round(score, 3), label])

    random.shuffle(rows)

    with open(output_file, 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(header)
        writer.writerows(rows)

    pos = sum(r[-1] for r in rows)
    neg = len(rows) - pos
    print(f"✅ Dataset generated: {len(rows)} rows  |  {pos} positive  |  {neg} negative")
    print(f"📄 Saved to: {output_file}")


if __name__ == '__main__':
    out_path = os.path.join(os.path.dirname(__file__), 'outfit_dataset.csv')
    generate_dataset(n_samples=12000, output_file=out_path)
