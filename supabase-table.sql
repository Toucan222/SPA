CREATE TABLE scraped_data (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      url TEXT NOT NULL,
      content JSONB NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
