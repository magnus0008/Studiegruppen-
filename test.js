console.log("hej") 

async function hentdata(){
let BASEURL = "https://paia.projects.cavi.au.dk";
let GROUP = "TEST_INF26";
let HASHCODE = "UrBZhehkn@bJCzTz"

    const svar = await fetch(BASEURL + "/api/stories/group/RikkeBB", 
        {headers: {
            "Authorization": `Group ${GROUP}:${HASHCODE}`
        }});
    const data = await svar.json();
    console.log(data);
}

hentdata();