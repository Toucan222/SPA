const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event) => {
  try {
    const { url } = JSON.parse(event.body);
    const deepseekApiKey = process.env.DEEPSEEK_API_KEY;
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Call Deepseek API
    const response = await axios.post('https://api.deepseek.com/v1/scrape', {
      url: url
    }, {
      headers: {
        'Authorization': `Bearer ${deepseekApiKey}`,
        'Content-Type': 'application/json'
      }
    });

    const scrapedData = response.data;

    // Store in Supabase
    const { data, error } = await supabase
      .from('scraped_data')
      .insert([
        {
          url: url,
          content: scrapedData,
          created_at: new Date().toISOString()
        }
      ]);

    if (error) throw error;

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Scraping successful',
        data: scrapedData
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.message
      })
    };
  }
};
