import os
import numpy as np
from app.utils.image_utils import embed_image_from_path

GALLERY_DIR = "samples"
DATA_DIR = "data"
os.makedirs(DATA_DIR, exist_ok=True)

EMB_PATH = os.path.join(DATA_DIR, "gallery_embeddings.npy")
PATHS_FILE = os.path.join(DATA_DIR, "gallery_paths.txt")


def load_gallery():
    """Load gallery images and embeddings, or build them if missing."""
    if os.path.exists(EMB_PATH) and os.path.exists(PATHS_FILE):
        print("Loading cached gallery embeddings...")
        gallery_embs = np.load(EMB_PATH)

        with open(PATHS_FILE, "r") as f:
            gallery_paths = [line.strip() for line in f.readlines()]

        return gallery_paths, gallery_embs

    print("Building gallery embeddings from samples/ ...")

    gallery_paths = [
        os.path.join(GALLERY_DIR, f)
        for f in os.listdir(GALLERY_DIR)
        if f.lower().endswith((".jpg", ".jpeg", ".png"))
    ]

    # create embeddings
    gallery_embs = np.vstack([embed_image_from_path(p) for p in gallery_paths])

    # save
    np.save(EMB_PATH, gallery_embs)

    with open(PATHS_FILE, "w") as f:
        for p in gallery_paths:
            f.write(p + "\n")

    print("Gallery built and cached.")
    return gallery_paths, gallery_embs
