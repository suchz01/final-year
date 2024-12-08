const axios = require('axios');
const cheerio = require('cheerio');

async function getCodeChefRating(username) {
  const url = `https://www.codechef.com/users/${username}`;

  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    
    const ratingElement = $('div.rating-number').first(); 
    const rating = ratingElement.text().trim();

    if (rating) {
      return rating;
    } else {
      throw new Error(`Rating not found for user: ${username}`);
    }
  } catch (error) {
    console.error(error);
  }
}

const username = 'suchzz';
getCodeChefRating(username).then(rating => {
  console.log(`User: ${username}, Rating: ${rating}`);
}).catch(error => {
  console.error('Error:', error);
});
