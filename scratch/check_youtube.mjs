
const urls = [
  "https://www.youtube.com/shorts/ttBYN_YBpYs",
  "https://www.youtube.com/shorts/2FYu6QM9ZNA",
  "https://www.youtube.com/shorts/uefC6ViBccc"
];

for (const url of urls) {
  try {
    const watchUrl = url.replace('/shorts/', '/watch?v=');
    const noembedUrl = `https://noembed.com/embed?url=${encodeURIComponent(watchUrl)}`;
    const res = await fetch(noembedUrl);
    console.log(`Original: ${url} -> Watch: ${watchUrl}`);
    console.log(`Status: ${res.status}`);
    const data = await res.json();
    if (data.error) {
      console.log(`Error Response: ${data.error}`);
    } else {
      console.log(`Title: ${data.title}`);
    }
    console.log('---');
  } catch (err) {
    console.error(`Error fetching ${url}:`, err.message);
  }
}


