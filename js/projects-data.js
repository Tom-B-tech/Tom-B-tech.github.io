/* Your projects. Copy a block to add another. */

var CATEGORIES = {
  all: "All",
  research: "Research",
  web: "Web",
  tool: "Tools"
};

var PROJECTS = [
  {
    id: "llm-data-tools",
    title: "Clinical Decision-Support Agent",
    tagline: "A tool-calling LLM agent that explains dementia-classifier predictions to clinicians — built under a UIUC graduate researcher, with safety guards against fabricated claims.",
    category: "research",
    year: "Summer–Fall 2026",
    status: "Completed",
    image: "assets/cognify-web-demo.jpg",
    description: [
      "In a research collaboration at Illinois, I worked under graduate student Vatsal Tailor on Cognify: an agent that sits on top of a pre-computed dementia classifier and explains its predictions in clinician-readable form. The classifier itself is not my work; my side was the agent that explains it, a ReAct (Reasoning + Acting) design with 11 purpose-built clinical tools. One of my contributions was a compounding feature: after a good run, the agent's insight can be added to the knowledge base, so later runs can build on it.",
      "The agent queries pre-computed diagnostic results for 6,212 synthetic patients, retrieves per-patient SHAP feature attributions, searches a curated ~375KB clinical knowledge base, and produces a structured 4-section clinical note — grounded entirely in tool outputs, never fabricated.",
      "This is a research prototype, not a validated medical device, and every patient record it reasons over is synthetic."
    ],
    highlights: [
      "Built an 11-tool ReAct agent (Python + a local LLM via Ollama) that explains classifier predictions using SHAP attributions, brain volumetrics, and a curated clinical knowledge base",
      "Added a compounding feature: after a good run, the agent's insight is filed into the knowledge base (with a review step) for later runs to draw on",
      "Designed an unsourced-claim guard that detects and strips fabricated patient measurements from the LLM's output whenever the sourcing tool was never actually called",
      "Built value-meaning resolution so counter-intuitive coded clinical fields (e.g. a field coded 0 meaning \"Abnormal\") can't be misread by the model",
      "Added conflict detection across 4 different MoCA cognitive-score variants, which frequently disagree with each other",
      "282-line test suite covering every safety guard and tool, runnable without a live LLM"
    ],
    stack: ["Python", "LLMs", "ReAct agents", "SHAP", "Tool-use", "Flask"],
    demo: { type: "replay" },
    links: [
      { label: "Try this!", action: "demo", primary: true },
      { label: "My GitHub", url: "https://github.com/Tom-B-tech" }
    ]
  },
  {
    id: "soft-robotics",
    title: "Iterative Design of Soft Actuators",
    tagline: "Soft robotics research presented at the UIUC Undergraduate Research Symposium — actuators improved through build-test-refine cycles and computer-vision validation.",
    category: "research",
    year: "Spring 2026",
    status: "Completed",
    image: "assets/soft-actuator-thumb.jpg?v=6",
    description: [
      "While traditional robotic mechanisms use rigid materials, soft robotics is a field in which robots lack rigidity: thus soft robots have immense capability in packaging, biomedicine, etc. Compliant mechanisms use their material properties to create movement. The iterative design process is the cycle of creating prototypes and testing for an improved design. Three of my classmates and I, under the mentorship of two graduate students and two UIUC professors, researched how the iterative design process can be applied to soft robotics.",
      "The pneumatic actuator uses inflation of a chambered design to create movement and it was cast from EcoFlex 30 silicone. As a group, we experimented with changing the angle of the chambers to create a twisting actuation. After testing out the design with an air pump, we saw that at 45 degrees, the actuation had a more bio-mimetic shape. We split into two groups for the cable actuator’s design process. My group tested actuators with offset cable heights to create a twist movement. We achieved an average twist of 25.5 degrees. The other group attempted to create a more anthropomorphic design. They curved the edges, flattened the profile, and decreased furrow distance. Overall, they created a tighter curl.",
      "We used cyclical testing to analyze the performance of our designs. This involved setting up a camera to track many actuations of our designs using an Arduino and motor. Then, we used OpenCV to track the video and plotted our design’s performance with Matplotlib. For our twisting cable actuator, we used extra video analysis to find an angle.",
      "For the symposium, I focused on presenting topology optimization. Topology optimization is a computer design process where an input is iterated on by small incremental changes over time to improve the design on designated variables, creating a design by an evolution-like process. We used topology optimization to improve the performance of a compliant 3D-printed gripper. These compliant mechanisms are one part, so they can be used at micro scales more easily. We tested multiple inputs through our program, then printed our best designs."
    ],
    highlights: [
      "We iterated on twisting pneumatic soft actuators, twisting cable actuators, and anthropomorphic cable actuators.",
      "We used cyclical testing and computer tracking to verify the performance of our designs.",
      "We used topology optimization to iterate on a compliant gripper mechanism.",
      "We presented our research of the whole semester at University of Illinois Urbana-Champaign’s Undergraduate Research Symposium to judges, professors, and other presenters."
    ],
    stack: ["Soft robotics", "Silicone casting", "3D printing", "Arduino", "OpenCV", "MATLAB", "Fusion 360"],
    links: [
      { label: "View full poster", url: "assets/soft-robotics-poster.jpg", primary: true }
    ]
  },
  {
    id: "portfolio-ai-study",
    title: "Portfolios in the Age of AI",
    tagline: "Coming soon.",
    category: "research",
    year: "Fall 2026",
    status: "In progress",
    image: "assets/portfolio-ai-thumb.jpg?v=1",
    description: [],
    highlights: [],
    stack: ["Gemini 2.5 Flash", "Vision models", "Node.js", "Data analysis"],
    links: []
  },
  {
    id: "fish-tank-software",
    title: "Fish Tank Management Software",
    tagline: "Software for managing fish tanks. Details coming soon.",
    category: "tool",
    year: "Fall 2026",
    status: "In progress",
    image: "assets/hobby-pea-puffer.jpg",
    description: [],
    highlights: [],
    stack: [],
    links: []
  }
];
