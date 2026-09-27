/**
 * Privacy Policy text. Edit here; the /privacy page renders it.
 * Block types: "p" paragraph, "ul" bullet list, "ol" numbered list, "h3" sub-heading.
 */

export type PolicyBlock = { p: string } | { ul: string[] } | { ol: string[] } | { h3: string };
export type PolicySection = { n: number; title: string; blocks: PolicyBlock[] };

export const policyUpdated = "September 27, 2026";

export const policyIntro: PolicyBlock[] = [
  { p: "DekhKhao (“DekhKhao”, “we”, “us”, or “our”) is a product of Portive Technologies." },
  {
    p: "DekhKhao provides technology that allows restaurant customers to visualize food and menu items using their smartphones, including through augmented reality (AR). Our service is designed to help customers understand what a food item may look like and how it may appear in a real-world setting before ordering it from the restaurant.",
  },
  {
    p: "This Privacy Policy explains what information may be collected when you visit or use the DekhKhao website or a restaurant experience powered by DekhKhao, how that information may be used, and the choices available to you.",
  },
  { p: "By using our website or a DekhKhao-powered experience, you acknowledge the practices described in this Privacy Policy." },
];

export const policySections: PolicySection[] = [
  {
    n: 1,
    title: "About DekhKhao",
    blocks: [
      { p: "DekhKhao is a food visualization service, not an online food-ordering platform." },
      { p: "A typical experience may involve:" },
      {
        ol: [
          "Scanning a QR code provided by a participating restaurant.",
          "Opening a DekhKhao webpage on your smartphone.",
          "Selecting a food or menu item.",
          "Viewing a digital representation of that item.",
          "Using your device's camera and supported AR capabilities to place the representation within your surroundings.",
        ],
      },
      { p: "DekhKhao does not process your restaurant order or payment unless a future service specifically states otherwise." },
      {
        p: "Any actual food order, payment, reservation, delivery, or restaurant transaction remains between you and the relevant restaurant or third-party service.",
      },
    ],
  },
  {
    n: 2,
    title: "Information We May Collect",
    blocks: [
      { p: "The information we collect depends on how you interact with DekhKhao." },
      { h3: "2.1 Information You Provide Directly" },
      { p: "If you contact us through a contact form or other communication method, we may receive information such as:" },
      {
        ul: [
          "Your name",
          "Restaurant or company name",
          "Phone number",
          "Email address, if provided",
          "The contents of your message",
          "Any other information you voluntarily provide",
        ],
      },
      {
        p: "Our website may provide a contact form that generates a WhatsApp message addressed to DekhKhao. In such cases, the information you enter is transmitted through WhatsApp rather than being submitted directly to a DekhKhao database.",
      },
      { p: "You should review WhatsApp's own privacy practices when using WhatsApp." },
    ],
  },
  {
    n: 3,
    title: "Camera and Augmented Reality Data",
    blocks: [
      { p: "Some DekhKhao experiences may use your smartphone's camera to provide augmented reality functionality." },
      { p: "When you choose to use an AR feature, your browser may request permission to access your device's camera." },
      { p: "Camera access is used to enable the AR experience." },
      { p: "For example, camera access may allow the service to:" },
      {
        ul: [
          "Detect surfaces such as tables or floors.",
          "Determine where a digital food item can be placed.",
          "Display a 3D representation within your physical surroundings.",
          "Allow you to move or position the digital representation.",
        ],
      },
      {
        p: "DekhKhao does not use the camera for photography, surveillance, or recording of your surroundings unless a particular feature explicitly states otherwise and obtains the appropriate permission.",
      },
      { p: "Where technically possible, AR processing may occur directly on your device through your web browser." },
      { p: "We do not intend to use camera access to identify individuals, analyze faces, or create biometric profiles." },
      {
        p: "If you do not want to provide camera access, you can deny the permission through your browser or device settings. You may still be able to access non-AR portions of the service.",
      },
    ],
  },
  {
    n: 4,
    title: "Location Information",
    blocks: [
      { p: "DekhKhao does not require your precise geographical location to use its core food visualization functionality." },
      { p: "If a future feature requires location information, we will provide appropriate notice and request permission where required." },
      {
        p: "Your device or browser may nevertheless provide certain technical information, such as approximate network information or IP address, as part of normal internet communication.",
      },
    ],
  },
  {
    n: 5,
    title: "Device and Technical Information",
    blocks: [
      {
        p: "When you access our website, certain technical information may be automatically processed by our hosting infrastructure, web servers, browsers, or other technology providers.",
      },
      { p: "This may include:" },
      {
        ul: [
          "IP address",
          "Browser type and version",
          "Device type",
          "Operating system",
          "Screen or display characteristics",
          "Language and regional settings",
          "Referring webpage",
          "Date and time of access",
          "Pages or resources requested",
          "Basic technical information relating to AR or 3D compatibility",
        ],
      },
      { p: "This information may be used for purposes such as:" },
      {
        ul: [
          "Operating the website",
          "Delivering content",
          "Maintaining security",
          "Detecting abuse or malicious activity",
          "Troubleshooting technical problems",
          "Improving reliability and compatibility",
          "Understanding general usage patterns",
        ],
      },
      {
        p: "Where technical information is collected automatically by third-party infrastructure providers, it may be processed according to their respective privacy policies.",
      },
    ],
  },
  {
    n: 6,
    title: "Cookies and Similar Technologies",
    blocks: [
      {
        p: "DekhKhao may use cookies, local storage, session technologies, or similar technologies to operate and improve the website.",
      },
      { p: "These technologies may be used for purposes such as:" },
      {
        ul: [
          "Maintaining necessary website functionality",
          "Remembering temporary preferences",
          "Improving performance",
          "Understanding website usage",
          "Maintaining security",
          "Supporting analytics, if analytics services are enabled",
        ],
      },
      { p: "We do not use cookies for the purpose of selling your personal information." },
      {
        p: "If analytics, advertising, or other non-essential tracking technologies are introduced in the future, this Privacy Policy may be updated accordingly.",
      },
      {
        p: "You can also control or disable cookies through your browser settings. Disabling certain technologies may affect some website functionality.",
      },
    ],
  },
  {
    n: 7,
    title: "How We Use Information",
    blocks: [
      { p: "We may use information we collect for legitimate business and operational purposes, including to:" },
      {
        ul: [
          "Provide and operate DekhKhao.",
          "Provide food visualization and AR functionality.",
          "Respond to enquiries.",
          "Communicate with restaurants and businesses.",
          "Maintain and improve our website and services.",
          "Diagnose technical problems.",
          "Protect our services against abuse, fraud, and security threats.",
          "Understand how our services are used.",
          "Develop new features and products.",
          "Maintain business and technical records.",
          "Comply with applicable legal obligations.",
          "Enforce our agreements and protect our rights.",
        ],
      },
      {
        p: "We will not use personal information for purposes materially different from those described in this Privacy Policy without appropriate notice where required.",
      },
    ],
  },
  {
    n: 8,
    title: "Restaurant Information",
    blocks: [
      {
        p: "Restaurants using DekhKhao may provide us with information relating to their business, menus, food items, photographs, branding, prices, descriptions, and 3D models or other digital assets.",
      },
      { p: "This information may be displayed to customers through the restaurant's DekhKhao experience." },
      {
        p: "Restaurant-provided information is generally business information rather than personal information. However, if a restaurant provides information relating to an identifiable individual, that information will be handled in accordance with this Privacy Policy and applicable requirements.",
      },
      {
        p: "Restaurants are responsible for ensuring that information and materials they provide to DekhKhao are lawful and appropriate for use through the service.",
      },
    ],
  },
  {
    n: 9,
    title: "Food Visualization and 3D Data",
    blocks: [
      { p: "DekhKhao may process digital representations of food items, including:" },
      {
        ul: [
          "3D models",
          "Images",
          "Textures",
          "Photographs",
          "Menu descriptions",
          "Food dimensions",
          "Portion or size information",
          "Other information necessary to display a food item",
        ],
      },
      { p: "These assets are used to provide the food visualization experience." },
      {
        p: "Where a restaurant supplies dimensions or specifications for a food item, we may use those specifications to create or configure a digital representation intended to correspond to the physical item.",
      },
      {
        p: "However, digital visualization is intended as a representation and should not be interpreted as a guarantee regarding the exact appearance, preparation, ingredients, portion, or final presentation of food served by a restaurant.",
      },
    ],
  },
  {
    n: 10,
    title: "Information We Do Not Intentionally Collect Through the AR Experience",
    blocks: [
      { p: "DekhKhao is designed around visualizing food, not identifying users." },
      { p: "Unless a specific feature clearly states otherwise, we do not intentionally collect:" },
      {
        ul: [
          "Facial recognition data",
          "Biometric profiles",
          "Identity documents",
          "Contact lists",
          "Microphone recordings",
          "Photos of users",
          "Videos of users",
          "Precise GPS location",
          "Payment card information",
          "Restaurant order information",
        ],
      },
      { p: "Camera access is requested only where required for an AR experience." },
    ],
  },
  {
    n: 11,
    title: "How We Share Information",
    blocks: [
      { p: "We do not sell or rent your personal information to third parties." },
      { p: "We may share information with service providers where reasonably necessary to operate DekhKhao." },
      { p: "These providers may include services relating to:" },
      {
        ul: [
          "Website hosting",
          "Cloud infrastructure",
          "Database or storage infrastructure",
          "Security",
          "Communications",
          "Analytics, where enabled",
          "Error monitoring",
          "Technical support",
        ],
      },
      {
        p: "Service providers may process information on our behalf and may be subject to their own privacy policies and contractual obligations.",
      },
      { p: "We may also disclose information when reasonably necessary to:" },
      {
        ul: [
          "Comply with applicable law or a valid legal process.",
          "Respond to lawful requests from government authorities.",
          "Protect the rights, property, or safety of DekhKhao, Portive Technologies, our users, restaurants, or others.",
          "Investigate fraud, security incidents, or abuse.",
          "Establish or defend legal claims.",
        ],
      },
    ],
  },
  {
    n: 12,
    title: "Third-Party Services",
    blocks: [
      { p: "DekhKhao may rely on third-party technology providers to operate portions of the service." },
      { p: "Depending on the implementation of a particular version of the service, these may include providers for:" },
      {
        ul: [
          "Hosting",
          "Content delivery",
          "Cloud storage",
          "Analytics",
          "Communications",
          "AR or 3D rendering",
          "Security",
          "Error monitoring",
        ],
      },
      { p: "Third-party services may process certain technical or other information according to their own privacy policies." },
      {
        p: "Where third-party services are used, we seek to use providers appropriate for the relevant function and to limit information shared to what is reasonably necessary.",
      },
    ],
  },
  {
    n: 13,
    title: "WhatsApp and External Communication",
    blocks: [
      { p: "Our website may provide a WhatsApp contact option." },
      { p: "If you choose to contact us through WhatsApp:" },
      {
        ul: [
          "Your communication will be handled through WhatsApp.",
          "Your phone number and message may be visible to us as part of the communication.",
          "WhatsApp may process information according to its own terms and privacy practices.",
        ],
      },
      { p: "DekhKhao does not control how WhatsApp processes information after you choose to use its service." },
      {
        p: "You should review WhatsApp's privacy documentation before using WhatsApp to communicate with us if you have concerns about how your information is handled.",
      },
    ],
  },
  {
    n: 14,
    title: "Data Retention",
    blocks: [
      {
        p: "We retain information only for as long as reasonably necessary for the purposes described in this Privacy Policy, unless a longer retention period is required or permitted by applicable law.",
      },
      { p: "The appropriate retention period may depend on the type of information and why it was collected." },
      { p: "For example:" },
      {
        ul: [
          "Business enquiries may be retained for as long as reasonably necessary to respond to and manage the enquiry.",
          "Technical and security records may be retained for a period necessary for security, troubleshooting, and operational purposes.",
          "Information required for legal, accounting, or regulatory purposes may be retained for the applicable period.",
        ],
      },
      { p: "When information is no longer reasonably required, we may delete, anonymize, or otherwise securely dispose of it." },
    ],
  },
  {
    n: 15,
    title: "Data Security",
    blocks: [
      { p: "We take reasonable technical and organizational measures to protect information handled through DekhKhao." },
      { p: "Depending on the information and service involved, these measures may include:" },
      {
        ul: [
          "Encrypted connections such as HTTPS.",
          "Access controls.",
          "Authentication and authorization mechanisms.",
          "Secure cloud infrastructure.",
          "Limited access to personal information.",
          "Security monitoring and maintenance.",
          "Reasonable measures designed to prevent unauthorized access, alteration, disclosure, or destruction.",
        ],
      },
      { p: "However, no website, internet transmission, or storage system can be guaranteed to be completely secure." },
      { p: "Accordingly, we cannot guarantee absolute security of information transmitted to or through the service." },
    ],
  },
  {
    n: 16,
    title: "Children's Privacy",
    blocks: [
      { p: "DekhKhao is intended primarily for restaurant customers and businesses." },
      { p: "Our services are not specifically directed toward children." },
      { p: "We do not knowingly seek to collect personal information from children." },
      {
        p: "If you believe that a child has provided personal information to us without appropriate authorization, please contact us so that we can review the situation and take reasonable steps where appropriate.",
      },
    ],
  },
  {
    n: 17,
    title: "Your Privacy Choices and Rights",
    blocks: [
      { p: "Depending on your location and applicable law, you may have rights relating to your personal information." },
      { p: "These may include the ability to:" },
      {
        ul: [
          "Ask what personal information we hold about you.",
          "Request correction of inaccurate information.",
          "Request deletion of information where applicable.",
          "Ask about how information is being used.",
          "Object to or restrict certain processing where applicable.",
          "Withdraw consent where processing is based on consent.",
          "Request information about certain third-party processing.",
          "Raise a privacy complaint.",
        ],
      },
      { p: "These rights may be subject to applicable legal exceptions, technical limitations, and other requirements." },
      { p: "To make a privacy-related request, contact us using the information provided in the Contact Us section below." },
      {
        p: "We may need to verify your identity before completing certain requests in order to protect your information from unauthorized access.",
      },
    ],
  },
  {
    n: 18,
    title: "International Data Processing",
    blocks: [
      { p: "DekhKhao may use cloud infrastructure and service providers that operate in countries other than Pakistan." },
      { p: "As a result, information may be processed or stored outside the country from which you access the service." },
      {
        p: "Where this occurs, we will take reasonable steps to use appropriate service providers and safeguards consistent with applicable requirements.",
      },
    ],
  },
  {
    n: 19,
    title: "Restaurant Customers and Restaurant Responsibilities",
    blocks: [
      { p: "When you access DekhKhao through a restaurant, the restaurant may independently collect or process information about you." },
      { p: "For example, a restaurant may separately collect information when you:" },
      {
        ul: [
          "Place an order.",
          "Make a reservation.",
          "Join a loyalty program.",
          "Contact the restaurant.",
          "Make a payment.",
          "Use the restaurant's own website or application.",
        ],
      },
      { p: "Those activities are governed by the restaurant's own privacy policies and practices." },
      { p: "DekhKhao is not responsible for the independent privacy practices of restaurants or other third parties." },
    ],
  },
  {
    n: 20,
    title: "Links to Other Websites",
    blocks: [
      { p: "DekhKhao may contain links to websites or services operated by third parties." },
      { p: "We are not responsible for the privacy practices, security, content, or policies of those third-party websites." },
      { p: "We recommend reviewing the privacy policy of any external service before providing personal information to it." },
    ],
  },
  {
    n: 21,
    title: "Business Transfers",
    blocks: [
      {
        p: "If Portive Technologies or the DekhKhao business is involved in a merger, acquisition, restructuring, financing, sale of assets, or similar transaction, information associated with the service may be transferred as part of that transaction, subject to applicable law.",
      },
      { p: "Where required, appropriate notice will be provided." },
    ],
  },
  {
    n: 22,
    title: "Changes to This Privacy Policy",
    blocks: [
      { p: "We may update this Privacy Policy from time to time." },
      { p: "Changes may be made to reflect:" },
      {
        ul: [
          "New features.",
          "Changes to our technology.",
          "Changes to how information is processed.",
          "Changes to third-party service providers.",
          "Changes in applicable legal or regulatory requirements.",
          "Improvements to our privacy practices.",
        ],
      },
      { p: "When we make changes, we will update the Last Updated date at the beginning of this Privacy Policy." },
      {
        p: "Your continued use of DekhKhao after an updated Privacy Policy becomes available constitutes acknowledgement of the updated policy to the extent permitted by applicable law.",
      },
    ],
  },
  {
    n: 23,
    title: "Applicable Law",
    blocks: [
      { p: "This Privacy Policy is intended to operate in accordance with applicable laws and regulations governing the services we provide." },
      {
        p: "As DekhKhao operates from Pakistan and may serve users and businesses in other jurisdictions, different privacy and data-protection requirements may apply depending on where a user or restaurant is located.",
      },
      { p: "Nothing in this Privacy Policy is intended to remove or limit rights that cannot legally be excluded under applicable law." },
    ],
  },
  {
    n: 24,
    title: "Contact Us",
    blocks: [
      {
        p: "If you have questions, concerns, requests, or complaints regarding this Privacy Policy or the way DekhKhao handles information, please contact us.",
      },
      { p: "DekhKhao\nA product of Portive Technologies\nWhatsApp / Phone: +92 335 3989333" },
      { p: "You may contact us regarding:" },
      {
        ul: [
          "Privacy questions",
          "Personal information requests",
          "Data deletion requests",
          "Data correction requests",
          "Security concerns",
          "Questions about camera or AR functionality",
          "Questions about third-party services",
        ],
      },
      { p: "We will review reasonable privacy requests and respond within a reasonable period." },
    ],
  },
  {
    n: 25,
    title: "Summary",
    blocks: [
      { p: "DekhKhao is built around a simple principle: help customers see what they are getting before they order it." },
      {
        p: "Our service is designed primarily to provide food visualization and augmented reality experiences rather than to collect personal information.",
      },
      { p: "We aim to collect only information reasonably necessary to operate, secure, improve, and communicate about the service." },
      { p: "We do not sell personal information, and we do not use the AR camera experience to intentionally identify users." },
      { p: "If you have questions about how your information is handled, you can contact us at +92 335 3989333." },
    ],
  },
];
