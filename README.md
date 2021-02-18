# Hmmm is that right?

A web app for made for quick **fact checking**. 🔎📰

A web-app to help people quickly fact check statements and news claims. The idea is to automate as much of the cross-checking process as possible.

Enter a news statement and the app will scrape related articles from a few different sources and display them in a table for the user.

The steps the app preforms are as follows:

1. The user enters a statement into the UI search bar:
   ![UI image](https://github.com/OrionMat/Hmm-is-that-right/blob/master/client/public/UI_landing.png?raw=true)
2. The UI sends the statement and the active news sources to the back-end server.
   ![UI search image](https://github.com/OrionMat/Hmm-is-that-right/blob/master/client/public/UI_search.png?raw=true) > (News sources can be toggled between active and inactive by clicking on them. Greyed out icons are displayed for de-activated news sources. Here the New York Times and Reuters news are activated, and so only articles from those News agencies will be scrapped).
3. The back-end server performs a google search query with the **statement** and **news sources**.
4. The resulting URLs taken from google are then used to programmatically visit the webpages and scrape the html.
5. The raw html is then parsed into a news piece object which contains the fields **Source, Title, Author, Date** and **Body**.
6. The news piece objects are then sent back the the UI to be displayed in a table for easy fact-checking.
   ![UI results table](https://github.com/OrionMat/Hmm-is-that-right/blob/master/client/public/UI_results.png?raw=true)

## Technical

The project is mainly written in TypeScript (a statically typed superset of Javascript). Babel is used to compile TypeScript down to JavaScript, then Webpack bundles the code for deployment.

- The UI is built with React ⚛️ and leverages TypeScript via `jsx` .
- The backend uses `express` and `axios` to handle the **http** requests sent between the front-end and the back-end.
- [Scale SERP](https://scaleserp.com/) is used as an interface with Google to search for relevant news and get the article links.
  > To run the web app you will need a google API key to get search results. This can be obtained for free [here](https://app.scaleserp.com/signup)

## Run the Project

1. Clone the project [here](https://github.com/OrionMat/Hmm-is-that-right)
2. Install the dependencies:
   Open the terminal and change directory into the `client` folder (`cd client`). Then run the command `npm install` to install all the dependencies for the UI.
   Change directory into the server (`cd ../server` if you're still in the client folder) and run another `npm install`.
3. Create a file in the server folder called `.env` and paste: **SERP_SEARCH_API_KEY=**
   then paste your google API search key (can get a free one from [here](https://app.scaleserp.com/signup))
4. Run an `npm run build` in the server directory
5. Change into the Client directory and run a `npm run start`. This should kick off the UI.

now testing git reset
