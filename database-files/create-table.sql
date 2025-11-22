CREATE TABLE brands (
    brand_id SERIAL PRIMARY KEY,
    brand_name VARCHAR(255) NOT NULL,
    overall_score INTEGER NOT NULL
);

CREATE TABLE clothing_items (
    clothing_id SERIAL PRIMARY KEY,
    image_url TEXT NOT NULL,
    item_url TEXT NOT NULL,
    brand_name VARCHAR(255) NOT NULL,
    clothing_name TEXT NOT NULL,
    price_usd NUMERIC(10,2)
);