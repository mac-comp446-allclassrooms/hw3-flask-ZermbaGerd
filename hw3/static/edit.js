
const id = document.getElementById("type").content
// id will be -1 if we're creating a new movie, and anything else we are editing one


// if we're not creating a new review, update our areas to have the existing value, and tell our form to edit instead of create
if(id !== "-1") {
    fillValues();
}
else {  // if we ARE creating a new one, don't populate and make title interactable again
    document.getElementById("title").style.pointerEvents = "all";

    // make our form do a POST request to create
    document.getElementById("reviewForm").action = "/create"
    document.getElementById("reviewForm").method = "POST"
}

// Gets the JSON object of a review from a given id
async function getReviewFromID(id) {
    let response = await fetch("/get_review/"+id);
    let json = await response.json();
    return json;
}

async function fillValues() {
    let reviewJSON = await getReviewFromID(id);
    
    // populate all of our inputs with the existing data
    document.getElementById("title").value = reviewJSON["title"];
    document.getElementById("review").innerText = reviewJSON["text"];
    document.getElementById(String(reviewJSON["rating"])).checked = true;

    // make our form do a POST request to edit
    document.getElementById("reviewForm").action = "/edit"
    document.getElementById("reviewForm").method = "POST"
}