import sys
import json
from pathlib import Path

from PIL import Image
import torch
import torch.nn as nn
from torchvision import models, transforms

NUM_CLASSES = 50

BASE_DIR = Path(__file__).resolve().parent
MODEL_DIR = BASE_DIR / "model"

CHECKPOINT_PATH = MODEL_DIR / "efficientnet_b0_best_model.pth"
CLASS_MAP_PATH = MODEL_DIR / "class_map.json"
CATEGORY_NAME_PATH = MODEL_DIR / "category_id_to_name.json"
MAIN_CATEGORY_MAP_PATH = MODEL_DIR / "main_category_map.json"

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")


def build_model(num_classes=50):
    model = models.efficientnet_b0(weights=None)
    in_features = model.classifier[1].in_features
    model.classifier[1] = nn.Linear(in_features, num_classes)
    return model


def load_json(path: Path):
    if not path.exists():
        raise FileNotFoundError(f"JSON file not found: {path}")
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def load_model():
    if not CHECKPOINT_PATH.exists():
        raise FileNotFoundError(f"Checkpoint not found: {CHECKPOINT_PATH}")

    model = build_model(NUM_CLASSES).to(DEVICE)
    checkpoint = torch.load(CHECKPOINT_PATH, map_location=DEVICE)

    if isinstance(checkpoint, dict) and "model_state_dict" in checkpoint:
        model.load_state_dict(checkpoint["model_state_dict"])
    else:
        model.load_state_dict(checkpoint)

    model.eval()
    return model


INFER_TRANSFORM = transforms.Compose([
    transforms.Resize((256, 256)),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    ),
])

DISPLAY_NAME_MAP = {
    "Tee": "T-Shirt",
    "Button-Down": "Shirt",
    "Tank": "Tank Top",
    "Sweatpants": "Track Pants",
    "Cutoffs": "Shorts",
}


def normalize_display_name(type_name: str) -> str:
    return DISPLAY_NAME_MAP.get(type_name, type_name)


def predict(image_path: str):
    class_map = load_json(CLASS_MAP_PATH)
    category_names = load_json(CATEGORY_NAME_PATH)
    main_category_map = load_json(MAIN_CATEGORY_MAP_PATH)

    model_to_raw = class_map["model_to_raw"]
    model = load_model()

    image = Image.open(image_path).convert("RGB")
    x = INFER_TRANSFORM(image).unsqueeze(0).to(DEVICE)

    with torch.no_grad():
        logits = model(x)
        probs = torch.softmax(logits, dim=1)[0]

    # Aggregate confidence by main type
    grouped_predictions = {}

    for idx, prob in enumerate(probs.tolist()):
        raw_category_id = model_to_raw.get(str(idx), idx)
        raw_type_name = category_names.get(str(raw_category_id), f"class_{raw_category_id}")

        display_type_name = normalize_display_name(raw_type_name)
        main_type = main_category_map.get(display_type_name, display_type_name)

        if main_type not in grouped_predictions:
            grouped_predictions[main_type] = {
                "type": main_type,
                "confidence": 0.0,
                "raw_types": set()
            }

        grouped_predictions[main_type]["confidence"] += prob
        grouped_predictions[main_type]["raw_types"].add(raw_type_name)

    # Convert to sorted list
    aggregated_predictions = []
    for item in grouped_predictions.values():
        aggregated_predictions.append({
            "type": item["type"],
            "confidence": round(item["confidence"], 4),
            "raw_types": sorted(list(item["raw_types"]))
        })

    aggregated_predictions.sort(
        key=lambda x: x["confidence"],
        reverse=True
    )

    top_k_predictions = aggregated_predictions[:5]
    top_prediction = top_k_predictions[0]

    return {
        "type": top_prediction["type"],
        "confidence": top_prediction["confidence"],
        "top_k_predictions": top_k_predictions
    }


def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Image path is required"}))
        sys.exit(1)

    image_path = sys.argv[1]

    try:
        result = predict(image_path)
        print(json.dumps(result))
    except Exception as e:
        import traceback
        traceback.print_exc(file=sys.stderr)
        print(json.dumps({"error": str(e)}))
        sys.exit(1)


if __name__ == "__main__":
    main()