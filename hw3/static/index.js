class Review {
    constructor(id, title, rating) {
        this.id = id;
        this.title = title;
        this.rating = rating;
        this.element = this.createElement();
    }

    /**
     * Creates the element to be put in the table.
    */
    createElement() {
        // create row
        let element = document.createElement("tr");
        element.className = "review";
        element.id = this.id;

        // create title
        let title = document.createElement("td");
        title.className = "title";
        title.innerText = this.title;
        element.appendChild(title);

        // create rating + put stars in it
        let ratingBox = document.createElement("td");
        for(let i = 0; i < Number(this.rating); i++) {
            let star = document.createElement("span");
            star.className = "fa fa-star";     // from https://www.w3schools.com/howto/howto_css_star_rating.asp
            ratingBox.appendChild(star);
        }
        element.appendChild(ratingBox);

        // create edit/delete and give them the right callbacks
        let editBox = document.createElement("td");
        let editContent = document.createElement("button");
        editContent.onclick = () => {console.log("poopie");};
        editContent.innerText = "Edit"
        editBox.appendChild(editContent);
        element.appendChild(editBox);

        let delBox = document.createElement("td");
        let delContent = document.createElement("button");
        delContent.onclick = () => {
            let response = fetch("/delete/"+this.id)
            this.element.remove();
        };
        delContent.innerText = "Delete"
        
        delBox.appendChild(delContent);
        element.appendChild(delBox);

        return element;
    }

    /**
     *  Renders the element to the DOM by putting it in the table of reviews
     */ 
    render() {
        document.getElementById("reviewTable").appendChild(this.element);
    }
}

/**
 * Creates a table row element for every review in our database
 */
async function populateReviews() {
    // logic from here: https://dmitripavlutin.com/fetch-with-json/
    let response = await fetch("/get_all_reviews");
    let json = await(response.json());

    // loop through every review we have and create an element for it
    let i = 0;
    while(json[String(i)] !== undefined) {
        let src = json[String(i)];
        console.log(src);
        let review = new Review(src["id"], src["title"], src["rating"]);
        review.createElement()
        review.render()

        i += 1;
    }
}

populateReviews();