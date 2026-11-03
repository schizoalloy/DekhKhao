/** Page copy that is list-shaped. Kept here so non-developers can edit it safely. */

export const problems = [
  {
    label: "Size is just a number",
    body: "“12-inch” is precise, and still hard to picture. Is that for one person or three?",
  },
  {
    label: "Portions are a guess",
    body: "A “full” karahi, a “family” platter, a “large” fries: every restaurant means something different.",
  },
  {
    label: "New dishes feel risky",
    body: "Unfamiliar food is easier to skip than to ask about, so customers order what they already know.",
  },
  {
    label: "Photos only go so far",
    body: "A flat, cropped photo shows a dish, not how big it is on the table in front of you.",
  },
] as const;

export const steps = [
  { title: "Scan", body: "The customer scans the DekhKhao QR code on their table." },
  { title: "Pick a dish", body: "They choose one of the dishes you’ve brought to life." },
  { title: "See it, real size", body: "It appears on their actual table through the phone camera, at the size it’s served." },
  { title: "Decide better", body: "Then they order the way they always do, knowing what’s coming." },
] as const;

export const experiencePoints = [
  { title: "Understand the size", body: "A 10-inch and a 14-inch pizza stop being numbers and start being objects." },
  { title: "Judge the portion", body: "See whether a platter covers the table or fits beside the chai." },
  { title: "Look closer", body: "Turn a dish around, get close, look at it from the side." },
  { title: "Try something new", body: "Unfamiliar food is less of a gamble when you can see it first." },
] as const;

/** What the restaurant does vs what DekhKhao does: the "fully managed" promise. */
export const managed = {
  restaurant: ["Send us the dishes you want to show", "Put the QR codes on your tables"],
  dekhkhao: [
    "Build a true-to-size 3D model of every dish",
    "Check each model against the real dish",
    "Host and run the AR experience",
    "Supply print-ready table QR codes",
  ],
} as const;

export const benefits = [
  {
    title: "Real size, not a guess",
    body: "Customers answer “how big is it?” for themselves, before they order.",
  },
  {
    title: "Your signature dishes, up close",
    body: "Every angle, at the size you serve it. A better showcase than a line of text and a photo.",
  },
  {
    title: "Nothing to change",
    body: "No app for customers, no new system for staff. Your menu, POS and ordering stay exactly as they are.",
  },
  {
    title: "A table moment people remember",
    body: "Food appearing on the table is something guests show the people next to them.",
  },
] as const;

export const faqs = [
  {
    q: "What is DekhKhao?",
    a: "A simple, fully managed augmented reality experience for restaurants. Customers scan a QR code on the table, pick a dish and see it on their own table through the phone camera, at its real size, before they order.",
  },
  {
    q: "What does “fully managed” mean?",
    a: "You send us the dishes you want to show. We build a true-to-size 3D model of each one, check it against the real dish, host the AR experience and give you print-ready QR codes for your tables. Your staff never touch any 3D software.",
  },
  {
    q: "Is DekhKhao a digital menu, POS or ordering system?",
    a: "No. It’s a visual layer that sits next to whatever you already use. Customers still order and pay exactly as they do today: with your waiters, at the counter, or through your own app or delivery partners.",
  },
  {
    q: "Do customers need to download an app?",
    a: "No. The QR code opens the experience in the phone’s browser. iPhones use Apple’s built-in AR viewer; Android phones use Google’s. We’ll confirm support on the phones your customers use before launch.",
  },
  {
    q: "Can customers really see the actual size?",
    a: "Yes, that’s the point. Each dish is modelled to its measured dimensions, so a 12-inch pizza appears as a 12-inch pizza on the table. Phone cameras need decent light and a clear surface to place things accurately.",
  },
  {
    q: "What food can be shown?",
    a: "Most dishes that hold their shape: pizzas, burgers, karahi, biryani, platters, desserts and drinks. We’ll help you choose the dishes where seeing the size helps customers most.",
  },
  {
    q: "How does a restaurant get started?",
    a: "Message us on WhatsApp. We’ll talk through which dishes to start with and show you what it looks like for your restaurant.",
  },
] as const;
