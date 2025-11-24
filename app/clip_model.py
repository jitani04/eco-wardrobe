import torch
import clip

# Load CLIP model once on startup
device = "cuda" if torch.cuda.is_available() else "cpu"
model, preprocess = clip.load("ViT-B/32", device=device)

def get_model():
    """Return the loaded CLIP model, preprocess, and device."""
    return model, preprocess, device
