
const id = document.getElementById("id").content

fillValues()

// Gets the JSON object of a review from a given id
async function getReviewFromID(id) {
    let response = await fetch("/get_review/"+id);
    let json = await response.json();
    return json;
}

async function fillValues() {
    let reviewJSON = await getReviewFromID(id);
    
    // populate all of our inputs with the existing data
    document.getElementById("filler").innerText = "Review Of: "+ reviewJSON["title"];
    document.getElementById("review").innerText = reviewJSON["text"];

    // put stars in rating
    let rating = document.getElementById("rating");
    for(let i = 0; i < Number(reviewJSON["rating"]); i++) {
        let star = document.createElement("span");
        star.className = "fa fa-star";     // from https://www.w3schools.com/howto/howto_css_star_rating.asp
        rating.appendChild(star);
    }
}