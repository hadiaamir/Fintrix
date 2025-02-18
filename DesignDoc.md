## Introduction

- given a prompt the chatbot responds with a summary answering the prompt and
  also provides a detailed view of the response

able to handle all these questions and more:

"Summarize Spotify's latest conference call."
"What has Airbnb management said about profitability over the last few earnings calls?"
"What are Mark Zuckerberg's and Satya Nadella's recent comments about AI?"
"How many new large deals did ServiceNow sign in the last quarter?"

## Extra Stuff added

- I tried to cover as much coverage as I could with FMP's category of APIs after I covered the
  Earning Transcripts and specific financial metrics.

- Added summary along with a detailed view of the response

- Custom UI/UX design of the platform, creating a nice sliding prompt buttons you can click on
  that trigger a prompt

- Redis caching, for common used prompts

## System Architecture

Folder Structure

- components/ - folder that holds all the custom reusuable components
- constants/ - that holds the FMP API json covering the different categories
  which holds the name (as the key), the api url to call (I picked the one that covered moajority of the prompts)
  and path (path parameteres) and queries (query params) for that api.

- services/api/ - I like to organize my api related function into seperate files that hold
  functions that align with the file name (i.e. ChatGPTService -- all functions that use ChatGPT completion API).
  This way it keeps any other code related to my route.js files for APIs clean.

- utils/ - holds http.js a custom file wrapper for my axios calls that just makes my responses return using data: ...
  and also for cleaner api calls on the frontend using http.get(/pathtoapi) rather that typing out the headers,
  domain name and etc.

Fronted

- React js - used latest react

Backend

- Next.js 15 - used latest Next.js

Database/Storage

- Redis - used redis for caching server side responses for common prompts.

## Non-Functional Requirements

Scalability - as more people use this platform and more prompts, there needs to be some timeout or one request at a time for
the user using it. So that it does not trigger multiple prompts because that'll break the search.

Performance - not as fast on the initial pull, due to the chatgpt usage but after first pull I cache it into redis

Security - using environment variables for keys but if I were to add any authentication to it. I would defitnetly add JWT tokens
or any other secure security on each API.

Reliability - since im using chatgpt-3.5-turbo, the prompts work if you give a small sec before you ask another question. If it
doesnt work the first time try again.

## Other notes:

- I am low on my CHATGPT budget as I have used 2.4$ out of 5$ limit so if that happens. Let me know or if you guys have a spare testing
  one pls use that.
