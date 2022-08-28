import fetch from 'node-fetch';

const user = "ssz256";
const perPage = 512;
const repoName = "gpmc-plugin/ReportsSystem".toLowerCase();
const searchEndpoint = "search/commits?q=author:" + user + "&sort=author-date&order=desc&per_page=" + perPage;
const exitOnRareLimit = false;

async function apiGet(endpoint)
{
    const modifiedEndpoint = "https://api.github.com/" + endpoint;
    const response = await fetch(modifiedEndpoint);
    const body = await response.json();
    if(body["message"] != undefined)
    {
        console.log("rare limited");
        if(exitOnRareLimit)
            process.exit(1);
        sleep(15000);
        return await apiGet(endpoint);
    }
    return body;
}

function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
        currentDate = Date.now();
    } while (currentDate - date < milliseconds);
}

let body = await apiGet(searchEndpoint);

const pageCount = Math.floor(body["total_count"] / perPage + 0.5);

let commitDatabase = [];

let usedDates = [];

for (let i = 0; i <= pageCount; i++) {
    body = await apiGet(searchEndpoint+"&page="+i.toString());
    for (let index = 0; index < body["items"].length; index++) {
        const commit = body["items"][index];
        if(usedDates.includes(commit["commit"]["author"]["date"]))
            continue
        usedDates.push(commit["commit"]["author"]["date"]);
        if(commit["repository"]["full_name"].toLowerCase() == repoName)
        {
            let commitName = commit["commit"]["message"].split("\n")[0];
            console.log(user + " (" + commit["commit"]["author"]["date"] + "): " + commitName);

        }
            //console.log(commit["commit"]["message"]);
    }
    commitDatabase = commitDatabase.concat(body["items"]);
}
//console.log(commitDatabase);