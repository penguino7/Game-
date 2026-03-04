// File: js/qna.data.js
// Cấu trúc Data dạng JSON Object để dễ quản lý

const QNA_DATABASE = {
  1: {
    topic: "Firewalls",
    points: 100,
    text: "........ are stand-alone, self-contained combinations of computing hardware and software.",
    snippet: null,
    options: [
      "Firewall appliances",
      "Firewall architectures",
      "Firewall systems",
      "Firewall software",
    ],
    correctIdx: 0,
  },

  2: {
    topic: "Intellectual Property & Malware",
    points: 100,
    text: "Which of the following is a malicious program that replicates itself constantly, without requiring another program environment?",
    snippet: null,
    options: ["Black door", "Worm", "Virus", "Worm Hoax"],
    correctIdx: 1,
  },
  3: {
    topic: "Information Security Basics",
    points: 100,
    text: ".............. is a category of objects, persons, or other entities that presents a danger to an asset.",
    snippet: null,
    options: ["Threat", "Security posture", "Risk", "Vulnerability"],
    correctIdx: 0,
  },

  4: {
    topic: "Firewalls",
    points: 100,
    text: "Organizations can install .............. on an existing general purpose computer system.",
    snippet: null,
    options: [
      "Firewall hardware",
      "Firewall architecture",
      "Firewall software",
      "Firewall devices",
    ],
    correctIdx: 1,
  },

  5: {
    topic: "Firewalls",
    points: 100,
    text: "The SOHO firewall serves first as a stateful firewall to enable ........ access.",
    snippet: null,
    options: [
      "Inside-to-outside",
      "Outside-to-inside",
      "A & B are correct",
      "None is correct",
    ],
    correctIdx: 0,
  },

  6: {
    topic: "Information Security Basics",
    points: 100,
    text: "The IS component that created much of the need for increased computer and information security is .............",
    snippet: null,
    options: ["Software", "Networking", "Hardware", "Data"],
    correctIdx: 1,
  },
  7: {
    topic: "Firewalls",
    points: 100,
    text: "What became the basis for Gauntlet firewall at Trusted Information Systems?",
    snippet: null,
    options: [
      "Hypertext Transfer Protocol",
      "Firewall Toolkit",
      "User Datagram Protocol",
      "Transport layer",
    ],
    correctIdx: 1,
  },

  8: {
    topic: "Network Attacks",
    points: 100,
    text: ".............. attacks are the most difficult to defend against, and there are presently no controls that any single organization can apply.",
    snippet: null,
    options: ["Password crack", "Dictionary", "DDoS", "Back door"],
    correctIdx: 2,
  },

  9: {
    topic: "Firewalls",
    points: 100,
    text: "Which of the following helps your computer still be safe no matter how hard the attackers manage?",
    snippet: null,
    options: [
      "An anti-virus software program",
      "A strong password",
      "A hardware firewall",
      "SOHO",
    ],
    correctIdx: 2,
  },

  10: {
    topic: "Intellectual Property & Malware",
    points: 100,
    text: ".............. is one that over time changes the way it appears to antivirus software programs, making it undetectable by techniques that look for preconfigured signatures.",
    snippet: null,
    options: ["Trojan Horse", "A polymorphic threat", "Virus", "Worm"],
    correctIdx: 1,
  },
};
