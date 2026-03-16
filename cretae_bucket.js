const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function main() {
  try {
    const envFile = fs.readFileSync('.env', 'utf8');
    const supabaseUrl = envFile.match(/SUPABASE_URL=(.*)/)[1].trim();
    const supabaseKey = envFile.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)[1].trim();
    
    console.log('Connecting to Supabase...');
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('Creating bucket "journal-images"...');
    const { data, error } = await supabase.storage.createBucket('journal-images', { public: true });
    
    if (error) {
      if (error.message.includes('already exists') || error.message.includes('Duplicate')) {
        console.log('Bucket already exists. Updating it to be public...');
        await supabase.storage.updateBucket('journal-images', { public: true });
        console.log('Bucket updated.');
      } else {
        console.error('Error creating bucket:', error);
      }
    } else {
      console.log('Bucket created successfully:', data);
    }
  } catch (err) {
    console.error('Script error:', err);
  }
}

main();
