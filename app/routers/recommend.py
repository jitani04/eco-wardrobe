import io
import numpy as np
from fastapi import APIRouter, UploadFile, File
from PIL import Image

from app.gallery import load_gallery
from app.utils.image_utils import embed_image_from_pil

router = APIRouter(
    prefix="/api",
    tags=["recommendations"]
)

# load gallery once at startup
gallery_paths, gallery_embs = load_gallery()


@router.post("/recommend")
async def recommend(file: UploadFile = File(...), k: int = 3):
    """Upload an image → return top-k similar clothing images."""
    try:
        # read uploaded image
        data = await file.read()
        img = Image.open(io.BytesIO(data))

        # embed uploaded image
        query_emb = embed_image_from_pil(img)

        # cosine similarity via dot product
        sims = gallery_embs @ query_emb

        # get top-k results
        topk_idx = np.argsort(sims)[::-1][:k]

        results = []
        for idx in topk_idx:
            results.append({
                "score": float(sims[idx]),
                "image_path": gallery_paths[idx]
            })

        return {"matches": results}

    except Exception as e:
        return {"error": str(e)}
