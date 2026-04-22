// Gemmer events-arrayet i localStorage som en JSON-streng
function saveEvents(events) {
    localStorage.setItem("events", JSON.stringify(events));
}

// Loader events fra localStorage
function loadEvents() {
    const data = localStorage.getItem("events"); // Henter gemte events

    if (data) {
        return JSON.parse(data); // Hvis der findes data, returneres det som objekt
    }

    // Hvis der ikke findes noget i localStorage, returneres standard-events
    return [
        {
            id: 1,
            title: "Fællesspisning",
            location: "Køkkenet",
            time: "Fredag 18:00",
            max: 8,
            joined: 3,
            usersJoined: false
        },
        {
            id: 2,
            title: "Filmaften",
            location: "Fællesrum",
            time: "Lørdag 20:00",
            max: 10,
            joined: 6,
            usersJoined: false
        },
        {
            id: 3,
            title: "Løbetur",
            location: "Indgangen",
            time: "Søndag 10:00",
            max: 5,
            joined: 2,
            usersJoined: false
        }
    ];
}

const events = loadEvents(); // Loader events ved start


// ---------------- MIN SIDE KNAP ----------------
// Funktion der sender brugeren til "minSide.html"
function goToMyPage() {
    window.location.href = "minSide.html";
}


// ---------------- FORMULAR ----------------
document.addEventListener("DOMContentLoaded", function () {

    const btn = document.getElementById("openFormBtn"); // Knappen der åbner/lukker formularen
    const form = document.getElementById("formContainer"); // Selve formular-containeren

    if (btn && form) {
        btn.addEventListener("click", function () {
            form.classList.toggle("hidden"); // Viser/skjuler formularen
        });
    }

});


// ---------------- RENDER events ind på siden ----------------
// Funktion der viser alle events på siden
function renderEvents() {
    const container = document.getElementById("events"); // Container til events
    container.innerHTML = ""; // Rydder containeren før ny rendering

    events.forEach(event => {

        const div = document.createElement("div"); // Wrapper til hvert event
        div.className = "event";

        const title = document.createElement("h2"); // Titel
        title.textContent = event.title;

        const location = document.createElement("div"); // Lokation
        location.className = "meta";
        location.textContent = "Sted: " + event.location;

        const time = document.createElement("div"); // Tidspunkt
        time.className = "meta";
        time.textContent = "Hvornår: " + event.time;

        const people = document.createElement("div"); // Antal tilmeldte
        people.className = "meta";
        people.textContent = "Tilmeldte: " + event.joined + "/" + event.max;

        const button = document.createElement("button"); // Tilmeld/afmeld-knap
        button.className = "join";

        // Teksten afhænger af om brugeren allerede er tilmeldt
        button.textContent = event.usersJoined ? "Meld af" : "Tilmeld mig";

        // Klik på knappen toggler tilmelding
        button.onclick = function () {
            toggleJoin(event.id);
        };

        // Tilføjer elementerne til event-div'en
        div.appendChild(title);
        div.appendChild(location);
        div.appendChild(time);
        div.appendChild(people);
        div.appendChild(button);


        // Hvis eventet er oprettet af brugeren selv, vises en slet-knap
        if (event.createdByMe) {

            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "Slet event";
            deleteBtn.style.color = "white";
            deleteBtn.style.marginTop = "5px";

            // Klik på knappen sletter eventet
            deleteBtn.onclick = function () {
                deleteEvent(event.id);
            };

            div.appendChild(deleteBtn);
        }

        // Tilføjer eventet til containeren
        container.appendChild(div);
    });
}


// ---------------- JOIN / LEAVE ----------------
// Funktion der håndterer tilmelding/afmelding
function toggleJoin(id) {
    const event = events.find(e => e.id === id); // Finder eventet ud fra id

    if (!event) return; // Hvis event ikke findes, stop

    if (!event.usersJoined) {
        // Hvis brugeren ikke er tilmeldt
        if (event.joined < event.max) {
            event.joined++; // Øger antal tilmeldte
            event.usersJoined = true; // Marker at brugeren er tilmeldt
        } else {
            alert("Eventet er fuldt!"); // Hvis max er nået
        }
    } else {
        // Hvis brugeren allerede er tilmeldt → afmeld
        event.joined--;
        event.usersJoined = false;
    }

    saveEvents(events); // Gem ændringer
    renderEvents(); // Opdater visningen
}


// ---------------- ADD EVENT ----------------
// Funktion der oprettes globalt, så HTML kan kalde den
window.addEvent = function () {

    // Henter inputværdier fra formularen
    const title = document.getElementById("title").value;
    const location = document.getElementById("location").value;
    const time = document.getElementById("time").value;
    const max = document.getElementById("max").value;

    // Tjekker om alle felter er udfyldt
    if (!title || !location || !time || !max) {
        alert("Udfyld alle felter");
        return;
    }

    // Opretter nyt event-objekt
    const newEvent = {
        id: Date.now(), // Unikt ID baseret på timestamp
        title,
        location,
        time,
        max: Number(max), // max konverteres til tal
        joined: 1, // Opretteren er automatisk tilmeldt
        usersJoined: true,

        createdByMe: true // Markerer at brugeren selv har lavet eventet
    };

    events.push(newEvent); // Tilføjer eventet til arrayet

    saveEvents(events); // Gemmer i localStorage
    renderEvents(); // Opdaterer visningen

    // Nulstiller formularfelterne
    document.getElementById("title").value = "";
    document.getElementById("location").value = "";
    document.getElementById("time").value = "";
    document.getElementById("max").value = "";

};


// ---------------- START ----------------
// Renderer events når siden indlæses
renderEvents();


// Funktion der sletter et event ud fra id
function deleteEvent(id) {

    const index = events.findIndex(e => e.id === id); // Finder index i arrayet

    if (index !== -1) {
        events.splice(index, 1); // Fjerner eventet fra arrayet
    }

    localStorage.setItem("events", JSON.stringify(events)); // Gemmer ændringer
    renderEvents(); // Opdaterer visningen
}
