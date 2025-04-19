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
        let element = document.createElement("tr");
        element.className = "review";
        element.id = this.id;

        let title = document.createElement("td");
        title.className = "title";
        title.innerText = this.title;
        element.appendChild(title);

        let ratingBox = document.createElement("td");
        for(let i = 0; i < Number(this.rating); i++) {
            let star = document.createElement("span");
            star.className = "fa fa-star";     // from https://www.w3schools.com/howto/howto_css_star_rating.asp
            ratingBox.appendChild(star);
        }
        element.appendChild(ratingBox);

        let edit = document.createElement("td");
        edit.innerText = "Edit";
        element.appendChild(edit);

        let del = document.createElement("td");
        del.innerText = "Delete";
        element.appendChild(del);

        return element;
    }

    /**
     *  Renders the element to the DOM by putting it in the table of reviews
     */ 
    render() {
        document.getElementById("reviewTable").appendChild(this.element);
    }

    /**
     * Remove the element from the DOM
     */
    delete() {
        this.element.remove();
    }
}

/**
 * Creates a table row element for every review in our database
 */
async function populateReviews() {
    // logic from here: https://dmitripavlutin.com/fetch-with-json/
    let response = await fetch("/get_all_reviews");
    let json = await(response.json());

    let i = 0;
    while(json[String(i)] !== null) {
        console.log("got into the while loop");
        let src = json[String(i)];
        console.log(src);
        let review = new Review(src["id"], src["title"], src["rating"]);
        review.createElement()
        review.render()

        i += 1;
    }
}

populateReviews();