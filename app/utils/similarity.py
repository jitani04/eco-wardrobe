import numpy as np

def top_k_similar(query_emb, gallery_embs, k=3):
    """Return indices and similarity scores for top-k nearest images."""
    sims = gallery_embs @ query_emb
    topk_idx = np.argsort(sims)[::-1][:k]
    return topk_idx, sims
