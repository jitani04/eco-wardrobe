import os
import torch
import clip
import requests
from io import BytesIO
from PIL import Image
from supabase import create_client, Client
from dotenv import load_dotenv
import numpy as np

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

'''
HOW TO RUN:
* create a python virtual enviroment
* install these dependencies
    pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
    pip install Pillow requests python-dotenv supabase ftfy regex timm
    pip install git+https://github.com/openai/CLIP.git
    pip install fastapi uvicorn
    pip install python-multipart

* use this command to run the backend:
    uvicorn CLIP_clothing_rec_backend:app --reload

* go to the link to access the backend and test it out, click on the /search endpoint:
    http://localhost:8000/docs
'''

# load environment variables - getting secret key and url
print("Script Started") #test print to check if the script runs
load_dotenv()

SUPABASE_URL = os.getenv("VITE_SUPABASE_URL")
SUPABASE_SECRET_KEY = os.getenv("SUPABASE_SECRET_KEY")  # must use service key

if not SUPABASE_URL or not SUPABASE_SECRET_KEY:
    raise ValueError("Missing SUPABASE_URL or SUPABASE_SECRET_KEY in .env")

# create supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SECRET_KEY)

# --- Load FashionCLIP ---
device = "cuda" if torch.cuda.is_available() else "cpu"
model, preprocess = clip.load("ViT-B/32", device=device)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],       
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"status": "ok"}

def compute_embedding(image: Image.Image):
    image_tensor = preprocess(image).unsqueeze(0).to(device)
    with torch.no_grad():
        embedding = model.encode_image(image_tensor)
    
    embedding = embedding / embedding.norm(dim=-1, keepdim=True)
    return embedding.cpu().numpy().tolist()[0]

@app.post("/search")
async def search(file: UploadFile = File(...), k: int = 3):
    img_bytes = await file.read()
    image = Image.open(BytesIO(img_bytes)).convert("RGB")

    query_embedding = compute_embedding(image)

    response = supabase.rpc(
        "match_embeddings",  # stored function name
        {"query_embedding": query_embedding, "match_count": k}
    ).execute()

    return response.data

# # --- Run it ---
# results = find_top_matches("pink-sweater.png")

# for item in results:
#     print(item["clothing_name"], item["image_url"], item["distance"])