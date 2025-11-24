import numpy as np
import torch
from PIL import Image
from app.clip_model import get_model

model, preprocess, device = get_model()


def embed_image_from_pil(img: Image.Image) -> np.ndarray:
    """Embed a PIL image using CLIP."""
    img = img.convert("RGB")
    img_tensor = preprocess(img).unsqueeze(0).to(device)

    with torch.no_grad():
        emb = model.encode_image(img_tensor)
        emb = emb / emb.norm(dim=-1, keepdim=True)

    return emb.cpu().numpy()[0]


def embed_image_from_path(path: str) -> np.ndarray:
    """Embed an image located at a file path."""
    return embed_image_from_pil(Image.open(path))
