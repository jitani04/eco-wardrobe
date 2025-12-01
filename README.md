# Sustainable Fashion Assistant

# Step 1: Clone the repository using the project's Git URL.
git clone https://github.com/jitani04/eco-wardrobe.git

# Step 2: Navigate to the project directory.
cd ecostyle

# Step 3: Install the necessary dependencies.
npm install

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run build

After the build completes, the output will be in `frontend/dist/` In Chrome/Edge/Brave open Extensions -> Load unpacked and select the `frontend/dist/` folder.


# Step 4: Run the backend server
cd backend
create a python venv
install dependencies from requirements.txt
pip install -r requirements.txt
    if you cant run the requirements.txt file, run these commands manually:
        pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
        pip install Pillow requests python-dotenv supabase ftfy regex timm
        pip install git+https://github.com/openai/CLIP.git
        pip install fastapi uvicorn
        pip install python-multipart
        pip install numpy==1.26.4

use these command to run the backend:
cd clothing-rec-program
uvicorn CLIP_text_rec_backend:app --reload

go to the link to access the backend and test it out, click on the /search endpoint and upload an image of a product image:
    http://localhost:8000/docs

# This project is built with:

- Vite
- TypeScript
- React
- FastAPI
- Python
- shadcn-ui
- Tailwind CSS
