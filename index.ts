import * as core from '@actions/core';
// import OpenAI from 'openai';
import { LinearClient, Issue } from '@linear/sdk';

const version = core.getInput('version', { required: true });
const linearTeam = core.getInput('linear-team', { required: true });
const linearApiKey = core.getInput('linear-api-key', { required: true });
// const openaiApiKey = core.getInput('openai-api-key');

const linearClient = new LinearClient({
  apiKey: linearApiKey,
});

async function getAllFinishedTickets() {
  let tickets: Issue[] = [];

  try {
    // Assuming there exists a method `issues` that fetches all issues.
    const allIssues = await linearClient.issues({
      filter: {
        and: [
          {
            team: { name: { eq: linearTeam } },
            labels: { name: { eq: version } },
            //   state: { name: { eq: LINEAR_DONE_COLUMN } },
          },
        ],
      },
      // should be enough to not paginate (250 is Linear's limit)
      first: 250,
    });

    const totalTicketCount = allIssues.nodes.length;

    if (allIssues && totalTicketCount) {
      console.log(`Found ${totalTicketCount} tickets...`);
      tickets = allIssues.nodes;
    } else {
      console.log("No issues found");
    }
  } catch (error) {
    console.error("Error fetching issues", error);
  }

  return tickets;
}

function formatReleaseNote(tickets: Issue[]) {
  let resultString = "";

  tickets.forEach((ticket) => {
    resultString += `- [${ticket.identifier}](${ticket.url}) - ${ticket.title}\n`;
  });

  return resultString;
}

getAllFinishedTickets().then((tickets) => {
  const formattedTickets = formatReleaseNote(tickets);
  console.log(formattedTickets);
  core.setOutput("release_notes", formattedTickets);
}).catch((error) => {
  console.error("Error getting tickets", error);
  core.setFailed(error.message);
});
