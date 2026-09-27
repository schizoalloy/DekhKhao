/** Page copy that is list-shaped. Kept here so non-developers can edit it safely. */

export const problems = [
  {
    label: "Size is a number",
    body: "“12-inch” is precise, and still hard to picture. Is that for one person or three?",
  },
  {
    label: "Portions are a guess",
    body: "A “full” karahi, a “family” platter, a “large” fries — every restaurant means something different.",
  },
  {
    label: "New dishes feel risky",
    body: "Unfamiliar food is easier to skip than to ask about, so customers order what they already know.",
  },
  {
    label: "Photos only go so far",
    body: "A flat, cropped photo shows a dish, not how big it is on the table in front of you.",
  },
  {
    label: "QR menus look the same",
    body: "Most digital menus are a PDF behind a code. Nothing about them says anything about your restaurant.",
  },
] as const;

export const steps = [
  { n: "01", title: "Scan", body: "The customer scans the QR code on their table." },
  { n: "02", title: "Choose", body: "They pick a dish from your digital menu." },
  { n: "03", title: "See", body: "The dish opens in 3D. They can turn it, get close, look at it from the side." },
  { n: "04", title: "Place", body: "Through the phone camera, it sits on their actual table — at its real size." },
] as const;

export const experiencePoints = [
  { title: "Understand the size", body: "A 10-inch and a 14-inch pizza stop being numbers and start being objects." },
  { title: "Judge the portion", body: "See whether a platter covers the table or fits beside the chai." },
  { title: "Explore the menu", body: "Turn a dish around. Get close. Look at it from the side." },
  { title: "Try something new", body: "Unfamiliar food is less of a gamble when you can see it first." },
  { title: "Remember the meal", body: "It’s the part of the evening people show their friends." },
] as const;

export const benefits = [
  {
    title: "Make the menu visual",
    body: "Customers understand dishes beyond a line of text and a static photo.",
  },
  {
    title: "Reduce uncertainty",
    body: "Customers can answer “how big is it?” for themselves, and know what they’re ordering.",
  },
  {
    title: "Showcase your food",
    body: "Give signature dishes the presentation they deserve — at their real size, from every angle.",
  },
  {
    title: "Stand out",
    body: "Offer something beyond a conventional QR menu — a menu worth talking about.",
  },
  {
    title: "Build a digital food library",
    body: "Each dish gets its own reusable 3D representation — ready for the menu, your socials, and whatever comes next.",
  },
] as const;

export const faqs = [
  {
    q: "What is DekhKhao?",
    a: "DekhKhao turns your restaurant’s menu into something customers can see. They scan a QR code, choose a dish, and view it in 3D — or placed on their own table through their phone camera — before they order.",
  },
  {
    q: "Do customers need to download an app?",
    a: "No. The experience is designed to run in the phone’s web browser, straight from the QR code. We’re testing across a wide range of phones, and we’ll confirm device support with you before launch.",
  },
  {
    q: "Does it work with existing restaurant menus?",
    a: "DekhKhao is built to sit alongside the menu you already have — your dishes, names and sizes stay the same, and we add the visual layer. How it connects to your current setup is something we work out with each restaurant.",
  },
  {
    q: "Can customers order through DekhKhao?",
    a: "No. DekhKhao only shows the food. Your ordering stays exactly as it is — waiters, counter, your own app or delivery partners. We add the visual layer that helps customers decide.",
  },
  {
    q: "What food can be visualized?",
    a: "Potentially any menu item that can be represented well in 3D — pizzas, burgers, karahi, biryani, platters, desserts and drinks. We’ll help you decide which dishes benefit most.",
  },
  {
    q: "Can customers see the actual size?",
    a: "Yes — that’s the whole point. Every dish is modelled to its real, measured dimensions, so a 12-inch pizza appears as a 12-inch pizza on the customer’s table, and a 10-inch looks like a 10-inch next to it. Phone cameras need good light and a clear surface to place things accurately, and we check every model against the real dish before it goes live.",
  },
  {
    q: "How does a restaurant get started?",
    a: "Send us a message. We’ll talk through your menu, pick the first dishes to bring to life, and show you what it looks like for your restaurant.",
  },
] as const;
