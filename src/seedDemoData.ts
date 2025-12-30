import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase-config';
import type { GhostStatus, GhostCategory } from './types/ghost';

const sampleGhosts = [
  {
    title: "Weekly All-Hands Meeting",
    description: "Scheduled every Monday at 9am but hasn't happened in 3 months. Calendar invite still goes out though.",
    reporter: "sarah.chen",
    reporterEmail: "sarah.chen@company.com",
    category: "Communication Gap" as GhostCategory,
    impact: 4,
    status: "New" as GhostStatus,
    url: "https://calendar.company.com/meeting/all-hands"
  },
  {
    title: "Daily Standup on Project Phoenix",
    description: "Project was cancelled 6 months ago but the standup meeting still shows up on everyone's calendar.",
    reporter: "mike.torres",
    reporterEmail: "mike.torres@company.com",
    category: "Process Inefficiency" as GhostCategory,
    impact: 2,
    status: "Resolved" as GhostStatus,
    url: "https://calendar.company.com/meeting/phoenix-standup"
  },
  {
    title: "Q3 Strategy Review Email Thread",
    description: "Still getting CC'd on these emails even though Q4 ended two weeks ago. 47 people on the thread.",
    reporter: "alex.kumar",
    reporterEmail: "alex.kumar@company.com",
    category: "Communication Gap" as GhostCategory,
    impact: 2,
    status: "In Progress" as GhostStatus,
    url: "https://mail.company.com/thread/q3-strategy"
  },
  {
    title: "Urgent: Client Escalation",
    description: "Email chain about a client issue that was resolved 2 months ago. Still marked as urgent.",
    reporter: "jennifer.park",
    reporterEmail: "jennifer.park@company.com",
    category: "Communication Gap" as GhostCategory,
    impact: 5,
    status: "New" as GhostStatus,
    url: "https://mail.company.com/thread/client-escalation"
  },
  {
    title: "#random-coffee Slack Channel",
    description: "Automated bot posts coffee meetup reminders but the office closed and everyone is remote now.",
    reporter: "david.okonkwo",
    reporterEmail: "david.okonkwo@company.com",
    category: "Process Inefficiency" as GhostCategory,
    impact: 1,
    status: "Resolved" as GhostStatus,
    url: "https://slack.company.com/random-coffee"
  },
  {
    title: "#project-alpha-updates",
    description: "Slack channel with 200+ members for a project that was merged into another team. No one posts but notifications keep coming.",
    reporter: "emma.wright",
    reporterEmail: "emma.wright@company.com",
    category: "Communication Gap" as GhostCategory,
    impact: 3,
    status: "New" as GhostStatus,
    url: "https://slack.company.com/project-alpha"
  },
  {
    title: "Monthly Team Lunch Coordination",
    description: "Still coordinating team lunches for a team that was dissolved during the last reorganization.",
    reporter: "carlos.rodriguez",
    reporterEmail: "carlos.rodriguez@company.com",
    category: "Process Inefficiency" as GhostCategory,
    impact: 2,
    status: "In Progress" as GhostStatus,
    url: "https://calendar.company.com/team-lunch"
  },
  {
    title: "Quarterly Business Review Deck",
    description: "Required to submit slides every quarter for a review meeting that never actually happens.",
    reporter: "lisa.nakamura",
    reporterEmail: "lisa.nakamura@company.com",
    category: "Process Inefficiency" as GhostCategory,
    impact: 5,
    status: "New" as GhostStatus,
    url: "https://docs.company.com/qbr-deck"
  },
  {
    title: "Friday Demo Day",
    description: "Calendar says we have Friday demos but they stopped after the second week. Been 5 months now.",
    reporter: "tom.anderson",
    reporterEmail: "tom.anderson@company.com",
    category: "Communication Gap" as GhostCategory,
    impact: 3,
    status: "Resolved" as GhostStatus,
    url: "https://calendar.company.com/demo-day"
  },
  {
    title: "Status Report Email to Old Manager",
    description: "Still sending weekly status reports to a manager who left the company 4 months ago. They bounce back every time.",
    reporter: "priya.shah",
    reporterEmail: "priya.shah@company.com",
    category: "Process Inefficiency" as GhostCategory,
    impact: 3,
    status: "In Progress" as GhostStatus,
    url: "https://mail.company.com/status-reports"
  },
  {
    title: "#watercooler-chat Notifications",
    description: "Slack channel that was created during COVID for virtual socializing. Gets 200+ messages a day, mostly bots and gifs.",
    reporter: "james.williams",
    reporterEmail: "james.williams@company.com",
    category: "Communication Gap" as GhostCategory,
    impact: 2,
    status: "New" as GhostStatus,
    url: "https://slack.company.com/watercooler"
  },
  {
    title: "Annual Performance Review Prep Meeting",
    description: "Recurring meeting to prep for annual reviews, but company switched to continuous feedback 2 years ago.",
    reporter: "olivia.martinez",
    reporterEmail: "olivia.martinez@company.com",
    category: "Process Inefficiency" as GhostCategory,
    impact: 5,
    status: "New" as GhostStatus,
    url: "https://calendar.company.com/performance-review-prep"
  },
  {
    title: "Legacy System Migration Updates",
    description: "Weekly email about migrating off old CRM system. Migration completed 18 months ago.",
    reporter: "ryan.patel",
    reporterEmail: "ryan.patel@company.com",
    category: "Technical Issue" as GhostCategory,
    impact: 2,
    status: "Resolved" as GhostStatus,
    url: "https://mail.company.com/migration-updates"
  },
  {
    title: "Cross-Functional Sync Meeting",
    description: "Meeting between two teams that no longer work together after the product pivot. Still on calendar.",
    reporter: "amanda.brown",
    reporterEmail: "amanda.brown@company.com",
    category: "Process Inefficiency" as GhostCategory,
    impact: 3,
    status: "In Progress" as GhostStatus,
    url: "https://calendar.company.com/cross-functional-sync"
  },
  {
    title: "Office Birthday Celebration Planning",
    description: "Still planning office birthday parties even though we've been fully remote for 2 years.",
    reporter: "kevin.lee",
    reporterEmail: "kevin.lee@company.com",
    category: "Other" as GhostCategory,
    impact: 1,
    status: "New" as GhostStatus,
    url: "https://intranet.company.com/birthday-planning"
  }
];

function generateGhostId() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `GH-${timestamp.toString().slice(-6)}${random}`;
}

export async function seedDemoData() {
  try {
    console.log('Starting to seed demo data...');

    const ghostsCollection = collection(db, 'ghosts');
    let count = 0;

    for (const ghost of sampleGhosts) {
      const now = new Date();
      const daysAgo = Math.floor(Math.random() * 30);
      const reportDate = new Date(now);
      reportDate.setDate(reportDate.getDate() - daysAgo);

      await addDoc(ghostsCollection, {
        id: generateGhostId(),
        title: ghost.title,
        description: ghost.description,
        category: ghost.category,
        impact: ghost.impact,
        effort: 3,
        email: ghost.reporterEmail,
        reporterEmail: ghost.reporterEmail,
        reporter: ghost.reporter,
        department: 'Operations',
        geography: 'Global',
        riskType: [],
        url: ghost.url,
        pageTitle: ghost.title,
        timestamp: reportDate.toISOString(),
        dateReported: reportDate.toISOString().split('T')[0],
        status: ghost.status,
        assignedTo: null,
        resolutionNotes: '',
        daysOpen: ghost.status === 'Resolved' ? Math.floor(Math.random() * 14) + 1 : daysAgo,
        screenshot: null
      });
      count++;
      console.log(`Added ghost ${count}/${sampleGhosts.length}: ${ghost.title}`);
    }

    console.log(`✅ Successfully seeded ${count} ghost reports!`);
    return count;
  } catch (error) {
    console.error('Error seeding demo data:', error);
    throw error;
  }
}
