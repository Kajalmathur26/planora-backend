// test.js
fetch("https://odimwlxlkvihktuxoufu.supabase.co")
  .then(res => console.log("Supabase reachable", res.status))
  .catch(err => console.log("Cannot reach Supabase", err));